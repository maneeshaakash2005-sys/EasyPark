'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_SESSIONS, DEMO_FINES, DEMO_PAYMENTS, DEMO_LOCATIONS } from '@/lib/mockData';
import { formatLKR, lsGet } from '@/lib/utils';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

const COLORS = ['#168bff', '#20c878', '#f0bf65'];

export default function GovernmentReportsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const govtLocationIds = new Set(DEMO_LOCATIONS.filter(location => location.type === 'government').map(location => location.id));
  const sessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])].filter(session => govtLocationIds.has(session.locationId));
  const fines = [...DEMO_FINES, ...lsGet<any[]>('checker_fines', [])].filter(fine => govtLocationIds.has(fine.locationId));
  const sessionPaymentIds = new Set(sessions.map(session => session.paymentId).filter(Boolean));
  const sessionIds = new Set(sessions.map(session => session.id));
  const payments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])].filter(payment => payment.status === 'completed' && (sessionPaymentIds.has(payment.id) || sessionIds.has(payment.referenceId)));
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);

  const fineStatusData = ['pending', 'paid', 'disputed'].map(status => ({ name: status, value: fines.filter(fine => fine.status === status).length }));
  const monthRecords = new Map<string, { month: string; sessions: number; revenue: number; fines: number }>();
  const getMonthRecord = (date: string) => {
    const timestamp = new Date(date);
    const key = timestamp.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Colombo' });
    const month = timestamp.toLocaleDateString('en-LK', { month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });
    if (!monthRecords.has(key)) monthRecords.set(key, { month, sessions: 0, revenue: 0, fines: 0 });
    return monthRecords.get(key)!;
  };
  sessions.forEach(session => { getMonthRecord(session.createdAt).sessions += 1; });
  payments.forEach(payment => { getMonthRecord(payment.createdAt).revenue += payment.amount; });
  fines.forEach(fine => { getMonthRecord(fine.issuedAt).fines += 1; });
  const monthlyRecords = [...monthRecords.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, record]) => record);

  return (
    <DashboardLayout nav={NAV} title="Government Admin" accent="blue">
      <PageHeader
        title="Analytics & Reports"
        description="Recorded government parking sessions, linked payments and fines."
        action={<button onClick={() => alert('Report download is a demo feature.')} className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><Download className="w-4 h-4" /> Export Report</button>}
      />

      <p className="mb-4 text-xs text-gray-500">DEMO DATA · Revenue is the sum of completed payment records linked to government-location sessions. Fine amount is the sum of recorded fines.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-blue-700">{formatLKR(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Session Revenue</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-orange-600">{formatLKR(totalFines)}</p>
          <p className="text-xs text-gray-500 mt-1">Fine amounts recorded · LKR</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-700">{sessions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Government sessions · records</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Recorded session revenue</h2>
          <p className="mb-4 text-xs text-gray-500">Completed linked payments · LKR · Month follows Asia/Colombo</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a313d" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#929ba9' }} />
              <YAxis tick={{ fontSize: 12, fill: '#929ba9' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatLKR(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#168bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Fine status distribution</h2>
          <p className="text-xs text-gray-500">Count of government fine records by status.</p>
          <div className="flex items-center justify-center h-48">
            <PieChart width={180} height={180}>
              <Pie data={fineStatusData} cx={85} cy={85} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {fineStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Monthly Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Month', 'Sessions', 'Revenue', 'Fines Issued'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyRecords.map(m => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.month}</td>
                  <td className="px-4 py-3">{m.sessions} records</td>
                  <td className="px-4 py-3 font-medium">{formatLKR(m.revenue)}</td>
                  <td className="px-4 py-3 text-orange-600">{m.fines} records</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
