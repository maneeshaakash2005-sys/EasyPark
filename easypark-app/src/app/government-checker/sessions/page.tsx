'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, Search, AlertTriangle, History, Shield, Timer } from 'lucide-react';

const NAV = [
  { href: '/government-checker', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government-checker/verify', label: 'Verify Vehicle', icon: <Search className="w-4 h-4" /> },
  { href: '/government-checker/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
  { href: '/government-checker/fines', label: 'Issue Fine', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government-checker/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function CheckerSessionsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const now = useDemoClock();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];

  return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <PageHeader title="Active Sessions" description="All active parking sessions in your area." />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Session Ref', 'Vehicle', 'Location', 'Paid Until', 'Time Remaining', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allSessions.map(s => {
                const loc = getLocationById(s.locationId);
                const remaining = getTimeUntil(s.endTime, now);
                const isExpired = remaining === 'Expired';
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs">{s.sessionRef}</td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{s.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.endTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium flex items-center gap-1 ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        <Timer className="w-3 h-3" /> {remaining}
                      </span>
                    </td>
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
