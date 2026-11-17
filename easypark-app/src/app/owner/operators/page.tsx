'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_OPERATORS } from '@/lib/mockData';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings } from 'lucide-react';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function OwnerOperatorsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader title="Operator Management" description="Manage operators assigned to your parking locations." />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Name', 'Email', 'Phone', 'Locations', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_OPERATORS.map(op => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{op.name}</td>
                  <td className="px-4 py-3 text-gray-600">{op.email}</td>
                  <td className="px-4 py-3 text-gray-600">{op.phone}</td>
                  <td className="px-4 py-3 text-gray-700">{op.locationIds.length} location(s)</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${op.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{op.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
