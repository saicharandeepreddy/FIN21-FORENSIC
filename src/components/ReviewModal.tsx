import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Claim, ReviewPayload } from '../lib/types';

interface ReviewModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (claimId: number, payload: ReviewPayload) => void;
  stage: 'manager' | 'finance';
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  claim,
  isOpen,
  onClose,
  onConfirm,
  stage,
}) => {
  const [reason, setReason] = useState('POLICY_VIOLATION');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !claim) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Audit reason notes are required for formal claim rejection.');
      return;
    }
    onConfirm(claim.id, {
      decision: 'reject',
      rejection_reason: reason,
      notes: notes.trim(),
    });
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F0F0F]"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative bg-[#0F0F0F] text-[#EDE8DF] border border-[#262626] max-w-lg w-full p-6 sm:p-8 z-10 shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-[#262626] pb-4 mb-6">
            <div>
              <span className="small-caps text-[11px] text-[#C8352B] tracking-[0.25em] font-bold block mb-1">
                {stage.toUpperCase()} ADJUDICATION
              </span>
              <h2 className="font-anton text-[36px] sm:text-[40px] text-[#EDE8DF] tracking-[-0.02em] leading-none uppercase">
                REJECT CLAIM
              </h2>
            </div>
            <button onClick={onClose} className="text-[#EDE8DF] hover:text-[#C8352B] p-1">
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          <div className="mb-4 text-xs text-[#8A8378]">
            Claim ID: <span className="font-mono text-[#EDE8DF] font-bold">{claim.claim_number}</span> | Vendor: <span className="text-[#EDE8DF]">{claim.vendor}</span> | Amount: <span className="font-mono text-[#C8352B] font-bold">₹{claim.amount.toLocaleString()}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-2 font-bold">
                REJECTION CATEGORY
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#EDE8DF] text-[#0F0F0F] px-3 py-2.5 text-sm font-sans rounded-[2px] border border-[#0F0F0F] focus:outline-none"
              >
                <option value="POLICY_VIOLATION">Corporate Policy Limit Exceeded</option>
                <option value="SUSPICIOUS_RECEIPT">Suspicious / Tampered Receipt Artifacts</option>
                <option value="MISSING_GSTIN">Invalid or Missing Mod-36 GSTIN</option>
                <option value="UNAUTHORIZED_VENDOR">Unauthorized / Unverified Vendor</option>
                <option value="DUPLICATE_CLAIM">Duplicate Claim Hash Detected</option>
                <option value="OTHER">Other Compliance Non-conformity</option>
              </select>
            </div>

            <div>
              <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-2 font-bold">
                AUDIT NOTES (MANDATORY)
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (error) setError('');
                }}
                rows={4}
                placeholder="Detail why this expense failed policy verification..."
                className="w-full bg-[#EDE8DF] text-[#0F0F0F] p-3 text-sm font-sans rounded-[2px] border border-[#0F0F0F] placeholder:text-[#8A8378] focus:outline-none resize-none"
              />
              {error && (
                <div className="flex items-center space-x-1.5 text-xs text-[#C8352B] mt-1.5 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#262626] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-[#8A8378] text-[#8A8378] hover:border-[#EDE8DF] hover:text-[#EDE8DF] small-caps text-xs tracking-[0.25em] transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors"
              >
                CONFIRM REJECTION
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
