'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_USERS } from '@/lib/mockData';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2 } from 'lucide-react';

const NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

export default function GovernmentCheckersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  const checkers = DEMO_USERS.filter(u => u.role === 'checker');

  return (
    <DashboardLayout nav={NAV} title="Government Admin" accent="blue">
      <PageHeader title="Checker Management" description="Manage parking verification officers." action={
        <button onClick={() => alert('Add Checker: Demo feature — save to localStorage in production.')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Users className="w-4 h-4" /> Add Checker
        </button>
      } />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-50">{['Name', 'Email', 'Phone', 'Assigned Locations', 'Status', 'Last Activity'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {checkers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-700">Kaduwela, Rajagiriya</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">Today, 10:30 AM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
