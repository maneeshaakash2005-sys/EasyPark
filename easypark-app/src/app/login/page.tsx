'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

const DEMO_ACCOUNTS = [
  { role: 'customer' as UserRole, email: 'customer@easypark.lk', label: 'Customer', color: 'bg-green-50 border-green-200 text-green-700' },
  { role: 'owner' as UserRole, email: 'owner@easypark.lk', label: 'Parking Owner', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { role: 'operator' as UserRole, email: 'operator@easypark.lk', label: 'Operator', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { role: 'government' as UserRole, email: 'government@easypark.lk', label: 'Govt Admin', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { role: 'checker' as UserRole, email: 'checker@easypark.lk', label: 'Checker', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { role: 'admin' as UserRole, email: 'admin@easypark.lk', label: 'Super Admin', color: 'bg-red-50 border-red-200 text-red-700' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsRole } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('easypark_user') || '{}');
      router.push(ROLE_REDIRECTS[user.role as UserRole] || '/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const quickLogin = (role: UserRole) => {
    loginAsRole(role);
    router.push(ROLE_REDIRECTS[role]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 to-green-900 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">EasyPark</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Find. Reserve.<br />Pay. Park.</h2>
          <p className="text-green-100 text-lg mb-8">Sri Lanka&apos;s smartest parking platform. Reserve private bays or pay at government lots instantly with QR codes.</p>
          <div className="space-y-3">
            {['Real-time parking availability', 'Instant QR code payments', 'Multi-role platform management', 'Covering 8 locations across Western Province'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-green-100">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Easy<span className="text-green-600">Park</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to EasyPark</h1>
          <p className="text-sm text-gray-500 mb-6">Use password: <span className="font-mono font-bold text-gray-700">demo123</span></p>

          {/* Quick role select */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.role}
                  onClick={() => quickLogin(a.role)}
                  className={`flex flex-col items-center gap-1 p-2.5 border rounded-xl text-xs font-medium transition-all hover:scale-105 ${a.color}`}
                >
                  <span className="font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign in manually</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@easypark.lk"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="demo123"
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-600 font-medium hover:underline">Register here</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            <Link href="/" className="hover:text-gray-600">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
