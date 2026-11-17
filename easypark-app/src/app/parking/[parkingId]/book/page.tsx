'use client';
import React, { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNav } from '@/components/layout/Navigation';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import { useOwnerLocations } from '@/lib/useOwnerLocations';
import { formatLKR, lsSet, generateRef } from '@/lib/utils';
import { MapPin, Clock, Car, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function BookContent({ params }: { params: Promise<{ parkingId: string }> }) {
  const { parkingId } = use(params);
  const { user } = useAuth();
  const ownerLocations = useOwnerLocations();
  const loc = DEMO_LOCATIONS.find(l => l.id === parkingId) ?? ownerLocations.find(l => l.id === parkingId);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [vehicleReg, setVehicleReg] = useState('');
  const [hours, setHours] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!loc || loc.type !== 'private') return (
    <div className="min-h-screen bg-gray-50"><PublicNav /><main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-xl font-semibold text-gray-900">Parking location unavailable</h1><p className="mt-2 text-sm text-gray-500">This private location is not available in the current demo records.</p><Link href="/parking" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-cyan-600 px-4 text-sm font-medium text-white">Back to parking</Link></main></div>
  );

  const available = getAvailableCount(loc);
  const total = loc.hourlyRate * hours;
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + hours * 3600000);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!vehicleReg.trim()) e.vehicleReg = 'Vehicle registration is required';
    if (vehicleReg.trim().length < 4) e.vehicleReg = 'Enter a valid vehicle registration';
    if (available === 0) e.capacity = 'No spaces available at this location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    const bookingRef = generateRef('EP');
    const booking = {
      id: `bk-demo-${globalThis.crypto.randomUUID()}`,
      bookingRef,
      customerId: user?.id ?? 'u1',
      locationId: loc.id,
      vehicleReg: vehicleReg.toUpperCase(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      hours,
      amount: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    lsSet('pending_booking', booking);
    router.push(`/payment/new?booking=${bookingRef}&amount=${total}`);
  };

  const fmt = (d: Date) => d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo' });
  const fmtDate = (d: Date) => d.toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Colombo' });

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href={`/parking/${parkingId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>

        {/* Demo banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800 font-medium text-center">
          DEMO MODE · No real payment or reservation will be processed
        </div>

        {/* Location summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Car className="w-5 h-5 text-green-600" /></div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{loc.name}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3 h-3" /> {loc.address}, {loc.city}</div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-green-600 font-medium">{available} spaces available</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{formatLKR(loc.hourlyRate)}/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <h1 className="text-xl font-bold text-gray-900">Reserve a Parking Space</h1>

          {errors.capacity && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4" /> {errors.capacity}
            </div>
          )}

          {/* Vehicle Reg */}
          <div>
            <label htmlFor="vehicle-registration" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
            <input
              id="vehicle-registration"
              type="text"
              value={vehicleReg}
              onChange={e => setVehicleReg(e.target.value.toUpperCase())}
              placeholder="e.g. CAR-1234, WP-AB-5678"
              className={`w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 uppercase ${errors.vehicleReg ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.vehicleReg && <p className="text-xs text-red-600 mt-1">{errors.vehicleReg}</p>}
            <p className="text-xs text-gray-400 mt-1">Examples: CAR-1234, WP-AB-5678, NB-CD-9012</p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Parking Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${hours === h ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-[11px] text-gray-500">Times shown in Asia/Colombo. Rate and capacity are demo location records.</p>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" /> Check-in</div>
              <div className="font-medium text-gray-900">{fmtDate(startTime)}, {fmt(startTime)}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" /> Check-out</div>
              <div className="font-medium text-gray-900">{fmtDate(endTime)}, {fmt(endTime)}</div>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">Total ({formatLKR(loc.hourlyRate)} × {hours} hrs)</div>
              <div className="text-lg font-bold text-gray-900">{formatLKR(total)}</div>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Continue to Payment
          </button>
          <p className="text-xs text-center text-gray-400">By reserving, you agree to EasyPark&apos;s Terms of Service (Demo)</p>
        </div>
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: Promise<{ parkingId: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}><BookContent params={params} /></Suspense>;
}
