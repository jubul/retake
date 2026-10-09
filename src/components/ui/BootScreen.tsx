'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export const BOOT_LINES = [
  'RETAKE BIOS v1.0  (c) 2026',
  'MEM CHECK ........... OK',
  'CARTUCHO ............ DETECTADO',
  'SOPLAR CARTUCHO ..... NO HACE FALTA',
  'REGION LOCK ......... IGNORADO',
  'CARGANDO BOTIN ...... ▓▓▓▓▓▓▓▓░░',
];

type Phase = 'typing' | 'out' | 'gone';

export function BootScreen({ lines = BOOT_LINES, once = true }: { lines?: string[]; once?: boolean }) {
  const [state, setState] = useState<{ phase: Phase; shown: number }>({ phase: 'typing', shown: 0 });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    let skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!skip && once) {
      try {
        skip = window.sessionStorage.getItem('retake-boot') === '1';
      } catch {
        skip = false;
      }
    }

    if (skip) {
      timers.push(setTimeout(() => setState({ phase: 'gone', shown: 0 }), 0));
    } else {
      try {
        window.sessionStorage.setItem('retake-boot', '1');
      } catch {
        // sin storage: se muestra igual
      }
      let shown = 0;
      interval = setInterval(() => {
        shown += 1;
        setState((s) => (s.phase === 'typing' ? { phase: 'typing', shown } : s));
        if (shown >= lines.length) {
          clearInterval(interval);
          timers.push(
            setTimeout(() => {
              setState((s) => (s.phase === 'typing' ? { ...s, phase: 'out' } : s));
              timers.push(setTimeout(() => setState({ phase: 'gone', shown: 0 }), 500));
            }, 450),
          );
        }
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [lines, once]);

  function dismiss() {
    setState((s) => (s.phase === 'typing' ? { ...s, phase: 'out' } : s));
    setTimeout(() => setState({ phase: 'gone', shown: 0 }), 500);
  }

  if (state.phase === 'gone') return null;

  return (
    <div className={cn('boot', state.phase === 'out' && 'out')} aria-hidden="true" onClick={dismiss}>
      <pre>
        {lines
          .slice(0, state.shown)
          .map((l) => l + '\n')
          .join('')}
        <span className="cur" />
      </pre>
    </div>
  );
}
