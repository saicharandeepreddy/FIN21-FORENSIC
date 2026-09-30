import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';

interface MyClaimsProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onOpenSubmit: () => void;
}

export const MyClaimsView: React.FC<MyClaimsProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
  onOpenSubmit,
}) => {
  const [internalClaims, setInternalClaims] = useState<Claim[]>(passedClaims || []);
  const [loading, setLoading] = useState<boolean>(!passedClaims);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'AUTO_APPROVED' | 'REJECTED' | 'REIMBURSED'>('ALL');

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
          setError(err.message || 'Failed to fetch claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const filteredClaims = claims.filter((claim) => {
    if (filter === 'ALL') return true;
    if (filter === 'REJECTED') {
      return claim.status.endsWith('_REJECTED') || claim.status === 'REJECTED';
    }
    return claim.status === filter;
  });

  return (
    <div className="w-full space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0F0F0F] pb-6">
        <div>
          <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
            MY CLAIMS.
          </h1>
          <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
            RECORDED EXPENSE INVOICES & STATUTORY AUDIT STATUS
          </div>
        </div>

        <button
          onClick={onOpenSubmit}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-xs tracking-[0.25em] font-bold transition-colors"
        >
          + NEW EXPENSE
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

      {/* Filter Chips (small caps, underline on active) */}
      <div className="flex flex-wrap gap-4 sm:gap-6 text-xs small-caps border-b border-[#0F0F0F] pb-3">
        {(['ALL', 'SUBMITTED', 'AUTO_APPROVED', 'REJECTED', 'REIMBURSED'] as const).map((chip) => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`transition-colors py-1 ${
              filter === chip
                ? 'text-[#C8352B] font-bold underline underline-offset-8 decoration-2 decoration-[#C8352B]'
                : 'text-[#8A8378] hover:text-[#0F0F0F]'
            }`}
          >
            {chip.replace(/_/g, ' ')} (
            {chip === 'ALL'
              ? claims.length
              : chip === 'REJECTED'
              ? claims.filter((c) => c.status.endsWith('_REJECTED') || c.status === 'REJECTED').length
              : claims.filter((c) => c.status === chip).length}
            )
          </button>
        ))}
      </div>

      {/* Claims Table */}
      {!loading && !error && (
        <ClaimsTable
          claims={filteredClaims}
          onSelectClaim={onSelectClaim}
          emptyMessage="NO CLAIMS MATCH THE SELECTED FILTER."
        />
      )}
    </div>
  );
};
