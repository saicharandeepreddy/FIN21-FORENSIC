const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const ROLE_KEYS = {
  employee: "sk_employee_ravi",
  manager:  "sk_manager_karthik",
  finance:  "sk_finance_arjun",
  admin:    "sk_admin_chaitanya",
};

export interface Claim {
  id: number;
  claim_number: string;
  employee_id: string;
  vendor: string | null;
  amount: number;
  category: string;
  expense_date: string | null;
  receipt_path: string | null;
  status: string;
  violations: string[];
  forensics_flags: string[];
  manager_approved_by: string | null;
  finance_approved_by: string | null;
  reimbursement_reference: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimEvent {
  id: number;
  claim_id: number;
  event_type: string;
  actor_id: string;
  actor_role: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
}

async function req<T>(path: string, apiKey: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "X-API-Key": apiKey,
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const fetchClaims = (k: string) => req<Claim[]>("/api/v1/claims", k);

export const fetchClaim = (k: string, id: number) =>
  req<Claim>(`/api/v1/claims/${id}`, k);

export const fetchHistory = (k: string, id: number) =>
  req<ClaimEvent[]>(`/api/v1/claims/${id}/history`, k);

export const uploadClaim = async (k: string, fd: FormData, _meta?: any) =>
  req<Claim>("/api/v1/claims/upload", k, { method: "POST", body: fd });
  // IMPORTANT: do NOT set Content-Type — browser adds multipart boundary

export const managerReview = (k: string, id: number, body: object, _meta?: any) =>
  req<Claim>(`/api/v1/claims/${id}/manager-review`, k, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const financeReview = (k: string, id: number, body: object, _meta?: any) =>
  req<Claim>(`/api/v1/claims/${id}/finance-review`, k, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const reimburse = (k: string, id: number, body: object, _meta?: any) =>
  req<Claim>(`/api/v1/claims/${id}/reimburse`, k, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const raiseAppeal = async (claimIdOrKey: any, notesOrId: any, maybeNotesOrMeta?: any) => {
  let key: string;
  let id: number;
  let notes: string;

  if (typeof claimIdOrKey === 'string' && typeof notesOrId === 'number') {
    key = claimIdOrKey;
    id = notesOrId;
    notes = typeof maybeNotesOrMeta === 'string' ? maybeNotesOrMeta : (maybeNotesOrMeta?.notes || '');
  } else {
    id = Number(claimIdOrKey);
    notes = String(notesOrId);
    key = ROLE_KEYS.employee;
  }

  try {
    const raw = localStorage.getItem('fin21_appeals');
    const map = raw ? JSON.parse(raw) : {};
    map[id] = notes;
    localStorage.setItem('fin21_appeals', JSON.stringify(map));
  } catch {}

  try {
    return await req<Claim>(`/api/v1/claims/${id}/appeal`, key, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  } catch {
    return await fetchClaim(key, id);
  }
};

export const receiptUrl = (path: string | null) => (path ? `${API}${path}` : "");
