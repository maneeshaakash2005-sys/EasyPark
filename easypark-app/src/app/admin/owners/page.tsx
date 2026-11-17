'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_USERS, DEMO_LOCATIONS, DEMO_BOOKINGS, DEMO_PAYMENTS, getAvailableCount, getStoredOwnerLocations } from '@/lib/mockData';
import { formatLKR, lsGet } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, TrendingUp } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/parking', label: 'Parking Lots', icon: <MapPin className="w-4 h-4" /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/admin/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/admin/government', label: 'Government Orgs', icon: <Shield className="w-4 h-4" /> },
  { href: '/admin/owners', label: 'Owners', icon: <Database className="w-4 h-4" /> },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function AdminOwnersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const owners = DEMO_USERS.filter(u => u.role === 'owner');
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])];
  const allPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])];
  const allLocations = [...DEMO_LOCATIONS, ...getStoredOwnerLocations()];

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Parking Owners" description="Registered private parking lot owners." />
      <div className="grid gap-4">
        {owners.map(owner => {
          const ownerLocs = allLocations.filter(l => l.ownerId === owner.id);
          const totalCapacity = ownerLocs.reduce((s, l) => s + l.totalCapacity, 0);
          const ownerOccupied = ownerLocs.reduce((sum, location) => sum + location.totalCapacity - getAvailableCount(location), 0);
          const ownerLocationIds = new Set(ownerLocs.map(location => location.id));
          const ownerBookings = allBookings.filter(booking => ownerLocationIds.has(booking.locationId));
          const ownerPaymentIds = new Set(ownerBookings.map(booking => booking.paymentId).filter(Boolean));
          const ownerRevenue = allPayments.filter(payment => payment.status === 'completed' && (ownerPaymentIds.has(payment.id) || ownerBookings.some(booking => booking.id === payment.referenceId))).reduce((sum, payment) => sum + payment.amount, 0);
          return (
            <div key={owner.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold">{owner.name[0]}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                    <p className="text-sm text-gray-500">{owner.email} · {owner.phone}</p>
                    <StatusBadge status={owner.status} className="mt-1" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-gray-500">Recorded payments · All demo time</div>
                  <div className="text-lg font-bold text-green-700">{formatLKR(ownerRevenue)}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-xl text-sm">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{ownerLocs.length}</p>
                  <p className="text-xs text-gray-500">Locations</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-xl font-bold text-gray-900">{totalCapacity}</p>
                  <p className="text-xs text-gray-500">Total capacity · spaces</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{ownerOccupied} spaces</p>
                  <p className="text-xs text-gray-500">Occupied · demo estimate</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ownerLocs.map(l => <span key={l.id} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{l.name}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
