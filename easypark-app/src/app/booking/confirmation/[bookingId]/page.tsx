'use client';
import React, { Suspense, use } from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/layout/Navigation';
import { DEMO_BOOKINGS, DEMO_LOCATIONS, DEMO_SESSIONS, getLocationById } from '@/lib/mockData';
import { lsGet } from '@/lib/utils';
import { formatLKR, formatDateTime } from '@/lib/utils';
import { CheckCircle, Car, MapPin, Clock, CreditCard, Download, Share2, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui';

function ConfirmationContent({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);

  // Look up booking
  const allBookings = [...DEMO_BOOKINGS, ...lsGet<any[]>('bookings', [])];
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];

  const booking = allBookings.find(b => b.id === bookingId);
  const session = allSessions.find(s => s.id === bookingId);
  const item = booking || session;
  const isSession = !!session && !booking;

  const loc = item ? getLocationById(item.locationId) : null;

  if (!item) return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-6">Your demo booking has been successfully processed.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-xl">View Dashboard</Link>
          <Link href="/parking" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl">Find More Parking</Link>
        </div>
      </div>
    </div>
  );

  const ref = (booking as any)?.bookingRef || (session as any)?.sessionRef || bookingId;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Success header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isSession ? 'Session Active!' : 'Booking Confirmed!'}</h1>
          <p className="text-gray-500 text-sm mt-1">Your reference is: <span className="font-mono font-bold text-gray-900">{ref}</span></p>
        </div>

        {/* Confirmation card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          {/* Green header strip */}
          <div className="bg-green-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs uppercase tracking-wide mb-1">{isSession ? 'Session Reference' : 'Booking Reference'}</p>
                <p className="font-mono text-xl font-bold">{ref}</p>
              </div>
              <StatusBadge status={item.status} className="bg-white/20 text-white border-0" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            {loc && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{loc.name}</p>
                  <p className="text-sm text-gray-500">{loc.address}, {loc.city}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg"><Car className="w-4 h-4 text-gray-500" /></div>
              <div>
                <p className="text-xs text-gray-500">Vehicle Registration</p>
                <p className="font-mono font-medium text-gray-900">{item.vehicleReg}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><Clock className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Start Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(item.startTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><Clock className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">End Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(item.endTime)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-4 h-4 text-gray-500" /></div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{item.hours} hour{item.hours > 1 ? 's' : ''}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><CreditCard className="w-4 h-4 text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900">{formatLKR(item.amount)}</p>
                </div>
              </div>
              <StatusBadge status="paid" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
              DEMO BOOKING · No real payment was processed.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button onClick={() => alert('Print/Download feature coming soon (Demo)')} className="flex items-center justify-center gap-2 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={() => { if (navigator.share) navigator.share({ title: 'EasyPark Booking', text: ref }); else alert('Share: ' + ref); }} className="flex items-center justify-center gap-2 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded-xl transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors">
            View My Bookings
          </Link>
          <Link href="/parking" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
            Find More Parking
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}><ConfirmationContent params={params} /></Suspense>;
}
