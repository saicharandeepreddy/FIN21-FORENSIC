import React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onNavigateHome,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#EDE8DF] border-t border-[#0F0F0F] mt-24 py-12 px-4 sm:px-8 text-[#0F0F0F]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Left: Brand */}
        <div>
          <button
            onClick={onNavigateHome}
            className="text-left font-anton text-3xl text-[#0F0F0F] hover:text-[#C8352B] transition-colors tracking-[-0.02em] block"
          >
            FIN21 — FORENSICS
          </button>
          <p className="text-xs text-[#8A8378] mt-1 max-w-sm">
            Autonomous financial expense audit, forensic receipt analysis, and Nova policy compliance system.
          </p>
        </div>

        {/* Center: Legal & System links */}
        <div className="flex flex-wrap gap-6 text-xs small-caps">
          <button
            onClick={onOpenPrivacy}
            className="text-[#0F0F0F] hover:text-[#C8352B] hover:underline underline-offset-4 transition-colors"
          >
            PRIVACY POLICY
          </button>
          <button
            onClick={onOpenTerms}
            className="text-[#0F0F0F] hover:text-[#C8352B] hover:underline underline-offset-4 transition-colors"
          >
            TERMS OF SERVICE
          </button>
          <a
            href="mailto:compliance@fin21.internal"
            className="text-[#0F0F0F] hover:text-[#C8352B] hover:underline underline-offset-4 transition-colors flex items-center space-x-1"
          >
            <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>COMPLIANCE DESK</span>
          </a>
          <a
            href="tel:+18005550210"
            className="text-[#0F0F0F] hover:text-[#C8352B] hover:underline underline-offset-4 transition-colors flex items-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>+1 (800) 555-0210</span>
          </a>
        </div>

        {/* Right: Copyright Year */}
        <div className="text-xs text-[#8A8378] font-mono">
          © {currentYear} FIN21 ENGINE · ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
};
