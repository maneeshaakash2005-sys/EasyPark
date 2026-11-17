'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, PageHeader, StatusBadge, SearchInput } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_PAYMENTS, DEMO_OPERATORS, getLocationById, applyOperatorBookingStatus } from '@/lib/mockData';
import { lsGet, lsSet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Car, Users, History, ArrowRight, CheckCircle, LogOut } from 'lucide-react';

const NAV = [
  { href: '/operator', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/operator/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/operator/vehicles', label: 'Vehicles', icon: <Users className="w-4 h-4" /> },
  { href: '/operator/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function OperatorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!user) return null;

  const operator = DEMO_OPERATORS.find(item => item.userId === user.id);
  const locationIds = new Set(operator?.locationIds ?? []);
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])]
    .filter(booking => locationIds.has(booking.locationId))
    .map(applyOperatorBookingStatus);
  const active = allBookings.filter(b => b.status === 'active');
  const upcoming = allBookings.filter(b => b.status === 'confirmed');
  const paymentIds = new Set(allBookings.map(booking => booking.paymentId).filter(Boolean));
  const revenue = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])]
    .filter(payment => payment.status === 'completed' && (paymentIds.has(payment.id) || allBookings.some(booking => booking.id === payment.referenceId)))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <DashboardLayout nav={NAV} title="Operator Portal" accent="indigo">
      <PageHeader title="Operator Dashboard" description={`Welcome, ${user.name}. Managing ${locationIds.size} assigned demo locations.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned Locations" value={`${locationIds.size} locations`} icon={<LayoutDashboard className="w-5 h-5 text-indigo-600" />} source="DEMO_OPERATORS location assignments for the signed-in operator." formula="Count of assigned location IDs." />
        <StatCard label="Active Bookings" value={active.length} icon={<Car className="w-5 h-5 text-green-600" />} source="Bookings at this operator's assigned locations." formula="Count of matching bookings with active status." />
        <StatCard label="Confirmed Bookings" value={upcoming.length} icon={<Users className="w-5 h-5 text-blue-600" />} source="Bookings at this operator's assigned locations." formula="Count of matching bookings with confirmed status; not limited to today." />
        <StatCard label="Recorded revenue" value={formatLKR(revenue)} icon={<History className="w-5 h-5 text-purple-600" />} source="Completed payments linked to bookings at assigned locations." formula="Sum of eligible completed payment amounts in LKR." period="All recorded demo transactions" />
      </div>

      {/* Vehicles in */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Vehicles Currently Inside</h2>
          <Link href="/operator/vehicles" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Vehicle', 'Booking Ref', 'Location', 'Check-in', 'Booked Until'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {active.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{b.vehicleReg}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-700">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.checkInTime ? formatDateTime(b.checkInTime) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(b.endTime)}</td>
                  </tr>
                );
              })}
              {active.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No vehicles currently inside</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upcoming Arrivals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Vehicle', 'Booking Ref', 'Location', 'Arrival', 'Duration', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {upcoming.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{b.vehicleReg}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-700">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3">{b.hours}h</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                );
              })}
              {upcoming.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No upcoming arrivals</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
