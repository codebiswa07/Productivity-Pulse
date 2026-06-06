import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Shield, Settings, LogOut, Menu, X, Flame } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { to: '/',          icon: Activity,  label: 'Dashboard' },
  { to: '/reports',   icon: BarChart2, label: 'Reports'   },
  { to: '/blocked',   icon: Shield,    label: 'Blocked'   },
  { to: '/settings',  icon: Settings,  label: 'Settings'  },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => { signOut(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-yellow-800 via-lime-500 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
            <img src="./logo/logo.png" alt="logo" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">ProductivityPulse</p>
            <p className="text-xs text-slate-400">Focus & Track</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-50">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">ProductivityPulse</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
