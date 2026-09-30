import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class ClaimBase(BaseModel):
    employee_id: str
    vendor: Optional[str] = None
    amount: float = 0.0
    category: Optional[str] = "other"
    expense_date: Optional[str] = None


class ClaimCreate(ClaimBase):
    pass


class ClaimResponse(ClaimBase):
    id: int
    claim_number: str
    receipt_filename: Optional[str] = None
    receipt_path: Optional[str] = None
    receipt_hash: Optional[str] = None
    status: str
    violations: List[str] = []
    forensics_flags: List[str] = []
    ocr_raw_text: Optional[str] = None

    manager_approved_by: Optional[str] = None
    manager_approved_at: Optional[datetime.datetime] = None
    finance_approved_by: Optional[str] = None
    finance_approved_at: Optional[datetime.datetime] = None
    rejection_reason: Optional[str] = None
    rejection_notes: Optional[str] = None

    reimbursed_at: Optional[datetime.datetime] = None
    reimbursement_reference: Optional[str] = None
    reimbursed_amount: Optional[float] = None

    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class ReviewRequest(BaseModel):
    decision: str
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class ReimburseRequest(BaseModel):
    reimbursement_reference: str
    amount: Optional[float] = None


class AppealRequest(BaseModel):
    notes: str


class ClaimStatusUpdate(BaseModel):
    status: str


class ClaimEventResponse(BaseModel):
    id: int
    claim_id: int
    event_type: str
    actor_id: str
    actor_role: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ClaimEvaluationResult(BaseModel):
    status: str
    violations: List[str] = []
    ocr_data: Optional[dict] = None
    forensics_flags: List[str] = []


class VendorMatchResult(BaseModel):
    status: str
    candidates: List[dict] = []
    error: Optional[str] = None


class EmployeeMatchResult(BaseModel):
    exists: bool
    employee: Optional[dict] = None
    error: Optional[str] = None


class DuplicateCheckResult(BaseModel):
    is_duplicate: bool
    matching_claim: Optional[dict] = None
    error: Optional[str] = None
