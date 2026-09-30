import React, { useState, useEffect } from 'react';
import { Claim, Actor } from '../../lib/types';
import { fetchClaims } from '../../lib/api';
import { ArrowRight } from 'lucide-react';

interface AppealsProps {
  user?: Actor;
  claims?: Claim[];
  onSelectClaim: (claim: Claim) => void;
  onOpenAppeal?: (claim: Claim) => void;
}

export const AppealsView: React.FC<AppealsProps> = ({
  user,
  claims: passedClaims,
  onSelectClaim,
}) => {
  const [internalClaims, setInternalClaims] = useState<Claim[]>(passedClaims || []);
  const [loading, setLoading] = useState<boolean>(!passedClaims);
  const [error, setError] = useState<string | null>(null);
  const [appealsMap, setAppealsMap] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fin21_appeals');
      if (raw) {
        setAppealsMap(JSON.parse(raw));
      }
    } catch {
      // ignore
    }

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
  const appealsList = claims.filter((c) => appealsMap[c.id] !== undefined);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-[#0F0F0F] pb-6">
        <h1 className="font-anton text-[52px] sm:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
          APPEALS.
        </h1>
        <div className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
          ADJUDICATION & POLICY MITIGATION DISPUTES
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
        appealsList.length === 0 ? (
          <div className="py-20 text-center border-t border-b border-[#0F0F0F]">
            <h3 className="font-anton text-[40px] sm:text-[48px] text-[#0F0F0F] tracking-[-0.02em] uppercase leading-none">
              NO ACTIVE APPEALS.
            </h3>
            <p className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] mt-3">
              ALL CLAIMS PROCEEDING UNDER STANDARD WORKFLOW
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#0F0F0F] border-t border-b border-[#0F0F0F]">
            {appealsList.map((claim) => (
              <div
                key={claim.id}
                onClick={() => onSelectClaim(claim)}
                className="py-6 px-4 hover:bg-[#F5F1E8] cursor-pointer transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-[#8A8378] font-bold">
                        {claim.claim_number}
                      </span>
                      <span className="small-caps text-[10px] text-[#D97706] border border-[#D97706] px-2 py-0.5 font-bold">
                        APPEAL FILED
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[#0F0F0F] mt-1">
                      {claim.vendor || 'Unknown Vendor'}
                    </h3>
                    <div className="text-xs text-[#8A8378] font-mono mt-0.5">
                      Amount: ₹{claim.amount.toLocaleString()} · Rejection: {claim.rejection_reason || 'Policy Violation'}
                    </div>

                    {appealsMap[claim.id] && (
                      <div className="mt-3 p-3 bg-[#EDE8DF] border-l-2 border-[#C8352B] text-xs text-[#0F0F0F] italic">
                        "{appealsMap[claim.id]}"
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="small-caps text-[11px] text-[#C8352B] font-bold hover:underline flex items-center space-x-1 justify-end">
                      <span>VIEW AUDIT LEDGER</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
