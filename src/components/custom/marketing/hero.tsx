// @polsia:user-owned — Hero section for the TraceGlass marketing page.
// Server Component. No data fetching; copy is static.
// Prefer the CMS HeroSection in marketing-page-renderer for the live home page.

'use client';

import Link from 'next/link';
import { SampleLogDemo } from '@/components/custom/marketing/sample-log-demo';
import { WaitlistForm } from '@/components/custom/waitlist-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[60vh] bg-gradient-to-b from-[color:var(--signal-accent)]/10 via-background to-background dark:from-[color:var(--signal-accent)]/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.04)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255,255,255,0.05)_1px,transparent_1px)]" />
      </div>

      <div className="container-page grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="flex flex-col gap-7">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-[color:var(--signal-accent)]/60 bg-background/60 px-3 py-1 text-eyebrow text-[color:var(--signal-accent-strong)] dark:border-[color:var(--signal-accent)]/50 dark:text-[color:var(--signal-accent)]"
          >
            <span className="size-1.5 rounded-full bg-[color:var(--signal-accent)]" />
            Local-first CI log triage
          </Badge>

          <h1 className="text-display font-display text-balance text-foreground">
            Start at the first error candidate.
          </h1>

          <p className="max-w-xl text-balance text-body-lg text-muted-foreground">
            Open a failed GitHub Actions log offline. Jump to the first error candidate, fold the
            setup noise, compare with your last green run. Join the waitlist to hear when it&apos;s
            ready.
          </p>

          <div className="max-w-md rounded-md border border-[color:var(--signal-accent)]/30 bg-card/80 p-4 shadow-lg shadow-black/20 sm:p-5">
            <WaitlistForm idPrefix="static-hero" submitLabel="Join the waitlist" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost" size="lg" className="h-11 px-5 text-sm font-semibold">
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:max-w-md">
            <div className="flex flex-col gap-0.5">
              <span className="text-h4 font-semibold text-foreground">100%</span>
              <span className="text-caption">runs locally</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-h4 font-semibold text-foreground">0</span>
              <span className="text-caption">log bytes uploaded</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-[color:var(--signal-accent)]/15 via-transparent to-transparent blur-2xl dark:from-[color:var(--signal-accent)]/20"
          />
          <SampleLogDemo className="signal-tui--hero min-h-[22rem] w-full min-w-0 shadow-xl shadow-black/40 sm:min-h-[26rem]" />
        </div>
      </div>
    </section>
  );
}
