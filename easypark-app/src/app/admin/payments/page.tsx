'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_PAYMENTS } from '@/lib/mockData';
import { formatLKR, formatDateTime, lsGet } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database } from 'lucide-react';

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

export default function AdminPaymentsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const allPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])];
  const totalRevenue = allPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const refunded = allPayments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
  const methodBreakdown = ['card','mobile','bank'].map(m => ({
    method: m, count: allPayments.filter(p => p.method === m).length,
    amount: allPayments.filter(p => p.method === m && p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  }));

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Payment Transactions" description="All platform payment records." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total transactions" value={allPayments.length} icon={<CreditCard className="w-5 h-5 text-indigo-600" />} source="Seeded payment records plus browser-stored simulated transactions." formula="Count of payment records." />
        <StatCard label="Completed revenue" value={formatLKR(totalRevenue)} icon={<Shield className="w-5 h-5 text-green-600" />} source="Payment records with completed status." formula="Sum of completed amounts in LKR." period="All recorded demo transactions" />
        <StatCard label="Refunded" value={formatLKR(refunded)} icon={<AlertTriangle className="w-5 h-5 text-red-600" />} source="Payment records with refunded status." formula="Sum of refunded amounts in LKR." />
        <StatCard label="Pending" value={allPayments.filter(p => p.status === 'pending').length} icon={<FileText className="w-5 h-5 text-orange-600" />} source="Seeded and browser-stored payments." formula="Count of pending payment records." />
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {methodBreakdown.map(m => (
          <div key={m.method} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 capitalize mb-1">{m.method.replace('_', ' ')}</p>
            <p className="text-xl font-bold text-gray-900">{m.count} txns</p>
            <p className="text-sm text-gray-600">{formatLKR(m.amount)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Date', 'Reference', 'Type', 'Amount', 'Method', 'Status', 'Gateway'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allPayments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.referenceId}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{p.referenceType}</td>
                  <td className="px-4 py-3 font-medium">{formatLKR(p.amount)}</td>
                  <td className="px-4 py-3 capitalize text-xs text-gray-600">{p.method.replace('_',' ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.gateway}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
