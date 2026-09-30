import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { StatCard } from '../../components/StatCard';
import { ClaimsTable } from '../../components/ClaimsTable';

interface ManagerDashboardProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onNavigatePending: () => void;
  refreshTrigger?: number;
}

export const ManagerDashboardView: React.FC<ManagerDashboardProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
  onNavigatePending,
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
          setError(err.message || 'Failed to fetch manager metrics');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const pendingCount = claims.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'AUTO_APPROVED' || c.status === 'FLAGGED'
  ).length;
  const approvedCount = claims.filter(
    (c) => c.status === 'MANAGER_APPROVED' || c.status === 'FINANCE_APPROVED' || c.status === 'REIMBURSED'
  ).length;
  const rejectedCount = claims.filter(
    (c) => c.status.endsWith('_REJECTED') || c.status === 'REJECTED'
  ).length;
  const totalVolume = claims.reduce((acc, c) => acc + (c.amount || 0), 0);

  return (
    <div className="w-full space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0F0F0F] pb-6">
        <div>
          <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
            MANAGER OVERVIEW.
          </h1>
          <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
            DEPARTMENTAL BUDGET VELOCITY & AUDIT COMPLIANCE
          </div>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={onNavigatePending}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors"
          >
            REVIEW {pendingCount} PENDING
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
                label="PENDING ADJUDICATION"
                value={pendingCount}
                subline="Requires manager action"
                highlightRed={pendingCount > 0}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="APPROVED CLAIMS"
                value={approvedCount}
                subline="Passed to finance queue"
                highlightRed={false}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="REJECTED CLAIMS"
                value={rejectedCount}
                subline="Policy non-conformity"
                highlightRed={true}
              />
            </div>
            <div className="sm:px-6 last:pr-0">
              <StatCard
                label="DEPARTMENT RUN-RATE"
                value={`₹${(totalVolume / 1000).toFixed(1)}K`}
                subline="Fiscal cycle to date"
                highlightRed={false}
              />
            </div>
          </div>

          {/* Pending Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0F0F0F] pb-2">
              <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
                ACTION REQUIRED // PENDING REVIEW
              </div>
            </div>
            <ClaimsTable
              claims={claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'AUTO_APPROVED' || c.status === 'FLAGGED')}
              onSelectClaim={onSelectClaim}
              emptyMessage="ALL DEPARTMENT SUBMISSIONS HAVE BEEN REVIEWED."
            />
          </div>
        </>
      )}
    </div>
  );
};
