import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { __sampleLogDemoTest } from '@/components/custom/marketing/sample-log-demo';
import { getDefaultMarketingPageContent } from '@/lib/marketing-page-content';

const sampleLogDemoSource = readFileSync(
  'src/components/custom/marketing/sample-log-demo.tsx',
  'utf8',
);

describe('SampleLogDemo data', () => {
  it('shows a failed Actions log with folded setup groups and a first error candidate', () => {
    const { ROWS } = __sampleLogDemoTest;
    const folds = ROWS.filter((row) => row.kind === 'fold');
    const candidate = ROWS.find((row) => row.kind === 'line' && row.candidate);

    expect(folds.length).toBeGreaterThanOrEqual(2);
    expect(folds.some((row) => row.kind === 'fold' && row.label.includes('Set up job'))).toBe(true);
    expect(candidate).toBeDefined();
    if (candidate?.kind === 'line') {
      expect(candidate.text.toLowerCase()).toContain('error');
    }
    expect(sampleLogDemoSource).toContain('1 first error candidate - press n to jump');
    expect(sampleLogDemoSource).toContain('ci-failed.log');
    expect(sampleLogDemoSource.toLowerCase()).not.toContain('root cause of cascading');
  });

  it('keeps hero terminal copy aligned with the Actions triage status line', () => {
    const home = getDefaultMarketingPageContent('home');
    const hero = home.sections.find((section) => section.id === 'hero');
    const terminal = hero?.data.terminal as { lines?: string[] } | undefined;
    expect(terminal?.lines).toEqual([
      'TraceGlass · ci-failed.log · github-actions',
      '1 first error candidate - press n to jump',
    ]);
    expect(hero?.assets ?? []).toEqual([]);
  });
});

describe('Hero mobile stacking contract', () => {
  it('marks hero copy before the terminal so mobile order stays copy → CTA → terminal', () => {
    const renderer = readFileSync(
      'src/components/custom/marketing/marketing-page-renderer.tsx',
      'utf8',
    );
    expect(renderer).toContain('data-hero-copy');
    expect(renderer).toContain('data-hero-terminal');
    expect(renderer.indexOf('data-hero-copy')).toBeLessThan(renderer.indexOf('data-hero-terminal'));
  });
});
