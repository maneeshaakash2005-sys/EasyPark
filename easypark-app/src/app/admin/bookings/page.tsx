'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime } from '@/lib/utils';
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

export default function AdminBookingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])];
  const totalRev = allBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="All Bookings" description="Platform-wide private parking reservations." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={allBookings.length} icon={<Car className="w-5 h-5 text-indigo-600" />} />
        <StatCard label="Active" value={allBookings.filter(b => b.status === 'active').length} icon={<MapPin className="w-5 h-5 text-green-600" />} />
        <StatCard label="Completed" value={allBookings.filter(b => b.status === 'completed').length} icon={<Shield className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Total Revenue" value={formatLKR(totalRev)} icon={<CreditCard className="w-5 h-5 text-purple-600" />} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Ref', 'Customer', 'Vehicle', 'Location', 'Date', 'Duration', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allBookings.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.customerId}</td>
                    <td className="px-4 py-3 font-mono text-sm">{b.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3">{b.hours}h</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(b.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
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
