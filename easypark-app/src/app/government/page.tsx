'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, DEMO_SESSIONS, DEMO_FINES, DEMO_PAYMENTS, getLocationById, getAvailableCount } from '@/lib/mockData';
import { formatLKR, formatDateTime, lsGet } from '@/lib/utils';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const GOVT_NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

export default function GovernmentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!user) return null;

  const govtLocs = DEMO_LOCATIONS.filter(l => l.type === 'government');
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])].filter(session => govtLocs.some(location => location.id === session.locationId));
  const activeSessions = allSessions.filter(s => s.status === 'active');
  const sessionPaymentIds = new Set(allSessions.map(session => session.paymentId).filter(Boolean));
  const sessionIds = new Set(allSessions.map(session => session.id));
  const govtPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])].filter(payment => payment.status === 'completed' && (sessionPaymentIds.has(payment.id) || sessionIds.has(payment.referenceId)));
  const totalRevenue = govtPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const revenueByMonth = Object.values(govtPayments.reduce<Record<string, { month: string; revenue: number }>>((months, payment) => {
    const month = new Date(payment.createdAt).toLocaleDateString('en-LK', { month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });
    months[month] ??= { month, revenue: 0 };
    months[month].revenue += payment.amount;
    return months;
  }, {}));
  const allFines = [...DEMO_FINES, ...lsGet<any[]>('checker_fines', [])];
  const pendingFines = allFines.filter(f => f.status === 'pending').length;

  return (
    <DashboardLayout nav={GOVT_NAV} title="Government Admin" accent="blue">
      <PageHeader title="Government Parking Dashboard" description="Western Province Road Development Authority" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Managed Locations" value={govtLocs.length} icon={<Shield className="w-5 h-5 text-blue-600" />} source="Government-type location records in the demo data." formula="Count of government locations." />
        <StatCard label="Active Sessions" value={activeSessions.length} icon={<Clock className="w-5 h-5 text-green-600" />} source="Government-location sessions from demo records and browser-stored sessions." formula="Count of matching sessions with active status." />
        <StatCard label="Recorded revenue" value={formatLKR(totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} source="Completed payment records linked to government-location sessions." formula="Sum of eligible completed payment amounts in LKR." period="All recorded demo transactions" />
        <StatCard label="Pending Fines" value={pendingFines} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} source="Government fines in demo records and browser-stored checker fines." formula="Count of records with pending status." />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Recorded government-session payments</h2>
          <p className="mb-4 text-xs text-gray-500">Source: completed linked payment records · Amounts in LKR</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatLKR(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#168bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Locations overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Location Status</h2>
            <Link href="/government/locations" className="text-xs text-blue-600 hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {govtLocs.map(loc => {
              const sessCount = allSessions.filter(s => s.locationId === loc.id && s.status === 'active').length;
              const avail = getAvailableCount(loc);
              return (
                <div key={loc.id} className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="font-medium text-gray-900 text-sm">{loc.name}</p>
                    <StatusBadge status={loc.status} />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>{avail} spaces free</span>
                    <span>•</span>
                    <span className="text-green-600">{sessCount} active session{sessCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{formatLKR(loc.hourlyRate)}/hr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Active Parking Sessions</h2>
          <Link href="/government/sessions" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Session Ref', 'Vehicle', 'Location', 'Start', 'End', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allSessions.map(s => {
                const loc = getLocationById(s.locationId);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.sessionRef}</td>
                    <td className="px-4 py-3 font-mono text-sm">{s.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.endTime)}</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(s.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
