import React from 'react';
import { Claim } from '../lib/types';
import { StatusPill } from './StatusPill';
import { ArrowRight, Check, X, CreditCard } from 'lucide-react';

interface ClaimsTableProps {
  claims: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onManagerApprove?: (claim: Claim) => void;
  onManagerReject?: (claim: Claim) => void;
  onFinanceReimburse?: (claim: Claim) => void;
  showManagerActions?: boolean;
  showFinanceActions?: boolean;
  emptyMessage?: string;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  claims,
  onSelectClaim,
  onManagerApprove,
  onManagerReject,
  onFinanceReimburse,
  showManagerActions = false,
  showFinanceActions = false,
  emptyMessage = 'NO CLAIMS REGISTERED.',
}) => {
  if (claims.length === 0) {
    return (
      <div className="py-20 text-center border-t border-b border-[#0F0F0F] my-6">
        <h3 className="font-anton text-[40px] sm:text-[48px] text-[#0F0F0F] tracking-[-0.02em] uppercase leading-none">
          NOTHING HERE YET.
        </h3>
        <p className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Swiss Editorial Table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#0F0F0F]">
              <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
                REF / CLAIM #
              </th>
              <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
                VENDOR & DATE
              </th>
              <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
                CATEGORY
              </th>
              <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold text-right">
                AMOUNT (₹)
              </th>
              <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold text-center">
                STATUS
              </th>
              {(showManagerActions || showFinanceActions) && (
                <th className="py-3 px-4 small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold text-right">
                  ACTIONS
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F0F0F]">
            {claims.map((claim) => {
              const isOver5k = claim.amount > 5000;
              return (
                <tr
                  key={claim.id}
                  onClick={() => onSelectClaim(claim)}
                  className="group cursor-pointer hover:bg-[#F5F1E8] transition-colors"
                >
                  {/* Claim # in mono */}
                  <td className="py-4 px-4 font-mono text-sm text-[#0F0F0F] group-hover:translate-x-1 transition-transform">
                    {claim.claim_number}
                  </td>

                  {/* Vendor & Date */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-sm text-[#0F0F0F]">
                      {claim.vendor}
                    </div>
                    <div className="text-xs text-[#8A8378] font-mono mt-0.5">
                      {claim.expense_date} {claim.employee_name ? `· ${claim.employee_name}` : ''}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 text-xs text-[#8A8378] capitalize">
                    {claim.category.replace('_', ' ')}
                  </td>

                  {/* Amount (blood-red if > 5000) */}
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-mono text-base font-bold ${
                        isOver5k ? 'text-[#C8352B]' : 'text-[#0F0F0F]'
                      }`}
                    >
                      ₹{claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <StatusPill status={claim.status} />
                  </td>

                  {/* Optional Inline Actions */}
                  {(showManagerActions || showFinanceActions) && (
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {showManagerActions && ['SUBMITTED', 'AUTO_APPROVED'].includes(claim.status) && (
                        <div className="flex items-center justify-end space-x-3 text-xs small-caps">
                          <button
                            onClick={() => onManagerApprove?.(claim)}
                            className="text-[#6B7B3E] hover:underline flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2]" />
                            <span>APPROVE</span>
                          </button>
                          <span className="text-[#8A8378]">/</span>
                          <button
                            onClick={() => onManagerReject?.(claim)}
                            className="text-[#C8352B] hover:underline flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                            <span>REJECT</span>
                          </button>
                        </div>
                      )}

                      {showFinanceActions && claim.status === 'MANAGER_APPROVED' && (
                        <div className="flex items-center justify-end space-x-3 text-xs small-caps">
                          <button
                            onClick={() => onManagerApprove?.(claim)}
                            className="text-[#6B7B3E] hover:underline"
                          >
                            APPROVE (FIN)
                          </button>
                          <span className="text-[#8A8378]">/</span>
                          <button
                            onClick={() => onManagerReject?.(claim)}
                            className="text-[#C8352B] hover:underline"
                          >
                            REJECT
                          </button>
                        </div>
                      )}

                      {showFinanceActions && claim.status === 'FINANCE_APPROVED' && (
                        <button
                          onClick={() => onFinanceReimburse?.(claim)}
                          className="text-[#C8352B] hover:underline small-caps text-xs font-bold flex items-center space-x-1 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>REIMBURSE →</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card Layout (visible below 768px) */}
      <div className="block md:hidden divide-y divide-[#0F0F0F] border-t border-b border-[#0F0F0F]">
        {claims.map((claim) => {
          const isOver5k = claim.amount > 5000;
          return (
            <div
              key={claim.id}
              onClick={() => onSelectClaim(claim)}
              className="py-4 px-2 cursor-pointer hover:bg-[#F5F1E8] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-[#8A8378] font-bold">
                    {claim.claim_number}
                  </span>
                  <h4 className="font-bold text-sm text-[#0F0F0F] mt-0.5">
                    {claim.vendor}
                  </h4>
                  <div className="text-xs text-[#8A8378] font-mono mt-0.5">
                    {claim.expense_date}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono text-base font-bold ${
                      isOver5k ? 'text-[#C8352B]' : 'text-[#0F0F0F]'
                    }`}
                  >
                    ₹{claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={claim.status} />
                  </div>
                </div>
              </div>

              {(showManagerActions || showFinanceActions) && (
                <div
                  className="mt-3 pt-3 border-t border-[#0F0F0F]/30 flex items-center justify-end space-x-4 text-xs small-caps"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showManagerActions && ['SUBMITTED', 'AUTO_APPROVED'].includes(claim.status) && (
                    <>
                      <button
                        onClick={() => onManagerApprove?.(claim)}
                        className="text-[#6B7B3E] font-bold underline"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => onManagerReject?.(claim)}
                        className="text-[#C8352B] font-bold underline"
                      >
                        REJECT
                      </button>
                    </>
                  )}
                  {showFinanceActions && claim.status === 'FINANCE_APPROVED' && (
                    <button
                      onClick={() => onFinanceReimburse?.(claim)}
                      className="text-[#C8352B] font-bold underline"
                    >
                      REIMBURSE →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
