from fastapi import Header, HTTPException, Depends
from typing import Optional

API_KEYS = {
    "sk_employee_ravi":   {"role": "employee", "actor_id": "EMP-0060", "name": "Ravi Yadav"},
    "sk_manager_karthik": {"role": "manager",  "actor_id": "EMP-0054", "name": "Karthik Jain"},
    "sk_finance_arjun":   {"role": "finance",  "actor_id": "EMP-0053", "name": "Arjun Prasad"},
    "sk_admin_chaitanya": {"role": "admin",    "actor_id": "EMP-0052", "name": "Chaitanya Raju"},
}


def require_role(*allowed_roles: str):
    def dependency(x_api_key: Optional[str] = Header(None)):
        if not x_api_key or x_api_key not in API_KEYS:
            raise HTTPException(status_code=401, detail="Invalid or missing API key")
        user = API_KEYS[x_api_key]
        if allowed_roles and user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{user['role']}' not permitted. Required: {allowed_roles}",
            )
        return user
    return dependency
