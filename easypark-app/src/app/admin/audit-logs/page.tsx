'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_AUDIT_LOGS } from '@/lib/mockData';
import { formatDateTime } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, User, MapPin as LocIcon } from 'lucide-react';

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

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-purple-100 text-purple-800',
  logout: 'bg-gray-100 text-gray-700',
  approve: 'bg-indigo-100 text-indigo-800',
  reject: 'bg-orange-100 text-orange-800',
};

export default function AdminAuditLogsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Audit Logs" description="Complete platform activity and change history." />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500"><strong className="text-gray-900">{DEMO_AUDIT_LOGS.length}</strong> log entries</p>
          <button onClick={() => alert('Log export is a demo feature.')} className="text-xs text-indigo-600 hover:underline">Export Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_AUDIT_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{log.userId[0].toUpperCase()}</div>
                      <span className="text-xs text-gray-700">{log.userId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.resource}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-48 truncate">{log.details}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
