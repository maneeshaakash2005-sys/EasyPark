'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { lsGet, lsSet } from '@/lib/utils';
import { notifyOwnerLocationsChanged } from '@/lib/useOwnerLocations';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings, CheckCircle } from 'lucide-react';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const FACILITIES_OPTIONS = ['CCTV', 'Covered', 'EV Charging', 'Valet', 'Motorcycle Parking', 'Security', 'Open Air', '24/7 Access'];

export default function NewLocationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [form, setForm] = useState({ name: '', address: '', city: 'Malabe', totalCapacity: 50, hourlyRate: 100, openHour: '07:00', closeHour: '21:00', description: '' });
  const [facilities, setFacilities] = useState<string[]>(['CCTV']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Required';
    if (!form.address) e.address = 'Required';
    if (!form.description) e.description = 'Required';
    if (form.totalCapacity < 1) e.totalCapacity = 'Must be at least 1';
    if (form.hourlyRate < 1) e.hourlyRate = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const newLoc = {
      id: `loc-new-${Date.now()}`,
      ...form,
      type: 'private',
      bookedCount: 0,
      facilities,
      photos: [],
      ownerId: user?.id,
      qrToken: `qr-new-${Date.now()}`,
      status: 'active',
      operatingHours: { open: form.openHour, close: form.closeHour },
      lat: 0,
      lng: 0,
      coordinatesVerified: false,
    };
    const existing = lsGet<any[]>('owner_locations', []);
    lsSet('owner_locations', [...existing, newLoc]);
    notifyOwnerLocationsChanged();
    setSaved(true);
    setTimeout(() => router.push('/owner/locations'), 1500);
  };

  if (saved) return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-7 h-7 text-green-600" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Location Added!</h2>
        <p className="text-gray-500 text-sm">Redirecting to locations list...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader title="Add Parking Location" description="Register a new private parking facility." />
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          {[{ key: 'name', label: 'Location Name', type: 'text', placeholder: 'e.g. Main Street Parking' },
            { key: 'address', label: 'Street Address', type: 'text', placeholder: 'e.g. 45 Main Street' }].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[f.key] ? 'border-red-300' : 'border-gray-200'}`} />
              {errors[f.key] && <p className="text-xs text-red-600 mt-1">{errors[f.key]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {['Malabe', 'Kaduwela', 'Battaramulla', 'Rajagiriya', 'Colombo', 'Nawala', 'Nugegoda', 'Dehiwala'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
              <input type="number" value={form.totalCapacity} onChange={e => setForm(p => ({ ...p, totalCapacity: +e.target.value }))} min={1} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.totalCapacity ? 'border-red-300' : 'border-gray-200'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (LKR)</label>
              <input type="number" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: +e.target.value }))} min={1} className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.hourlyRate ? 'border-red-300' : 'border-gray-200'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input type="time" value={form.openHour} onChange={e => setForm(p => ({ ...p, openHour: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input type="time" value={form.closeHour} onChange={e => setForm(p => ({ ...p, closeHour: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
            <div className="grid grid-cols-2 gap-2">
              {FACILITIES_OPTIONS.map(f => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={facilities.includes(f)} onChange={e => setFacilities(prev => e.target.checked ? [...prev, f] : prev.filter(x => x !== f))} className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm text-gray-700">{f}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the parking facility..." className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`} />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors">Add Location</button>
            <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
