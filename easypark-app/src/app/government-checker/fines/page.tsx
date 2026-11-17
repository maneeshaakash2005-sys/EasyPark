'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, getLocationById } from '@/lib/mockData';
import { lsGet, lsSet, generateRef, formatLKR, formatDate } from '@/lib/utils';
import { LayoutDashboard, Search, AlertTriangle, History, Shield, CheckCircle } from 'lucide-react';

const NAV = [
  { href: '/government-checker', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government-checker/verify', label: 'Verify Vehicle', icon: <Search className="w-4 h-4" /> },
  { href: '/government-checker/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
  { href: '/government-checker/fines', label: 'Issue Fine', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government-checker/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

const FINE_REASONS = [
  'Expired parking session',
  'No valid parking session found',
  'Overstay — exceeded booked duration',
  'Parked in disabled bay without permit',
  'Parked in restricted zone',
  'Obstructing traffic',
  'Invalid vehicle registration displayed',
];

const FINE_AMOUNTS: Record<string, number> = {
  'Expired parking session': 1500,
  'No valid parking session found': 2500,
  'Overstay — exceeded booked duration': 2000,
  'Parked in disabled bay without permit': 5000,
  'Parked in restricted zone': 3000,
  'Obstructing traffic': 4000,
  'Invalid vehicle registration displayed': 3500,
};

function FinesContent() {
  const params = useSearchParams();
  const initVehicle = params.get('vehicle') ?? '';
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [form, setForm] = useState({ vehicleReg: initVehicle, locationId: 'loc3', reason: FINE_REASONS[0], notes: '' });
  const [amount, setAmount] = useState(FINE_AMOUNTS[FINE_REASONS[0]]);
  const [issued, setIssued] = useState<string | null>(null);
  const govtLocs = DEMO_LOCATIONS.filter(l => l.type === 'government');

  const handleReasonChange = (reason: string) => {
    setForm(p => ({ ...p, reason }));
    setAmount(FINE_AMOUNTS[reason] ?? 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fine = {
      id: `fine-new-${Date.now()}`,
      fineRef: generateRef('FN'),
      vehicleReg: form.vehicleReg.toUpperCase(),
      locationId: form.locationId,
      reason: form.reason,
      notes: form.notes,
      amount,
      status: 'pending',
      checkerId: 'u5',
      issuedAt: new Date().toISOString(),
    };
    const existing = lsGet<any[]>('checker_fines', []);
    lsSet('checker_fines', [...existing, fine]);
    setIssued(fine.fineRef);
  };

  if (issued) return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-7 h-7 text-green-600" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Fine Issued</h2>
        <p className="text-gray-500 mb-2">Fine reference: <span className="font-mono font-bold text-gray-900">{issued}</span></p>
        <p className="text-sm text-gray-400 mb-6">Penalty of {formatLKR(amount)} has been recorded.</p>
        <div className="flex gap-3">
          <button onClick={() => { setIssued(null); setForm({ vehicleReg: '', locationId: 'loc3', reason: FINE_REASONS[0], notes: '' }); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Issue Another Fine</button>
          <button onClick={() => router.push('/government-checker')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Back to Dashboard</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <PageHeader title="Issue a Fine" description="Record a parking violation for a vehicle." />
      <div className="max-w-xl">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-sm text-orange-800 font-medium">
          DEMO MODE · Fines are saved locally only. No real enforcement.
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
            <input required value={form.vehicleReg} onChange={e => setForm(p => ({ ...p, vehicleReg: e.target.value.toUpperCase() }))} placeholder="e.g. CAR-1234" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <select required value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {govtLocs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Violation Reason *</label>
            <select required value={form.reason} onChange={e => handleReasonChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {FINE_REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center">
            <span className="text-sm font-semibold text-red-900">Fine Amount</span>
            <span className="text-xl font-bold text-red-700">{formatLKR(amount)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any additional observations..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Issue Fine
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function CheckerFinesPage() {
  return <Suspense fallback={null}><FinesContent /></Suspense>;
}
