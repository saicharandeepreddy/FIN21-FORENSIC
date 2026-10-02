FIN21 — Expense Forensics

**Autonomous expense audit & Maker-Checker approval engine**  
Built at Finathon 2026 · Aczen Technologies

🌐 **Live App:** https://fin-21-forensic.vercel.app/  
⚙️ **API Docs:** https://fin21-forensic.onrender.com/docs  
📦 **Repo:** https://github.com/saicharandeepreddy/FIN21-FORENSIC

---

## Try It Now

Open the live app: **https://fin-21-forensic.vercel.app/**

### Demo Credentials

| Email | Password | Role |
|---|---|---|
| ravi@tulasisupplies.example | demo1234 | Employee |
| karthik@tulasisupplies.example | demo1234 | Manager |
| arjun@tulasisupplies.example | demo1234 | Finance |
| chaitanya@tulasisupplies.example | demo1234 | Admin |

Click any credential row on the login page to auto-fill. Then click **SIGN IN**.

---

## Full Flow in 90 Seconds

1. **Login as Ravi** (Employee) → click credential row → SIGN IN
2. Hamburger → **SUBMIT**
3. Upload any image renamed to `uber_receipt.jpg`
4. Set Vendor to `Deccan IT Services Ltd`, Amount to `1500`, Category to `Office Supplies`, Date to `2026-09-28`
5. Click **SUBMIT FOR AUTONOMOUS COMPLIANCE AUDIT**
6. Claim appears in **MY CLAIMS** with a green **AUTO_APPROVED** badge
7. Click it → evidence drawer opens with receipt image, extracted data, and audit timeline
8. **Sign out → login as Karthik** (Manager) → Pending Review → Approve
9. **Sign out → login as Arjun** (Finance) → Approve → Reimburse with UTR `UTR20260930001`
10. Click claim → History → see all 4 events logged

End-to-end Maker-Checker flow in under two minutes.

---

## What This Is

An expense verification platform that runs **six independent forensic checks** on every uploaded receipt — four against Aczen's live Nova API, two using local mathematical analysis. Clean claims auto-approve in under 3 seconds. Flagged claims route to Manager → Finance → Reimbursement with a complete audit trail.

Every check is deterministic and explainable. No ML black boxes.

---

## The Six Forensic Checks

| # | Check | Type | What It Catches |
|---|---|---|---|
| 1 | Employee in Nova master | Live API | Unknown / fake employees |
| 2 | Vendor in approved list | Live API | Shell companies, unapproved vendors |
| 3 | Amount vs dynamic policy limit (per grade G1–G8) | Live API | Off-policy spending |
| 4 | Duplicate within ±3 days | Live API | Same receipt submitted twice |
| 5 | GSTIN Mod-36 Luhn checksum | Local math | Fabricated tax IDs |
| 6 | EXIF metadata + ELA + DWT | Local forensics | Edited / AI-generated receipts |

**All 6 pass → AUTO_APPROVED.** Any fail → FLAGGED with the exact reason.

---

## Core Features

- **JWT-authenticated** with bcrypt-hashed passwords
- **Maker-Checker workflow:** Employee → Manager → Finance → Reimbursed
- **Complete audit trail:** every state change logged with server-verified actor
- **Role-based UI:** Employee · Manager · Finance · Admin — each sees only their views
- **Editorial design system:** Anton typeface, cream + blood-red palette
- **Persistent sidebar navigation** with role-specific items

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS |
| Backend | Python 3.13 · FastAPI · SQLAlchemy 2.1 |
| Database | SQLite (PostgreSQL-ready via SQLAlchemy) |
| Auth | JWT (python-jose) + bcrypt |
| Forensics | piexif · PyWavelets · NumPy · Pillow |
| External API | Aczen Nova (read-only, live) |
| Deploy | Render (backend) · Vercel (frontend) |

---

## API Endpoints

All endpoints except `/health` and `/api/v1/auth/login` require:  
`Authorization: Bearer <jwt_token>`

| Method | Endpoint | Role Required | Purpose |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/v1/auth/login` | — | Returns JWT |
| POST | `/api/v1/claims/upload` | employee, admin | Full pipeline |
| GET | `/api/v1/claims` | any | List claims |
| GET | `/api/v1/claims/{id}` | any | Single claim |
| POST | `/api/v1/claims/{id}/manager-review` | manager, admin | Approve/reject |
| POST | `/api/v1/claims/{id}/finance-review` | finance, admin | Second approval |
| POST | `/api/v1/claims/{id}/reimburse` | finance, admin | UTR reimbursement |
| GET | `/api/v1/claims/{id}/history` | any | Audit trail |
| POST | `/api/v1/claims/{id}/appeal` | any | Employee appeal |
| GET | `/api/v1/employees/verify` | any | Proxy to Nova |
| GET | `/api/v1/vendors/verify` | any | Proxy to Nova |

**Interactive API docs:** https://fin21-forensic.onrender.com/docs

---

## Nova API Integration

- **Base URL:** `https://www.aczen.in/nova-api/v1`
- **Auth:** `Authorization: Bearer nova_sk_...`
- **Rate limit:** 120 requests/minute
- **4 live calls per claim submission:**
  - `GET /employees?code=X` — verify employee + fetch grade
  - `GET /vendors?name.ilike=X` — vendor match
  - `GET /spend-policies?category=X` — dynamic policy limit
  - `GET /expense-claims?...` — duplicate detection ±3 days

---

## Architecture
┌──────────────────────────────────────────────────┐
│ Browser — React + Vite + TS │
│ Login · Submit · Claims · Evidence Drawer │
│ localStorage: JWT token │
│ Every fetch: Authorization: Bearer <jwt> │
└────────────────────┬─────────────────────────────┘
│ HTTPS
▼
┌──────────────────────────────────────────────────┐
│ BACKEND — FastAPI + Python │
│ auth.py → JWT decode + role checks │
│ main.py → 11 REST endpoints │
│ ocr_engine.py → receipt text extraction │
│ forensics.py → GSTIN Mod-36 + EXIF │
│ ela_dwt.py → ELA + DWT image forensics │
│ policy_engine.py → orchestrates 6 checks │
│ nova_client.py → async httpx to Nova API │
└──────────┬─────────────────┬─────────────────────┘
│ SQLAlchemy │ HTTP (live)
▼ ▼
┌──────────┐ ┌──────────────┐
│ SQLite │ │ Nova API │
│ claims │ │ aczen.in │
│ events │ │ nova-api/v1 │
└──────────┘ └──────────────┘

Troubleshooting
Live demo is slow on first load:
Render free tier spins down after 15 minutes of inactivity. First request takes 30–50 seconds to wake up. Subsequent requests are fast.

Backend won't start — bcrypt error:
Run pip install bcrypt==4.0.1.

401 Unauthorized:
JWT expired. Clear localStorage and re-login.

Built By
Sai Charan Deep Reddy & Team
Finathon 2026 · Aczen Technologies

License
Hackathon submission — not licensed for commercial use.
