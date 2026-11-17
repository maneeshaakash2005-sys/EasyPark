'use client';
import React from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/layout/Navigation';
import { Car, MapPin, Shield, Zap, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { DEMO_LOCATIONS } from '@/lib/mockData';

export default function AboutPage() {
  const totalCapacity = DEMO_LOCATIONS.reduce((sum, location) => sum + location.totalCapacity, 0);
  const cityCount = new Set(DEMO_LOCATIONS.map(location => location.city)).size;
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Car className="w-4 h-4" /> Parking technology demo · Western Province
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Parking should be easy.<br />That&apos;s why we built EasyPark.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">EasyPark demonstrates how drivers, private parking operators and government teams can coordinate discovery, reservations, payments and session verification in one platform.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-full text-center"><span className="demo-data-pill">DEMO DATA · Counts derived from location records</span></div>
          {[
            { label: 'Recorded capacity', value: `${totalCapacity} spaces` },
            { label: 'Demo locations', value: `${DEMO_LOCATIONS.length}` },
            { label: 'Cities in sample', value: `${cityCount}` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How EasyPark Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Car className="w-5 h-5 text-green-600" /> Private Parking</h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Find', desc: 'Browse private parking lots with sample capacity, listed rates and facility details.' },
                  { step: '2', title: 'Reserve', desc: 'Enter your vehicle registration, select duration and confirm your booking in seconds.' },
                  { step: '3', title: 'Pay', desc: 'Complete a simulated card or mobile-money payment and review the demo confirmation.' },
                  { step: '4', title: 'Park', desc: 'Show your booking reference at the gate. The operator checks you in and out.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{s.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Government Parking</h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Arrive', desc: 'Drive to any EasyPark-enabled government parking facility in Colombo, Kaduwela or Rajagiriya.' },
                  { step: '2', title: 'Scan QR', desc: 'Use the EasyPark app or scan the QR code displayed at the entrance.' },
                  { step: '3', title: 'Pay Online', desc: 'Enter your vehicle registration, select a duration and complete a simulated payment.' },
                  { step: '4', title: 'Park Freely', desc: 'Your session is active. Checkers can verify your payment at any time.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{s.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <MapPin className="w-6 h-6 text-green-600" />, title: 'Capacity overview', desc: 'Browse aggregate spaces from the provided sample location records. This is not a live feed.' },
              { icon: <Zap className="w-6 h-6 text-yellow-600" />, title: 'QR payment flow', desc: 'Government locations expose QR links and a simulated payment journey.' },
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Government workflows', desc: 'Demo flows model municipal locations, session checks and fine records.' },
              { icon: <Clock className="w-6 h-6 text-purple-600" />, title: 'Duration selection', desc: 'Select a parking duration supported by each individual booking flow.' },
              { icon: <Users className="w-6 h-6 text-indigo-600" />, title: 'Operator management', desc: 'Owner and operator demo areas include location and booking workflows.' },
              { icon: <Star className="w-6 h-6 text-orange-600" />, title: 'Multiple roles', desc: 'Switch between customer, owner, operator, government, checker and super-admin demos.' },
            ].map(f => (
              <div key={f.title} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="p-2 bg-gray-50 rounded-lg w-fit mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Designed around real parking roles</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-500">The demo includes role-specific workspaces for drivers, parking owners, operators, government administrators, checkers and platform administrators. All sample records are clearly identified as demo data.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-green-700">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to park smarter?</h2>
          <p className="text-green-100 mb-6">Explore the sample parking locations and role workflows in this EasyPark demo.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/parking" className="bg-white text-green-700 font-medium px-6 py-2.5 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
              Find Parking <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="border border-white/40 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 EasyPark (Demo). Built for Sri Lanka.</p>
      </footer>
    </div>
  );
}
