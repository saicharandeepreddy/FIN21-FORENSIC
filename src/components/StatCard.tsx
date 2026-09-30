import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subline?: string;
  highlightRed?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subline,
  highlightRed = true,
}) => {
  return (
    <div className="py-4 sm:py-6 flex flex-col justify-between">
      <div>
        <div className="small-caps text-[11px] sm:text-[12px] text-[#8A8378] tracking-[0.25em] font-bold">
          {label}
        </div>
        <div
          className={`font-anton text-[64px] sm:text-[80px] lg:text-[96px] tracking-[-0.02em] leading-[0.85] uppercase mt-2 ${
            highlightRed ? 'text-[#C8352B]' : 'text-[#0F0F0F]'
          }`}
        >
          {value}
        </div>
      </div>
      {subline && (
        <div className="text-xs text-[#8A8378] mt-3 font-mono">
          {subline}
        </div>
      )}
    </div>
  );
};
