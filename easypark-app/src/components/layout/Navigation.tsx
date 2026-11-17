'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, ROLE_REDIRECTS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import {
  MapPin, User, LogIn, LogOut, Menu, X, ChevronDown,
  LayoutDashboard, Building2, Car, Shield, UserCheck, Settings,
  Bell, Check, ArrowLeft, CreditCard, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

// ─── PUBLIC NAVBAR ────────────────────────────────────────────────────────────
export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, loginAsRole } = useAuth();
  const [roleOpen, setRoleOpen] = useState(false);
  const router = useRouter();

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'customer', label: 'Customer', icon: <User className="w-4 h-4" /> },
    { role: 'owner', label: 'Parking Owner', icon: <Building2 className="w-4 h-4" /> },
    { role: 'operator', label: 'Operator', icon: <Car className="w-4 h-4" /> },
    { role: 'government', label: 'Government Admin', icon: <Shield className="w-4 h-4" /> },
    { role: 'checker', label: 'Govt Checker', icon: <UserCheck className="w-4 h-4" /> },
    { role: 'admin', label: 'Super Admin', icon: <Settings className="w-4 h-4" /> },
  ];

  const switchRole = (role: UserRole) => {
    loginAsRole(role);
    router.push(ROLE_REDIRECTS[role]);
    setRoleOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-gray-950/95 backdrop-blur-xl">
      {/* Demo Mode Banner */}
      <div className="border-b border-cyan-400/10 bg-[#0e2029] px-4 py-1.5 text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-medium text-cyan-100">
          <Car className="h-3.5 w-3.5 text-cyan-400" /> EasyPark demo environment <span className="hidden sm:inline text-cyan-300/70">· Switch roles from Demo Mode</span>
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Easy<span className="text-cyan-400">Park</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-cyan-300 transition-colors">Home</Link>
            <Link href="/parking" className="text-sm font-medium text-gray-600 hover:text-cyan-300 transition-colors">Find Parking</Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-cyan-300 transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-cyan-300 transition-colors">Contact</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <span>Demo Mode</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {roleOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 rounded-xl shadow-2xl border border-gray-100 py-1 z-50">
                  <p className="px-3 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">Switch Role</p>
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => switchRole(r.role)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${user?.role === r.role ? 'text-cyan-300 bg-green-50' : 'text-gray-700'}`}
                    >
                      {r.icon}
                      {r.label}
                      {user?.role === r.role && <Check className="ml-auto h-4 w-4" aria-label="Current role" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href={ROLE_REDIRECTS[user.role]} className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                  Dashboard
                </Link>
                <button onClick={() => { logout(); }} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
                <Link href="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} className="md:hidden min-h-11 min-w-11 p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-gray-900 py-3">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-1">
            <Link href="/" className="min-h-11 py-3 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/parking" className="min-h-11 py-3 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Find Parking</Link>
            <Link href="/about" className="min-h-11 py-3 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className="min-h-11 py-3 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Contact</Link>
            <hr className="my-2 border-gray-100" />
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Switch Demo Role</p>
            {roles.map(r => (
              <button key={r.role} onClick={() => { switchRole(r.role); setMobileOpen(false); }} className="flex min-h-11 items-center gap-2 py-2 text-sm text-gray-700">
                {r.icon} {r.label}
              </button>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <div className="flex flex-col gap-1">
                <Link href={ROLE_REDIRECTS[user.role]} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-2 text-sm font-medium text-cyan-300"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex min-h-11 items-center gap-2 text-left text-sm text-gray-500"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            ) : <Link href="/login" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan-300"><LogIn className="h-4 w-4" /> Sign in</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── DASHBOARD SIDEBAR ────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  nav: NavItem[];
  title: string;
  accent?: string;
}

export function DashboardLayout({ children, nav, title }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const bg = 'bg-gray-900';
  const customerQuickNav = [
    { href: '/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/parking', label: 'Explore', icon: <MapPin className="h-5 w-5" /> },
    { href: '/dashboard/bookings', label: 'Bookings', icon: <Car className="h-5 w-5" /> },
    { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="h-5 w-5" /> },
  ];

  const renderNavLinks = (collapsed = false) => (
    <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
      {nav.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
              active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col ${sidebarCollapsed ? 'w-[76px]' : 'w-64'} ${bg} flex-shrink-0 border-r border-gray-100 transition-[width] duration-200`}>
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && <span className="font-bold text-white">EasyPark</span>}
          </Link>
          {!sidebarCollapsed && <p className="text-xs text-white/60 mt-1 ml-10">{title}</p>}
        </div>
        {renderNavLinks(sidebarCollapsed)}
        {user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name[0]}
              </div>
              {!sidebarCollapsed && <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/60 capitalize">{user.role}</p>
              </div>}
            </div>
            <button aria-label="Sign out" onClick={() => { logout(); router.push('/'); }} className={`w-full flex items-center gap-2 ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors`}>
              <LogOut className="w-4 h-4" /> {!sidebarCollapsed && 'Sign Out'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className={`relative flex h-full max-h-dvh w-[min(84vw,20rem)] flex-col ${bg} border-r border-gray-100 shadow-2xl`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-white">EasyPark</span>
              <button aria-label="Close dashboard navigation" onClick={() => setSidebarOpen(false)} className="min-h-11 min-w-11 text-white"><X className="w-5 h-5" /></button>
            </div>
            {renderNavLinks()}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-100 px-3 sm:px-5 py-3 flex items-center gap-3">
          <button aria-label="Open dashboard navigation" aria-expanded={sidebarOpen} className="lg:hidden min-h-11 min-w-11 p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <button type="button" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={sidebarCollapsed} className="hidden min-h-10 min-w-10 items-center justify-center rounded-lg hover:bg-gray-100 lg:flex" onClick={() => setSidebarCollapsed(current => !current)}>
            {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">
            DEMO MODE
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="mr-1 inline h-4 w-4" /><span className="hidden sm:inline">Public site</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="dashboard-main min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="demo-data-pill">DEMO DATA</span>
            <span className="text-[11px] text-gray-500">Sample records and browser-stored demo activity · Not live data</span>
          </div>
          {children}
        </main>
      </div>
      {user?.role === 'customer' && (
        <nav aria-label="Customer quick navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-gray-100 bg-gray-900/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl lg:hidden">
          {customerQuickNav.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium ${active ? 'text-cyan-300' : 'text-gray-500'}`}>{item.icon}<span>{item.label}</span></Link>;
          })}
        </nav>
      )}
    </div>
  );
}

// ─── CUSTOMER NAV ─────────────────────────────────────────────────────────────
export function CustomerNav() {
  const customerNav: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/parking', label: 'Find Parking', icon: <MapPin className="w-4 h-4" /> },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
    { href: '/dashboard/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
    { href: '/dashboard/payments', label: 'Payments', icon: <Building2 className="w-4 h-4" /> },
    { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];
  return { nav: customerNav, title: 'Customer Portal', accent: 'green' };
}
