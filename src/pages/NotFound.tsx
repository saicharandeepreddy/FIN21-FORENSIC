import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onBackHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onBackHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="small-caps text-[12px] text-[#C8352B] tracking-[0.25em] font-bold mb-2">
        ERROR 404 · ACCESS FAULT
      </div>
      <h1 className="font-anton text-[80px] sm:text-[120px] text-[#0F0F0F] tracking-[-0.02em] leading-none uppercase">
        NOT FOUND.
      </h1>
      <p className="text-[#8A8378] text-base mt-4 max-w-md mx-auto">
        The requested forensic ledger index, claim identifier, or audit pathway does not exist in the current session.
      </p>
      <button
        onClick={onBackHome}
        className="mt-8 px-6 py-3 bg-[#0F0F0F] hover:bg-[#C8352B] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] transition-colors flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
        <span>RETURN TO WORKSPACE</span>
      </button>
    </div>
  );
};
