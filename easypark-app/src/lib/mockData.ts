import type { User, ParkingLocation, Booking, GovernmentSession, Payment, Fine, Operator, GovernmentOrg, Notification, AuditLog } from './types';

// ─── USERS ──────────────────────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  { id: 'u1', email: 'customer@easypark.lk', name: 'Kasun Perera', role: 'customer', phone: '+94711234567', createdAt: '2024-01-15', status: 'active' },
  { id: 'u2', email: 'owner@easypark.lk', name: 'Nimal Silva', role: 'owner', phone: '+94712345678', createdAt: '2024-01-10', status: 'active' },
  { id: 'u3', email: 'operator@easypark.lk', name: 'Sunil Fernando', role: 'operator', phone: '+94713456789', createdAt: '2024-02-01', status: 'active' },
  { id: 'u4', email: 'government@easypark.lk', name: 'P.B. Rajapaksa', role: 'government', phone: '+94714567890', createdAt: '2024-01-05', status: 'active' },
  { id: 'u5', email: 'checker@easypark.lk', name: 'W.D. Kumara', role: 'checker', phone: '+94715678901', createdAt: '2024-02-10', status: 'active' },
  { id: 'u6', email: 'admin@easypark.lk', name: 'Admin User', role: 'admin', phone: '+94716789012', createdAt: '2024-01-01', status: 'active' },
  { id: 'u7', email: 'john@example.com', name: 'John Dias', role: 'customer', phone: '+94717890123', createdAt: '2024-03-01', status: 'active' },
  { id: 'u8', email: 'priya@example.com', name: 'Priya Mendis', role: 'customer', phone: '+94718901234', createdAt: '2024-03-15', status: 'active' },
];

