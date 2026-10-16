// @polsia:user-owned — Features section (static fallback; live home uses CMS renderer).
import { FileDown, FolderOpen, FoldVertical, GitCompare, ListChecks } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const items = [
  {
    title: 'Open offline',
    body: 'Open a failed log file or the zip GitHub gives you. Nothing is uploaded for triage.',
    icon: FolderOpen,
  },
  {
    title: 'First error candidate',
    body: 'Jump to the earliest line that looks like a failure, with the lines around it as evidence.',
    icon: ListChecks,
  },
  {
    title: 'Fold the noise',
    body: 'Repeated setup and install steps collapse, and you can expand them.',
    icon: FoldVertical,
  },
  {
    title: 'Compare with last green',
    body: 'Load a passing log you provide and see what changed.',
    icon: GitCompare,
  },
  {
    title: 'Short Markdown summary',
    body: 'Export the candidate and its evidence for an issue or Slack.',
    icon: FileDown,
  },
] as const;

export function Features() {
  return (
    <section id="features" className="section">
      <div className="container-page flex flex-col gap-10">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
            Features
          </span>
          <h2 className="text-h2 font-display text-balance text-foreground">
            Built for whoever gets the red build.
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Starting with GitHub Actions logs. Five steps from a red build to a short summary you
            can paste into an issue or Slack.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <Card key={item.title} className="site-design-card lift border-border/60 bg-card/70">
              <CardHeader className="gap-3">
                <div
                  className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-[color:var(--signal-accent)]/10 text-[color:var(--signal-accent)]"
                  aria-hidden="true"
                >
                  <item.icon className="size-4" />
                </div>
                <CardTitle className="text-h4">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
