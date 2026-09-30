import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import { Actor } from '../lib/types';

interface MenuItem {
  id: string;
  label: string;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: Actor | null;
  currentView: string;
  onSelectView: (viewId: string) => void;
  onSignOut: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  user,
  currentView,
  onSelectView,
  onSignOut,
}) => {
  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];
    switch (user.role) {
      case 'employee':
        return [
          { id: 'submit', label: 'SUBMIT' },
          { id: 'my_claims', label: 'MY CLAIMS' },
          { id: 'rejected', label: 'REJECTED' },
          { id: 'appeals', label: 'APPEALS' },
          { id: 'dashboard', label: 'DASHBOARD' },
        ];
      case 'manager':
        return [
          { id: 'pending', label: 'PENDING REVIEW' },
          { id: 'team_claims', label: 'TEAM CLAIMS' },
          { id: 'rejected', label: 'REJECTED' },
          { id: 'dashboard', label: 'DASHBOARD' },
        ];
      case 'finance':
        return [
          { id: 'manager_approved', label: 'MANAGER APPROVED' },
          { id: 'ready_to_reimburse', label: 'READY TO PAY' },
          { id: 'reimbursed', label: 'REIMBURSED' },
          { id: 'dashboard', label: 'DASHBOARD' },
        ];
      case 'admin':
        return [
          { id: 'all_claims', label: 'ALL CLAIMS' },
          { id: 'submit', label: 'SUBMIT' },
          { id: 'pending', label: 'PENDING REVIEW' },
          { id: 'ready_to_reimburse', label: 'READY TO PAY' },
          { id: 'dashboard', label: 'DASHBOARD' },
        ];
    }
  };

  const items = getMenuItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-[#0F0F0F] text-[#EDE8DF] flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
        >
          {/* Top Bar with Close X */}
          <div className="flex items-center justify-between border-b border-[#262626] pb-6">
            <div className="flex items-center space-x-3">
              <span className="font-anton text-2xl tracking-[-0.02em] text-[#EDE8DF]">
                FIN21
              </span>
              <span className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em]">
                INDEX // {user.role.toUpperCase()}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Navigation Menu"
              className="text-[#C8352B] hover:text-[#EDE8DF] transition-colors p-2 -mr-2"
            >
              <X className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
            </button>
          </div>

          {/* Menu Items Stack */}
          <div className="my-auto py-8 flex flex-col space-y-2 sm:space-y-4">
            {items.map((item, idx) => {
              const isActive = currentView === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => {
                      onSelectView(item.id);
                      onClose();
                    }}
                    className={`group text-left font-anton text-[44px] sm:text-[72px] md:text-[88px] lg:text-[96px] tracking-[-0.02em] leading-[0.85] uppercase transition-all duration-200 block w-full flex items-center justify-between ${
                      isActive ? 'text-[#C8352B]' : 'text-[#EDE8DF]'
                    } hover:text-[#C8352B] hover:translate-x-5`}
                  >
                    <span>{item.label}</span>
                    <span className="hidden md:inline font-mono text-xs text-[#8A8378] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      [0{idx + 1}]
                    </span>
                  </button>
                </motion.div>
              );
            })}

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#262626] my-4" />

            {/* Sign Out */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (items.length + 1) * 0.04, duration: 0.35 }}
            >
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="font-anton text-[28px] sm:text-[40px] md:text-[48px] tracking-[-0.02em] text-[#8A8378] hover:text-[#C8352B] hover:translate-x-3 transition-all duration-200 uppercase"
              >
                SIGN OUT
              </button>
            </motion.div>
          </div>

          {/* Footer Details */}
          <div className="border-t border-[#262626] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8A8378] gap-4">
            <div>
              <span className="font-mono text-xs text-[#EDE8DF]">{user?.name || 'Guest'}</span>
              <span className="mx-2 text-[#404040]">/</span>
              <span className="small-caps text-[10px]">{user?.actorId || 'NO-ID'}</span>
              <span className="mx-2 text-[#404040]">/</span>
              <span className="small-caps text-[10px] text-[#C8352B] font-bold">{user?.role || 'NONE'}</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px] small-caps">
              <span className="text-[#8A8378]">AUTONOMOUS AUDIT ENGINE</span>
              <span className="text-[#EDE8DF]">VER 1.0.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
