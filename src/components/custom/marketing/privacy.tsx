// @polsia:user-owned — Privacy block (static fallback; live home uses CMS renderer).
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const points = ['No upload', 'No account', 'Works offline'] as const;

export function Privacy() {
  return (
    <section id="privacy" className="section">
      <div className="container-page">
        <Card className="site-design-card mx-auto max-w-3xl border-[color:var(--signal-accent)]/40 bg-gradient-to-br from-[color:var(--signal-accent)]/20 via-background to-background">
          <CardHeader className="gap-4 p-8">
            <CardTitle className="text-h2 font-display">Your logs never leave your machine.</CardTitle>
            <CardDescription className="text-body-lg">
              Reading a log happens on your machine: no upload and no account.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-3">
              {points.map((point) => (
                <div
                  key={point}
                  className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium"
                >
                  {point}
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
