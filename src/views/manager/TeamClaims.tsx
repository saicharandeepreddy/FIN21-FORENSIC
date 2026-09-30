import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';

interface TeamClaimsProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onApprove: (claim: Claim) => void;
  onReject: (claim: Claim) => void;
  refreshTrigger?: number;
}

export const TeamClaimsView: React.FC<TeamClaimsProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
  onApprove,
  onReject,
  refreshTrigger,
}) => {
  const [internalClaims, setInternalClaims] = useState<Claim[]>(passedClaims || []);
  const [loading, setLoading] = useState<boolean>(!passedClaims);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

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
          setError(err.message || 'Failed to fetch team claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const filtered = claims.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return c.status === 'SUBMITTED' || c.status === 'AUTO_APPROVED' || c.status === 'FLAGGED';
    if (filter === 'APPROVED') return c.status === 'MANAGER_APPROVED' || c.status === 'FINANCE_APPROVED' || c.status === 'REIMBURSED';
    if (filter === 'REJECTED') return c.status.endsWith('_REJECTED') || c.status === 'REJECTED';
    return true;
  });

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
          TEAM CLAIMS.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          COMPLETE DIVISIONAL EXPENDITURE REGISTER
        </div>
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

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-6 text-xs small-caps border-b border-[#0F0F0F] pb-3">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((chip) => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`transition-colors py-1 ${
              filter === chip
                ? 'text-[#C8352B] font-bold underline underline-offset-8 decoration-2 decoration-[#C8352B]'
                : 'text-[#8A8378] hover:text-[#0F0F0F]'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {!loading && !error && (
        <ClaimsTable
          claims={filtered}
          onSelectClaim={onSelectClaim}
          showManagerActions={true}
          onManagerApprove={onApprove}
          onManagerReject={onReject}
          emptyMessage="NO CLAIMS MATCH THE SELECTED TEAM FILTER."
        />
      )}
    </div>
  );
};
