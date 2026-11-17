'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_NOTIFICATIONS } from '@/lib/mockData';
import { lsGet, lsSet } from '@/lib/utils';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const typeIcon: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const baseNotifs = DEMO_NOTIFICATIONS.filter(n => n.userId === 'u1');
  const [readIds, setReadIds] = useState<string[]>(lsGet('read_notifs', []));
  const [deletedIds, setDeletedIds] = useState<string[]>(lsGet('deleted_notifs', []));

  const notifs = baseNotifs.filter(n => !deletedIds.includes(n.id)).map(n => ({ ...n, read: readIds.includes(n.id) || n.read }));

  const markRead = (id: string) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    lsSet('read_notifs', updated);
  };
  const deleteNotif = (id: string) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    lsSet('deleted_notifs', updated);
  };
  const markAllRead = () => {
    const updated = [...readIds, ...notifs.map(n => n.id)];
    setReadIds(updated);
    lsSet('read_notifs', updated);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        action={unread > 0 ? <button onClick={markAllRead} className="text-sm text-green-600 font-medium hover:underline">Mark all as read</button> : undefined}
      />
      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p>No notifications</p>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`bg-white rounded-xl border p-4 flex gap-4 cursor-pointer hover:border-gray-200 transition-colors ${!n.read ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
            <div className="mt-0.5">{typeIcon[n.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className={`font-medium text-sm ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
