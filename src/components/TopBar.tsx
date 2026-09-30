import React from 'react';
import { Actor } from '../lib/types';

interface TopBarProps {
  user: Actor | null;
  pageTitle: string;
  onOpenMenu: () => void;
  onNavigateHome: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  pageTitle,
  onOpenMenu,
  onNavigateHome,
}) => {
  return (
    <header className="h-[80px] bg-[#EDE8DF] border-b border-[#0F0F0F] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Wordmark */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
        <span className="font-anton text-2xl text-[#0F0F0F] tracking-[-0.02em] hover:text-[#C8352B] transition-colors">
          FIN21
        </span>
        <span className="hidden sm:inline small-caps text-[10px] text-[#8A8378] tracking-[0.25em] border-l border-[#0F0F0F] pl-3">
          FORENSICS
        </span>
      </div>

      {/* Center: Current Page Title */}
      <div className="small-caps text-[11px] sm:text-[13px] tracking-[0.25em] text-[#0F0F0F] font-bold truncate max-w-[200px] sm:max-w-md text-center">
        {pageTitle}
      </div>

      {/* Right: Hamburger + User Square Initials */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* User initials square */}
        <div
          title={user ? `${user.name} (${user.role.toUpperCase()})` : 'User'}
          className="w-8 h-8 sm:w-9 sm:h-9 border border-[#0F0F0F] bg-[#F5F1E8] flex items-center justify-center font-mono text-xs font-bold text-[#0F0F0F]"
        >
          {user?.avatarInitials || '—'}
        </div>

        {/* Hamburger trigger */}
        <button
          onClick={onOpenMenu}
          aria-label="Open Navigation Menu"
          className="w-10 h-10 border border-[#0F0F0F] flex flex-col items-center justify-center gap-1.5 p-2 bg-[#EDE8DF] hover:bg-[#C8352B] group transition-colors"
        >
          <span className="w-5 h-[2px] bg-[#0F0F0F] group-hover:bg-[#EDE8DF] transition-colors" />
          <span className="w-5 h-[2px] bg-[#0F0F0F] group-hover:bg-[#EDE8DF] transition-colors" />
          <span className="w-5 h-[2px] bg-[#0F0F0F] group-hover:bg-[#EDE8DF] transition-colors" />
        </button>
      </div>
    </header>
  );
};
