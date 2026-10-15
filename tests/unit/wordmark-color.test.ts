import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { WORDMARK_COLOR_VARIANT } from '@/components/custom/brand-mark';
import { brandVisual } from '@/lib/brand';
import { signalTheme } from '@/lib/signal-theme';

const brandMarkSource = readFileSync('src/components/custom/brand-mark.tsx', 'utf8');
const customStyle = readFileSync('src/app/custom-style.css', 'utf8');

describe('TraceGlass wordmark Signal teal', () => {
  it('defaults to Option A (unified teal) behind a single swap constant', () => {
    expect(WORDMARK_COLOR_VARIANT).toBe('unified');
    expect(brandMarkSource).toMatch(
      /export const WORDMARK_COLOR_VARIANT:\s*'unified'\s*\|\s*'split'\s*=\s*'unified'/,
    );
    expect(brandMarkSource).toContain(
      'text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]',
    );
    expect(brandMarkSource).toContain('text-foreground');
    expect(brandMarkSource).not.toContain('text-brand-400');
  });

  it('exposes Signal teal as a CSS token matching the waitlist primary CTA', () => {
    expect(customStyle).toMatch(/--signal-accent:\s*#3ee0d8/i);
    expect(signalTheme.accent).toBe('#3EE0D8');
    expect(brandVisual.og.foreground).toBe(signalTheme.accent);
  });
});
