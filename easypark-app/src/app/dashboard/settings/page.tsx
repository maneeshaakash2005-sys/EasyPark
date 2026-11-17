'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { lsGet, lsSet } from '@/lib/utils';
import { LayoutDashboard, Car, Clock, CreditCard, Bell, Settings, CheckCircle, RefreshCw } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/dashboard/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [vehicles, setVehicles] = useState<string[]>(lsGet('my_vehicles', ['CAR-1234']));
  const [newVehicle, setNewVehicle] = useState('');
  const [prefs, setPrefs] = useState(lsGet('notif_prefs', { email: true, sms: true, push: false }));
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  const handleSave = () => { setSaved(true); lsSet('profile_form', form); setTimeout(() => setSaved(false), 2000); };
  const addVehicle = () => {
    if (!newVehicle.trim()) return;
    const updated = [...vehicles, newVehicle.toUpperCase()];
    setVehicles(updated);
    lsSet('my_vehicles', updated);
    setNewVehicle('');
  };
  const removeVehicle = (v: string) => {
    const updated = vehicles.filter(x => x !== v);
    setVehicles(updated);
    lsSet('my_vehicles', updated);
  };
  const resetDemo = () => {
    if (!confirm('Reset all demo data? This will clear all localStorage data.')) return;
    Object.keys(localStorage).filter(k => k.startsWith('easypark_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <DashboardLayout nav={NAV} title="Customer Portal" accent="green">
      <PageHeader title="Account Settings" description="Manage your profile and preferences." />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            {[{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' }].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            ))}
            <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
            </button>
            <p className="text-xs text-gray-400">DEMO DATA · Changes are saved locally in this browser only.</p>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Registered Vehicles</h2>
          <div className="space-y-2 mb-4">
            {vehicles.map(v => (
              <div key={v} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm text-gray-900">{v}</span>
                <button onClick={() => removeVehicle(v)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newVehicle} onChange={e => setNewVehicle(e.target.value.toUpperCase())} placeholder="Add vehicle reg..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 uppercase" />
            <button onClick={addVehicle} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Add</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {[{ key: 'email', label: 'Email Notifications', desc: 'Booking confirmations and reminders via email' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Text messages for active sessions and alerts' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications (requires permission)' }
            ].map(p => (
              <label key={p.key} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={prefs[p.key as keyof typeof prefs]} onChange={e => { const u = { ...prefs, [p.key]: e.target.checked }; setPrefs(u); lsSet('notif_prefs', u); }} className="mt-0.5 w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-semibold text-red-900 mb-2">Reset Demo Data</h2>
          <p className="text-sm text-red-700 mb-4">Clear all locally saved demo data and start fresh. This cannot be undone.</p>
          <button onClick={resetDemo} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset Demo Data
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
