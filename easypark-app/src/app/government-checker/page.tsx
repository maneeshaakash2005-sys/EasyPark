'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatCard, PageHeader, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, DEMO_FINES, getLocationById } from '@/lib/mockData';
import { lsGet, formatLKR, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, Search, AlertTriangle, History, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react';

const NAV = [
  { href: '/government-checker', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government-checker/verify', label: 'Verify Vehicle', icon: <Search className="w-4 h-4" /> },
  { href: '/government-checker/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
  { href: '/government-checker/fines', label: 'Issue Fine', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government-checker/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function CheckerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const now = useDemoClock();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  const [reg, setReg] = useState('');
  const [result, setResult] = useState<{ session?: any; status: 'valid' | 'expired' | 'not_found' } | null>(null);

  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];
  const activeSessions = allSessions.filter(s => s.status === 'active');
  const myFines = [...DEMO_FINES.filter(fine => fine.checkerId === user?.id), ...lsGet<any[]>('checker_fines', [])];
  if (!user) return null;

  const verify = () => {
    if (!reg.trim()) return;
    const session = allSessions.find(s => s.vehicleReg.toUpperCase() === reg.toUpperCase());
    if (!session) { setResult({ status: 'not_found' }); return; }
    setResult({ session, status: session.status === 'active' ? 'valid' : 'expired' });
  };

  return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <PageHeader title={`Checker Dashboard`} description={`On duty: ${user.name} · Western Province`} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Sessions" value={activeSessions.length} icon={<Shield className="w-5 h-5 text-blue-600" />} source="Demo and browser-stored parking sessions." formula="Count of session records with active status." />
        <StatCard label="Recorded Fines" value={myFines.length} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} source="Demo fines assigned to this checker plus browser-stored fines." formula="Count of matching fine records; no daily period is implied." />
        <StatCard label="Expired Sessions" value={allSessions.filter(session => session.status === 'expired').length} icon={<Search className="w-5 h-5 text-green-600" />} source="Demo and browser-stored parking sessions." formula="Count of session records with expired status." />
      </div>

      {/* Quick verify */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Vehicle Verification</h2>
        <div className="flex gap-2 mb-4">
          <input value={reg} onChange={e => setReg(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && verify()} placeholder="Enter vehicle reg (e.g. CAR-1234)" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={verify} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"><Search className="w-4 h-4" /> Verify</button>
        </div>

        {result && (
          <div className={`p-4 rounded-xl border-2 ${result.status === 'valid' ? 'bg-green-50 border-green-300' : result.status === 'expired' ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.status === 'valid' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
              <span className={`font-semibold ${result.status === 'valid' ? 'text-green-700' : 'text-red-700'}`}>
                {result.status === 'valid' ? 'Valid session found' : result.status === 'expired' ? 'Expired session' : 'No session found'}
              </span>
            </div>
            {result.session && (
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div><p className="text-xs text-gray-500">Session Ref</p><p className="font-mono font-medium">{result.session.sessionRef}</p></div>
                <div><p className="text-xs text-gray-500">Location</p><p>{getLocationById(result.session.locationId)?.name}</p></div>
                <div><p className="text-xs text-gray-500">Valid Until</p><p>{formatDateTime(result.session.endTime)}</p></div>
                <div><p className="text-xs text-gray-500">{result.status === 'valid' ? 'Time Remaining' : 'Expired'}</p><p className={result.status === 'expired' ? 'text-red-600' : 'text-green-600'}>{getTimeUntil(result.session.endTime, now)}</p></div>
              </div>
            )}
            {result.status === 'not_found' && (
              <div className="mt-2">
                <p className="text-sm text-red-700">No parking session found for <strong className="font-mono">{reg}</strong>.</p>
                <Link href={`/government-checker/fines?vehicle=${reg}`} className="mt-2 inline-block text-sm text-red-600 font-medium hover:underline">Issue a fine →</Link>
              </div>
            )}
            {result.status === 'expired' && (
              <Link href={`/government-checker/fines?vehicle=${reg}`} className="mt-2 inline-block text-sm text-orange-700 font-medium hover:underline">Issue a fine for expired session →</Link>
            )}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Active Sessions Nearby</h2>
          <Link href="/government-checker/sessions" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Vehicle', 'Session Ref', 'Location', 'Until', 'Time Left'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {activeSessions.slice(0, 5).map(s => {
                const loc = getLocationById(s.locationId);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{s.vehicleReg}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.sessionRef}</td>
                    <td className="px-4 py-3 text-gray-700">{loc?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(s.endTime)}</td>
                    <td className="px-4 py-3 text-xs font-medium text-green-600">{getTimeUntil(s.endTime, now)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
