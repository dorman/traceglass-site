// @polsia:user-owned — Privacy callout section.
// Server Component. Single centered card with the local-only positioning.

import { Lock, ShieldCheck } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Privacy() {
  return (
    <section id="privacy" className="section">
      <div className="container-page flex justify-center">
        <Card className="relative w-full max-w-3xl overflow-hidden border-[color:var(--signal-accent)]/30 bg-gradient-to-br from-[color:var(--signal-accent)]/10 via-background to-background dark:border-[color:var(--signal-accent)]/25 dark:from-[color:var(--signal-accent)]/15">
          <span
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-64 rounded-full bg-[color:var(--signal-accent)]/20 blur-3xl dark:bg-[color:var(--signal-accent)]/15"
          />
          <CardHeader className="relative gap-4 p-8 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-xl border border-[color:var(--signal-accent)]/40 bg-background/80 text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
              <Lock aria-hidden="true" className="size-6" />
            </div>
            <CardTitle className="text-h2 font-display text-balance">
              Nothing leaves your machine.
            </CardTitle>
            <CardDescription className="max-w-2xl text-body-lg text-muted-foreground">
              TraceGlass is a local CLI. Your log content, your stack traces, your PII — all of it
              stays in the pipe between the source command and your terminal. There is no hosted
              backend, no analytics, no opt-in telemetry. Even crash reports are written locally.
            </CardDescription>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: 'No network calls' },
                { icon: Lock, label: 'No cloud dashboard' },
                { icon: ShieldCheck, label: 'No telemetry' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium text-foreground/80"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]"
                  />
                  {label}
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
