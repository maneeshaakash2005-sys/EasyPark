'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, DEMO_BOOKINGS, DEMO_PAYMENTS, getStoredOwnerLocations } from '@/lib/mockData';
import { formatLKR, lsGet } from '@/lib/utils';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function OwnerReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const locationIds = new Set([...DEMO_LOCATIONS, ...getStoredOwnerLocations()].filter(location => location.ownerId === user?.id).map(location => location.id));
  const ownerBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])].filter(booking => locationIds.has(booking.locationId));
  const ownerPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])].filter(payment => payment.status === 'completed' && ownerBookings.some(booking => booking.id === payment.referenceId || booking.paymentId === payment.id));
  const reportMap = new Map<string, { month: string; revenue: number; bookings: number }>();
  ownerPayments.forEach(payment => {
    const timestamp = new Date(payment.createdAt);
    const key = timestamp.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Colombo' });
    const month = timestamp.toLocaleDateString('en-LK', { month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });
    const record = reportMap.get(key) ?? { month, revenue: 0, bookings: 0 };
    record.revenue += payment.amount;
    record.bookings += 1;
    reportMap.set(key, record);
  });
  const monthlyData = [...reportMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, record]) => record);
  const totalRevenue = ownerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBookings = ownerPayments.length;

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader
        title="Revenue Reports"
        description="Recorded payment and paid-booking totals for your assigned demo locations."
        action={<button onClick={() => alert('Report download is a demo feature only.')} className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><Download className="w-4 h-4" /> Download Report</button>}
      />
      <p className="mb-4 text-xs text-gray-500">DEMO DATA · Source: completed payment records linked to bookings at the signed-in owner&apos;s locations. Average transaction value = recorded revenue / linked completed transactions.</p>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Completed payment revenue</h2><p className="mb-4 text-xs text-gray-500">LKR · grouped by payment date in Asia/Colombo</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatLKR(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#00b8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Linked completed payments</h2><p className="mb-4 text-xs text-gray-500">Transaction count · grouped by payment date</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#168bff" strokeWidth={2} dot={{ fill: '#168bff', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Monthly Summary</h2>
          <div className="text-sm text-gray-500">Total: <strong className="text-gray-900">{formatLKR(totalRevenue)}</strong></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Month', 'Transactions', 'Revenue · LKR', 'Average transaction · LKR'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyData.map(m => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                  <td className="px-4 py-3 text-gray-700">{m.bookings} transactions</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatLKR(m.revenue)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatLKR(Math.round(m.revenue / m.bookings))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
