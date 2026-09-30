import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsProps {
  onBack: () => void;
}

export const Terms: React.FC<TermsProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs small-caps text-[#0F0F0F] hover:text-[#C8352B] mb-8"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
        <span>BACK TO WORKSPACE</span>
      </button>

      <div className="border-b border-[#0F0F0F] pb-6 mb-8">
        <span className="small-caps text-[11px] text-[#C8352B] tracking-[0.25em] font-bold block mb-1">
          FIN21 GOVERNANCE CODE
        </span>
        <h1 className="font-anton text-[44px] sm:text-[64px] text-[#0F0F0F] tracking-[-0.02em] leading-none uppercase">
          TERMS OF EXPENSE COMPLIANCE
        </h1>
        <p className="text-xs font-mono text-[#8A8378] mt-3">
          STANDARDS ENFORCED BY NOVA POLICY AUDIT ENGINE · REVISED 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-[#0F0F0F]">
        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            1. EMPLOYEE HONESTY & ANTI-FORGERY COVENANT
          </h2>
          <p className="text-[#8A8378]">
            Submitting edited, fabricated, or digitally synthesized invoices constitutes gross misconduct under corporate bylaws. The FIN21 engine runs automated software artifact detection (including Canva, Adobe Photoshop, and generative synthesis markers) alongside GSTIN Mod-36 checksum evaluations.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            2. AUTOMATIC APPROVAL THRESHOLDS
          </h2>
          <p className="text-[#8A8378]">
            Claims under ₹5,000 with 100% verified vendor GSTIN and clean forensic signatures qualify for instantaneous autonomous approval. Any expense in excess of standard department budgets requires explicit sequential sign-off by an assigned Manager and Finance Officer.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            3. APPEALS & ADJUDICATION
          </h2>
          <p className="text-[#8A8378]">
            Employees reserve the right to contest automated rejections by submitting business justifications through the formal appeal gateway. Appeals are escalated to the Finance Director for binding arbitration.
          </p>
        </section>
      </div>
    </div>
  );
};
