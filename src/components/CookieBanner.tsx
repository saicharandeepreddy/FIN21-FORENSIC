import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fin21_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fin21_cookie_consent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and telemetry consent"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0F0F0F] text-[#EDE8DF] border-t border-[#262626] p-4 sm:p-5"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3 text-xs">
          <Shield className="w-5 h-5 text-[#C8352B] stroke-[1.5] shrink-0 mt-0.5" />
          <div>
            <span className="small-caps text-[11px] text-[#EDE8DF] tracking-[0.25em] font-bold block mb-0.5">
              CRYPTOGRAPHIC SESSION & TELEMETRY PROTOCOL
            </span>
            <p className="text-[#8A8378]">
              FIN21 uses strict session security tokens and local cryptographic caching to audit receipts and preserve non-repudiation records. No 3rd-party commercial trackers are deployed.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] small-caps text-[11px] tracking-[0.25em] font-bold transition-colors"
          >
            ACKNOWLEDGE & PROCEED
          </button>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss cookie notice"
            className="p-1.5 text-[#8A8378] hover:text-[#EDE8DF]"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
