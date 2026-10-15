import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brandVisual } from '@/lib/brand';
import { signalTheme } from '@/lib/signal-theme';

const css = readFileSync('src/app/custom-style.css', 'utf8');
const icon = readFileSync('src/app/icon.svg', 'utf8');

describe('Signal teal visitor accents', () => {
  it('wires site primary/accent and PWA chrome to Signal teal', () => {
    expect(css).toMatch(/--signal-accent:\s*#3ee0d8/i);
    expect(css).toContain('--site-primary: var(--signal-accent)');
    expect(css).toContain('--site-accent: var(--signal-accent-dim)');
    expect(brandVisual.themeColor).toBe(signalTheme.accent);
    expect(signalTheme.accent).toBe('#3EE0D8');
  });

  it('does not ship the former neon or muted greens on the favicon mark', () => {
    expect(css.toLowerCase()).not.toContain('#00f5b8');
    expect(icon.toLowerCase()).not.toContain('#00f5b8');
    expect(icon).not.toContain('fill="#158353"');
    expect(icon).toContain(`fill="${signalTheme.accent}"`);
  });
});
