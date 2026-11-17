'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_PAYMENTS, DEMO_OPERATORS, getLocationById, applyOperatorBookingStatus } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Car, Users, History } from 'lucide-react';

const NAV = [
  { href: '/operator', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/operator/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/operator/vehicles', label: 'Vehicles', icon: <Users className="w-4 h-4" /> },
  { href: '/operator/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function OperatorHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const locationIds = new Set(DEMO_OPERATORS.find(operator => operator.userId === user?.id)?.locationIds ?? []);
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])]
    .filter(booking => locationIds.has(booking.locationId))
    .map(applyOperatorBookingStatus);
  const history = allBookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const completedIds = new Set(history.filter(booking => booking.status === 'completed').map(booking => booking.id));
  const completedPaymentIds = new Set(history.filter(booking => booking.status === 'completed').map(booking => booking.paymentId).filter(Boolean));
  const totalRevenue = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])]
    .filter(payment => payment.status === 'completed' && (completedPaymentIds.has(payment.id) || completedIds.has(payment.referenceId)))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Operator Portal" accent="indigo">
      <PageHeader title="Booking History" description={`${history.length} completed or cancelled records · ${formatLKR(totalRevenue)} in linked completed payments · DEMO DATA`} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Ref', 'Vehicle', 'Location', 'Date', 'Duration', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No history yet</td></tr>
              ) : history.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
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
