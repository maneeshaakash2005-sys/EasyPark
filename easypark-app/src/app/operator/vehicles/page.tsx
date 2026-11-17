'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, SearchInput, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, DEMO_OPERATORS, getLocationById, applyOperatorBookingStatus } from '@/lib/mockData';
import { lsGet, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, Car, Users, History, Search } from 'lucide-react';

const NAV = [
  { href: '/operator', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/operator/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/operator/vehicles', label: 'Vehicles', icon: <Users className="w-4 h-4" /> },
  { href: '/operator/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function OperatorVehiclesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const now = useDemoClock();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [lookupReg, setLookupReg] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const locationIds = new Set(DEMO_OPERATORS.find(operator => operator.userId === user?.id)?.locationIds ?? []);
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])]
    .filter(booking => locationIds.has(booking.locationId))
    .map(applyOperatorBookingStatus);
  const activeVehicles = allBookings.filter(b => b.status === 'active');

  const lookup = () => {
    if (!lookupReg.trim()) return;
    const found = allBookings.find(b => b.vehicleReg.toUpperCase() === lookupReg.toUpperCase());
    setLookupResult(found ?? 'not_found');
  };

  return (
    <DashboardLayout nav={NAV} title="Operator Portal" accent="indigo">
      <PageHeader title="Vehicle Tracking" description={`Search vehicles at ${locationIds.size} assigned demo locations.`} />

      {/* Vehicle Lookup */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Vehicle Lookup</h2>
        <div className="flex gap-2">
          <input value={lookupReg} onChange={e => setLookupReg(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && lookup()} placeholder="Enter vehicle reg (e.g. CAR-1234)" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={lookup} className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Search className="w-4 h-4" /> Search</button>
        </div>
        {lookupResult && lookupResult !== 'not_found' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 bg-green-500 rounded-full" /><span className="font-medium text-green-900">Vehicle Found</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Booking Ref</p><p className="font-mono font-medium">{lookupResult.bookingRef}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={lookupResult.status} /></div>
              <div><p className="text-xs text-gray-500">Location</p><p>{getLocationById(lookupResult.locationId)?.name ?? '—'}</p></div>
              <div><p className="text-xs text-gray-500">Until</p><p>{formatDateTime(lookupResult.endTime)}</p></div>
            </div>
          </div>
        )}
        {lookupResult === 'not_found' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <strong>No booking found</strong> for vehicle reg &quot;{lookupReg}&quot;.
          </div>
        )}
      </div>

      {/* Active vehicles table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Vehicles Currently Inside ({activeVehicles.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Vehicle Reg', 'Booking Ref', 'Location', 'Check-in', 'Booked Until', 'Time Left'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {activeVehicles.map(b => {
                const loc = getLocationById(b.locationId);
                const remaining = getTimeUntil(b.endTime, now);
                const isOverdue = remaining === 'Expired';
                return (
                  <tr key={b.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{b.vehicleReg}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-700">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{b.checkInTime ? formatDateTime(b.checkInTime) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(b.endTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>{remaining}</span>
                    </td>
                  </tr>
                );
              })}
              {activeVehicles.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No vehicles currently inside</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
