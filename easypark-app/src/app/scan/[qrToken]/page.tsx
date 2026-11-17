'use client';
import React, { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNav } from '@/components/layout/Navigation';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import { useOwnerLocations } from '@/lib/useOwnerLocations';
import { formatLKR, lsSet, generateRef } from '@/lib/utils';
import { Shield, QrCode, Car, MapPin, Clock, AlertCircle, CheckCircle, Camera } from 'lucide-react';

function ScanContent({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params);
  const { user } = useAuth();
  const ownerLocations = useOwnerLocations();
  const router = useRouter();
  const locations = [...DEMO_LOCATIONS, ...ownerLocations];
  const loc = locations.find(l => l.qrToken === qrToken);

  const [vehicleReg, setVehicleReg] = useState('');
  const [hours, setHours] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [manualToken, setManualToken] = useState('');
  const [showManual, setShowManual] = useState(!loc);

  const foundLoc = loc || locations.find(l => l.qrToken === manualToken.trim());

  const validate = () => {
    const e: Record<string, string> = {};
    if (!vehicleReg.trim() || vehicleReg.trim().length < 4) e.vehicleReg = 'Enter a valid vehicle registration';
    if (!foundLoc) e.location = 'Invalid QR token. Please try again.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (!validate() || !foundLoc) return;
    const sessionRef = generateRef('GS');
    const start = new Date();
    const end = new Date(start.getTime() + hours * 3600000);
    const session = {
      id: `sess-demo-${globalThis.crypto.randomUUID()}`,
      sessionRef,
      locationId: foundLoc.id,
      customerId: user?.id,
      vehicleReg: vehicleReg.toUpperCase(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      hours,
      amount: foundLoc.hourlyRate * hours,
      status: 'pending',
      createdAt: start.toISOString(),
    };
    lsSet('pending_session', session);
    router.push(`/payment/session?booking=${sessionRef}&amount=${session.amount}&type=session`);
  };

  const simulateScan = () => {
    const firstGovernmentLocation = locations.find(location => location.type === 'government');
    if (firstGovernmentLocation) router.push(`/scan/${firstGovernmentLocation.qrToken}`);
  };

  if (!loc && !showManual) return null;

  const displayLoc = foundLoc;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Government Parking</h1>
          <p className="text-sm text-gray-500 mt-1">Pay & Park — No advance reservation required</p>
        </div>

        {/* QR Scanner simulation */}
        {!loc && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="bg-gray-900 rounded-xl h-48 flex flex-col items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white" />
              </div>
              <Camera className="w-10 h-10 text-white/40 mb-2" />
              <p className="text-white/60 text-sm">Camera scanning area</p>
              <p className="text-white/40 text-xs">(Simulated — no camera access in demo)</p>
            </div>
            <button onClick={simulateScan} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4" /> Simulate QR Scan
            </button>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2 text-center">— or enter QR token manually —</p>
              <div className="flex gap-2">
                <input aria-label="QR token" value={manualToken} onChange={e => setManualToken(e.target.value)} placeholder="e.g. qr-loc3-kaduwela-muni" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => setShowManual(true)} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Go</button>
              </div>
              {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
              <p className="text-xs text-gray-400 mt-2">Try: qr-loc3-kaduwela-muni or qr-loc5-rajagiriya</p>
            </div>
          </div>
        )}

        {/* Location found */}
        {displayLoc && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Shield className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Government Parking</span>
                    {displayLoc.status === 'active' && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">● Open</span>}
                  </div>
                  <h2 className="font-semibold text-gray-900">{displayLoc.name}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3 h-3" /> {displayLoc.address}, {displayLoc.city}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-600">{formatLKR(displayLoc.hourlyRate)}/hr</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600 font-medium">{getAvailableCount(displayLoc)} aggregate spaces available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium text-center">
                DEMO / SIMULATED PAYMENT · No real transaction will be processed
              </div>

              <div>
                <label htmlFor="government-vehicle-registration" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                <input id="government-vehicle-registration" value={vehicleReg} onChange={e => setVehicleReg(e.target.value.toUpperCase())} placeholder="e.g. CAR-1234" className={`w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${errors.vehicleReg ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.vehicleReg && <p className="text-xs text-red-600 mt-1">{errors.vehicleReg}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(h => (
                    <button key={h} onClick={() => setHours(h)} className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${hours === h ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}>
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span><span className="font-medium">{formatLKR(displayLoc.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span><span className="font-medium">{hours} hour{hours > 1 ? 's' : ''}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatLKR(displayLoc.hourlyRate * hours)}</span>
                </div>
              </div>

              <button onClick={handleProceed} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Proceed to Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ScanPage({ params }: { params: Promise<{ qrToken: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}><ScanContent params={params} /></Suspense>;
}