// ─── PARKING LOCATIONS ───────────────────────────────────────────────────────
export const DEMO_LOCATIONS: ParkingLocation[] = [
  {
    id: 'loc1',
    name: 'SLIIT Malabe Parking Complex',
    type: 'private',
    address: 'New Kandy Rd, Malabe',
    city: 'Malabe',
    lat: 6.9144,
    lng: 79.9739,
    totalCapacity: 120,
    bookedCount: 98,
    hourlyRate: 100,
    operatingHours: { open: '06:00', close: '22:00' },
    facilities: ['CCTV', 'Security', 'Covered', 'EV Charging'],
    photos: ['/images/park1.jpg'],
    ownerId: 'u2',
    operatorId: 'u3',
    qrToken: 'qr-loc1-sliit-malabe',
    status: 'active',
    description: 'Secure covered parking facility adjacent to SLIIT university campus. 24/7 CCTV surveillance and trained security personnel.',
  },
  {
    id: 'loc2',
    name: 'Malabe Town Car Park',
    type: 'private',
    address: '45 Kaduwela Rd, Malabe',
    city: 'Malabe',
    lat: 6.9068,
    lng: 79.9682,
    totalCapacity: 60,
    bookedCount: 45,
    hourlyRate: 80,
    operatingHours: { open: '07:00', close: '21:00' },
    facilities: ['CCTV', 'Open Air', 'Motorcycle Parking'],
    photos: ['/images/park2.jpg'],
    ownerId: 'u2',
    operatorId: 'u3',
    qrToken: 'qr-loc2-malabe-town',
    status: 'active',
    description: 'Conveniently located open-air parking in the heart of Malabe town, close to shops and restaurants.',
  },
  {
    id: 'loc3',
    name: 'Kaduwela Municipal Parking',
    type: 'government',
    address: 'Main Street, Kaduwela',
    city: 'Kaduwela',
    lat: 6.9281,
    lng: 79.9909,
    totalCapacity: 80,
    bookedCount: 52,
    hourlyRate: 50,
    operatingHours: { open: '06:00', close: '22:00' },
    facilities: ['Government Managed', 'Open Air', 'CCTV'],
    photos: ['/images/park3.jpg'],
    governmentOrgId: 'gov1',
    qrToken: 'qr-loc3-kaduwela-muni',
    status: 'active',
    description: 'Official municipal parking facility managed by Kaduwela Urban Council. Pay-on-arrival via QR code.',
  },
  {
    id: 'loc4',
    name: 'Battaramulla Commercial Parking',
    type: 'private',
    address: '12 Parliament Rd, Battaramulla',
    city: 'Battaramulla',
    lat: 6.8949,
    lng: 79.9185,
    totalCapacity: 200,
    bookedCount: 160,
    hourlyRate: 120,
    operatingHours: { open: '05:30', close: '23:00' },
    facilities: ['CCTV', 'Multi-storey', 'Covered', 'EV Charging', 'Valet'],
    photos: ['/images/park4.jpg'],
    ownerId: 'u2',
    operatorId: 'u3',
    qrToken: 'qr-loc4-battaramulla',
    status: 'active',
    description: 'Premium multi-storey parking facility in the Battaramulla commercial district. Valet service available.',
  },
  {
    id: 'loc5',
    name: 'Rajagiriya Town Parking',
    type: 'government',
    address: 'High Level Rd, Rajagiriya',
    city: 'Rajagiriya',
    lat: 6.9022,
    lng: 79.8980,
    totalCapacity: 100,
    bookedCount: 70,
    hourlyRate: 50,
    operatingHours: { open: '06:00', close: '20:00' },
    facilities: ['Government Managed', 'Open Air', 'Motorcycle Parking'],
    photos: ['/images/park5.jpg'],
    governmentOrgId: 'gov1',
    qrToken: 'qr-loc5-rajagiriya',
    status: 'active',
    description: 'Municipal parking lot serving Rajagiriya town centre. Managed by the Western Province Road Development Authority.',
  },
  {
    id: 'loc6',
    name: 'Colombo Fort Secure Parking',
    type: 'private',
    address: '55 Chatham St, Colombo 01',
    city: 'Colombo',
    lat: 6.9333,
    lng: 79.8428,
    totalCapacity: 300,
    bookedCount: 280,
    hourlyRate: 150,
    operatingHours: { open: '00:00', close: '23:59' },
    facilities: ['CCTV', 'Multi-storey', 'Covered', '24/7 Security', 'EV Charging', 'Valet'],
    photos: ['/images/park6.jpg'],
    ownerId: 'u2',
    operatorId: 'u3',
    qrToken: 'qr-loc6-colombo-fort',
    status: 'active',
    description: 'Premium 24/7 secure parking in Colombo Fort CBD. 10-storey facility with advanced security systems.',
  },
  {
    id: 'loc7',
    name: 'Colombo Municipal Car Park — Pettah',
    type: 'government',
    address: 'Main Street, Pettah, Colombo 11',
    city: 'Colombo',
    lat: 6.9388,
    lng: 79.8529,
    totalCapacity: 150,
    bookedCount: 110,
    hourlyRate: 40,
    operatingHours: { open: '06:00', close: '22:00' },
    facilities: ['Government Managed', 'Open Air', 'CCTV', 'Motorcycle Parking'],
    photos: ['/images/park7.jpg'],
    governmentOrgId: 'gov2',
    qrToken: 'qr-loc7-pettah-muni',
    status: 'active',
    description: 'Colombo Municipal Council public parking in Pettah. Affordable pay-per-use via QR code.',
  },
  {
    id: 'loc8',
    name: 'Nawala Parking Hub',
    type: 'private',
    address: '23 Nawala Rd, Nugegoda',
    city: 'Nawala',
    lat: 6.8780,
    lng: 79.8980,
    totalCapacity: 50,
    bookedCount: 10,
    hourlyRate: 90,
    operatingHours: { open: '07:00', close: '20:00' },
    facilities: ['CCTV', 'Open Air'],
    photos: ['/images/park8.jpg'],
    ownerId: 'u2',
    operatorId: 'u3',
    qrToken: 'qr-loc8-nawala',
    status: 'active',
    description: 'Affordable private parking near Nawala junction. Easy access to Nawala-Rajagiriya arterial road.',
  },
];

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
export const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'bk1',
    bookingRef: 'EP-2024-001234',
    customerId: 'u1',
    locationId: 'loc1',
    vehicleReg: 'CAR-1234',
    startTime: '2026-11-16T10:00:00',
    endTime: '2026-11-16T13:00:00',
    hours: 3,
    amount: 300,
    status: 'active',
    paymentId: 'pay1',
    createdAt: '2026-11-16T09:30:00',
    checkInTime: '2026-11-16T10:05:00',
  },
  {
    id: 'bk2',
    bookingRef: 'EP-2024-001235',
    customerId: 'u1',
    locationId: 'loc4',
    vehicleReg: 'CAR-1234',
    startTime: '2026-11-17T09:00:00',
    endTime: '2026-11-17T12:00:00',
    hours: 3,
    amount: 360,
    status: 'confirmed',
    paymentId: 'pay2',
    createdAt: '2026-11-16T08:00:00',
  },
  {
    id: 'bk3',
    bookingRef: 'EP-2024-001200',
    customerId: 'u1',
    locationId: 'loc6',
    vehicleReg: 'CAR-1234',
    startTime: '2026-11-14T14:00:00',
    endTime: '2026-11-14T16:00:00',
    hours: 2,
    amount: 300,
    status: 'completed',
    paymentId: 'pay3',
    createdAt: '2026-11-14T13:30:00',
    checkInTime: '2026-11-14T14:02:00',
    checkOutTime: '2026-11-14T16:10:00',
  },
  {
    id: 'bk4',
    bookingRef: 'EP-2024-001180',
    customerId: 'u7',
    locationId: 'loc1',
    vehicleReg: 'WP-AB-5678',
    startTime: '2026-11-16T08:00:00',
    endTime: '2026-11-16T12:00:00',
    hours: 4,
    amount: 400,
    status: 'active',
    paymentId: 'pay4',
    createdAt: '2026-11-15T22:00:00',
    checkInTime: '2026-11-16T08:10:00',
  },
  {
    id: 'bk5',
    bookingRef: 'EP-2024-001160',
    customerId: 'u8',
    locationId: 'loc2',
    vehicleReg: 'NB-CD-9012',
    startTime: '2026-11-16T11:00:00',
    endTime: '2026-11-16T14:00:00',
    hours: 3,
    amount: 240,
    status: 'confirmed',
    paymentId: 'pay5',
    createdAt: '2026-11-16T10:00:00',
  },
  {
    id: 'bk6',
    bookingRef: 'EP-2024-001100',
    customerId: 'u1',
    locationId: 'loc2',
    vehicleReg: 'CAR-1234',
    startTime: '2026-11-10T10:00:00',
    endTime: '2026-11-10T13:00:00',
    hours: 3,
    amount: 240,
    status: 'cancelled',
    paymentId: 'pay6',
    createdAt: '2026-11-10T09:00:00',
  },
];

