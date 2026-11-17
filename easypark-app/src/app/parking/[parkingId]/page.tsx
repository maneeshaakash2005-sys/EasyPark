'use client';
import React, { Suspense, use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNav } from '@/components/layout/Navigation';
import { MapView } from '@/components/parking/ParkingCard';
import { QRPreview } from '@/components/qr/QRCode';
import { StatusBadge, Modal } from '@/components/ui';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import { PARKING_IMAGES, PARKING_IMAGE_FALLBACK } from '@/lib/parkingImages';
import { useOwnerLocations } from '@/lib/useOwnerLocations';
import { formatLKR } from '@/lib/utils';
import { MapPin, Clock, Car, Shield, Zap, QrCode, Navigation, ArrowLeft, CheckCircle } from 'lucide-react';

function ParkingDetailContent({ params }: { params: Promise<{ parkingId: string }> }) {
  const { parkingId } = use(params);
  const ownerLocations = useOwnerLocations();
  const loc = DEMO_LOCATIONS.find(l => l.id === parkingId) ?? ownerLocations.find(l => l.id === parkingId);
  const [qrOpen, setQrOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  if (!loc) return (
    <div className="min-h-screen bg-gray-50"><PublicNav /><main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-xl font-semibold text-gray-900">Parking location unavailable</h1><p className="mt-2 text-sm text-gray-500">This location is not present in the current demo records.</p><Link href="/parking" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-cyan-600 px-4 text-sm font-medium text-white">Back to parking</Link></main></div>
  );

  const available = getAvailableCount(loc);
  const occupied = loc.totalCapacity - available;
  const occupancyPercent = loc.totalCapacity > 0 ? occupied / loc.totalCapacity * 100 : 0;
  const isGovt = loc.type === 'government';

  const colorBg = isGovt ? 'bg-blue-600' : 'bg-green-600';
  const colorLight = isGovt ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700';

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/parking" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Parking
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-56 overflow-hidden rounded-2xl">
              {!photoFailed ? <Image src={PARKING_IMAGES[loc.id]?.src ?? PARKING_IMAGE_FALLBACK} alt={PARKING_IMAGES[loc.id]?.alt ?? 'Illustrative parking facility'} fill sizes="(max-width: 1024px) 100vw, 66vw" unoptimized loading="lazy" onError={() => setPhotoFailed(true)} className="object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950"><Car className="h-14 w-14 text-cyan-400/60" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-medium text-white/80">Illustrative photo · Not verified imagery of this location</span>
            </div>

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colorLight}`}>
                      {isGovt ? <Shield className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                      {isGovt ? 'Government Parking' : 'Private Parking'}
                    </span>
                    <StatusBadge status={loc.status} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{loc.name}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{loc.address}, {loc.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatLKR(loc.hourlyRate)}</div>
                  <div className="text-sm text-gray-500">per hour</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{loc.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{loc.totalCapacity}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Spaces</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-xl font-bold text-gray-900">{occupied} spaces</div>
                  <div className="text-xs text-gray-500 mt-0.5">Occupied · derived</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${available === 0 ? 'text-red-600' : available < 5 ? 'text-orange-600' : 'text-green-600'}`}>{available}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Available</div>
                </div>
              </div>

              {/* Availability bar */}
              <div className="mb-6">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${occupancyPercent > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${occupancyPercent}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 occupied</span><span>{loc.totalCapacity} total spaces</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">DEMO DATA · Available = total capacity − occupied sample capacity. Occupancy = occupied / total capacity × 100. Not a live count.</p>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><Clock className="w-4 h-4 text-gray-500" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Operating Hours</p>
                    <p className="text-sm font-medium text-gray-900">{loc.operatingHours.open} – {loc.operatingHours.close}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg mt-0.5"><Zap className="w-4 h-4 text-gray-500" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Facilities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.facilities.map(f => (
                        <span key={f} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
              <MapView locations={[loc]} selectedId={loc.id} height="250px" />
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.coordinatesVerified === false ? `${loc.address}, ${loc.city}, Sri Lanka` : `${loc.lat},${loc.lng}`)}`} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-green-600 hover:underline">
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">{isGovt ? 'Pay & Park' : 'Book a Space'}</h2>

              {isGovt ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
                    <Shield className="w-4 h-4 mb-1" />
                    <strong>Government Parking</strong> — No advance reservation required. Pay on arrival via QR code.
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Rate</span><strong>{formatLKR(loc.hourlyRate)}/hr</strong></div>
                    <div className="flex justify-between"><span>Minimum</span><strong>1 hour</strong></div>
                    <div className="flex justify-between"><span>Payment</span><strong>Mobile Money / Card</strong></div>
                  </div>
                  <Link href={`/scan/${loc.qrToken}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    Scan QR & Pay Now
                  </Link>
                  <button onClick={() => setQrOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded-xl transition-colors">
                    <QrCode className="w-4 h-4" /> View QR Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {available === 0 ? (
                    <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700 border border-red-100">
                      <strong>No spaces available</strong> at this time. Check back later.
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 border border-green-100">
                      <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> <strong>{available} spaces available</strong></div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Rate</span><strong>{formatLKR(loc.hourlyRate)}/hr</strong></div>
                    <div className="flex justify-between"><span>Min booking</span><strong>1 hour</strong></div>
                    <div className="flex justify-between"><span>Payment</span><strong>Card / Mobile Money</strong></div>
                  </div>
                  <Link href={available > 0 ? `/parking/${loc.id}/book` : '#'} className={`block w-full text-center font-medium py-3 rounded-xl transition-colors ${available > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    {available > 0 ? 'Reserve a Space' : 'No Spaces Available'}
                  </Link>
                  <button onClick={() => setQrOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded-xl transition-colors">
                    <QrCode className="w-4 h-4" /> View QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={qrOpen} onClose={() => setQrOpen(false)} title="Parking QR Code">
        <QRPreview token={loc.qrToken} locationName={loc.name} />
      </Modal>
    </div>
  );
}

export default function ParkingDetailPage({ params }: { params: Promise<{ parkingId: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}><ParkingDetailContent params={params} /></Suspense>;
}
