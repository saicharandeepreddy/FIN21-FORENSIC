import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import { Claim } from '../lib/types';

interface AppealModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitAppeal: (claimId: number, notes: string) => void;
}

export const AppealModal: React.FC<AppealModalProps> = ({
  claim,
  isOpen,
  onClose,
  onSubmitAppeal,
}) => {
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !claim) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Please provide a justification or mitigating context for your appeal.');
      return;
    }
    onSubmitAppeal(claim.id, justification.trim());
    setJustification('');
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
                POLICY EXCEPTION PROTOCOL
              </span>
              <h2 className="font-anton text-[36px] sm:text-[40px] text-[#EDE8DF] tracking-[-0.02em] leading-none uppercase">
                RAISE APPEAL
              </h2>
            </div>
            <button onClick={onClose} className="text-[#EDE8DF] hover:text-[#C8352B] p-1">
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          <div className="mb-4 text-xs text-[#8A8378]">
            Claim Ref: <span className="font-mono text-[#EDE8DF] font-bold">{claim.claim_number}</span> | Vendor: <span className="text-[#EDE8DF]">{claim.vendor}</span> | Amount: <span className="font-mono text-[#C8352B] font-bold">₹{claim.amount.toLocaleString()}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-2 font-bold">
                APPEAL JUSTIFICATION & BUSINESS CONTEXT
              </label>
              <textarea
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  if (error) setError('');
                }}
                rows={5}
                placeholder="Explain why this expense was necessary for company business (e.g. emergency hardware replacement, VP pre-approved client dinner, travel schedule change)..."
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
                className="px-6 py-3 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4 stroke-[1.5]" />
                <span>SUBMIT APPEAL</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
