import React from 'react';

interface SidebarUser {
  role: string;
  name: string;
  actorId: string;
}

interface NavItem {
  id: string;
  label: string;
}

interface SidebarProps {
  user: SidebarUser;
  activeView: string;
  onNavigate: (viewId: string) => void;
  onSignOut: () => void;
}

const EMPLOYEE_ITEMS: NavItem[] = [
  { id: 'submit', label: 'Submit' },
  { id: 'my_claims', label: 'My Claims' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'appeals', label: 'Appeals' },
  { id: 'dashboard', label: 'Dashboard' },
];

const MANAGER_ITEMS: NavItem[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'team_claims', label: 'Team Claims' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'dashboard', label: 'Dashboard' },
];

const FINANCE_ITEMS: NavItem[] = [
  { id: 'manager_approved', label: 'Manager Approved' },
  { id: 'ready_to_reimburse', label: 'Ready to Reimburse' },
  { id: 'reimbursed', label: 'Reimbursed' },
  { id: 'dashboard', label: 'Dashboard' },
];

function navItemsForRole(role: string): NavItem[] {
  const normalized = role.toLowerCase();
  if (normalized === 'employee') return EMPLOYEE_ITEMS;
  if (normalized === 'manager') return MANAGER_ITEMS;
  if (normalized === 'finance') return FINANCE_ITEMS;
  if (normalized === 'admin') {
    const seen = new Set<string>();
    const combined: NavItem[] = [];
    for (const item of [...EMPLOYEE_ITEMS, ...MANAGER_ITEMS, ...FINANCE_ITEMS]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      combined.push(item);
    }
    return combined;
  }
  return EMPLOYEE_ITEMS;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  onNavigate,
  onSignOut,
}) => {
  const items = navItemsForRole(user.role);
  const initials = initialsFromName(user.name);

  return (
    <aside
      className="hidden md:flex w-[240px] h-screen sticky top-0 shrink-0 flex-col bg-[#F5F1E8] border-r border-[#0F0F0F] rounded-none"
      aria-label="Primary navigation"
    >
      <div className="px-5 py-6 border-b border-[#0F0F0F]">
        <p className="font-anton text-[14px] uppercase text-[#0F0F0F]">FIN21</p>
        <p className="mt-2 font-mono text-[10px] tracking-widest uppercase text-[#8A8378]">
          {user.actorId}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`relative w-full text-left pl-5 pr-5 py-3 font-anton text-[14px] leading-normal uppercase rounded-none transition-colors ${
                isActive
                  ? 'font-bold text-[#0F0F0F]'
                  : 'text-[#0F0F0F] hover:bg-[#EDE8DF]'
              }`}
            >
              {isActive ? (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8352B]" aria-hidden="true" />
              ) : null}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#0F0F0F] px-5 py-5">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full text-left font-anton text-[14px] uppercase text-[#C8352B] py-2 mb-4 hover:bg-[#EDE8DF] rounded-none"
        >
          Sign Out
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-[#0F0F0F] bg-[#0F0F0F] font-anton text-[14px] uppercase text-[#F5F1E8]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-anton text-[14px] uppercase truncate text-[#0F0F0F]">{user.name}</p>
            <p className="font-anton text-[14px] uppercase text-[#8A8378]">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};