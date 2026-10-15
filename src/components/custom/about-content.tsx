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
    body: 'The product trust line is simple: 0 log bytes uploaded. No remote processing, no silent telemetry from the tool.',
  },
  {
    title: 'Signed releases',
    body: 'Public releases ship with published checksums so you can verify what you install before you open a diagnostic file.',
  },
  {
    title: 'MIT licensed',
    body: 'TraceGlass is released under the MIT license. Copyright (c) 2026 TraceGlass.',
  },
] as const;

export function AboutContent() {
  return (
    <article className="site-design-page dark min-h-full bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950 py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <p className="text-eyebrow font-mono text-[#3EE0D8]">ABOUT · TRACEGLASS</p>
          <h1 className="mt-3 font-display text-display text-balance text-zinc-50">
            Local-first log triage for L2 support.
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-zinc-400">
            TraceGlass ranks signals in diagnostic logs so support specialists can find what matters
            without sending files off-machine.
          </p>
        </div>
      </header>

      <section className="section border-b border-zinc-800/80">
        <div className="container-page max-w-3xl flex flex-col gap-5">
          <h2 className="font-display text-h2 text-balance text-zinc-50">What it is</h2>
          <p className="text-body-lg leading-relaxed text-zinc-400">
            TraceGlass is a local-first log triage tool. Open a diagnostic collection or pipe a
            stream through a Rust engine that keeps source lines visible while it ranks signals —
            built for L2 support specialists, not developers writing the systems under review.
          </p>
          <p className="text-body-lg leading-relaxed text-zinc-400">
            Logs are processed on the user&apos;s machine and never uploaded. The site&apos;s trust
            line is <span className="font-semibold text-[#3EE0D8]">0 log bytes uploaded</span>.
          </p>
        </div>
      </section>

      <section className="section border-b border-zinc-800/80">
        <div className="container-page max-w-3xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-h2 text-balance text-zinc-50">Why it exists</h2>
            <p className="text-body-lg leading-relaxed text-zinc-400">
              Support work already lives in large, messy diagnostics. TraceGlass exists to make that
              review faster without asking anyone to trust a cloud inbox with customer logs.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {principles.map((item) => (
              <li key={item.title} className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
                <h3 className="text-base font-semibold text-zinc-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-eyebrow font-mono text-[#8B7CF6]">
              PUBLIC LAUNCH · MID-NOVEMBER 2026
            </p>
            <h2 className="font-display text-h2 text-balance text-zinc-50">Where it&apos;s at</h2>
            <p className="text-body-lg leading-relaxed text-zinc-400">
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
