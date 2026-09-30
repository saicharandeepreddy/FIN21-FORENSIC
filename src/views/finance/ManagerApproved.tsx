import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';

interface ManagerApprovedProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onApprove: (claim: Claim) => void;
  onReject: (claim: Claim) => void;
  refreshTrigger?: number;
}

export const FinanceManagerApprovedView: React.FC<ManagerApprovedProps> = ({
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
          setError(err.message || 'Failed to fetch manager approved claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, refreshTrigger, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const managerApprovedClaims = claims.filter((c) => c.status === 'MANAGER_APPROVED');

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
          MANAGER APPROVED.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          DEPARTMENT SIGN-OFF COMPLETED · QUEUED FOR STATUTORY TAX AUDIT
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
          claims={managerApprovedClaims}
          onSelectClaim={onSelectClaim}
          showFinanceActions={true}
          onManagerApprove={onApprove}
          onManagerReject={onReject}
          emptyMessage="NO CLAIMS AWAITING SECOND-TIER FINANCE APPROVAL."
        />
      )}
    </div>
  );
};
