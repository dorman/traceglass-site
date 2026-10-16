// @polsia:user-owned — About page body for TraceGlass (no bios, no GitHub).
import Link from 'next/link';
import { JoinWaitlistButton } from '@/components/custom/waitlist-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

const principles = [
  {
    title: 'Local-first',
    body: 'A Rust engine processes logs on your machine. Source lines stay on disk — nothing is uploaded for triage.',
  },
  {
    title: 'Privacy-first',
    // Product/CLI only (TRUST.md + home privacy/FAQ). Site may load optional PolsiaAnalytics when
    // POLSIA_ANALYTICS_SLUG is set — do not claim this marketing site has no analytics.
    body: 'No accounts, no telemetry, nothing phoning home.',
  },
  {
    title: 'Verified installs',
    // Aligned with install-catalog: Ed25519 signing planned; artifacts unpublished until launch.
    body: "Installers will be signed and verified before they run. They'll be published at public launch.",
  },
  {
    title: 'MIT licensed',
    body: 'TraceGlass is released under the MIT license. Copyright (c) 2026 TraceGlass.',
  },
] as const;

export function AboutContent() {
  return (
    <article className="site-design-page min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-background py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <p className="text-eyebrow font-mono text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
            ABOUT · TRACEGLASS
          </p>
          <h1 className="mt-3 font-display text-display text-balance break-words text-foreground">
            Local-first log triage.
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            TraceGlass ranks signals in diagnostic logs so support specialists can find what matters
            without sending files off-machine.
          </p>
        </div>
      </header>

      <section className="section border-b border-border/80">
        <div className="container-page max-w-3xl flex flex-col gap-5">
          <h2 className="font-display text-h2 text-balance text-foreground">What it is</h2>
          <p className="text-body-lg leading-relaxed text-muted-foreground">
            TraceGlass is a local-first log triage tool. Open a diagnostic collection or pipe a
            stream through a Rust engine that keeps source lines visible while it ranks signals —
            built for support specialists.
          </p>
          <p className="text-body-lg leading-relaxed text-muted-foreground">
            Your logs are processed on your machine and never uploaded.
          </p>
        </div>
      </section>

      <section className="section border-b border-border/80">
        <div className="container-page max-w-3xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-h2 text-balance text-foreground">Why it exists</h2>
            <p className="text-body-lg leading-relaxed text-muted-foreground">
              Support work already lives in large, messy diagnostics. TraceGlass exists to make that
              review faster without asking anyone to trust a cloud inbox with customer logs.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {principles.map((item) => (
              <li
                key={item.title}
                className="site-design-card flex flex-col gap-2 border border-border bg-card p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-card-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-eyebrow font-mono text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
              PUBLIC LAUNCH · MID-NOVEMBER 2026
            </p>
            <h2 className="font-display text-h2 text-balance text-foreground">When it launches</h2>
            <p className="text-body-lg leading-relaxed text-muted-foreground">
              TraceGlass is preparing for a public launch around mid-November 2026. Join the
              waitlist for one email when it ships — no newsletter, and your email is never shared.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <JoinWaitlistButton
              className={cn('h-11 px-6 text-sm font-semibold', WAITLIST_PRIMARY_BUTTON_CLASS)}
            >
              Join the waitlist
            </JoinWaitlistButton>
            <Button asChild variant="ghost" size="lg" className="h-11 px-5 text-sm font-semibold">
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
