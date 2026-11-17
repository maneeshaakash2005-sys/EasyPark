'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, StatCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, getAvailableCount, getStoredOwnerLocations } from '@/lib/mockData';
import { formatLKR } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, Building2 } from 'lucide-react';

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

export default function AdminParkingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const locations = [...DEMO_LOCATIONS, ...getStoredOwnerLocations()];
  const privateLocs = locations.filter(l => l.type === 'private');
  const govtLocs = locations.filter(l => l.type === 'government');
  const totalCapacity = locations.reduce((s, l) => s + l.totalCapacity, 0);
  const totalAvailable = locations.reduce((sum, location) => sum + getAvailableCount(location), 0);
  const totalBooked = totalCapacity - totalAvailable;

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Parking Locations" description="All registered parking facilities platform-wide." />
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Total Locations" value={locations.length} icon={<MapPin className="w-5 h-5 text-green-600" />} source="Seeded demo locations plus browser-saved owner locations." formula="Count of location records." />
        <StatCard label="Private" value={privateLocs.length} icon={<Building2 className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Government" value={govtLocs.length} icon={<Shield className="w-5 h-5 text-cyan-600" />} />
        <StatCard label="Sample occupancy" value={`${Math.round((totalBooked/totalCapacity)*100)}%`} icon={<Car className="w-5 h-5 text-purple-600" />} source="Aggregate capacity fields from DEMO_LOCATIONS and browser-stored paid activity." formula="Occupied spaces / total capacity × 100; occupied = total capacity − aggregate availability." period="Current demo state; not live occupancy" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Name', 'City', 'Type', 'Owner', 'Capacity · spaces', 'Occupied · spaces', 'Rate · LKR/hour', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {locations.map(loc => {
                const available = getAvailableCount(loc);
                const occupied = loc.totalCapacity - available;
                return <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{loc.name}</p>
                    <p className="text-xs text-gray-400">{loc.address}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{loc.city}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${loc.type === 'government' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{loc.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{loc.ownerId ?? '—'}</td>
                  <td className="px-4 py-3">{loc.totalCapacity}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span>{occupied}</span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${loc.totalCapacity ? occupied/loc.totalCapacity*100 : 0}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatLKR(loc.hourlyRate)}/hr</td>
                  <td className="px-4 py-3"><StatusBadge status={loc.status} /></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
