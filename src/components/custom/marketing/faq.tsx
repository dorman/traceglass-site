// @polsia:user-owned — FAQ section (static fallback; live home uses CMS renderer).
import Link from 'next/link';

const items = [
  {
    q: 'Does it upload my logs?',
    a: 'No. Triage is designed to run on your machine. Your log file stays local.',
  },
  {
    q: 'Does it find the root cause?',
    a: 'No. It shows a first error candidate and the evidence around it. You decide what it means.',
  },
  {
    q: 'Which logs work?',
    a: 'GitHub Actions logs and zips in v1. Other formats are not promised.',
  },
  {
    q: 'How is it different from searching the log?',
    a: 'It folds repeated setup noise, jumps to the first error candidate, and compares with a green run you provide.',
  },
  {
    q: 'How does the last-green comparison work offline?',
    a: 'You supply the passing log file. TraceGlass compares it with the failed log locally.',
  },
  {
    q: 'How do I get access?',
    a: "Join the waitlist to hear when it's ready.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="section">
      <div className="container-page grid gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:gap-16">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
            FAQ
          </span>
          <h2 className="text-balance text-h2 font-display text-foreground max-md:max-w-[20ch] max-md:text-[1.65rem] max-md:leading-snug md:max-w-xl">
            Questions developers and on-call engineers ask first.
          </h2>
          <p className="text-body-lg text-muted-foreground">
            If yours isn&apos;t here,{' '}
            <Link
              href="/contact"
              className="font-medium text-[color:var(--signal-accent-strong)] underline-offset-4 hover:underline dark:text-[color:var(--signal-accent)]"
            >
              write to us
            </Link>
            .
          </p>
        </div>
        <div>
          {items.map((item) => (
            <details key={item.q} className="border-b border-border/60 py-5">
              <summary className="cursor-pointer font-semibold text-foreground">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground/80">
            TraceGlass is not affiliated with GitHub. GitHub Actions is used only to name the log
            format.
          </p>
        </div>
      </div>
    </section>
  );
}
