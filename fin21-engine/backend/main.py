from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from auth import require_role, authenticate_user, create_access_token
from forensics import analyze_image_forensics, calculate_file_hash
from ocr_engine import extract_receipt_data
from policy_engine import evaluate_claim, map_category_to_nova
from nova_client import verify_vendor, verify_employee
from ela_dwt import analyze_forgery

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="FIN21 Expense & Policy Engine",
    description="Autonomous Financial Expense Audit & Nova Policy Compliance Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/v1/auth/login", response_model=schemas.LoginResponse, tags=["Auth"])
def login(payload: schemas.LoginRequest):
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({
        "sub": user["actor_id"],
        "role": user["role"],
        "name": user["name"],
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "actor_id": user["actor_id"],
        "name": user["name"],
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "fin21-engine",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }


@app.post("/api/v1/claims/upload",
          response_model=schemas.ClaimResponse,
          status_code=status.HTTP_201_CREATED,
          tags=["Claims"])
async def upload_claim(
    employee_id: str = Form(...),
    amount: Optional[float] = Form(None),
    vendor: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    expense_date: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user=Depends(require_role("employee", "admin")),
    db: Session = Depends(get_db),
):
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_filepath = os.path.join(UPLOAD_DIR, unique_filename)

    contents = await file.read()
    with open(saved_filepath, "wb") as f:
        f.write(contents)

    file_hash = calculate_file_hash(saved_filepath)
    forensics_flags = analyze_image_forensics(saved_filepath)
    forensics_flags.extend(analyze_forgery(saved_filepath))

    ocr_extracted = extract_receipt_data(saved_filepath, file.filename)

    final_vendor = vendor or ocr_extracted.get("vendor") or "Unknown Vendor"
    final_amount = float(amount) if amount is not None else float(ocr_extracted.get("amount") or 0.0)
    final_date = expense_date or ocr_extracted.get("date") or datetime.date.today().isoformat()
    raw_cat = category or ocr_extracted.get("category") or "other"
    final_category = map_category_to_nova(raw_cat)

    ocr_data = {
        "employee_id": employee_id.strip(),
        "vendor": final_vendor.strip(),
        "amount": final_amount,
        "date": final_date.strip(),
        "category": final_category,
        "gstin": ocr_extracted.get("gstin"),
    }

    result = await evaluate_claim(ocr_data, forensics_flags, db)

    initial_status = "AUTO_APPROVED" if result["status"] == "AUTO_APPROVED" else "SUBMITTED"

    claim_number = f"CLM-{uuid.uuid4().hex[:8].upper()}"

    db_claim = models.Claim(
        claim_number=claim_number,
        employee_id=ocr_data["employee_id"],
        vendor=ocr_data["vendor"],
        amount=ocr_data["amount"],
        category=ocr_data["category"],
        expense_date=ocr_data["date"],
        receipt_filename=file.filename,
        receipt_path=f"/uploads/{unique_filename}",
        receipt_hash=file_hash,
        status=initial_status,
        violations=result["violations"],
        forensics_flags=forensics_flags,
        ocr_raw_text=ocr_extracted.get("raw_text", ""),
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)

    db.add(models.ClaimEvent(
        claim_id=db_claim.id,
        event_type="SUBMITTED",
        actor_id=user["actor_id"],
        actor_role=user["role"],
        old_status=None,
        new_status=initial_status,
        notes=f"Uploaded by {user['name']}",
    ))
    db.commit()
    db.refresh(db_claim)
    return db_claim
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_filepath = os.path.join(UPLOAD_DIR, unique_filename)

    contents = await file.read()
    with open(saved_filepath, "wb") as f:
        f.write(contents)

    file_hash = calculate_file_hash(saved_filepath)
    forensics_flags.extend(analyze_forgery(saved_filepath))

    ocr_extracted = extract_receipt_data(saved_filepath, file.filename)

    final_vendor = vendor or ocr_extracted.get("vendor") or "Unknown Vendor"
    final_amount = float(amount) if amount is not None else float(ocr_extracted.get("amount") or 0.0)
    final_date = expense_date or ocr_extracted.get("date") or datetime.date.today().isoformat()
    raw_cat = category or ocr_extracted.get("category") or "other"
    final_category = map_category_to_nova(raw_cat)

    ocr_data = {
        "employee_id": employee_id.strip(),
        "vendor": final_vendor.strip(),
        "amount": final_amount,
        "date": final_date.strip(),
        "category": final_category,
        "gstin": ocr_extracted.get("gstin"),
    }

    result = await evaluate_claim(ocr_data, forensics_flags, db)

    initial_status = "AUTO_APPROVED" if result["status"] == "AUTO_APPROVED" else "SUBMITTED"

    claim_number = f"CLM-{uuid.uuid4().hex[:8].upper()}"

    db_claim = models.Claim(
        claim_number=claim_number,
        employee_id=ocr_data["employee_id"],
        vendor=ocr_data["vendor"],
        amount=ocr_data["amount"],
        category=ocr_data["category"],
        expense_date=ocr_data["date"],
        receipt_filename=file.filename,
        receipt_path=f"/uploads/{unique_filename}",
        receipt_hash=file_hash,
        status=initial_status,
        violations=result["violations"],
        forensics_flags=forensics_flags,
        ocr_raw_text=ocr_extracted.get("raw_text", ""),
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)

    db.add(models.ClaimEvent(
        claim_id=db_claim.id,
        event_type="SUBMITTED",
        actor_id=user["actor_id"],
        actor_role=user["role"],
        old_status=None,
        new_status=initial_status,
        notes=f"Uploaded by {user['name']}",
    ))
    db.commit()
    db.refresh(db_claim)
    return db_claim


@app.get("/api/v1/claims",
         response_model=List[schemas.ClaimResponse],
         tags=["Claims"])
def list_claims(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
    db: Session = Depends(get_db),
):
    query = db.query(models.Claim)
    if status_filter:
        query = query.filter(models.Claim.status == status_filter)
    return query.order_by(models.Claim.id.desc()).offset(skip).limit(limit).all()


@app.get("/api/v1/claims/{claim_id}",
         response_model=schemas.ClaimResponse,
         tags=["Claims"])
def get_claim(
    claim_id: int,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@app.post("/api/v1/claims/{claim_id}/manager-review",
          response_model=schemas.ClaimResponse,
          tags=["Workflow"])
def manager_review(
    claim_id: int,
    payload: schemas.ReviewRequest,
    user=Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status not in ("SUBMITTED", "FLAGGED", "AUTO_APPROVED"):
        raise HTTPException(status_code=400, detail=f"Cannot review claim in status {claim.status}")

    old = claim.status
    if payload.decision == "approve":
        claim.status = "MANAGER_APPROVED"
        claim.manager_approved_by = user["actor_id"]
        claim.manager_approved_at = datetime.datetime.utcnow()
        event_type = "MANAGER_APPROVED"
    else:
        claim.status = "MANAGER_REJECTED"
        claim.rejection_reason = payload.rejection_reason or "OTHER"
        claim.rejection_notes = payload.notes
        event_type = "MANAGER_REJECTED"

    db.add(models.ClaimEvent(
        claim_id=claim_id, event_type=event_type,
        actor_id=user["actor_id"], actor_role=user["role"],
        old_status=old, new_status=claim.status, notes=payload.notes,
    ))
    db.commit()
    db.refresh(claim)
    return claim


@app.post("/api/v1/claims/{claim_id}/finance-review",
          response_model=schemas.ClaimResponse,
          tags=["Workflow"])
def finance_review(
    claim_id: int,
    payload: schemas.ReviewRequest,
    user=Depends(require_role("finance", "admin")),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "MANAGER_APPROVED":
        raise HTTPException(status_code=400, detail="Claim must be MANAGER_APPROVED first")

    old = claim.status
    if payload.decision == "approve":
        claim.status = "FINANCE_APPROVED"
        claim.finance_approved_by = user["actor_id"]
        claim.finance_approved_at = datetime.datetime.utcnow()
        event_type = "FINANCE_APPROVED"
    else:
        claim.status = "FINANCE_REJECTED"
        claim.rejection_reason = payload.rejection_reason or "OTHER"
        claim.rejection_notes = payload.notes
        event_type = "FINANCE_REJECTED"

    db.add(models.ClaimEvent(
        claim_id=claim_id, event_type=event_type,
        actor_id=user["actor_id"], actor_role=user["role"],
        old_status=old, new_status=claim.status, notes=payload.notes,
    ))
    db.commit()
    db.refresh(claim)
    return claim


@app.post("/api/v1/claims/{claim_id}/reimburse",
          response_model=schemas.ClaimResponse,
          tags=["Workflow"])
def reimburse(
    claim_id: int,
    payload: schemas.ReimburseRequest,
    user=Depends(require_role("finance", "admin")),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "FINANCE_APPROVED":
        raise HTTPException(status_code=400, detail="Claim must be FINANCE_APPROVED first")

    old = claim.status
    claim.status = "REIMBURSED"
    claim.reimbursed_at = datetime.datetime.utcnow()
    claim.reimbursement_reference = payload.reimbursement_reference
    claim.reimbursed_amount = payload.amount or claim.amount

    db.add(models.ClaimEvent(
        claim_id=claim_id, event_type="REIMBURSED",
        actor_id=user["actor_id"], actor_role=user["role"],
        old_status=old, new_status="REIMBURSED",
        notes=f"UTR: {payload.reimbursement_reference}",
    ))
    db.commit()
    db.refresh(claim)
    return claim


@app.get("/api/v1/claims/{claim_id}/history",
         response_model=List[schemas.ClaimEventResponse],
         tags=["Workflow"])
def claim_history(
    claim_id: int,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
    db: Session = Depends(get_db),
):
    return db.query(models.ClaimEvent).filter(
        models.ClaimEvent.claim_id == claim_id
    ).order_by(models.ClaimEvent.id.asc()).all()


@app.post("/api/v1/claims/{claim_id}/appeal",
          response_model=schemas.ClaimResponse,
          tags=["Workflow"])
def raise_appeal(
    claim_id: int,
    payload: schemas.AppealRequest,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
    db: Session = Depends(get_db),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    db.add(models.ClaimEvent(
        claim_id=claim_id,
        event_type="APPEAL_SUBMITTED",
        actor_id=user["actor_id"],
        actor_role=user["role"],
        old_status=claim.status,
        new_status=claim.status,
        notes=payload.notes,
    ))
    db.commit()
    db.refresh(claim)
    return claim


@app.get("/api/v1/vendors/verify", tags=["Nova Verification"])
async def verify_vendor_endpoint(
    name: str,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
):
    return await verify_vendor(name)


@app.get("/api/v1/employees/verify", tags=["Nova Verification"])
async def verify_employee_endpoint(
    code: str,
    user=Depends(require_role("employee", "manager", "finance", "admin")),
):
    return await verify_employee(code)
