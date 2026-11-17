'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, SearchInput, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_USERS } from '@/lib/mockData';
import { lsGet, lsSet } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, Eye, Edit, UserX } from 'lucide-react';

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

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800', customer: 'bg-green-100 text-green-800', owner: 'bg-blue-100 text-blue-800',
  operator: 'bg-purple-100 text-purple-800', government: 'bg-cyan-100 text-cyan-800', checker: 'bg-orange-100 text-orange-800'
};

export default function AdminUsersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewUser, setViewUser] = useState<any>(null);
  const [suspendedIds, setSuspendedIds] = useState<string[]>(lsGet('suspended_users', []));

  const all = DEMO_USERS;
  const filtered = all
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleSuspend = (id: string) => {
    const updated = suspendedIds.includes(id) ? suspendedIds.filter(x => x !== id) : [...suspendedIds, id];
    setSuspendedIds(updated);
    lsSet('suspended_users', updated);
  };

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="User Management" description={`${all.length} registered users on the platform.`} />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {['all', 'customer', 'owner', 'operator', 'government', 'checker', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${roleFilter === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r}</button>
            ))}
          </div>
          <div className="w-56"><SearchInput value={search} onChange={setSearch} placeholder="Search users..." /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const isSuspended = suspendedIds.includes(u.id);
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">{u.name[0]}</div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={isSuspended ? 'suspended' : u.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewUser(u)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => toggleSuspend(u.id)} className={`p-1.5 rounded transition-colors ${isSuspended ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-500'}`} title={isSuspended ? 'Reinstate' : 'Suspend'}>
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
        {viewUser && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700">{viewUser.name[0]}</div>
              <div><p className="font-semibold text-gray-900">{viewUser.name}</p><p className="text-gray-500 text-xs">{viewUser.email}</p></div>
            </div>
            {[['Role', viewUser.role], ['Phone', viewUser.phone], ['Status', viewUser.status], ['ID', viewUser.id]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium capitalize text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
