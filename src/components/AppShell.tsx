import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Clock, FileDown, LogOut, Menu, Plus, Receipt, Scale, Settings, UserCircle, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ExpenseModal } from '@/components/ExpenseModal';
import { useAppData } from '@/lib/use-app-data';
import { useAuth } from '@/lib/use-auth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/groups', label: 'Guruhlar', icon: Users },
  { to: '/debts', label: 'Qarzlar', icon: Scale },
  { to: '/activity', label: 'Faoliyat', icon: Clock },
  { to: '/reports', label: 'Hisobotlar', icon: FileDown },
  { to: '/profile', label: 'Profil', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { groups, openCreateGroup, openExpenseModal } = useAppData();
  const { user, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    );

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">Guruh Pul Hisobi</p>
          <p className="text-xs text-slate-500">Hisob-kitob paneli</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass} onClick={onNavigate}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-900">Tezkor amallar</p>
          <div className="mt-3 space-y-2">
            <Button
              className="w-full justify-start bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                openCreateGroup();
                onNavigate?.();
              }}
            >
              <Plus className="h-4 w-4" />
              Yangi guruh
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-slate-300 bg-white"
              onClick={() => {
                openExpenseModal();
                onNavigate?.();
              }}
              disabled={groups.length === 0}
            >
              <Receipt className="h-4 w-4" />
              Xarajat qo'shish
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t p-3">
        <div className="mb-3 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <UserCircle className="h-5 w-5 shrink-0 text-slate-500" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Hisob</p>
            <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start border-slate-300 bg-white" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Chiqish
        </Button>
      </div>
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    groups,
    isCreateGroupOpen,
    isExpenseModalOpen,
    selectedGroup,
    closeCreateGroup,
    closeExpenseModal,
    handleCreateGroup,
    handleAddExpense,
  } = useAppData();

  const activeTitle = navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 border-slate-300 bg-white lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 lg:hidden">Guruh Pul Hisobi</p>
                <h1 className="truncate text-lg font-semibold tracking-normal text-slate-950">{activeTitle}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-5 lg:px-6 lg:pb-5">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-white px-2 py-1 shadow-lg lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium',
                  isActive ? 'text-emerald-700' : 'text-slate-500'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <CreateGroupModal isOpen={isCreateGroupOpen} onClose={closeCreateGroup} onCreate={handleCreateGroup} />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        onAdd={handleAddExpense}
        groups={groups}
        selectedGroup={selectedGroup}
      />
    </div>
  );
}
