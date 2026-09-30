cd "D:\prototype fin21"
notepad README.md
Delete everything, paste this, save:

markdown
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
Runs on http://localhost:8000. API docs at /docs.

Frontend
bash
npm install
npm run dev
Runs on http://localhost:3000.

Demo Credentials
Email	Password	Role
ravi@tulasisupplies.example	demo1234	Employee
karthik@tulasisupplies.example	demo1234	Manager
arjun@tulasisupplies.example	demo1234	Finance
chaitanya@tulasisupplies.example	demo1234	Admin
Nova API Integration
4 live calls per claim submission:

GET /employees — verify employee + fetch grade

GET /vendors — verify vendor in master data

GET /spend-policies — dynamic limit for category + employee grade

GET /expense-claims — duplicate detection within ±3 days

What's Real vs. Fixture
Real: Nova API calls, GSTIN checksum, EXIF forensics, SHA-256 hashing, approval workflow, audit trail.

Fixture: OCR (filename-driven for demo determinism — PaddleOCR-ready pipeline) and login credentials (production would use JWT).

Team
Finathon 2026 · Aczen Technologies

Built by SAI CHARAN DEEP REDDY.

text

Then:
```bash
git add README.md
git commit -m "custom README"
git push
