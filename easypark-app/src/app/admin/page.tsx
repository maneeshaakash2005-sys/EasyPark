'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_USERS, DEMO_LOCATIONS, DEMO_BOOKINGS, DEMO_SESSIONS, DEMO_PAYMENTS, DEMO_FINES, DEMO_REVENUE_MONTHLY, getLocationById, getStoredOwnerLocations } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, TrendingUp, ArrowRight, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/parking', label: 'Parking Lots', icon: <MapPin className="w-4 h-4" /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/admin/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/admin/government', label: 'Government Orgs', icon: <Shield className="w-4 h-4" /> },
  { href: '/admin/owners', label: 'Owners', icon: <Database className="w-4 h-4" /> },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!user) return null;

  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])];
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];
  const allPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])];
  const allFines = [...DEMO_FINES, ...lsGet<any[]>('checker_fines', [])];
  const allLocations = [...DEMO_LOCATIONS, ...getStoredOwnerLocations()];
  const totalRevenue = allPayments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const paidFineAmount = allFines.filter(fine => fine.status === 'paid').reduce((sum, fine) => sum + fine.amount, 0);

  const stats = [
    { label: 'Total Users', value: DEMO_USERS.length, icon: <Users className="w-5 h-5 text-blue-600" />, source: 'DEMO_USERS records.', formula: 'Count of seeded demo user records.' },
    { label: 'Parking Locations', value: allLocations.length, icon: <MapPin className="w-5 h-5 text-green-600" />, source: 'Seeded demo locations plus browser-saved owner locations.', formula: 'Count of location records.' },
    { label: 'Total Bookings', value: allBookings.length, icon: <Car className="w-5 h-5 text-purple-600" />, source: 'Seeded bookings plus browser-stored bookings.', formula: 'Count of booking records.' },
    { label: 'Recorded revenue', value: formatLKR(totalRevenue), icon: <TrendingUp className="w-5 h-5 text-orange-600" />, source: 'Seeded and browser-stored payments with completed status.', formula: 'Sum of completed payment amounts in LKR.', period: 'All recorded demo transactions' },
    { label: 'Active Sessions', value: allSessions.filter(session => session.status === 'active').length, icon: <Shield className="w-5 h-5 text-cyan-600" />, source: 'Seeded sessions plus browser-stored sessions.', formula: 'Count of session records with active status.' },
    { label: 'Pending Fines', value: allFines.filter(fine => fine.status === 'pending').length, icon: <AlertTriangle className="w-5 h-5 text-red-600" />, source: 'Seeded fines plus browser-stored checker fines.', formula: 'Count of fine records with pending status.' },
    { label: 'Total Payments', value: allPayments.length, icon: <CreditCard className="w-5 h-5 text-indigo-600" />, source: 'Seeded payment records plus browser-stored simulated transactions.', formula: 'Count of payment records.' },
    { label: 'Paid fines', value: formatLKR(paidFineAmount), icon: <FileText className="w-5 h-5 text-rose-600" />, source: 'Seeded and browser-stored fines with paid status.', formula: 'Sum of paid fine amounts in LKR.' },
  ];

  return (
    <DashboardLayout nav={ADMIN_NAV} title="Super Admin" accent="indigo">
      <PageHeader
        title="Platform Overview"
        description="EasyPark system-wide analytics and management."
        action={
          <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg font-medium">
            SUPER ADMIN — Full Access
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Platform revenue */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Illustrative monthly revenue (LKR)</h2>
          <p className="mb-4 text-xs text-gray-500">Source: pre-aggregated DEMO_REVENUE_MONTHLY sample · Jun–Nov 2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEMO_REVENUE_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatLKR(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#00b8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users by role */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Users by Role</h2>
            <Link href="/admin/users" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="mb-3 text-xs text-gray-500">Source: DEMO_USERS · bar width = users in role / total seeded users × 100.</p>
          <div className="space-y-3">
            {(['customer','owner','operator','government','checker','admin'] as const).map(role => {
              const count = DEMO_USERS.filter(u => u.role === role).length;
              const colors: Record<string, string> = {
                customer: 'bg-green-500', owner: 'bg-blue-500', operator: 'bg-purple-500',
                government: 'bg-cyan-500', checker: 'bg-orange-500', admin: 'bg-red-500'
              };
              return (
                <div key={role} className="flex items-center gap-3">
                  <span className="text-xs capitalize text-gray-600 w-20">{role}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[role]}`} style={{ width: `${(count / DEMO_USERS.length) * 100}%`, minWidth: '8px' }} />
                  </div>
                  <span className="text-xs font-medium text-gray-900 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ADMIN_NAV.slice(1).map(item => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
            <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">{item.icon}</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{item.label}</span>
            <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-indigo-500 ml-auto transition-colors" />
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
