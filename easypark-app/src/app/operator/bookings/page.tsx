'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader, SearchInput } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_OPERATORS, getLocationById, applyOperatorBookingStatus } from '@/lib/mockData';
import { lsGet, lsSet, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Car, Users, History, CheckCircle, LogOut } from 'lucide-react';

const NAV = [
  { href: '/operator', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/operator/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/operator/vehicles', label: 'Vehicles', icon: <Users className="w-4 h-4" /> },
  { href: '/operator/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function OperatorBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'active' | 'completed'>('active');
  const [checkedIn, setCheckedIn] = useState<string[]>(lsGet('operator_checkedin', []));
  const [checkedOut, setCheckedOut] = useState<string[]>(lsGet('operator_checkedout', []));

  const assignedLocationIds = new Set(DEMO_OPERATORS.find(operator => operator.userId === user?.id)?.locationIds ?? []);
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])].filter(booking => assignedLocationIds.has(booking.locationId));
  const withStatus = allBookings.map(applyOperatorBookingStatus);

  const filtered = withStatus
    .filter(b => tab === 'upcoming' ? b.status === 'confirmed' : tab === 'active' ? b.status === 'active' : b.status === 'completed')
    .filter(b => !search || b.bookingRef?.toLowerCase().includes(search.toLowerCase()) || b.vehicleReg?.toLowerCase().includes(search.toLowerCase()));

  const doCheckIn = (id: string) => {
    const updated = [...checkedIn, id];
    setCheckedIn(updated);
    lsSet('operator_checkedin', updated);
  };
  const doCheckOut = (id: string) => {
    const updated = [...checkedOut, id];
    setCheckedOut(updated);
    lsSet('operator_checkedout', updated);
  };

  return (
    <DashboardLayout nav={NAV} title="Operator Portal" accent="indigo">
      <PageHeader title="Booking Management" description={`Check in and check out vehicles at ${assignedLocationIds.size} assigned demo locations.`} />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1">
            {(['upcoming', 'active', 'completed'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>
          <div className="w-56"><SearchInput value={search} onChange={setSearch} placeholder="Search ref or vehicle..." /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Vehicle', 'Booking Ref', 'Location', 'Start', 'End', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No bookings found</td></tr>
              ) : filtered.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{b.vehicleReg}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.endTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      {b.status === 'confirmed' && (
                        <button onClick={() => doCheckIn(b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                          <CheckCircle className="w-3 h-3" /> Check In
                        </button>
                      )}
                      {b.status === 'active' && (
                        <button onClick={() => doCheckOut(b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
                          <LogOut className="w-3 h-3" /> Check Out
                        </button>
                      )}
                    </td>
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