// ─── GOVERNMENT SESSIONS ─────────────────────────────────────────────────────
export const DEMO_SESSIONS: GovernmentSession[] = [
  {
    id: 'sess1',
    sessionRef: 'GS-2024-005001',
    locationId: 'loc3',
    vehicleReg: 'CAR-1234',
    startTime: '2026-11-16T09:00:00',
    endTime: '2026-11-16T11:00:00',
    hours: 2,
    amount: 100,
    status: 'active',
    paymentId: 'pay7',
    createdAt: '2026-11-16T09:00:00',
    checkerId: 'u5',
  },
  {
    id: 'sess2',
    sessionRef: 'GS-2024-005000',
    locationId: 'loc5',
    vehicleReg: 'WP-AB-5678',
    startTime: '2026-11-15T10:00:00',
    endTime: '2026-11-15T12:00:00',
    hours: 2,
    amount: 100,
    status: 'completed',
    paymentId: 'pay8',
    createdAt: '2026-11-15T10:00:00',
    checkerId: 'u5',
  },
  {
    id: 'sess3',
    sessionRef: 'GS-2024-004999',
    locationId: 'loc7',
    vehicleReg: 'NB-CD-9012',
    startTime: '2026-11-16T07:00:00',
    endTime: '2026-11-16T09:00:00',
    hours: 2,
    amount: 80,
    status: 'expired',
    paymentId: 'pay9',
    createdAt: '2026-11-16T07:00:00',
    checkerId: 'u5',
  },
];

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const DEMO_PAYMENTS: Payment[] = [
  { id: 'pay1', amount: 300, method: 'card', status: 'completed', referenceId: 'bk1', referenceType: 'booking', createdAt: '2026-11-16T09:30:00', gateway: 'PayHere (DEMO)' },
  { id: 'pay2', amount: 360, method: 'mobile', status: 'completed', referenceId: 'bk2', referenceType: 'booking', createdAt: '2026-11-16T08:00:00', gateway: 'Dialog eZ Cash (DEMO)' },
  { id: 'pay3', amount: 300, method: 'card', status: 'completed', referenceId: 'bk3', referenceType: 'booking', createdAt: '2026-11-14T13:30:00', gateway: 'PayHere (DEMO)' },
  { id: 'pay4', amount: 400, method: 'card', status: 'completed', referenceId: 'bk4', referenceType: 'booking', createdAt: '2026-11-15T22:00:00', gateway: 'PayHere (DEMO)' },
  { id: 'pay5', amount: 240, method: 'mobile', status: 'completed', referenceId: 'bk5', referenceType: 'booking', createdAt: '2026-11-16T10:00:00', gateway: 'Dialog eZ Cash (DEMO)' },
  { id: 'pay6', amount: 240, method: 'card', status: 'refunded', referenceId: 'bk6', referenceType: 'booking', createdAt: '2026-11-10T09:00:00', gateway: 'PayHere (DEMO)' },
  { id: 'pay7', amount: 100, method: 'mobile', status: 'completed', referenceId: 'sess1', referenceType: 'session', createdAt: '2026-11-16T09:00:00', gateway: 'Dialog eZ Cash (DEMO)' },
  { id: 'pay8', amount: 100, method: 'card', status: 'completed', referenceId: 'sess2', referenceType: 'session', createdAt: '2026-11-15T10:00:00', gateway: 'PayHere (DEMO)' },
  { id: 'pay9', amount: 80, method: 'mobile', status: 'completed', referenceId: 'sess3', referenceType: 'session', createdAt: '2026-11-16T07:00:00', gateway: 'Dialog eZ Cash (DEMO)' },
];

