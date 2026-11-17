'use client';
import React, { useMemo, useState } from 'react';
import { ArrowDownUp, MapPin, Search, ShieldCheck, X } from 'lucide-react';
import { PublicNav } from '@/components/layout/Navigation';
import { ParkingCard, MapView } from '@/components/parking/ParkingCard';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import { useOwnerLocations } from '@/lib/useOwnerLocations';

type Sort = 'price' | 'availability';
type Filter = 'all' | 'private' | 'government';

export default function ParkingPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('availability');
  const [selected, setSelected] = useState<string | null>(null);
  const ownerLocations = useOwnerLocations();
  const locations = useMemo(() => [...DEMO_LOCATIONS, ...ownerLocations], [ownerLocations]);

  const filtered = useMemo(() => locations
    .filter(location => filter === 'all' || location.type === filter)
    .filter(location => !search || `${location.name} ${location.city} ${location.address}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price' ? a.hourlyRate - b.hourlyRate : getAvailableCount(b) - getAvailableCount(a)), [locations, filter, search, sort]);
  const selectedLocation = locations.find(location => location.id === selected);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <header className="border-b border-gray-100 bg-[radial-gradient(ellipse_at_75%_0%,rgba(0,184,240,.12),transparent_42%),linear-gradient(180deg,#11151b,#080a0d)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Location directory</p><h1 className="text-3xl font-semibold tracking-tight text-white">Find your next parking space</h1><p className="mt-2 text-sm text-gray-500">Explore private reservations and government pay-and-park locations.</p></div>
            <span className="demo-data-pill"><ShieldCheck className="h-3.5 w-3.5" /> DEMO DATA</span>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto_auto]">
            <label className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, city or address" aria-label="Search parking locations" className="min-h-12 w-full rounded-xl border border-gray-100 bg-gray-900 pl-10 pr-10 text-sm" />{search && <button aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500"><X className="h-4 w-4" /></button>}</label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter parking type">
              {(['all', 'private', 'government'] as Filter[]).map(type => <button key={type} onClick={() => setFilter(type)} aria-pressed={filter === type} className={`min-h-11 rounded-xl border px-3 text-sm font-medium capitalize ${filter === type ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200' : 'border-gray-100 bg-gray-900 text-gray-500'}`}>{type === 'all' ? 'All' : type === 'government' ? 'Government' : 'Private'}</button>)}
            </div>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-900 px-3 text-gray-500"><ArrowDownUp className="h-4 w-4" /><select value={sort} onChange={event => setSort(event.target.value as Sort)} className="flex-1 border-0 bg-transparent text-sm text-gray-700"><option value="availability">Most available</option><option value="price">Lowest hourly price</option></select></label>
          </div>
          <p className="mt-3 text-xs text-gray-500"><strong className="text-gray-300">{filtered.length}</strong> locations · Includes browser-saved owner locations. Availability is sample data, not a live feed.</p>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="lg:sticky lg:top-4 lg:self-start"><MapView className="discovery-map" locations={filtered} selectedId={selected ?? undefined} onSelect={location => setSelected(selected === location.id ? null : location.id)} height="min(62vh, 680px)" />{selectedLocation && <div className="mt-3"><ParkingCard location={selectedLocation} selected onSelect={() => setSelected(null)} /></div>}</div>
        <section aria-label="Parking results" className="discovery-results space-y-3">
          <h2 className="px-1 text-sm font-semibold text-gray-300"><MapPin className="mr-1 inline h-4 w-4 text-cyan-400" />Parking locations</h2>
          {filtered.length ? filtered.map(location => <ParkingCard key={location.id} location={location} selected={selected === location.id} onSelect={item => setSelected(selected === item.id ? null : item.id)} />) : <div className="rounded-2xl border border-gray-100 bg-gray-900 p-8 text-center text-sm text-gray-500">No matching parking. Adjust search or filters.</div>}
        </section>
      </main>
    </div>
  );
}
