import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { StatCard } from '../../components/StatCard';
import { ClaimsTable } from '../../components/ClaimsTable';

interface DashboardProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onOpenSubmit: () => void;
}

export const EmployeeDashboardView: React.FC<DashboardProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
  onOpenSubmit,
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
          setError(err.message || 'Failed to fetch dashboard data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const totalAmount = claims.reduce((acc, c) => acc + (c.amount || 0), 0);
  const reimbursedAmount = claims
    .filter((c) => c.status === 'REIMBURSED')
    .reduce((acc, c) => acc + (c.amount || 0), 0);

  const autoApprovedOrLater = claims.filter(
    (c) =>
      c.status === 'AUTO_APPROVED' ||
      c.status === 'MANAGER_APPROVED' ||
      c.status === 'FINANCE_APPROVED' ||
      c.status === 'REIMBURSED'
  ).length;

  const compliancePassRate = claims.length > 0 ? Math.round((autoApprovedOrLater / claims.length) * 100) : 100;

  const flaggedIncidents = claims.filter(
    (c) =>
      c.status.includes('REJECTED') ||
      c.status.includes('FLAGGED') ||
      (c.violations && c.violations.length > 0)
  ).length;

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0F0F0F] pb-6">
        <div>
          <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
            AUDIT METRICS.
          </h1>
          <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
            AUTONOMOUS POLICY COMPLIANCE & REIMBURSEMENT VELOCITY
          </div>
        </div>

        <button
          onClick={onOpenSubmit}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors"
        >
          + SUBMIT CLAIM
        </button>
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
          {/* Stat Cards: No boxes, Anton 96px blood red, thin dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#0F0F0F] border-t border-b border-[#0F0F0F]">
            <div className="sm:px-6 first:pl-0">
              <StatCard
                label="TOTAL EXPENSED"
                value={`₹${(totalAmount / 1000).toFixed(1)}K`}
                subline={`${claims.length} claims submitted`}
                highlightRed={false}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="REIMBURSED (PAID)"
                value={`₹${(reimbursedAmount / 1000).toFixed(1)}K`}
                subline="Disbursed via bank UTR"
                highlightRed={true}
              />
            </div>
            <div className="sm:px-6">
              <StatCard
                label="COMPLIANCE PASS RATE"
                value={`${compliancePassRate}%`}
                subline="Clean forensic check"
                highlightRed={false}
              />
            </div>
            <div className="sm:px-6 last:pr-0">
              <StatCard
                label="FLAGGED INCIDENTS"
                value={flaggedIncidents}
                subline="Policy breaches / checks"
                highlightRed={true}
              />
            </div>
          </div>

          {/* Minimalist Editorial Chart */}
          <div className="border border-[#0F0F0F] p-6 sm:p-8 bg-[#F5F1E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#0F0F0F] pb-4 mb-6">
              <div>
                <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em]">
                  VOLUME FORECAST // FISCAL 2026
                </div>
                <h3 className="font-anton text-2xl text-[#0F0F0F] tracking-[-0.02em] uppercase mt-1">
                  DISBURSEMENT VELOCITY
                </h3>
              </div>
              <span className="font-mono text-xs text-[#C8352B] font-bold">
                TOTAL CLAIMS: {claims.length}
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="py-12 text-center">
                <h4 className="font-anton text-4xl text-[#8A8378] uppercase">NO DATA</h4>
                <p className="small-caps text-xs text-[#8A8378] mt-2">SUBMIT CLAIMS TO GENERATE VOLUME VELOCITY</p>
              </div>
            ) : (
              <div className="h-48 w-full flex items-end justify-between pt-8 border-b border-[#0F0F0F] px-4">
                {[
                  { month: 'APR', val: Math.min(100, Math.max(10, Math.round(claims.length * 15))) },
                  { month: 'MAY', val: Math.min(100, Math.max(20, Math.round(claims.length * 22))) },
                  { month: 'JUN', val: Math.min(100, Math.max(15, Math.round(claims.length * 18))) },
                  { month: 'JUL', val: Math.min(100, Math.max(30, Math.round(claims.length * 35))) },
                  { month: 'AUG', val: Math.min(100, Math.max(25, Math.round(claims.length * 28))) },
                  { month: 'SEP', val: Math.min(100, Math.max(40, Math.round(claims.length * 45))) },
                ].map((item) => (
                  <div key={item.month} className="flex flex-col items-center gap-2 group cursor-default">
                    <span className="font-mono text-[10px] text-[#8A8378] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.val}%
                    </span>
                    <div
                      style={{ height: `${item.val * 1.3}px` }}
                      className="w-8 sm:w-14 bg-[#C8352B] hover:bg-[#0F0F0F] transition-colors rounded-none"
                    />
                    <span className="small-caps text-[10px] text-[#0F0F0F] font-bold mt-2">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Claims Section */}
          <div className="space-y-4">
            <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] font-bold">
              RECENT CLAIMS REGISTER
            </div>
            <ClaimsTable
              claims={claims.slice(0, 5)}
              onSelectClaim={onSelectClaim}
              emptyMessage="NO RECENT CLAIMS."
            />
          </div>
        </>
      )}
    </div>
  );
};
