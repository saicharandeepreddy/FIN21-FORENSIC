import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';

interface PendingProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onApprove: (claim: Claim) => void;
  onReject: (claim: Claim) => void;
  refreshTrigger?: number;
}

export const ManagerPendingView: React.FC<PendingProps> = ({
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
          setError(err.message || 'Failed to fetch pending claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const pendingClaims = claims.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'AUTO_APPROVED' || c.status === 'FLAGGED'
  );

  return (
    <div className="w-full space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
          PENDING REVIEW.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          EXPENSE SUBMISSIONS AWAITING DEPARTMENT HEAD ADJUDICATION
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
          claims={pendingClaims}
          onSelectClaim={onSelectClaim}
          showManagerActions={true}
          onManagerApprove={onApprove}
          onManagerReject={onReject}
          emptyMessage="INBOX ZERO · NO CLAIMS PENDING MANAGER REVIEW."
        />
      )}
    </div>
  );
};
