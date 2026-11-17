'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CarFront, Clock3, MapPin, Navigation, ParkingCircle, Shield } from 'lucide-react';
import type { ParkingLocation } from '@/lib/types';
import { formatLKR } from '@/lib/utils';
import { getAvailableCount } from '@/lib/mockData';
import { PARKING_IMAGES, PARKING_IMAGE_FALLBACK } from '@/lib/parkingImages';
import { StatusBadge } from '@/components/ui';

interface ParkingCardProps {
  location: ParkingLocation;
  onSelect?: (loc: ParkingLocation) => void;
  selected?: boolean;
}

export function ParkingCard({ location, onSelect, selected }: ParkingCardProps) {
  const available = getAvailableCount(location);
  const [imageSrc, setImageSrc] = useState(PARKING_IMAGES[location.id]?.src ?? PARKING_IMAGE_FALLBACK);
  const [imageFailed, setImageFailed] = useState(false);
  const isGovt = location.type === 'government';
  const image = PARKING_IMAGES[location.id];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${location.address}, ${location.city}, Sri Lanka`)}`;
  const selectOnKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(location);
    }
  };

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-gray-900 transition-all duration-200 ${selected ? 'border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/30' : 'border-gray-100 hover:border-gray-400/60 hover:shadow-xl hover:shadow-black/20'}`}
      onClick={() => onSelect?.(location)}
      onKeyDown={selectOnKeyboard}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
    >
      <div className="relative h-36 overflow-hidden sm:h-40">
        {!imageFailed ? (
          <Image
            src={imageSrc}
            alt={image?.alt ?? 'Illustrative parking facility'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            unoptimized
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => {
              if (imageSrc !== PARKING_IMAGE_FALLBACK) setImageSrc(PARKING_IMAGE_FALLBACK);
              else setImageFailed(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <CarFront className="h-12 w-12 text-cyan-400/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md ${isGovt ? 'bg-blue-600/90' : 'bg-slate-900/80'}`}>
            {isGovt ? <Shield className="h-3.5 w-3.5" /> : <ParkingCircle className="h-3.5 w-3.5" />}
            {isGovt ? 'Government' : 'Private'}
          </span>
          {typeof location.distance === 'number' && <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">{location.distance < 1 ? `${Math.round(location.distance * 1000)} m` : `${location.distance.toFixed(1)} km`}</span>}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/65">Illustrative parking image</p>
            <h2 className="line-clamp-1 text-base font-semibold text-white sm:text-lg">{location.name}</h2>
          </div>
          <StatusBadge status={available === 0 ? 'Full' : available < 5 ? 'Low availability' : 'Available'} className="shrink-0 border border-white/10 bg-black/55 text-white" />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <span className="min-w-0">{location.address}, {location.city}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Hourly rate</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-gray-900">{formatLKR(location.hourlyRate)}<span className="ml-1 text-xs font-normal text-gray-500">/ hour</span></p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Aggregate availability</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold tracking-tight text-gray-900"><CarFront className="h-4 w-4 text-cyan-400" />{available}<span className="text-xs font-normal text-gray-500">spaces</span></p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{location.operatingHours.open}–{location.operatingHours.close} local time</span>
          {typeof location.distance !== 'number' && <span>{location.coordinatesVerified === false ? 'Map coordinates unavailable' : 'Distance unavailable'}</span>}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-500">Capacity and rate are demo location records. Photos are illustrative and are not verified images of this facility.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={event => event.stopPropagation()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-100 px-3 text-sm font-medium text-gray-700 transition hover:border-cyan-500/50 hover:text-cyan-300"
          >
            <Navigation className="h-4 w-4" /> Directions
          </a>
          {isGovt ? (
            <Link href={`/scan/${location.qrToken}`} onClick={event => event.stopPropagation()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              Pay & Park <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href={`/parking/${location.id}`} onClick={event => event.stopPropagation()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 text-sm font-semibold text-white transition hover:bg-cyan-500">
              View details <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  if (total <= 0) return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">Capacity unavailable</span>;
  if (available <= 0) return <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">Full</span>;
  if (available < 5) return <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Limited availability · {available} spaces</span>;
  return <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">{available} spaces available</span>;
}

interface MapViewProps {
  locations: ParkingLocation[];
  selectedId?: string;
  onSelect?: (loc: ParkingLocation) => void;
  height?: string;
  className?: string;
}

const MAP_BOUNDS = { minLat: 6.86, maxLat: 6.95, minLng: 79.83, maxLng: 80.00 };

function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x, y };
}

export function MapView({ locations, selectedId, onSelect, height = '400px', className = '' }: MapViewProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-[#111820] ${className}`} style={{ height }} role="region" aria-label="Parking locations map">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="map-grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M 56 0 L 0 0 0 56" fill="none" stroke="#26313d" strokeWidth="1" /></pattern>
          <linearGradient id="map-glow" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#00b8f0" stopOpacity=".08" /><stop offset="1" stopColor="#168bff" stopOpacity=".02" /></linearGradient>
        </defs>
        <rect width="800" height="500" fill="#111820" />
        <rect width="800" height="500" fill="url(#map-grid)" />
        <rect width="800" height="500" fill="url(#map-glow)" />
        <g fill="none" strokeLinecap="round">
          <path d="M-30 350 C160 280 250 430 440 330 S670 210 840 265" stroke="#293744" strokeWidth="13" />
          <path d="M-30 350 C160 280 250 430 440 330 S670 210 840 265" stroke="#43515e" strokeWidth="2" />
          <path d="M120 -20 C180 120 350 140 360 260 S290 390 340 520" stroke="#273542" strokeWidth="10" />
          <path d="M120 -20 C180 120 350 140 360 260 S290 390 340 520" stroke="#3b4a57" strokeWidth="2" />
          <path d="M530 -10 C490 120 600 180 560 270 S620 410 700 520" stroke="#273542" strokeWidth="9" />
          <path d="M530 -10 C490 120 600 180 560 270 S620 410 700 520" stroke="#3b4a57" strokeWidth="2" />
        </g>
      </svg>
      <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-[#080a0d]/80 px-3 py-2 text-xs font-medium text-gray-300 backdrop-blur-md">
        <span className="block text-gray-500">DEMO MAP · Sri Lanka</span>Western Province
      </div>
      {locations.some(location => location.coordinatesVerified === false) && <div className="absolute right-3 top-3 max-w-48 rounded-lg border border-amber-300/20 bg-[#080a0d]/85 px-2.5 py-2 text-[10px] leading-relaxed text-amber-200">Some locations have no verified coordinates and are not pinned.</div>}
      {locations.filter(location => location.coordinatesVerified !== false).map(loc => {
        const { x, y } = latLngToPercent(loc.lat, loc.lng);
        const available = getAvailableCount(loc);
        const isSelected = selectedId === loc.id;
        const isGovt = loc.type === 'government';
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect?.(loc)}
            aria-label={`${loc.name}, ${available} aggregate spaces available`}
            aria-pressed={isSelected}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-transform hover:scale-110 focus-visible:z-20"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-1 text-xs font-bold text-white shadow-lg ${isSelected ? 'scale-110 border-white bg-cyan-500 ring-4 ring-cyan-400/30' : isGovt ? 'border-blue-300 bg-blue-600' : available === 0 ? 'border-red-300 bg-red-600' : 'border-cyan-200 bg-cyan-600'}`}>
              <ParkingCircle className="h-4 w-4" />
            </span>
            {isSelected && <span className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-xl border border-gray-100 bg-gray-900 p-3 text-left shadow-2xl">
              <span className="block text-xs font-semibold text-gray-900">{loc.name}</span>
              <span className="mt-1 block text-xs text-cyan-300">{formatLKR(loc.hourlyRate)} / hour</span>
              <span className="mt-1 block text-xs text-gray-500">{available} aggregate spaces available</span>
            </span>}
          </button>
        );
      })}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-lg border border-white/10 bg-[#080a0d]/85 px-3 py-2 text-[11px] text-gray-300 backdrop-blur-md">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />Private</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Government</span>
      </div>
    </div>
  );
}
