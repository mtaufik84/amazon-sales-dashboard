import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Lightbulb,
  Table2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/wilayah', label: 'Peta Wilayah', icon: Map },
  { to: '/rekomendasi', label: 'Rekomendasi', icon: Lightbulb },
  { to: '/data', label: 'Daftar Pesanan', icon: Table2 },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={`no-print bg-surface border-r border-default flex flex-col transition-[width] duration-200 ${
        collapsed ? 'w-[56px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-subtle shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent-500 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-primary-c leading-tight">Amazon Analytics</div>
            <div className="text-2xs text-muted-c leading-tight">Q2 2022 · Women's Fashion</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors focus-ring group ${
                isActive
                  ? 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                  : 'text-secondary-c hover:bg-subtle hover:text-primary-c'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-accent-600 dark:text-accent-400' : ''}`}
                strokeWidth={1.75}
              />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-subtle shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-muted-c hover:text-primary-c hover:bg-subtle transition-colors focus-ring"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              <span className="text-xs">Ciutkan</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