// ─── FINES ────────────────────────────────────────────────────────────────────
export const DEMO_FINES: Fine[] = [
  {
    id: 'fine1',
    fineRef: 'FN-2024-0001',
    vehicleReg: 'WP-XX-9999',
    locationId: 'loc3',
    checkerId: 'u5',
    reason: 'Parking without valid session',
    amount: 2000,
    status: 'pending',
    issuedAt: '2026-11-16T10:30:00',
    notes: 'Vehicle parked in bay 12 without active session.',
  },
  {
    id: 'fine2',
    fineRef: 'FN-2024-0002',
    vehicleReg: 'SP-YY-1111',
    locationId: 'loc5',
    checkerId: 'u5',
    reason: 'Expired parking session',
    amount: 1500,
    status: 'paid',
    issuedAt: '2026-11-15T14:00:00',
    paidAt: '2026-11-15T16:30:00',
    notes: 'Session expired at 12:00, vehicle still present at 14:00.',
  },
  {
    id: 'fine3',
    fineRef: 'FN-2024-0003',
    vehicleReg: 'NW-ZZ-2222',
    locationId: 'loc7',
    checkerId: 'u5',
    reason: 'Parking in disabled bay without permit',
    amount: 5000,
    status: 'disputed',
    issuedAt: '2026-11-14T11:00:00',
    notes: 'Driver claims permit was in glove box — dispute filed.',
  },
];

