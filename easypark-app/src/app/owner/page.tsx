'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, DEMO_BOOKINGS, DEMO_PAYMENTS, getLocationById, getAvailableCount } from '@/lib/mockData';
import { formatLKR, formatDateTime, lsGet } from '@/lib/utils';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOwnerLocations } from '@/lib/useOwnerLocations';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function OwnerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const storedLocations = useOwnerLocations();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!user) return null;

  const myLocs = [...DEMO_LOCATIONS.filter(l => l.ownerId === user.id), ...storedLocations.filter(location => location.ownerId === user.id)];
  const totalCapacity = myLocs.reduce((s, l) => s + l.totalCapacity, 0);
  const totalAvailable = myLocs.reduce((sum, location) => sum + getAvailableCount(location), 0);
  const totalBooked = totalCapacity - totalAvailable;
  const ownerLocationIds = new Set(myLocs.map(location => location.id));
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])];
  const ownerBookings = allBookings.filter(booking => ownerLocationIds.has(booking.locationId));
  const paymentIds = new Set(ownerBookings.map(booking => booking.paymentId).filter(Boolean));
  const ownerPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])].filter(payment => payment.status === 'completed' && (paymentIds.has(payment.id) || ownerBookings.some(booking => booking.id === payment.referenceId)));
  const totalRevenue = ownerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const revenueByMonth = Object.values(ownerPayments.reduce<Record<string, { month: string; revenue: number }>>((months, payment) => {
    const month = new Date(payment.createdAt).toLocaleDateString('en-LK', { month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });
    months[month] ??= { month, revenue: 0 };
    months[month].revenue += payment.amount;
    return months;
  }, {}));
  const recentBookings = ownerBookings.slice(0, 5);

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader
        title="Owner Dashboard"
        description="Manage your parking locations and revenue."
        action={<Link href="/owner/locations/new" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><MapPin className="w-4 h-4" /> Add Location</Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Locations" value={myLocs.length} icon={<Building2 className="w-5 h-5 text-green-600" />} source="Demo parking location records assigned to this owner." formula="Count of locations with matching owner ID." />
        <StatCard label="Total Capacity" value={`${totalCapacity} spaces`} icon={<Car className="w-5 h-5 text-blue-600" />} source="Total capacity fields on this owner's demo location records." formula="Sum of totalCapacity across owned locations." />
        <StatCard label="Occupied" value={`${totalBooked} / ${totalCapacity} spaces`} icon={<MapPin className="w-5 h-5 text-orange-600" />} source="Demo location capacity and browser-stored paid demo activity." formula="Occupied = total capacity − aggregate availability; occupancy = occupied / total capacity." period="Current demo state; not live occupancy" />
        <StatCard label="Recorded revenue" value={formatLKR(totalRevenue)} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} source="Completed payment records linked to bookings at this owner's locations." formula="Sum of eligible completed payment amounts in LKR." period="All recorded demo transactions" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Completed payment records by month</h2>
          <p className="mb-4 text-xs text-gray-500">Source: completed demo transactions linked to this owner&apos;s locations · Amounts in LKR</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatLKR(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#00b8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Locations overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Locations Overview</h2>
            <Link href="/owner/locations" className="text-xs text-green-600 hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {myLocs.map(loc => {
              const avail = getAvailableCount(loc);
              const occupied = loc.totalCapacity - avail;
              const pct = loc.totalCapacity > 0 ? occupied / loc.totalCapacity : 0;
              return (
                <div key={loc.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 truncate">{loc.name}</span>
                      <span className="text-gray-500 ml-2 whitespace-nowrap">{avail} free</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 0.8 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round(pct * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/owner/bookings" className="text-xs text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Reference', 'Vehicle', 'Location', 'Date', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.startTime)}</td>
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
