'use client';
import React, { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicNav } from '@/components/layout/Navigation';
import { formatLKR, lsGet, lsSet } from '@/lib/utils';
import { getLocationById } from '@/lib/mockData';
import { CreditCard, Smartphone, Building2, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingRef = params.get('booking') ?? '';
  const amount = parseInt(params.get('amount') ?? '0', 10);
  const type = params.get('type') ?? 'booking';

  const pending = lsGet<any>('pending_booking', null) ?? lsGet<any>('pending_session', null);

  const [method, setMethod] = useState<'card' | 'mobile' | 'bank'>('card');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [cardNum, setCardNum] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/27');
  const [cvv, setCvv] = useState('123');
  const [mobile, setMobile] = useState('0771234567');
  const [simulateFail, setSimulateFail] = useState(false);

  const loc = pending?.locationId ? getLocationById(pending.locationId) : null;

  const displayAmount = amount || pending?.amount || 0;
  const displayRef = bookingRef || pending?.bookingRef || pending?.sessionRef || 'DEMO-PAYMENT';
  const hourlyRate = loc?.hourlyRate;
  const duration = Number(pending?.hours ?? 0);

  const handlePay = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    if (simulateFail) { setStep('failed'); return; }

    // Save booking/session
    if (pending) {
      const updated = { ...pending, status: type === 'session' ? 'active' : 'confirmed', paymentId: `pay-demo-${globalThis.crypto.randomUUID()}` };
      const simulatedPayment = {
        id: updated.paymentId,
        amount: displayAmount,
        method,
        status: 'completed',
        referenceId: updated.id,
        referenceType: type === 'session' ? 'session' : 'booking',
        createdAt: new Date().toISOString(),
        gateway: `${method === 'mobile' ? 'Dialog eZ Cash' : method === 'bank' ? 'HNB Bank Transfer' : 'PayHere'} (DEMO)`,
      };
      const savedPayments = lsGet<any[]>('payments', []).filter(payment => payment.id !== simulatedPayment.id);
      lsSet('payments', [...savedPayments, simulatedPayment]);
      if (type === 'session') {
        const sessions = lsGet<any[]>('sessions', []);
        lsSet('sessions', [...sessions, updated]);
        lsSet('pending_session', null);
      } else {
        const bookings = lsGet<any[]>('bookings', []);
        lsSet('bookings', [...bookings, updated]);
        lsSet('pending_booking', null);
      }
      const id = updated.id;
      setStep('success');
      setTimeout(() => router.push(`/booking/confirmation/${id}`), 1500);
    } else {
      setStep('success');
      setTimeout(() => router.push('/booking/confirmation/demo'), 1500);
    }
  };

  if (step === 'processing') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
        <p className="text-gray-500 text-sm">Please wait. Do not close this page.</p>
        <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-4 py-2 rounded-lg inline-block">DEMO / SIMULATED PAYMENT · No real transaction</p>
      </div>
    </div>
  );

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 text-sm">Redirecting to confirmation...</p>
      </div>
    </div>
  );

  if (step === 'failed') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-500 text-sm mb-6">Your simulated payment was declined. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setStep('form'); setSimulateFail(false); }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Try Again</button>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Go Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800 font-medium text-center">
          DEMO / SIMULATED PAYMENT · No real transaction will be processed
        </div>

        <div className="grid gap-4">
          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            {loc && <div className="mb-3 rounded-xl bg-gray-50 p-3"><p className="font-medium text-gray-900">{loc.name}</p><p className="text-xs text-gray-500">{loc.address}, {loc.city} · {loc.type === 'government' ? 'Government parking' : 'Private parking'}</p></div>}
            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Reference</span>
              <span className="font-mono text-sm text-gray-900">{displayRef}</span>
            </div>
            {pending?.hours && (
              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium">{pending.hours} hour{pending.hours > 1 ? 's' : ''}</span>
              </div>
            )}
            {pending?.vehicleReg && (
              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Vehicle registration</span>
                <span className="font-mono text-sm font-medium text-gray-900">{pending.vehicleReg}</span>
              </div>
            )}
            {hourlyRate !== undefined && duration > 0 && (
              <>
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Parking ({duration} hour{duration === 1 ? '' : 's'} × {formatLKR(hourlyRate)} / hour)</span>
                  <span className="text-sm font-medium text-gray-900">{formatLKR(hourlyRate * duration)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 py-2 text-xs text-gray-500">
                  <span>Price calculation</span><span>{formatLKR(hourlyRate)} × {duration} hours · No additional fees in this demo</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Payment status</span>
              <span className="text-xs font-semibold text-amber-500">SIMULATION · Awaiting demo action</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-gray-900">{formatLKR(displayAmount)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
                { id: 'mobile', label: 'eZ Cash', icon: <Smartphone className="w-5 h-5" /> },
                { id: 'bank', label: 'Bank', icon: <Building2 className="w-5 h-5" /> },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id as any)} className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl text-sm font-medium transition-all ${method === m.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry (MM/YY)</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                    <input value={cvv} onChange={e => setCvv(e.target.value)} type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>
            )}
            {method === 'mobile' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Number (Dialog eZ Cash)</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-xs text-gray-400 mt-1">You will receive an OTP on this number (Demo)</p>
              </div>
            )}
            {method === 'bank' && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                <p><strong>Bank:</strong> HNB Sri Lanka</p>
                <p><strong>Account:</strong> 002-1234-5678-901</p>
                <p><strong>Reference:</strong> {displayRef}</p>
                <p className="text-xs text-gray-400 mt-2">Transfer {formatLKR(displayAmount)} to the above account (Demo)</p>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <input type="checkbox" id="sim-fail" checked={simulateFail} onChange={e => setSimulateFail(e.target.checked)} className="rounded" />
              <label htmlFor="sim-fail" className="text-xs text-gray-500">Simulate payment failure (for demo)</label>
            </div>

            <button onClick={handlePay} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Pay {formatLKR(displayAmount)} (Demo)
            </button>
            <p className="text-xs text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> This is a simulated demo payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ paymentId: string }> }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>}><PaymentContent /></Suspense>;
}
