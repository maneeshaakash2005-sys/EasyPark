'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { lsGet, lsSet } from '@/lib/utils';
import { LayoutDashboard, Users, MapPin, Car, CreditCard, AlertTriangle, FileText, Settings, Shield, Database, CheckCircle, RefreshCw } from 'lucide-react';

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

export default function AdminSettingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(lsGet('platform_settings', {
    platformName: 'EasyPark', supportEmail: 'admin@easypark.lk', maxBookingHours: 8,
    defaultFineAmount: 2000, maintenanceMode: false, registrationOpen: true,
  }));

  const save = () => {
    lsSet('platform_settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = () => {
    if (!confirm('Reset ALL platform demo data? This cannot be undone.')) return;
    Object.keys(localStorage).filter(k => k.startsWith('easypark_') || ['pending_booking','pending_session','owner_locations','bookings','sessions','checker_fines'].includes(k)).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <DashboardLayout nav={NAV} title="Super Admin" accent="indigo">
      <PageHeader title="Platform Settings" description="Global EasyPark configuration." />
      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">General Settings</h2>
          {[
            { key: 'platformName', label: 'Platform Name', type: 'text' },
            { key: 'supportEmail', label: 'Support Email', type: 'email' },
            { key: 'maxBookingHours', label: 'Max Booking Duration (hours)', type: 'number' },
            { key: 'defaultFineAmount', label: 'Default Fine Amount (LKR)', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={(settings as any)[f.key]} onChange={e => setSettings((p: any) => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}

          <div className="space-y-3">
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to public users' },
              { key: 'registrationOpen', label: 'Open Registration', desc: 'Allow new users to register' },
            ].map(s => (
              <label key={s.key} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={(settings as any)[s.key]} onChange={e => setSettings((p: any) => ({ ...p, [s.key]: e.target.checked }))} className="mt-0.5 w-4 h-4 text-indigo-600 rounded" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button onClick={save} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            {saved ? <><CheckCircle className="w-4 h-4" /> Settings Saved!</> : 'Save Settings'}
          </button>
          <p className="text-xs text-gray-400">DEMO DATA · Settings are saved locally in this browser only.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-semibold text-red-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-700 mb-4">Reset all demo data including bookings, sessions, fines, and locally stored settings. This cannot be undone.</p>
          <button onClick={resetAll} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset All Demo Data
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
