// @polsia:user-owned — About page body for TraceGlass (no bios, no GitHub).
import Link from 'next/link';
import { JoinWaitlistButton } from '@/components/custom/waitlist-dialog';
import { Button } from '@/components/ui/button';
import { signalTheme } from '@/lib/signal-theme';
import { cn } from '@/lib/utils';
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

const principles = [
  {
    title: 'Local-first',
    body: 'Open a failed GitHub Actions log on your machine. Source lines stay on disk — nothing is uploaded for triage.',
  },
  {
    title: 'Privacy-first',
    // Product/CLI intent. Site may load optional PolsiaAnalytics when
    // POLSIA_ANALYTICS_SLUG is set — do not claim this marketing site has no analytics.
    body: 'No upload and no account required to triage a log.',
  },
  {
    title: 'Verified installs',
    body: "Installers will be signed and verified before they run. They'll be published when TraceGlass publicly launches.",
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
          <p className="text-eyebrow font-mono" style={{ color: signalTheme.accent }}>
            ABOUT · TRACEGLASS
          </p>
          <h1 className="mt-3 font-display text-display text-balance break-words text-zinc-50">
            Local-first CI log triage.
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-zinc-400">
            TraceGlass helps developers and on-call engineers start at the first error candidate in a
            failed GitHub Actions log — without sending files off-machine.
          </p>
        </div>
      </header>

      <section className="section border-b border-zinc-800/80">
        <div className="container-page max-w-3xl flex flex-col gap-5">
          <h2 className="font-display text-h2 text-balance text-zinc-50">What it is</h2>
          <p className="text-body-lg leading-relaxed text-zinc-400">
            TraceGlass is local-first CI log triage. Open a failed Actions log or zip offline, jump
            to the first error candidate with evidence, fold setup noise, and compare with a last
            green run you provide.
          </p>
          <p className="text-body-lg leading-relaxed text-zinc-400">
            Your logs are processed on your machine and never uploaded.
          </p>
        </div>
      </section>

      <section className="section border-b border-zinc-800/80">
        <div className="container-page max-w-3xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-h2 text-balance text-zinc-50">Why it exists</h2>
            <p className="text-body-lg leading-relaxed text-zinc-400">
              Red builds already dump thousands of setup lines before the real failure. TraceGlass
              exists to make that review faster without asking anyone to trust a cloud inbox with CI
              logs.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {principles.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-2 border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-zinc-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400 sm:text-[0.9375rem]">
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
            <p className="text-eyebrow font-mono" style={{ color: signalTheme.accent }}>
              WAITLIST
            </p>
            <h2 className="font-display text-h2 text-balance text-zinc-50">Join the waitlist</h2>
            <p className="text-body-lg leading-relaxed text-zinc-400">
              Join the waitlist to hear when TraceGlass is ready for developers and on-call engineers
              — no newsletter, and your email is never shared.
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
