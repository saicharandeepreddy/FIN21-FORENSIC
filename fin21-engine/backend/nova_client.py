import os
import re
import asyncio
import datetime
from typing import Optional, List, Dict, Any
import httpx

BASE_URL = "https://www.aczen.in/nova-api/v1"


def _normalize_name(name: str) -> str:
    if not name:
        return ""
    return re.sub(r"[^a-z0-9]", "", name.lower())


async def _nova(path: str, **params) -> dict:
    api_key = os.getenv("NOVA_API_KEY")
    if not api_key:
        raise RuntimeError("NOVA_API_KEY environment variable is missing")

    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    # Filter out None values from params
    query_params = {k: v for k, v in params.items() if v is not None}

    max_502_retries = 3
    attempt_502 = 0
    has_retried_429 = False

    async with httpx.AsyncClient(timeout=15.0) as client:
        while True:
            try:
                response = await client.get(url, headers=headers, params=query_params)
            except (httpx.RequestError, httpx.TimeoutException) as exc:
                if attempt_502 < max_502_retries - 1:
                    sleep_time = 2**attempt_502  # 1s, 2s, 4s
                    attempt_502 += 1
                    await asyncio.sleep(sleep_time)
                    continue
                raise RuntimeError(f"Nova API network error: {str(exc)}") from exc

            # 429 Rate Limit Handling
            if response.status_code == 429:
                if not has_retried_429:
                    has_retried_429 = True
                    retry_after_header = response.headers.get("Retry-After")
                    try:
                        retry_after = float(retry_after_header) if retry_after_header else 60.0
                    except ValueError:
                        retry_after = 60.0
                    await asyncio.sleep(retry_after)
                    continue
                else:
                    raise RuntimeError("Nova API rate limit exceeded after retry (429)")

            # 502 Upstream Error Handling (exponential backoff 1s, 2s, 4s max 3 tries)
            if response.status_code == 502:
                if attempt_502 < max_502_retries:
                    sleep_time = 2**attempt_502
                    attempt_502 += 1
                    await asyncio.sleep(sleep_time)
                    continue
                else:
                    raise RuntimeError("Nova API 502 upstream_error exceeded maximum retries")

            # 400, 401, 404, 405 Fatal client errors
            if response.status_code in (400, 401, 404, 405):
                try:
                    err_json = response.json()
                    err_code = err_json.get("error", {}).get("code", "unknown_error")
                    req_id = err_json.get("request_id", "unknown_req_id")
                    err_msg = err_json.get("error", {}).get("message", response.text)
                except Exception:
                    err_code = f"HTTP_{response.status_code}"
                    req_id = response.headers.get("x-request-id", "unknown")
                    err_msg = response.text
                raise RuntimeError(
                    f"Nova API Error [{response.status_code}]: code={err_code}, "
                    f"request_id={req_id}, message={err_msg}"
                )

            if response.status_code >= 400:
                raise RuntimeError(
                    f"Nova API unexpected HTTP {response.status_code}: {response.text}"
                )

            try:
                return response.json()
            except Exception as exc:
                raise RuntimeError(f"Invalid JSON returned from Nova API: {str(exc)}") from exc


async def _list_all(path: str, **params) -> list:
    offset = 0
    limit = 200
    all_data = []
    pages = 0
    max_pages = 3

    while pages < max_pages:
        req_params = dict(params)
        req_params["limit"] = limit
        req_params["offset"] = offset

        res = await _nova(path, **req_params)
        data = res.get("data", [])
        all_data.extend(data)

        pagination = res.get("pagination", {})
        has_more = pagination.get("has_more", False)
        if not has_more or len(data) == 0:
            break

        offset += limit
        pages += 1

    return all_data


async def verify_vendor(vendor_name: str) -> dict:
    if not vendor_name:
        return {"status": "unknown", "candidates": []}

    try:
        res = await _nova("/vendors", **{"name.ilike": vendor_name, "limit": 10, "sort": "name"})
        candidates = res.get("data", [])
        norm_query = _normalize_name(vendor_name)

        if len(candidates) == 0:
            return {"status": "unknown", "candidates": []}

        # Check for matched: exactly 1 candidate AND normalized names equal
        if len(candidates) == 1:
            cand_name = candidates[0].get("name", "")
            if _normalize_name(cand_name) == norm_query:
                return {"status": "matched", "candidates": candidates}

        # Check if any candidate is an exact match even among multiple
        exact_matches = [
            c for c in candidates if _normalize_name(c.get("name", "")) == norm_query
        ]
        if len(exact_matches) == 1 and len(candidates) == 1:
            return {"status": "matched", "candidates": candidates}

        # Partial: 1-5 candidates but no exact normalized match
        if 1 <= len(candidates) <= 5:
            return {"status": "partial", "candidates": candidates}

        return {"status": "unknown", "candidates": candidates}

    except Exception as exc:
        return {"status": "unknown", "error": "nova_unavailable", "candidates": []}


async def verify_employee(employee_code: str) -> dict:
    if not employee_code:
        return {"exists": False, "employee": None}

    try:
        res = await _nova("/employees", code=employee_code, limit=1)
        data = res.get("data", [])
        if data:
            return {"exists": True, "employee": data[0]}
        return {"exists": False, "employee": None}
    except Exception as exc:
        return {"exists": False, "employee": None, "error": "nova_unavailable"}


async def get_category_limit(category: str, grade: Optional[str] = None) -> Optional[float]:
    try:
        res = await _nova("/spend-policies", category=category, limit=50)
        items = res.get("data", [])

        # Client-side filter: applies_to == "expense_claim"
        valid_items = [
            item for item in items if item.get("applies_to") == "expense_claim"
        ]

        # If grade: keep items where grade_min <= grade (string compare works for G1..G8)
        if grade:
            valid_items = [
                item
                for item in valid_items
                if not item.get("grade_min") or str(item.get("grade_min")) <= str(grade)
            ]

        if not valid_items:
            return None

        # Sort remaining: highest grade_min, then most recent effective_from
        def sort_key(x):
            grade_val = str(x.get("grade_min") or "")
            eff_val = str(x.get("effective_from") or "")
            return (grade_val, eff_val)

        valid_items.sort(key=sort_key, reverse=True)
        selected = valid_items[0]
        limit_amount = selected.get("limit_amount")
        return float(limit_amount) if limit_amount is not None else None

    except Exception:
        return None


async def check_historical_duplicate(
    employee_code: str, amount: float, expense_date: str, window_days: int = 3
) -> dict:
    if not employee_code or not expense_date:
        return {"is_duplicate": False, "matching_claim": None}

    try:
        clean_date_str = expense_date.strip().split("T")[0]
        exp_dt = datetime.date.fromisoformat(clean_date_str)
        date_from = (exp_dt - datetime.timedelta(days=window_days)).isoformat()
        date_to = (exp_dt + datetime.timedelta(days=window_days)).isoformat()

        res = await _nova(
            "/expense-claims",
            **{
                "employee_id": employee_code,
                "amount": amount,
                "expense_date.gte": date_from,
                "expense_date.lte": date_to,
                "limit": 5,
            },
        )
        data = res.get("data", [])
        if data:
            return {"is_duplicate": True, "matching_claim": data[0]}
        return {"is_duplicate": False, "matching_claim": None}
    except Exception:
        return {
            "is_duplicate": False,
            "matching_claim": None,
            "error": "nova_unavailable",
        }
