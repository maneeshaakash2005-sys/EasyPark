'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, StatusBadge, PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_SESSIONS, DEMO_PAYMENTS, DEMO_NOTIFICATIONS, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings, MapPin, ArrowRight } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: '2' },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!user) return null;

  const savedBookings = lsGet<any[]>('bookings', []).filter(booking => !booking.customerId || booking.customerId === user.id);
  const cancelledIds = new Set<string>(lsGet('cancelled_bookings', []));
  const userBookings = [...DEMO_BOOKINGS.filter(b => b.customerId === user.id), ...savedBookings]
    .map(booking => cancelledIds.has(booking.id) ? { ...booking, status: 'cancelled' } : booking);
  const active = userBookings.filter(b => b.status === 'active');
  const upcoming = userBookings.filter(b => b.status === 'confirmed');
  const paymentIds = new Set(userBookings.map(booking => booking.paymentId).filter(Boolean));
  const allPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])];
  const totalSpent = allPayments.filter(payment => paymentIds.has(payment.id) && payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const vehicleRegs = new Set(userBookings.map(booking => booking.vehicleReg));
  const sessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])].filter(session => vehicleRegs.has(session.vehicleReg));
  const activeSessions = sessions.filter(s => s.status === 'active');
  const recentBookings = userBookings.slice(0, 5);
  const unreadNotifs = DEMO_NOTIFICATIONS.filter(n => n.userId === user.id && !n.read);

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}!`}
        description="Manage your bookings and parking sessions."
        action={<Link href="/parking" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><MapPin className="w-4 h-4" /> Find Parking</Link>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Bookings" value={active.length} icon={<Car className="w-5 h-5 text-green-600" />} source="Bookings for the signed-in customer with active status." formula="Count of matching active booking records." />
        <StatCard label="Upcoming" value={upcoming.length} icon={<Clock className="w-5 h-5 text-blue-600" />} source="Bookings for the signed-in customer with confirmed status." formula="Count of matching confirmed booking records." />
        <StatCard label="Total Spent" value={formatLKR(totalSpent)} icon={<CreditCard className="w-5 h-5 text-purple-600" />} source="Completed payment records linked to this customer's bookings." formula="Sum of completed linked transaction amounts in LKR." period="All recorded demo transactions" />
        <StatCard label="Active Sessions" value={activeSessions.length} icon={<Bell className="w-5 h-5 text-orange-600" />} source="Sessions matching vehicle registrations in this customer's bookings." formula="Count of matching active session records." />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">{['Reference', 'Location', 'Date', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map(b => {
                  const loc = getLocationById(b.locationId);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{b.bookingRef}</td>
                      <td className="px-4 py-3 text-gray-700">{loc?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(b.startTime)}</td>
                      <td className="px-4 py-3 font-medium">{formatLKR(b.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications + Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Notifications</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{unreadNotifs.length} new</span>
            </div>
            <div className="space-y-3">
              {unreadNotifs.slice(0, 3).map(n => (
                <div key={n.id} className="flex gap-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              ))}
              {unreadNotifs.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No new notifications</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/parking" className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-green-600" /> Find Parking
              </Link>
              <Link href="/dashboard/bookings" className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700">
                <Car className="w-4 h-4 text-blue-600" /> My Bookings
              </Link>
              <Link href="/dashboard/payments" className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700">
                <CreditCard className="w-4 h-4 text-purple-600" /> Payment History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
