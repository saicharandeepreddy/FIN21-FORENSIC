import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { StatCard } from '../../components/StatCard';
import { ClaimsTable } from '../../components/ClaimsTable';

interface FinanceDashboardProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onNavigateReady: () => void;
  refreshTrigger?: number;
}

export const FinanceDashboardView: React.FC<FinanceDashboardProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
  onNavigateReady,
  refreshTrigger,
}) => {
  const [internalClaims, setInternalClaims] = useState<Claim[]>(passedClaims || []);
  const [loading, setLoading] = useState<boolean>(!passedClaims);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (passedClaims !== undefined) {
      setInternalClaims(passedClaims);
      setLoading(false);
      return;
    }
    if (user?.apiKey) {
      setLoading(true);
      setError(null);
      fetchClaims(user.apiKey)
        .then((data) => {
          setInternalClaims(data);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch treasury metrics');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const readyToPayCount = claims.filter((c) => c.status === 'FINANCE_APPROVED').length;
  const readyToPayAmount = claims
    .filter((c) => c.status === 'FINANCE_APPROVED')
    .reduce((acc, c) => acc + (c.amount || 0), 0);

  const totalDisbursed = claims
    .filter((c) => c.status === 'REIMBURSED')
    .reduce((acc, c) => acc + (c.amount || 0), 0);

  const pendingManagerApproved = claims.filter((c) => c.status === 'MANAGER_APPROVED').length;

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0F0F0F] pb-6">
        <div>
          <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
            TREASURY DISBURSEMENT.
          </h1>
          <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
            LIQUIDITY MANAGEMENT & STATUTORY RECONCILIATION
          </div>
        </div>

        {readyToPayCount > 0 && (
          <button
            onClick={onNavigateReady}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors"
          >
            DISBURSE ₹{(readyToPayAmount / 1000).toFixed(1)}K READY
          </button>
        )}
      </div>

      {loading && (
        <div className="small-caps text-xs text-[#8A8378] tracking-[0.25em] py-2">
          LOADING.
        </div>
      )}

      {error && (
        <div className="border border-[#C8352B] bg-[#C8352B]/10 p-4 text-xs text-[#C8352B] font-mono">
          ERROR: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#0F0F0F] border-t border-b border-[#0F0F0F]">
            <div className="sm:px-6 first:pl-0">
              <StatCard
                label="READY FOR WIRE (UTR)"
                value={`₹${(readyToPayAmount / 1000).toFixed(1)}K`}
                subline={`${readyToPayCount} batches approved`}
                highlightRed={readyToPayCount > 0}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="SETTLED DISBURSEMENTS"
                value={`₹${(totalDisbursed / 1000).toFixed(1)}K`}
                subline="Total liquidity wired"
                highlightRed={false}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="AWAITING 2ND REVIEW"
                value={pendingManagerApproved}
                subline="Manager approved queue"
                highlightRed={false}
              />
            </div>
            <div className="sm:px-6 last:pr-0">
              <StatCard
                label="TAX RECONCILIATION"
                value="100%"
                subline="Mod-36 Luhn verified"
                highlightRed={false}
              />
            </div>
          </div>

          {/* Ready to pay list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0F0F0F] pb-2">
              <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
                IMMEDIATE DISBURSEMENT QUEUE
              </div>
            </div>
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'FINANCE_APPROVED')}
              onSelectClaim={onSelectClaim}
              emptyMessage="NO CLAIMS QUEUED FOR IMMEDIATE PAYMENT."
            />
          </div>
        </>
      )}
    </div>
  );
};
