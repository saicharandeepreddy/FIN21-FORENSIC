export type Role = 'employee' | 'manager' | 'finance' | 'admin';

export interface Actor {
  apiKey: string;
  role: string;
  actorId: string;
  name: string;
  title: string;
  avatarInitials: string;
  email: string;
}

export type { Claim, ClaimEvent } from './api';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface ReviewPayload {
  decision: 'approve' | 'reject';
  notes?: string;
  rejection_reason?: string;
}

export interface ReimbursePayload {
  reimbursement_reference: string;
  amount?: number;
}
