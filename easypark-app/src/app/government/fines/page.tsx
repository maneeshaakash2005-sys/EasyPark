'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_FINES, getLocationById } from '@/lib/mockData';
import { lsGet, lsSet, formatLKR, formatDate } from '@/lib/utils';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2, Eye } from 'lucide-react';

const NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

export default function GovernmentFinesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [paidFines, setPaidFines] = useState<string[]>(lsGet('paid_fines', []));
  const allFines = [...DEMO_FINES, ...lsGet<any[]>('easypark_fines', [])];
  const withStatus = allFines.map(f => paidFines.includes(f.id) ? { ...f, status: 'paid' } : f);

  const markPaid = (id: string) => {
    const updated = [...paidFines, id];
    setPaidFines(updated);
    lsSet('paid_fines', updated);
  };

  const totalCollected = withStatus.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = withStatus.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Government Admin" accent="blue">
      <PageHeader title="Fine Management" description="Monitor and manage parking violation fines." />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Fines" value={withStatus.length} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} />
        <StatCard label="Collected" value={formatLKR(totalCollected)} icon={<BarChart2 className="w-5 h-5 text-green-600" />} />
        <StatCard label="Pending" value={formatLKR(totalPending)} icon={<Clock className="w-5 h-5 text-red-600" />} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-50">{['Fine Ref', 'Vehicle', 'Location', 'Reason', 'Amount', 'Status', 'Issued', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {withStatus.map(f => {
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
                    <td className="px-4 py-3">
                      {f.status === 'pending' && (
                        <button onClick={() => markPaid(f.id)} className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Mark Paid</button>
                      )}
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
