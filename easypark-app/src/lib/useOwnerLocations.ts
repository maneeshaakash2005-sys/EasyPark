'use client';

import { useSyncExternalStore } from 'react';
import type { ParkingLocation } from './types';
import { getStoredOwnerLocations } from './mockData';

const EMPTY_LOCATIONS: ParkingLocation[] = [];

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('easypark:owner-locations', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('easypark:owner-locations', onStoreChange);
  };
}

export function notifyOwnerLocationsChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('easypark:owner-locations'));
}

export function useOwnerLocations() {
  return useSyncExternalStore(subscribe, getStoredOwnerLocations, () => EMPTY_LOCATIONS);
}
