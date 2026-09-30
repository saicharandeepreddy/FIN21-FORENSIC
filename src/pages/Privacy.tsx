import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyProps {
  onBack: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onBack }) => {
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
          FIN21 LEGAL FRAMEWORK
        </span>
        <h1 className="font-anton text-[44px] sm:text-[64px] text-[#0F0F0F] tracking-[-0.02em] leading-none uppercase">
          PRIVACY & FORENSIC TELEMETRY
        </h1>
        <p className="text-xs font-mono text-[#8A8378] mt-3">
          EFFECTIVE REVISION: SEPTEMBER 2026 · SECURITY LEVEL: ENTERPRISE AUDIT
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-[#0F0F0F]">
        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            1. SCOPE OF FORENSIC EXTRACTION
          </h2>
          <p className="text-[#8A8378]">
            FIN21 analyzes corporate expense documentation exclusively for legitimate financial reconciliation, tax verification under Indian Goods & Services Tax (GST) rules, and policy validation against the Nova Engine compliance rules. Documents uploaded into the system are digested through optical character recognition (OCR) and EXIF metadata analyzers.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            2. HARDWARE CRYPTOGRAPHY & SHA-256 HASHES
          </h2>
          <p className="text-[#8A8378]">
            Receipt images generate an irreversible SHA-256 cryptographic digest immediately upon ingestion. This hash ensures that duplicate submissions across fiscal cycles are detected without indexing raw private user metadata in external public stores.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            3. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS
          </h2>
          <p className="text-[#8A8378]">
            Only designated actors possessing authenticated hardware API keys (Employee, Manager, Finance, and Executive Administration) may inspect claim details corresponding to their operational hierarchy. Audit trails retain immutable actor IDs and UTC timestamps for all state modifications.
          </p>
        </section>

        <section>
          <h2 className="font-anton text-2xl uppercase mb-2 tracking-[-0.02em]">
            4. DATA RETENTION & COMPLIANCE
          </h2>
          <p className="text-[#8A8378]">
            In compliance with statutory financial audit mandates, claim telemetry and forensic validation results are archived for 7 fiscal years within secured database storage before scheduled cryptographic zeroing.
          </p>
        </section>
      </div>
    </div>
  );
};