// ─── OPERATORS ────────────────────────────────────────────────────────────────
export const DEMO_OPERATORS: Operator[] = [
  {
    id: 'op1',
    userId: 'u3',
    name: 'Sunil Fernando',
    email: 'operator@easypark.lk',
    phone: '+94713456789',
    locationIds: ['loc1', 'loc2', 'loc4', 'loc6', 'loc8'],
    status: 'active',
  },
];

// ─── GOVERNMENT ORGS ──────────────────────────────────────────────────────────
export const DEMO_GOVT_ORGS: GovernmentOrg[] = [
  {
    id: 'gov1',
    name: 'Western Province Road Development Authority',
    code: 'WPRDA',
    locationIds: ['loc3', 'loc5'],
    checkerIds: ['u5'],
    status: 'active',
  },
  {
    id: 'gov2',
    name: 'Colombo Municipal Council',
    code: 'CMC',
    locationIds: ['loc7'],
    checkerIds: [],
    status: 'active',
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', title: 'Booking Confirmed', message: 'Your booking EP-2024-001234 at SLIIT Malabe has been confirmed.', type: 'success', read: false, createdAt: '2026-11-16T09:30:00' },
  { id: 'n2', userId: 'u1', title: 'Check-in Reminder', message: 'Your booking at Battaramulla Commercial starts in 1 hour.', type: 'info', read: false, createdAt: '2026-11-17T08:00:00' },
  { id: 'n3', userId: 'u1', title: 'Booking Cancelled', message: 'Your booking EP-2024-001100 has been cancelled and refund initiated.', type: 'warning', read: true, createdAt: '2026-11-10T10:00:00' },
  { id: 'n4', userId: 'u2', title: 'New Booking', message: 'New booking received for SLIIT Malabe — Vehicle CAR-1234.', type: 'info', read: false, createdAt: '2026-11-16T09:30:00' },
  { id: 'n5', userId: 'u3', title: 'Vehicle Arriving', message: 'Vehicle CAR-1234 booked for check-in at SLIIT Malabe at 10:00.', type: 'info', read: false, createdAt: '2026-11-16T09:00:00' },
];

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', userId: 'u1', action: 'CREATE_BOOKING', resource: 'Booking bk1', details: 'Customer created booking for SLIIT Malabe', ip: '192.168.1.100', createdAt: '2026-11-16T09:30:00' },
  { id: 'al2', userId: 'u3', action: 'CHECK_IN', resource: 'Booking bk1', details: 'Operator checked in vehicle CAR-1234', ip: '192.168.1.102', createdAt: '2026-11-16T10:05:00' },
  { id: 'al3', userId: 'u5', action: 'ISSUE_FINE', resource: 'Fine fine1', details: 'Checker issued fine to WP-XX-9999', ip: '10.0.0.5', createdAt: '2026-11-16T10:30:00' },
  { id: 'al4', userId: 'u6', action: 'APPROVE_LOCATION', resource: 'Location loc8', details: 'Admin approved Nawala Parking Hub', ip: '10.0.0.1', createdAt: '2026-11-14T09:00:00' },
  { id: 'al5', userId: 'u2', action: 'UPDATE_LOCATION', resource: 'Location loc1', details: 'Owner updated hourly rate for SLIIT Malabe', ip: '192.168.1.101', createdAt: '2026-11-13T15:30:00' },
];

