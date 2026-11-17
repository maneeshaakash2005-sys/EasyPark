'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Navigation';
import { StatusBadge, PageHeader, Modal, ConfirmDialog } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { DEMO_LOCATIONS, getAvailableCount } from '@/lib/mockData';
import { lsGet, lsSet, formatLKR } from '@/lib/utils';
import { notifyOwnerLocationsChanged } from '@/lib/useOwnerLocations';
import { QRPreview } from '@/components/qr/QRCode';
import { LayoutDashboard, MapPin, Car, Users, BarChart2, Settings, Plus, Edit, Trash2, QrCode } from 'lucide-react';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/owner/locations', label: 'My Locations', icon: <MapPin className="w-4 h-4" /> },
  { href: '/owner/bookings', label: 'Bookings', icon: <Car className="w-4 h-4" /> },
  { href: '/owner/operators', label: 'Operators', icon: <Users className="w-4 h-4" /> },
  { href: '/owner/reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function OwnerLocationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const baseLocs = DEMO_LOCATIONS.filter(l => l.ownerId === user?.id);
  const [extraLocs, setExtraLocs] = useState(lsGet<any[]>('owner_locations', []));
  const [qrLoc, setQrLoc] = useState<any>(null);
  const [deleteLoc, setDeleteLoc] = useState<string | null>(null);
  const [editLoc, setEditLoc] = useState<any>(null);
  const [editForm, setEditForm] = useState({ hourlyRate: 0, totalCapacity: 0 });

  const allLocs = [...baseLocs, ...extraLocs];

  const handleDelete = (id: string) => {
    const updated = extraLocs.filter(l => l.id !== id);
    setExtraLocs(updated);
    lsSet('owner_locations', updated);
    notifyOwnerLocationsChanged();
  };

  const handleEditSave = () => {
    if (!editLoc) return;
    const updated = extraLocs.map(l => l.id === editLoc.id ? { ...l, ...editForm } : l);
    setExtraLocs(updated);
    lsSet('owner_locations', updated);
    notifyOwnerLocationsChanged();
    setEditLoc(null);
  };

  return (
    <DashboardLayout nav={NAV} title="Owner Portal" accent="green">
      <PageHeader
        title="My Parking Locations"
        description={`Managing ${allLocs.length} parking locations`}
        action={<Link href="/owner/locations/new" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus className="w-4 h-4" /> Add Location</Link>}
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Name', 'City', 'Capacity', 'Booked', 'Available', 'Rate/hr', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {allLocs.map(loc => {
                const avail = getAvailableCount(loc);
                const occupied = loc.totalCapacity - avail;
                const isExtra = extraLocs.some(l => l.id === loc.id);
                return (
                  <tr key={loc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{loc.name}</p>
                        <p className="text-xs text-gray-400">{loc.address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{loc.city}</td>
                    <td className="px-4 py-3">{loc.totalCapacity}</td>
                    <td className="px-4 py-3 text-orange-600">{occupied} spaces</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{avail}</td>
                    <td className="px-4 py-3 font-medium">{formatLKR(loc.hourlyRate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={loc.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setQrLoc(loc)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="QR"><QrCode className="w-4 h-4" /></button>
                        {isExtra && <>
                          <button onClick={() => { setEditLoc(loc); setEditForm({ hourlyRate: loc.hourlyRate, totalCapacity: loc.totalCapacity }); }} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteLoc(loc.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </>}
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

      <Modal isOpen={!!editLoc} onClose={() => setEditLoc(null)} title="Edit Location">
        {editLoc && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (LKR)</label>
              <input type="number" value={editForm.hourlyRate} onChange={e => setEditForm(p => ({ ...p, hourlyRate: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
              <input type="number" value={editForm.totalCapacity} onChange={e => setEditForm(p => ({ ...p, totalCapacity: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button onClick={handleEditSave} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg">Save Changes</button>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteLoc} onClose={() => setDeleteLoc(null)} onConfirm={() => { if (deleteLoc) handleDelete(deleteLoc); }} title="Delete Location" message="Are you sure you want to delete this parking location? This action cannot be undone." confirmLabel="Delete" />
    </DashboardLayout>
  );
}
