import React from 'react';

interface StatusPillProps {
  status: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  let borderColor = 'border-[#8A8378]';
  let textColor = 'text-[#8A8378]';
  let label = status ? status.replace(/_/g, ' ') : 'UNKNOWN';

  if (status === 'AUTO_APPROVED') {
    borderColor = 'border-[#6B7B3E]';
    textColor = 'text-[#6B7B3E]';
    label = 'AUTO APPROVED';
  } else if (status === 'MANAGER_APPROVED') {
    borderColor = 'border-[#6B7B3E]';
    textColor = 'text-[#6B7B3E]';
    label = 'MANAGER APPROVED';
  } else if (status === 'FINANCE_APPROVED') {
    borderColor = 'border-[#6B7B3E]';
    textColor = 'text-[#6B7B3E]';
    label = 'FINANCE APPROVED';
  } else if (status === 'SUBMITTED' || status === 'FLAGGED') {
    borderColor = 'border-[#D97706]';
    textColor = 'text-[#D97706]';
    label = status === 'FLAGGED' ? 'FLAGGED' : 'IN REVIEW';
  } else if (status.endsWith('_REJECTED') || status === 'REJECTED') {
    borderColor = 'border-[#C8352B]';
    textColor = 'text-[#C8352B]';
    label = status === 'MANAGER_REJECTED' ? 'MGR REJECTED' : status === 'FINANCE_REJECTED' ? 'FIN REJECTED' : 'REJECTED';
  } else if (status === 'REIMBURSED') {
    borderColor = 'border-[#0F0F0F]';
    textColor = 'text-[#0F0F0F]';
    label = 'REIMBURSED';
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 border ${borderColor} ${textColor} text-[10px] font-semibold tracking-[0.25em] uppercase small-caps ${className}`}
    >
      {label}
    </span>
  );
};
