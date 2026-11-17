'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_PAYMENTS, DEMO_BOOKINGS, DEMO_SESSIONS } from '@/lib/mockData';
import { formatLKR, formatDateTime, lsGet } from '@/lib/utils';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function PaymentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const savedBookings = lsGet<any[]>('bookings', []).filter(booking => !booking.customerId || booking.customerId === user?.id);
  const customerBookings = [...DEMO_BOOKINGS.filter(booking => booking.customerId === user?.id), ...savedBookings];
  const customerVehicles = new Set(customerBookings.map(booking => booking.vehicleReg));
  const customerSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])].filter(session => session.customerId === user?.id || customerVehicles.has(session.vehicleReg));
  const references = new Set([...customerBookings.map(record => record.id), ...customerSessions.map(record => record.id)]);
  const paymentIds = new Set([...customerBookings, ...customerSessions].map(record => record.paymentId).filter(Boolean));
  const myPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])].filter(payment => paymentIds.has(payment.id) || references.has(payment.referenceId));
  const total = myPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const refunded = myPayments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader title="Payment History" description="All transactions associated with your account." />
      <p className="mb-4 text-xs text-gray-500">DEMO DATA · Transactions are simulated. Totals use records linked to this customer&apos;s bookings and parking sessions.</p>
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Total paid" value={formatLKR(total)} icon={<CreditCard className="w-5 h-5 text-green-600" />} source="Completed linked payment records." formula="Sum of completed amounts in LKR." />
        <StatCard label="Transactions" value={myPayments.length} icon={<Bell className="w-5 h-5 text-blue-600" />} source="Payments linked to this customer's booking or session records." formula="Count of matched payment records." />
        <StatCard label="Refunded" value={formatLKR(refunded)} icon={<Clock className="w-5 h-5 text-red-600" />} source="Refunded linked payment records." formula="Sum of refunded amounts in LKR." />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Date', 'Reference', 'Type', 'Amount', 'Method', 'Status', 'Gateway'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {myPayments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.referenceId}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{p.referenceType}</td>
                  <td className="px-4 py-3 font-medium">{formatLKR(p.amount)}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{p.method}</td>
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
