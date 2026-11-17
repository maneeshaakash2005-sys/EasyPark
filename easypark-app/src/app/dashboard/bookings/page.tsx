'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader, SearchInput, Modal, ConfirmDialog } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_BOOKINGS, getLocationById } from '@/lib/mockData';
import { lsGet, lsSet, formatLKR, formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings, Eye, X } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

type TabType = 'all' | 'active' | 'confirmed' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<any>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>(lsGet('cancelled_bookings', []));

  const savedBookings = lsGet<any[]>('bookings', []).filter(booking => !booking.customerId || booking.customerId === user?.id);
  const all = [...DEMO_BOOKINGS.filter(b => b.customerId === user?.id), ...savedBookings];
  const withStatus = all.map(b => cancelled.includes(b.id) ? { ...b, status: 'cancelled' } : b);

  const filtered = withStatus
    .filter(b => tab === 'all' || b.status === tab)
    .filter(b => !search || b.bookingRef?.toLowerCase().includes(search.toLowerCase()) || b.vehicleReg?.toLowerCase().includes(search.toLowerCase()));

  const PER_PAGE = 5;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const doCancel = (id: string) => {
    const updated = [...cancelled, id];
    setCancelled(updated);
    lsSet('cancelled_bookings', updated);
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: withStatus.length },
    { key: 'active', label: 'Active', count: withStatus.filter(b => b.status === 'active').length },
    { key: 'confirmed', label: 'Upcoming', count: withStatus.filter(b => b.status === 'confirmed').length },
    { key: 'completed', label: 'Completed', count: withStatus.filter(b => b.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: withStatus.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader title="My Bookings" description="View and manage all your parking reservations." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Tabs + Search */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          <div className="w-full sm:w-56"><SearchInput value={search} onChange={setSearch} placeholder="Search ref or vehicle..." /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Reference', 'Location', 'Vehicle', 'Date & Time', 'Duration', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No bookings found</td></tr>
              ) : paginated.map(b => {
                const loc = getLocationById(b.locationId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 whitespace-nowrap">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.vehicleReg}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{b.hours}h</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{formatLKR(b.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewBooking(b)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                        {b.status === 'confirmed' && (
                          <button onClick={() => setCancelId(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details">
        {viewBooking && (() => {
          const loc = getLocationById(viewBooking.locationId);
          return (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Reference', viewBooking.bookingRef],
                  ['Location', loc?.name ?? '—'],
                  ['Vehicle', viewBooking.vehicleReg],
                  ['Duration', `${viewBooking.hours} hour(s)`],
                  ['Start', formatDateTime(viewBooking.startTime)],
                  ['End', formatDateTime(viewBooking.endTime)],
                  ['Amount', formatLKR(viewBooking.amount)],
                  ['Status', viewBooking.status],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-xs text-gray-500">{k}</p><p className="font-medium text-gray-900 mt-0.5">{v}</p></div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => { if (cancelId) doCancel(cancelId); setCancelId(null); }}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? A refund will be initiated (Demo only)."
        confirmLabel="Cancel Booking"
      />
    </DashboardLayout>
  );
}
