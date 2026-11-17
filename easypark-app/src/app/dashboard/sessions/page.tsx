'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, DEMO_BOOKINGS, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings, Timer } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function SessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const now = useDemoClock();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const savedBookings = lsGet<any[]>('bookings', []).filter(booking => !booking.customerId || booking.customerId === user?.id);
  const customerBookings = [...DEMO_BOOKINGS.filter(booking => booking.customerId === user?.id), ...savedBookings];
  const customerVehicles = new Set(customerBookings.map(booking => booking.vehicleReg));
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])].filter(session => session.customerId === user?.id || customerVehicles.has(session.vehicleReg));

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader title="Parking Sessions" description="Sessions linked to your demo bookings and vehicle registrations." />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Session Ref', 'Location', 'Vehicle', 'Start', 'End', 'Duration', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allSessions.map(s => {
                const loc = getLocationById(s.locationId);
                const isActive = s.status === 'active';
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{s.sessionRef}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-36 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.vehicleReg}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.endTime)}</td>
                    <td className="px-4 py-3">{s.hours}h</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(s.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge status={s.status} />
                        {isActive && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Timer className="w-3 h-3" /> {getTimeUntil(s.endTime, now)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allSessions.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No sessions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
