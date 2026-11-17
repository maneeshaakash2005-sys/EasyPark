'use client';

import { useEffect, useState } from 'react';

export function useDemoClock() {
  const [now, setNow] = useState<number>();

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return now;
}
