import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ClaimsTable } from '../../components/ClaimsTable';
import { AlertTriangle } from 'lucide-react';

interface RejectedProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onOpenAppeal: (claim: Claim) => void;
}

export const RejectedView: React.FC<RejectedProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
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
          setError(err.message || 'Failed to fetch claims');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.apiKey, passedClaims]);

  const claims = passedClaims !== undefined ? passedClaims : internalClaims;

  const rejectedOrFlagged = claims.filter(
    (c) =>
      c.status.endsWith('_REJECTED') ||
      c.status === 'REJECTED' ||
      (c.violations && c.violations.length > 0) ||
      (c.forensics_flags && c.forensics_flags.length > 0)
  );

  return (
    <div className="w-full space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#C8352B] tracking-[-0.02em] leading-[0.85] uppercase">
          REJECTED & FLAGGED.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          ITEMS TRIGGERING POLICY BREACHES, OCR CHECKSUM ANOMALIES, OR DISAPPROVAL
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
        <>
          <div className="border border-[#C8352B] bg-[#C8352B]/5 p-4 flex items-center justify-between text-xs text-[#0F0F0F]">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-[#C8352B] stroke-[1.5] shrink-0" />
              <span>
                Claims listed below encountered automated GSTIN checksum violations, late-night alcohol restrictions, or budget limit caps.
              </span>
            </div>
            <span className="small-caps text-[11px] text-[#C8352B] font-bold shrink-0 hidden sm:inline">
              {rejectedOrFlagged.length} INCIDENTS
            </span>
          </div>

          <ClaimsTable
            claims={rejectedOrFlagged}
            onSelectClaim={onSelectClaim}
            emptyMessage="ZERO REJECTED OR FLAGGED CLAIMS ON FILE."
          />
        </>
      )}
    </div>
  );
};
