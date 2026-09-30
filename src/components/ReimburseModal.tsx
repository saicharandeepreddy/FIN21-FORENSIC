import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { Claim, ReimbursePayload } from '../lib/types';

interface ReimburseModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (claimId: number, payload: ReimbursePayload) => void;
}

export const ReimburseModal: React.FC<ReimburseModalProps> = ({
  claim,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (claim) {
      setAmount(claim.amount.toString());
      setUtr(`UTR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-HDFC-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [claim]);

  if (!isOpen || !claim) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) {
      setError('A valid bank transaction reference (UTR) is required.');
      return;
    }
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setError('Please specify a positive reimbursement amount.');
      return;
    }
    onConfirm(claim.id, {
      reimbursement_reference: utr.trim(),
      amount: parsedAmt,
    });
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
              <span className="small-caps text-[11px] text-[#6B7B3E] tracking-[0.25em] font-bold block mb-1">
                DISBURSEMENT DIRECTIVE
              </span>
              <h2 className="font-anton text-[36px] sm:text-[40px] text-[#EDE8DF] tracking-[-0.02em] leading-none uppercase">
                REIMBURSE
              </h2>
            </div>
            <button onClick={onClose} className="text-[#EDE8DF] hover:text-[#C8352B] p-1">
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          <div className="mb-4 text-xs text-[#8A8378]">
            Payee: <strong className="text-[#EDE8DF]">{claim.employee_name || claim.employee_id}</strong> | Claim: <span className="font-mono text-[#EDE8DF]">{claim.claim_number}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-2 font-bold">
                BANK UTR / PAYMENT REFERENCE
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-[#EDE8DF] text-[#0F0F0F] px-3 py-2.5 text-sm font-mono rounded-[2px] border border-[#0F0F0F] focus:outline-none"
                placeholder="e.g. UTR-20260930-HDFC-88129"
                required
              />
            </div>

            <div>
              <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-2 font-bold">
                DISBURSEMENT AMOUNT (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#EDE8DF] text-[#C8352B] font-mono font-bold text-lg px-3 py-2.5 rounded-[2px] border border-[#0F0F0F] focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-1.5 text-xs text-[#C8352B] font-sans">
                <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />
                <span>{error}</span>
              </div>
            )}

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
                className="px-6 py-3 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4 stroke-[1.5]" />
                <span>EXECUTE PAYMENT</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
