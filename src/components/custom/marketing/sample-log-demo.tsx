// @polsia:user-owned — Hero terminal: failed GitHub Actions log with folded
// setup groups, teal first-error-candidate marker, and status line.
// Uses Signal TUI chrome (shared/signal-tui.css). Respects prefers-reduced-motion.
'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { SAMPLE_LOG_FADE_MS, signalTheme } from '@/lib/signal-theme';
import { cn } from '@/lib/utils';

type Row =
  | { kind: 'fold'; id: string; label: string; lines: number }
  | { kind: 'line'; id: string; text: string; candidate?: boolean; dim?: boolean };

/** Illustrative failed Actions log — folded setup, teal marker on first error candidate. */
const ROWS: Row[] = [
  { kind: 'fold', id: 'fold-setup', label: 'Set up job', lines: 14 },
  { kind: 'fold', id: 'fold-checkout', label: 'Run actions/checkout@v4', lines: 8 },
  { kind: 'fold', id: 'fold-setup-node', label: 'Run actions/setup-node@v4', lines: 11 },
  {
    kind: 'line',
    id: 'run-header',
    text: 'Run npm test',
    dim: true,
  },
  {
    kind: 'line',
    id: 'npm-start',
    text: '> app@1.4.2 test',
    dim: true,
  },
  {
    kind: 'line',
    id: 'npm-script',
    text: '> vitest run',
    dim: true,
  },
  {
    kind: 'line',
    id: 'candidate',
    text: 'Error: Process completed with exit code 1',
    candidate: true,
  },
  {
    kind: 'line',
    id: 'evidence-1',
    text: ' FAIL  src/billing/checkout.test.ts > charges card',
  },
  {
    kind: 'line',
    id: 'evidence-2',
    text: 'AssertionError: expected 402 to be 200',
  },
  {
    kind: 'line',
    id: 'evidence-3',
    text: ' at src/billing/checkout.test.ts:42:18',
  },
];

function Header() {
  return (
    <div className="signal-tui__header" aria-hidden="true">
      <span className="signal-tui__brand">◆ TraceGlass</span>
      <span className="signal-tui__divider">│</span>
      <span className="signal-tui__file">ci-failed.log</span>
      <span className="signal-tui__divider signal-tui__divider--optional">│</span>
      <span className="signal-tui__lens">github-actions</span>
      <span className="signal-tui__header-spacer" />
      <span className="signal-tui__sev-group">
        <span className="signal-tui__sev">
          <span className="signal-tui__sev-dot signal-tui__sev--high">●</span>
          <span className="signal-tui__sev--high">1</span>
          <span className="signal-tui__sev-label"> candidate</span>
        </span>
      </span>
    </div>
  );
}

function Status() {
  return (
    <div className="signal-tui__status">
      <span className="signal-tui__mode">NORMAL</span>
      <span className="signal-tui__status-mid">
        1 candidate · press E to jump
        {' · '}
        <span className="signal-tui__help">? help</span>
      </span>
      <span className="signal-tui__pos">Ln 42</span>
    </div>
  );
}

function LogBody({ pulse }: { pulse: boolean }) {
  return (
    <div className="signal-tui__frame">
      <span className="signal-tui__frame-label">ci-failed.log</span>
      <pre className="signal-tui__log">
        {ROWS.map((row) => {
          if (row.kind === 'fold') {
            return (
              <div key={row.id} className="signal-tui__row signal-tui__row--fold">
                <span className="signal-tui__ln"> </span>
                <span className="signal-tui__dot"> </span>
                <span className="signal-tui__fold">
                  ▸ {row.label} <span className="signal-tui__fold-count">({row.lines} lines)</span>
                </span>
              </div>
            );
          }
          return (
            <div
              key={row.id}
              className={cn(
                'signal-tui__row',
                row.candidate && 'signal-tui__row--selected signal-tui__row--candidate',
                row.candidate && pulse && 'signal-tui__row--candidate-pulse',
                row.dim && 'signal-tui__row--dim',
              )}
            >
              <span className="signal-tui__ln"> </span>
              <span
                className={cn('signal-tui__dot', row.candidate && 'signal-tui__dot--candidate')}
                aria-hidden="true"
              >
                {row.candidate ? '●' : ' '}
              </span>
              <span
                className={cn('signal-tui__msg', row.candidate && 'signal-tui__msg--candidate')}
              >
                {row.text}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export function SampleLogDemo({
  className,
  'data-hero-terminal': dataHeroTerminal,
}: {
  className?: string;
  'data-hero-terminal'?: boolean | string;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setPulse((value) => !value);
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      className={cn('signal-tui', className)}
      style={
        {
          '--signal-fade-ms': `${SAMPLE_LOG_FADE_MS}ms`,
          background: signalTheme.bg,
        } as CSSProperties
      }
      data-scene="main"
      data-hero-terminal={dataHeroTerminal === undefined ? undefined : ''}
      aria-label="TraceGlass failed GitHub Actions log demo"
    >
      <Header />
      <LogBody pulse={!reduceMotion && pulse} />
      <Status />
    </section>
  );
}

/** Exported for unit tests — Actions log rows shown in the hero terminal. */
export const __sampleLogDemoTest = { ROWS };
