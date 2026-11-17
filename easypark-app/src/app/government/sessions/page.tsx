'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2, Timer } from 'lucide-react';

const NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

type Filter = 'all' | 'active' | 'expired' | 'completed';

export default function GovernmentSessionsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const now = useDemoClock();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [filter, setFilter] = useState<Filter>('all');
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];
  const filtered = allSessions.filter(s => filter === 'all' || s.status === filter);
  const totalRevenue = allSessions.reduce((s, sess) => s + sess.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Government Admin" accent="blue">
      <PageHeader title="Parking Sessions" description="All government parking sessions." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['all', 'active', 'completed', 'expired'] as Filter[]).map(f => {
          const count = f === 'all' ? allSessions.length : allSessions.filter(s => s.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`p-4 rounded-xl border-2 text-left transition-all ${filter === f ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className={`text-2xl font-bold ${filter === f ? 'text-blue-700' : 'text-gray-900'}`}>{count}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{f} sessions</p>
            </button>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-50">{['Session Ref', 'Location', 'Vehicle', 'Start', 'End', 'Duration', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No sessions found</td></tr>
              ) : filtered.map(s => {
                const loc = getLocationById(s.locationId);
                const isActive = s.status === 'active';
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.sessionRef}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{s.vehicleReg}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.endTime)}</td>
                    <td className="px-4 py-3">{s.hours}h</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(s.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                      {isActive && <div className="text-xs text-green-600 mt-0.5 flex items-center gap-1"><Timer className="w-3 h-3" />{getTimeUntil(s.endTime, now)}</div>}
                    </td>
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
