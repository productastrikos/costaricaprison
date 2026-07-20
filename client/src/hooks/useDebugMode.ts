import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cacco.twin.debug';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === '1') return true;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

/**
 * Controls visibility of Digital Twin debug helpers (grid/axes/stats).
 * Enable via `?debug=1`, or press the ` key at runtime to toggle.
 */
export function useDebugMode(): boolean {
  const [debug, setDebug] = useState<boolean>(readInitial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`') return;
      setDebug((prev) => {
        const next = !prev;
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return debug;
}
