'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_PAYMENTS, DEMO_LOCATIONS, getLocationById, getStoredOwnerLocations } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings } from 'lucide-react';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function OwnerBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const ownerLocations = [...DEMO_LOCATIONS, ...getStoredOwnerLocations()].filter(location => location.ownerId === user?.id);
  const locationIds = new Set(ownerLocations.map(location => location.id));
  const cancelledIds = new Set<string>(lsGet('cancelled_bookings', []));
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])]
    .filter(booking => locationIds.has(booking.locationId))
    .map(booking => cancelledIds.has(booking.id) ? { ...booking, status: 'cancelled' } : booking);
  const paymentIds = new Set(allBookings.filter(booking => booking.status !== 'cancelled').map(booking => booking.paymentId).filter(Boolean));
  const totalRevenue = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])]
    .filter(payment => payment.status === 'completed' && (paymentIds.has(payment.id) || allBookings.some(booking => booking.status !== 'cancelled' && booking.id === payment.referenceId)))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const active = allBookings.filter(b => b.status === 'active').length;

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader title="Booking Management" description="Bookings across your assigned demo parking locations." />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Total Bookings" value={allBookings.length} icon={<Car className="w-5 h-5 text-blue-600" />} source="Booking records linked to this owner's locations." formula="Count of matching booking records." />
        <StatCard label="Active Now" value={active} icon={<MapPin className="w-5 h-5 text-green-600" />} source="Booking records linked to this owner's locations." formula="Count of matching active records." />
        <StatCard label="Recorded revenue" value={formatLKR(totalRevenue)} icon={<BarChart2 className="w-5 h-5 text-purple-600" />} source="Completed payment records linked to non-cancelled owner bookings." formula="Sum of eligible completed transaction amounts in LKR." period="All recorded demo transactions" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Reference', 'Vehicle', 'Location', 'Start', 'End', 'Status', 'Amount'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allBookings.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.endTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 font-medium">{formatLKR(b.amount)}</td>
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
