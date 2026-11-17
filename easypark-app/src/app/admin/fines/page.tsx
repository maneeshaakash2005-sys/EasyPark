'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard, ConfirmDialog } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_FINES, getLocationById } from '@/lib/mockData';
import { lsGet, lsSet, formatLKR, formatDate } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, Trash2 } from 'lucide-react';

const NAV = [
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

export default function AdminFinesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [dismissId, setDismissId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(lsGet('dismissed_fines', []));
  const checkerFines = lsGet<any[]>('checker_fines', []);
  const allFines = [...DEMO_FINES, ...checkerFines].filter(f => !dismissed.includes(f.id));

  const doDismiss = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    lsSet('dismissed_fines', updated);
  };

  const totalCollected = allFines.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = allFines.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Fine Management" description="Platform-wide parking violation fines." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Fines" value={allFines.length} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} />
        <StatCard label="Pending" value={allFines.filter(f => f.status === 'pending').length} icon={<FileText className="w-5 h-5 text-red-600" />} />
        <StatCard label="Collected" value={formatLKR(totalCollected)} icon={<Shield className="w-5 h-5 text-green-600" />} />
        <StatCard label="Outstanding" value={formatLKR(totalPending)} icon={<CreditCard className="w-5 h-5 text-indigo-600" />} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Fine Ref', 'Vehicle', 'Location', 'Reason', 'Amount', 'Status', 'Issued', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allFines.map(f => {
                const loc = getLocationById(f.locationId);
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{f.fineRef}</td>
                    <td className="px-4 py-3 font-mono text-sm">{f.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-40 truncate text-xs">{f.reason}</td>
                    <td className="px-4 py-3 font-medium text-red-700">{formatLKR(f.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(f.issuedAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDismissId(f.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors" title="Dismiss">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allFines.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No fines found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog isOpen={!!dismissId} onClose={() => setDismissId(null)} onConfirm={() => { if (dismissId) doDismiss(dismissId); setDismissId(null); }} title="Dismiss Fine" message="Dismiss this fine record? It will be hidden from the list (demo only)." confirmLabel="Dismiss" />
    </DashboardLayout>
  );
}
