'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownUp, CarFront, Check, Clock3, MapPin, Navigation, Search, ShieldCheck, X } from 'lucide-react';
import { PublicNav } from '@/components/layout/Navigation';
import { ParkingCard, MapView } from '@/components/parking/ParkingCard';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import type { ParkingLocation } from '@/lib/types';
import { useOwnerLocations } from '@/lib/useOwnerLocations';

type SortBy = 'distance' | 'price' | 'availability';
type FilterType = 'all' | 'private' | 'government';

function distanceKm(from: GeolocationCoordinates, to: ParkingLocation) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusKm = 6371;
  const latDelta = radians(to.lat - from.latitude);
  const lngDelta = radians(to.lng - from.longitude);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.lat)) * Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('availability');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'list' | 'map'>('split');
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const ownerLocations = useOwnerLocations();
  const [locationMessage, setLocationMessage] = useState('Distance is unavailable until you share your location.');
  const [locating, setLocating] = useState(false);

  const sourceLocations = useMemo(() => [...DEMO_LOCATIONS, ...ownerLocations], [ownerLocations]);
  const locations = useMemo(() => sourceLocations.map(location => position && location.coordinatesVerified !== false
    ? { ...location, distance: distanceKm(position, location) }
    : { ...location, distance: undefined }), [sourceLocations, position]);

  const filtered = useMemo(() => locations
    .filter(location => filterType === 'all' || location.type === filterType)
    .filter(location => !search || `${location.name} ${location.city} ${location.address}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'distance' && position) return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      if (sortBy === 'price') return a.hourlyRate - b.hourlyRate;
      return getAvailableCount(b) - getAvailableCount(a);
    }), [locations, filterType, search, sortBy, position]);

  const selectedLocation = locations.find(location => location.id === selectedId);
  const availableSpaces = sourceLocations.reduce((sum, location) => sum + getAvailableCount(location), 0);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      result => {
        setPosition(result.coords);
        setSortBy('distance');
        setLocationMessage('Distance calculated from your device location.');
        setLocating(false);
      },
      () => {
        setLocationMessage('Location permission was not available. Distance remains unavailable.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicNav />
      <section className="border-b border-gray-100 bg-[radial-gradient(ellipse_at_75%_0%,rgba(0,184,240,.12),transparent_40%),linear-gradient(180deg,#11151b,#080a0d)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Parking discovery · Western Province</div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Arrive with a space waiting.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">Compare private reservations and government pay-and-park locations using the available demo location records.</p>
            </div>
            <span className="demo-data-pill"><ShieldCheck className="h-3.5 w-3.5" /> DEMO DATA</span>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
            <label className="relative block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a location, city or address" className="min-h-12 w-full rounded-xl border border-gray-100 bg-gray-900 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500" aria-label="Search parking locations" />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>}
            </label>
            <button type="button" onClick={useMyLocation} disabled={locating} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15 disabled:opacity-60">
              <Navigation className={`h-4 w-4 ${locating ? 'animate-pulse' : ''}`} />{locating ? 'Locating…' : position ? 'Location enabled' : 'Use my location'}
            </button>
            <label className="relative flex min-h-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-900 px-3 text-gray-500">
              <ArrowDownUp className="h-4 w-4" />
              <select value={sortBy} onChange={event => setSortBy(event.target.value as SortBy)} className="min-w-0 flex-1 border-0 bg-transparent pr-7 text-sm text-gray-700 outline-none focus:ring-0" aria-label="Sort parking locations">
                <option value="availability">Most available</option>
                <option value="price">Lowest hourly price</option>
                <option value="distance" disabled={!position}>Nearest to me</option>
              </select>
            </label>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>{locationMessage}</span>
            <span>Distance uses device location only; no location is stored by this demo.</span>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by parking type">
              {(['all', 'private', 'government'] as FilterType[]).map(type => (
                <button key={type} type="button" onClick={() => setFilterType(type)} aria-pressed={filterType === type} className={`min-h-10 rounded-lg border px-3.5 text-sm font-medium capitalize transition ${filterType === type ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200' : 'border-gray-100 bg-gray-900 text-gray-500 hover:text-white'}`}>
                  {type === 'government' ? 'Government' : type === 'all' ? 'All locations' : 'Private'}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-xs text-gray-500"><strong className="text-gray-300">{filtered.length}</strong> of {locations.length} locations</span>
              <div className="flex rounded-lg border border-gray-100 p-1" role="group" aria-label="Results layout">
                {(['split', 'list', 'map'] as const).map(mode => <button key={mode} type="button" onClick={() => setView(mode)} aria-pressed={view === mode} className={`min-h-8 rounded-md px-2.5 text-xs capitalize ${view === mode ? 'bg-gray-200 text-white' : 'text-gray-500 hover:text-gray-200'}`}>{mode}</button>)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-cyan-400" />{locations.length} demo locations</span>
            <span className="inline-flex items-center gap-2"><CarFront className="h-3.5 w-3.5 text-cyan-400" />{availableSpaces} aggregate available spaces</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-cyan-400" />Rates in LKR per hour</span>
            <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" />Source: demo records + browser-saved owner locations</span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-0 py-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="mx-4 rounded-2xl border border-gray-100 bg-gray-900 px-5 py-12 text-center sm:mx-0">
            <MapPin className="mx-auto h-8 w-8 text-gray-500" /><h2 className="mt-3 text-lg font-semibold text-gray-900">No matching parking</h2><p className="mt-1 text-sm text-gray-500">Try another search or clear the type filter.</p>
            <button onClick={() => { setSearch(''); setFilterType('all'); }} className="mt-4 min-h-10 rounded-lg bg-cyan-600 px-4 text-sm font-medium text-white">Clear filters</button>
          </div>
        ) : (
          <div className={`${view === 'split' ? 'grid grid-cols-1 gap-0 lg:grid-cols-[1.05fr_.95fr] lg:gap-5' : ''}`}>
            {(view === 'split' || view === 'map') && <div className={view === 'map' ? 'px-3 sm:px-0' : 'px-3 sm:px-0 lg:sticky lg:top-4 lg:self-start'}>
              <MapView className="discovery-map" locations={filtered} selectedId={selectedId ?? undefined} onSelect={location => setSelectedId(selectedId === location.id ? null : location.id)} height={view === 'map' ? '70vh' : '500px'} />
              {selectedLocation && <div className="mt-3"><ParkingCard location={selectedLocation} selected onSelect={() => setSelectedId(null)} /></div>}
            </div>}
            {(view === 'split' || view === 'list') && <section aria-label="Parking results" className={`discovery-results space-y-3 px-3 sm:px-0 ${view === 'split' ? 'lg:max-h-[80vh] lg:overflow-y-auto' : ''}`}>
              <div className="flex items-center justify-between px-1 pb-1">
                <h2 className="text-sm font-semibold text-gray-300">Available locations</h2>
                <span className="text-xs text-gray-500">Capacity shown in aggregate</span>
              </div>
              {filtered.map(location => <ParkingCard key={location.id} location={location} selected={selectedId === location.id} onSelect={item => setSelectedId(selectedId === item.id ? null : item.id)} />)}
            </section>}
          </div>
        )}
      </main>
      <footer className="mt-6 border-t border-gray-100 bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 EasyPark · Demonstration platform · Sample location data</span>
          <div className="flex gap-5"><Link href="/about" className="hover:text-white">About</Link><Link href="/contact" className="hover:text-white">Contact</Link><Link href="/login" className="hover:text-white">Demo accounts</Link></div>
        </div>
      </footer>
    </div>
  );
}
