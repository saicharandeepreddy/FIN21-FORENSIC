import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoginHeroProps {
  onProceed: () => void;
}

export const LoginHero: React.FC<LoginHeroProps> = ({ onProceed }) => {
  useEffect(() => {
    const handleScroll = (e: WheelEvent | TouchEvent) => {
      onProceed();
    };
    window.addEventListener('wheel', handleScroll, { passive: true });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [onProceed]);

  return (
    <div
      onClick={onProceed}
      className="min-h-screen w-full bg-[#EDE8DF] text-[#0F0F0F] flex flex-col justify-between items-center px-6 py-12 cursor-pointer select-none relative overflow-hidden"
    >
      {/* Top Label */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-4"
      >
        <div className="small-caps tracking-[0.25em] text-[12px] text-[#0F0F0F] font-bold">
          FIN21 · EXPENSE FORENSICS
        </div>
      </motion.div>

      {/* Main Massive Editorial Typography */}
      <div className="w-full max-w-7xl mx-auto text-center my-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <h1 className="font-anton text-[#C8352B] text-[64px] sm:text-[96px] md:text-[120px] lg:text-[140px] tracking-[-0.02em] leading-[0.85] uppercase w-full">
            CLAIM. VERIFY. APPROVE.
          </h1>
          <h2 className="font-anton text-[#0F0F0F] text-[44px] sm:text-[64px] md:text-[76px] lg:text-[80px] tracking-[-0.02em] leading-[0.85] uppercase mt-2">
            REIMBURSE.
          </h2>
          <p className="font-sans text-[#8A8378] text-base md:text-lg mt-6 max-w-xl mx-auto font-normal">
            Autonomous expense audit, forensic receipt analysis, and Nova policy compliance for modern teams.
          </p>
        </motion.div>
      </div>

      {/* Bottom Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col items-center space-y-3 pb-4"
      >
        <span className="small-caps text-[11px] tracking-[0.25em] text-[#0F0F0F] font-bold">
          SCROLL OR CLICK TO ENTER
        </span>
        <div className="w-[1px] h-12 bg-[#0F0F0F]" />
      </motion.div>
    </div>
  );
};
