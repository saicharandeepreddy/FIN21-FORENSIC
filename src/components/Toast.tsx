import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastNotification } from '../lib/types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto cursor-pointer p-4 bg-[#EDE8DF] text-[#0F0F0F] border border-[#0F0F0F] shadow-lg select-none ${
              toast.type === 'error'
                ? 'border-l-[4px] border-l-[#C8352B]'
                : toast.type === 'success'
                ? 'border-l-[4px] border-l-[#6B7B3E]'
                : 'border-l-[4px] border-l-[#8A8378]'
            }`}
          >
            <div className="small-caps text-[11px] tracking-[0.25em] font-bold text-[#0F0F0F]">
              {toast.title}
            </div>
            {toast.message && (
              <div className="text-xs text-[#0F0F0F] mt-1 font-sans">
                {toast.message}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
