'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, DEMO_LOCATIONS, getLocationById } from '@/lib/mockData';
import { lsGet, lsSet, generateRef, formatLKR, formatDate, formatDateTime, getTimeUntil } from '@/lib/utils';
import { useDemoClock } from '@/lib/useDemoClock';
import { LayoutDashboard, Search, AlertTriangle, History, Shield, CheckCircle, XCircle, Camera } from 'lucide-react';

const NAV = [
  { href: '/government-checker', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government-checker/verify', label: 'Verify Vehicle', icon: <Search className="w-4 h-4" /> },
  { href: '/government-checker/sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
  { href: '/government-checker/fines', label: 'Issue Fine', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government-checker/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

function VerifyContent() {
  const params = useSearchParams();
  const now = useDemoClock();
  const initReg = params.get('vehicle') ?? '';
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [reg, setReg] = useState(initReg);
  const [result, setResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];

  const verify = async () => {
    if (!reg.trim()) return;
    setVerifying(true);
    await new Promise(r => setTimeout(r, 600));
    const session = allSessions.find(s => s.vehicleReg.toUpperCase() === reg.trim().toUpperCase());
    if (!session) { setResult({ type: 'not_found', reg: reg.trim() }); setVerifying(false); return; }
    const loc = getLocationById(session.locationId);
    setResult({ type: session.status === 'active' ? 'valid' : 'expired', session, loc });
    setVerifying(false);
  };

  useEffect(() => { if (initReg) verify(); }, []);

  return (
    <DashboardLayout nav={NAV} title="Checker Portal" accent="blue">
      <PageHeader title="Vehicle Verification" description="Scan QR or enter vehicle registration to verify parking session." />

      {/* Scan area */}
      <div className="max-w-xl space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="bg-gray-900 rounded-xl h-40 flex flex-col items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-white/40 mb-2" />
            <p className="text-white/60 text-sm">Camera scan not available in demo</p>
          </div>
          <div className="flex gap-2">
            <input value={reg} onChange={e => setReg(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && verify()} placeholder="Enter vehicle registration..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={verify} disabled={verifying} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 transition-colors">
              {verifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />} Verify
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Try: CAR-1234, BUS-9087, VAN-6753</p>
        </div>

        {result && (
          <div className={`bg-white rounded-xl border-2 p-6 ${result.type === 'valid' ? 'border-green-400' : result.type === 'expired' ? 'border-orange-400' : 'border-red-400'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.type === 'valid' ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-500" />}
              <div>
                <h3 className={`font-bold text-lg ${result.type === 'valid' ? 'text-green-700' : 'text-red-700'}`}>
                  {result.type === 'valid' ? 'VALID — Paid session' : result.type === 'expired' ? 'EXPIRED session' : 'NO SESSION FOUND'}
                </h3>
                <p className="text-sm text-gray-500">Vehicle: <span className="font-mono font-semibold">{result.session?.vehicleReg ?? result.reg}</span></p>
              </div>
            </div>
            {result.session && (
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-xl p-4">
                {[
                  ['Session Ref', result.session.sessionRef],
                  ['Location', result.loc?.name ?? '—'],
                  ['Booked Until', formatDateTime(result.session.endTime)],
                  [result.type === 'valid' ? 'Remaining' : 'Expired', getTimeUntil(result.session.endTime, now)],
                  ['Amount Paid', formatLKR(result.session.amount)],
                  ['Duration', `${result.session.hours}h`],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-xs text-gray-500">{k}</p><p className={`font-medium mt-0.5 ${k === 'Remaining' && result.type === 'expired' ? 'text-red-600' : k === 'Remaining' ? 'text-green-600' : 'text-gray-900'}`}>{v}</p></div>
                ))}
              </div>
            )}
            {(result.type === 'not_found' || result.type === 'expired') && (
              <button onClick={() => router.push(`/government-checker/fines?vehicle=${result.session?.vehicleReg ?? result.reg}`)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Issue a Fine
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={null}><VerifyContent /></Suspense>;
}
