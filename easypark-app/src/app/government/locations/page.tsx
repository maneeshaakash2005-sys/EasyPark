'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Navigation';
import { PageHeader, StatusBadge, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, DEMO_SESSIONS, DEMO_PAYMENTS } from '@/lib/mockData';
import { formatLKR, lsGet } from '@/lib/utils';
import { QRPreview } from '@/components/qr/QRCode';
import { LayoutDashboard, MapPin, Users, Clock, AlertTriangle, BarChart2, QrCode, Edit } from 'lucide-react';

const NAV = [
  { href: '/government', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/government/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/government/checkers', label: 'Checkers', icon: <Users className="w-4 h-4" /> },
  { href: '/government/sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { href: '/government/fines', label: 'Fines', icon: <AlertTriangle className="w-4 h-4" /> },
  { href: '/government/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

export default function GovernmentLocationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const [qrLoc, setQrLoc] = useState<any>(null);
  const govtLocs = DEMO_LOCATIONS.filter(l => l.type === 'government');
  const allSessions = [...DEMO_SESSIONS, ...lsGet<any[]>('sessions', [])];
  const allPayments = [...DEMO_PAYMENTS, ...lsGet<any[]>('payments', [])];

  return (
    <DashboardLayout nav={NAV} title="Government Admin" accent="blue">
      <PageHeader title="Parking Locations" description="Manage government-operated parking facilities." />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-50">{['Name', 'City', 'Capacity · spaces', 'Active sessions', 'Recorded payments · LKR', 'Rate · LKR/hour', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {govtLocs.map(loc => {
                const locationSessions = allSessions.filter(session => session.locationId === loc.id);
                const activeSess = locationSessions.filter(session => session.status === 'active').length;
                const sessionIds = new Set(locationSessions.map(session => session.id));
                const paymentIds = new Set(locationSessions.map(session => session.paymentId).filter(Boolean));
                const recordedRevenue = allPayments.filter(payment => payment.status === 'completed' && (paymentIds.has(payment.id) || sessionIds.has(payment.referenceId))).reduce((sum, payment) => sum + payment.amount, 0);
                return (
                  <tr key={loc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{loc.name}</p>
                      <p className="text-xs text-gray-400">{loc.address}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{loc.city}</td>
                    <td className="px-4 py-3">{loc.totalCapacity}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{activeSess}</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(recordedRevenue)}</td>
                    <td className="px-4 py-3">{formatLKR(loc.hourlyRate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={loc.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setQrLoc(loc)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="View QR"><QrCode className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!qrLoc} onClose={() => setQrLoc(null)} title={`QR Code — ${qrLoc?.name}`}>
        {qrLoc && <QRPreview token={qrLoc.qrToken} locationName={qrLoc.name} />}
      </Modal>
    </DashboardLayout>
  );
}
