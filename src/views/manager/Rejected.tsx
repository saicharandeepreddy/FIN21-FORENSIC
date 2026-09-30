import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';

interface ManagerRejectedProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  refreshTrigger?: number;
}

export const ManagerRejectedView: React.FC<ManagerRejectedProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
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
          setError(err.message || 'Failed to fetch rejected claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const rejectedClaims = claims.filter(
    (c) => c.status.endsWith('_REJECTED') || c.status === 'REJECTED'
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#C8352B] tracking-[-0.02em] leading-[0.85] uppercase">
          REJECTED CLAIMS.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          DISAPPROVED SUBMISSIONS & FORMAL AUDIT REASONS
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

      {!loading && !error && (
        <ClaimsTable
          claims={rejectedClaims}
          onSelectClaim={onSelectClaim}
          emptyMessage="ZERO REJECTED EXPENSES ON DIVISIONAL RECORD."
        />
      )}
    </div>
  );
};
