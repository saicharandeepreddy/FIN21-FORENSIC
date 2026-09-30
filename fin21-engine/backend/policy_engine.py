from typing import List, Optional, Any
from nova_client import (
    verify_employee,
    verify_vendor,
    get_category_limit,
    check_historical_duplicate,
)
from forensics import validate_gstin

VALID_NOVA_CATEGORIES = {
    "travel_air",
    "travel_rail",
    "local_conveyance",
    "hotel",
    "meals",
    "client_entertainment",
    "telecom",
    "fuel",
    "office_supplies",
    "other",
}

COMPANY_POLICIES = {
    "travel_air": 15000,
    "meals": 3000,
    "hotel": 8000,
    "local_conveyance": 5000,
}


def get_fallback_limit(category: str) -> float:
    return float(COMPANY_POLICIES.get(category, 10000))


def map_category_to_nova(raw_category: str) -> str:
    if not raw_category:
        return "other"

    cleaned = str(raw_category).lower().strip()

    if cleaned in VALID_NOVA_CATEGORIES:
        return cleaned

    mapping_groups = [
        ({"flight", "air", "plane", "airline"}, "travel_air"),
        ({"train", "rail", "irctc"}, "travel_rail"),
        (
            {"cab", "uber", "ola", "taxi", "auto", "ride", "transport", "commute"},
            "local_conveyance",
        ),
        ({"hotel", "stay", "lodging", "airbnb"}, "hotel"),
        (
            {"dinner", "lunch", "breakfast", "food", "restaurant", "cafe", "meals"},
            "meals",
        ),
        (
            {"client dinner", "client_entertainment", "entertainment"},
            "client_entertainment",
        ),
        ({"phone", "mobile", "internet", "data", "sim", "telecom"}, "telecom"),
        ({"petrol", "diesel", "fuel", "gas"}, "fuel"),
        ({"stationery", "office", "supplies", "printer"}, "office_supplies"),
    ]

    for keywords, nova_cat in mapping_groups:
        if cleaned in keywords:
            return nova_cat
        for kw in keywords:
            if kw in cleaned:
                return nova_cat

    return "other"


async def evaluate_claim(
    ocr_data: dict, forensics_flags: list[str], db_session: Any = None
) -> dict:
    violations = list(forensics_flags or [])
    employee_code = ocr_data.get("employee_id")
    vendor_name = ocr_data.get("vendor")
    try:
        amount = float(ocr_data.get("amount", 0.0))
    except (ValueError, TypeError):
        amount = 0.0

    expense_date = ocr_data.get("date")
    nova_category = map_category_to_nova(ocr_data.get("category", "other"))
    ocr_data["category"] = nova_category

    # Check 1: Employee
    emp = await verify_employee(employee_code)
    if not emp.get("exists"):
        violations.append(f"Employee {employee_code} not found in master data")

    # Check 2: Vendor
    vend = await verify_vendor(vendor_name)
    if vend.get("status") == "unknown":
        violations.append(f"Unapproved vendor: {vendor_name}")
    elif vend.get("status") == "partial":
        violations.append(
            f"Vendor name ambiguous: {len(vend.get('candidates', []))} partial matches"
        )

    # Check 2.5: GSTIN validation
    gstin = ocr_data.get("gstin")
    if gstin:
        is_valid, reason = validate_gstin(gstin)
        if not is_valid:
            violations.append(f"GSTIN validation failed: {reason}")

    # Check 3: Dynamic limit
    grade = emp.get("employee", {}).get("grade") if emp.get("exists") else None
    limit = await get_category_limit(nova_category, grade=grade)
    if limit is None:
        limit = get_fallback_limit(nova_category)
    if amount > limit:
        violations.append(
            f"Amount {amount} exceeds corporate limit of {limit} for {nova_category}"
        )

    # Check 4: Duplicate
    dup = await check_historical_duplicate(employee_code, amount, expense_date)
    if dup.get("is_duplicate"):
        violations.append("Duplicate risk: matching expense found in Aczen books")

    return {
        "status": "FLAGGED" if violations else "AUTO_APPROVED",
        "violations": violations,
    }
