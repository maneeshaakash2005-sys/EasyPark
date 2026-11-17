'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { lsGet, formatLKR, formatDate, formatDateTime } from '@/lib/utils';
import { DEMO_FINES, getLocationById } from '@/lib/mockData';
import { LayoutDashboard, Search, AlertTriangle, History, Shield } from 'lucide-react';

const NAV = [
  { href: '/government-checker', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government-checker/verify', label: 'Verify Vehicle', icon: <Search className="w-4 h-4" /> },
  { href: '/government-checker/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
  { href: '/government-checker/fines', label: 'Issue Fine', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government-checker/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function CheckerHistoryPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const myFines = [...DEMO_FINES.filter(f => f.checkerId === 'u5'), ...lsGet<any[]>('checker_fines', [])];
  const totalAmount = myFines.reduce((s, f) => s + f.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <PageHeader title="Fine History" description={`${myFines.length} fines issued · ${formatLKR(totalAmount)} total`} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Fine Ref', 'Vehicle', 'Location', 'Reason', 'Amount', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {myFines.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No fines issued yet</td></tr>
              ) : myFines.map(f => {
                const loc = getLocationById(f.locationId);
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{f.fineRef}</td>
                    <td className="px-4 py-3 font-mono text-sm">{f.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-40 truncate">{f.reason}</td>
                    <td className="px-4 py-3 font-medium text-red-700">{formatLKR(f.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(f.issuedAt)}</td>
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
