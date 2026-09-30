import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { Claim, ClaimEvent, Actor } from '../lib/types';
import { fetchHistory, receiptUrl } from '../lib/api';
import { StatusPill } from './StatusPill';

interface ClaimDrawerProps {
  claim: Claim | null;
  onClose: () => void;
  currentUser: Actor | null;
  onOpenAppeal: (claim: Claim) => void;
  onOpenReject: (claim: Claim) => void;
  onOpenReimburse: (claim: Claim) => void;
  onManagerApprove: (claim: Claim) => void;
  onFinanceApprove: (claim: Claim) => void;
}

export const ClaimDrawer: React.FC<ClaimDrawerProps> = ({
  claim,
  onClose,
  currentUser,
  onOpenAppeal,
  onOpenReject,
  onOpenReimburse,
  onManagerApprove,
  onFinanceApprove,
}) => {
  const [history, setHistory] = useState<ClaimEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (claim && currentUser?.apiKey) {
      setLoadingHistory(true);
      fetchHistory(currentUser.apiKey, claim.id)
        .then((events) => {
          setHistory(events);
        })
        .catch(() => {
          setHistory([]);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    } else {
      setHistory([]);
    }
  }, [claim, currentUser?.apiKey]);

  if (!claim) return null;

  const isRejected = claim.status.endsWith('_REJECTED') || claim.status === 'REJECTED';
  const isFlagged = (claim.violations && claim.violations.length > 0) || (claim.forensics_flags && claim.forensics_flags.length > 0);
  const canAppeal = (isRejected || (claim.status === 'SUBMITTED' && isFlagged)) && currentUser?.role === 'employee';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black"
        />

        {/* Sliding Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen max-w-2xl bg-[#0F0F0F] text-[#EDE8DF] p-6 sm:p-10 flex flex-col justify-between overflow-y-auto border-l border-[#262626]"
          >
            {/* Top Navigation & Close */}
            <div>
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs tracking-wider text-[#8A8378]">
                    {claim.claim_number}
                  </span>
                  <StatusPill status={claim.status} />
                </div>
                <button
                  onClick={onClose}
                  className="text-[#EDE8DF] hover:text-[#C8352B] transition-colors p-1"
                >
                  <X className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>

              {/* Huge Status Word in Anton 64px */}
              <div className="mt-8 mb-6">
                <span className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
                  CURRENT AUDIT VERDICT
                </span>
                <h2
                  className={`font-anton text-[48px] sm:text-[64px] tracking-[-0.02em] leading-[0.85] uppercase ${
                    isRejected
                      ? 'text-[#C8352B]'
                      : isFlagged
                      ? 'text-[#D97706]'
                      : 'text-[#6B7B3E]'
                  }`}
                >
                  {claim.status === 'AUTO_APPROVED'
                    ? 'AUTO APPROVED'
                    : claim.status === 'MANAGER_APPROVED'
                    ? 'MGR APPROVED'
                    : claim.status === 'FINANCE_APPROVED'
                    ? 'FIN APPROVED'
                    : claim.status === 'REIMBURSED'
                    ? 'DISBURSED'
                    : isRejected
                    ? 'REJECTED'
                    : 'FLAGGED / IN REVIEW'}
                </h2>
              </div>

              {/* Receipt Preview Box */}
              {claim.receipt_path && (
                <div className="border border-[#262626] p-4 bg-[#141414] my-6">
                  <div className="flex items-center justify-between text-xs text-[#8A8378] mb-3 font-mono">
                    <span className="flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-[#C8352B] stroke-[1.5]" />
                      <span>RECEIPT ARTIFACT</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider">
                      PATH: {claim.receipt_path}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0A0A] border border-[#1F1F1F] p-2 flex items-center justify-center">
                    <img
                      src={receiptUrl(claim.receipt_path)}
                      alt={`Receipt artifact for ${claim.claim_number}`}
                      className="max-h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Key-Value Section */}
              <div className="my-6">
                <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] pb-2 border-b border-[#262626] mb-4">
                  EXTRACTED FINANCIAL TELEMETRY
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#8A8378] block">VENDOR</span>
                    <span className="font-bold text-[#EDE8DF]">{claim.vendor || 'Unknown Vendor'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A8378] block">CLAIMED AMOUNT</span>
                    <span className="font-mono font-bold text-lg text-[#C8352B]">
                      ₹{claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A8378] block">CATEGORY</span>
                    <span className="text-[#EDE8DF] capitalize">
                      {claim.category ? claim.category.replace(/_/g, ' ') : 'Other'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A8378] block">EXPENSE DATE</span>
                    <span className="font-mono text-[#EDE8DF]">{claim.expense_date || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#1F1F1F]">
                    <span className="text-xs text-[#8A8378] block">EMPLOYEE ID</span>
                    <span className="font-mono font-bold text-sm text-[#EDE8DF]">
                      {claim.employee_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection / Appeal reason banner if present */}
              {claim.rejection_reason && (
                <div className="border border-[#C8352B] bg-[#C8352B]/10 p-4 my-6">
                  <div className="small-caps text-[11px] text-[#C8352B] tracking-[0.25em] font-bold mb-1">
                    REJECTION AUDIT REASON: {claim.rejection_reason}
                  </div>
                </div>
              )}

              {/* Reimbursement Details if paid */}
              {claim.reimbursement_reference && (
                <div className="border border-[#6B7B3E] bg-[#6B7B3E]/10 p-4 my-6">
                  <div className="small-caps text-[11px] text-[#6B7B3E] tracking-[0.25em] font-bold mb-1">
                    DISBURSEMENT CONFIRMED
                  </div>
                  <div className="font-mono text-xs text-[#EDE8DF] mt-1">
                    Bank UTR Ref: <strong>{claim.reimbursement_reference}</strong>
                  </div>
                </div>
              )}

              {/* Violations Section */}
              <div className="my-6">
                <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] pb-2 border-b border-[#262626] mb-4">
                  POLICY VIOLATIONS
                </div>
                {!claim.violations || claim.violations.length === 0 ? (
                  <div className="flex items-center space-x-2 text-sm text-[#6B7B3E]">
                    <Check className="w-5 h-5 stroke-[2]" />
                    <span className="font-bold small-caps tracking-[0.25em]">ALL CLEAR — ZERO BREACHES</span>
                  </div>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {claim.violations.map((v, i) => (
                      <li key={i} className="flex items-start space-x-2.5 text-[#EDE8DF]">
                        <span className="w-2 h-2 rounded-none bg-[#C8352B] mt-1 shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Forensics Flags */}
              {claim.forensics_flags && claim.forensics_flags.length > 0 && (
                <div className="my-6">
                  <div className="small-caps text-[11px] text-[#C8352B] tracking-[0.25em] pb-2 border-b border-[#262626] mb-4 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                    <span>FORENSIC TAMPERING INDICATORS</span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {claim.forensics_flags.map((flag, i) => (
                      <li key={i} className="flex items-start space-x-2.5 text-[#EDE8DF] bg-[#C8352B]/10 p-2.5 border border-[#C8352B]/30">
                        <AlertTriangle className="w-4 h-4 text-[#C8352B] stroke-[1.5] shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline Section */}
              <div className="my-8">
                <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] pb-2 border-b border-[#262626] mb-4">
                  AUDIT TIMELINE
                </div>
                {loadingHistory ? (
                  <div className="small-caps text-xs text-[#8A8378] tracking-[0.25em]">LOADING.</div>
                ) : history.length === 0 ? (
                  <div className="text-xs text-[#8A8378]">NO TIMELINE EVENTS RECORDED.</div>
                ) : (
                  <div className="space-y-4">
                    {history.map((evt) => (
                      <div key={evt.id} className="flex items-start justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                        <div>
                          <div className="font-anton text-lg tracking-[-0.02em] text-[#EDE8DF] uppercase">
                            {evt.event_type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[#8A8378] text-[11px] mt-0.5">
                            Actor: <span className="text-[#EDE8DF] font-mono">{evt.actor_id}</span> ({evt.actor_role})
                          </div>
                          {evt.notes && (
                            <div className="text-xs text-[#8A8378] italic mt-1">
                              "{evt.notes}"
                            </div>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-[#8A8378] text-right">
                          {new Date(evt.created_at).toLocaleDateString()}<br />
                          {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions based on Role and Status */}
            <div className="pt-6 border-t border-[#262626] space-y-3">
              {/* Employee Appeal Button */}
              {canAppeal && (
                <button
                  onClick={() => onOpenAppeal(claim)}
                  className="w-full py-4 border border-[#C8352B] text-[#C8352B] hover:bg-[#C8352B] hover:text-[#EDE8DF] transition-colors small-caps font-bold text-xs tracking-[0.25em] flex items-center justify-center space-x-2"
                >
                  <span>RAISE FORMAL APPEAL</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </button>
              )}

              {/* Manager Review Buttons */}
              {(currentUser?.role === 'manager' || currentUser?.role === 'admin') &&
                ['SUBMITTED', 'AUTO_APPROVED', 'FLAGGED'].includes(claim.status) && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onManagerApprove(claim)}
                      className="py-3 bg-[#6B7B3E] hover:bg-[#5A6934] text-[#EDE8DF] small-caps font-bold text-xs tracking-[0.25em] transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>APPROVE CLAIM</span>
                    </button>
                    <button
                      onClick={() => onOpenReject(claim)}
                      className="py-3 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps font-bold text-xs tracking-[0.25em] transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                      <span>REJECT CLAIM</span>
                    </button>
                  </div>
                )}

              {/* Finance Review Buttons */}
              {(currentUser?.role === 'finance' || currentUser?.role === 'admin') &&
                claim.status === 'MANAGER_APPROVED' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onFinanceApprove(claim)}
                      className="py-3 bg-[#6B7B3E] hover:bg-[#5A6934] text-[#EDE8DF] small-caps font-bold text-xs tracking-[0.25em] transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>APPROVE (FINANCE)</span>
                    </button>
                    <button
                      onClick={() => onOpenReject(claim)}
                      className="py-3 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps font-bold text-xs tracking-[0.25em] transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                      <span>REJECT</span>
                    </button>
                  </div>
                )}

              {/* Finance Reimbursement Action */}
              {(currentUser?.role === 'finance' || currentUser?.role === 'admin') &&
                claim.status === 'FINANCE_APPROVED' && (
                  <button
                    onClick={() => onOpenReimburse(claim)}
                    className="w-full py-4 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps font-bold text-xs tracking-[0.25em] transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>EXECUTE REIMBURSEMENT (DISBURSE)</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                  </button>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