// ─── REVENUE DATA (monthly) ───────────────────────────────────────────────────
export const DEMO_REVENUE_MONTHLY = [
  { month: 'Jun', revenue: 42000, bookings: 320 },
  { month: 'Jul', revenue: 55000, bookings: 410 },
  { month: 'Aug', revenue: 61000, bookings: 460 },
  { month: 'Sep', revenue: 48000, bookings: 350 },
  { month: 'Oct', revenue: 72000, bookings: 540 },
  { month: 'Nov', revenue: 58500, bookings: 420 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getLocationById(id: string): ParkingLocation | undefined {
  return [...DEMO_LOCATIONS, ...getStoredOwnerLocations()].find(l => l.id === id);
}
const EMPTY_OWNER_LOCATIONS: ParkingLocation[] = [];
let cachedOwnerLocationsRaw: string | null = null;
let cachedOwnerLocations: ParkingLocation[] = EMPTY_OWNER_LOCATIONS;

export function getStoredOwnerLocations(): ParkingLocation[] {
  if (typeof window === 'undefined') return EMPTY_OWNER_LOCATIONS;
  let raw = '[]';
  try {
    raw = window.localStorage.getItem('easypark_owner_locations') ?? '[]';
  } catch {
    return EMPTY_OWNER_LOCATIONS;
  }
  if (raw === cachedOwnerLocationsRaw) return cachedOwnerLocations;
  try {
    cachedOwnerLocationsRaw = raw;
    cachedOwnerLocations = JSON.parse(raw) as ParkingLocation[];
  } catch {
    cachedOwnerLocationsRaw = raw;
    cachedOwnerLocations = EMPTY_OWNER_LOCATIONS;
  }
  return cachedOwnerLocations;
}
export function getBookingsByCustomer(customerId: string): Booking[] {
  return DEMO_BOOKINGS.filter(b => b.customerId === customerId);
}
export function getBookingsByLocation(locationId: string): Booking[] {
  return DEMO_BOOKINGS.filter(b => b.locationId === locationId);
}
export function getSessionsByLocation(locationId: string): GovernmentSession[] {
  return DEMO_SESSIONS.filter(s => s.locationId === locationId);
}
export function getPaymentById(id: string): Payment | undefined {
  return DEMO_PAYMENTS.find(p => p.id === id);
}
export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find(u => u.id === id);
}
export function getAvailableCount(loc: ParkingLocation): number {
  let additionalOccupancy = 0;
  if (typeof window !== 'undefined') {
    try {
      const cancelledIds = new Set<string>(JSON.parse(window.localStorage.getItem('easypark_cancelled_bookings') ?? '[]'));
      if (loc.type === 'private') {
        const bookings = JSON.parse(window.localStorage.getItem('easypark_bookings') ?? '[]') as Booking[];
        additionalOccupancy = bookings
          .map(applyOperatorBookingStatus)
          .filter(booking => booking.locationId === loc.id && ['active', 'confirmed'].includes(booking.status) && !cancelledIds.has(booking.id)).length;
      } else {
        const sessions = JSON.parse(window.localStorage.getItem('easypark_sessions') ?? '[]') as GovernmentSession[];
        additionalOccupancy = sessions.filter(session => session.locationId === loc.id && session.status === 'active').length;
      }
    } catch {
      additionalOccupancy = 0;
    }
  }
  return Math.max(0, loc.totalCapacity - loc.bookedCount - additionalOccupancy);
}

export function applyOperatorBookingStatus(booking: Booking): Booking {
  if (typeof window === 'undefined') return booking;
  try {
    const checkedOutIds = new Set<string>(JSON.parse(window.localStorage.getItem('easypark_operator_checkedout') ?? '[]'));
    const checkedInIds = new Set<string>(JSON.parse(window.localStorage.getItem('easypark_operator_checkedin') ?? '[]'));
    if (checkedOutIds.has(booking.id)) return { ...booking, status: 'completed' };
    if (checkedInIds.has(booking.id)) return { ...booking, status: 'active' };
  } catch {
    return booking;
  }
  return booking;
}
