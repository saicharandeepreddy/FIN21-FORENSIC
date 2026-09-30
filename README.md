# FIN21 — Expense Forensics

Autonomous expense audit & Maker-Checker approval engine built at **Finathon 2026** (Aczen Technologies).

## What it does

- Upload a receipt → extracts vendor, amount, category, date, GSTIN
- **Six forensic checks** run on every claim:
  1. Employee verification (live Nova API)
  2. Vendor verification (live Nova API)
  3. Dynamic policy limit lookup (live Nova API — per employee grade)
  4. Historical duplicate detection (live Nova API — ±3 day window)
  5. GSTIN Mod-36 checksum validation (local)
  6. EXIF metadata forensics (local — catches Photoshop/Canva edits)
- Approval workflow: **Employee → Manager → Finance → Reimbursement**
- Complete audit trail on every claim

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Python 3.13 + FastAPI + SQLAlchemy |
| Database | SQLite (dev) → PostgreSQL-ready |
| External API | Aczen Nova (read-only, live) |
| Deploy | Railway (backend) + Vercel (frontend) |

## Local Run

### Backend

```bash
cd fin21-engine/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
# add NOVA_API_KEY to .env (see .env.example)
uvicorn main:app --reload
