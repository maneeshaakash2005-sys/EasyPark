'use client';
import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;
let toastSequence = 0;

export function setGlobalToastHandler(fn: (toast: Omit<Toast, 'id'>) => void) {
  globalAddToast = fn;
}

export function toast(message: string, type: Toast['type'] = 'info') {
  if (globalAddToast) {
    globalAddToast({ message, type });
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `toast-${++toastSequence}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// localStorage helpers
export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`easypark_${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function lsSet<T>(key: string, value: T) {
  try { localStorage.setItem(`easypark_${key}`, JSON.stringify(value)); } catch {}
}

export function lsRemove(key: string) {
  try { localStorage.removeItem(`easypark_${key}`); } catch {}
}

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

export function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString('en-LK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Colombo',
  });
}

export function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'Asia/Colombo',
  });
}

export function formatTime(dt: string): string {
  return new Date(dt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo' });
}

export function getTimeUntil(dt: string, now?: number): string {
  if (now === undefined) return 'Calculating…';
  const diff = new Date(dt).getTime() - now;
  if (diff < 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m remaining`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m remaining`;
}

export function generateRef(prefix: string): string {
  const suffix = globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 10).toUpperCase() ?? `${Date.now()}`;
  return `${prefix}-${new Date().getFullYear()}-${suffix}`;
}
