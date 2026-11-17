'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_GOVT_ORGS, DEMO_LOCATIONS } from '@/lib/mockData';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database } from 'lucide-react';

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

export default function AdminGovernmentPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const govtLocs = DEMO_LOCATIONS.filter(l => l.type === 'government');

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Government Organizations" description="Registered government bodies managing parking facilities." action={
        <button onClick={() => alert('Add Government Org: Demo feature only')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Shield className="w-4 h-4" /> Add Organisation
        </button>
      } />

      <div className="grid gap-4">
        {DEMO_GOVT_ORGS.map(org => {
          const orgLocs = govtLocs.filter(l => org.locationIds.includes(l.id));
          return (
            <div key={org.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-blue-600" /></div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <StatusBadge status={org.status} />
                  </div>
                  <p className="text-sm text-gray-500 ml-10">Code: <strong>{org.code}</strong> · {orgLocs.length} location(s) · {org.checkerIds.length} checker(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{orgLocs.length}</p>
                  <p className="text-xs text-gray-500">locations</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 ml-10">
                <div>
                  <p className="text-xs text-gray-500">Organisation Code</p>
                  <p className="text-sm font-medium font-mono">{org.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Checkers Assigned</p>
                  <p className="text-sm font-medium">{org.checkerIds.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Locations</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {orgLocs.map(l => <span key={l.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{l.city}</span>)}
                    {orgLocs.length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
