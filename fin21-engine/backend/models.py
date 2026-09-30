import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey
from database import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(64), unique=True, index=True, nullable=False)
    employee_id = Column(String(64), index=True, nullable=False)
    vendor = Column(String(255), nullable=True)
    amount = Column(Float, default=0.0, nullable=False)
    category = Column(String(64), default="other", nullable=False)
    expense_date = Column(String(32), nullable=True)
    receipt_filename = Column(String(255), nullable=True)
    receipt_path = Column(String(512), nullable=True)
    receipt_hash = Column(String(64), index=True, nullable=True)
    status = Column(String(32), default="SUBMITTED", nullable=False)
    violations = Column(JSON, default=list, nullable=False)
    forensics_flags = Column(JSON, default=list, nullable=False)
    ocr_raw_text = Column(Text, nullable=True)

    manager_approved_by = Column(String(64), nullable=True)
    manager_approved_at = Column(DateTime, nullable=True)
    finance_approved_by = Column(String(64), nullable=True)
    finance_approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String(64), nullable=True)
    rejection_notes = Column(Text, nullable=True)

    reimbursed_at = Column(DateTime, nullable=True)
    reimbursement_reference = Column(String(64), nullable=True)
    reimbursed_amount = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow, nullable=False)


class ClaimEvent(Base):
    __tablename__ = "claim_events"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), index=True, nullable=False)
    event_type = Column(String(48), nullable=False)
    actor_id = Column(String(64), nullable=False)
    actor_role = Column(String(32), nullable=False)
    old_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
