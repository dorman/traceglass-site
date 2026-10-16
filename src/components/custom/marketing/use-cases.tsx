// @polsia:user-owned — static fallback "Built for" cards (home CMS no longer mounts this).
// Kept CI-focused so unused fallback copy cannot reintroduce retired audience wording.

import { Terminal } from '@/components/custom/terminal';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const useCases = [
  {
    id: 'actions-failed',
    label: 'Failed Actions log',
    description:
      'Open a failed GitHub Actions log offline and jump straight to the first error candidate.',
    title: 'ci-failed.log',
    prompt: '$ traceglass ci-failed.log',
    lines: [
      { tone: 'muted', text: '▸ Set up job (14 lines)' },
      { tone: 'muted', text: '▸ Run actions/checkout@v4 (8 lines)' },
      { tone: 'error', text: 'Error: Process completed with exit code 1' },
    ],
    tailNote: '1 candidate · press E to jump',
  },
  {
    id: 'actions-zip',
    label: 'Actions zip download',
    description: 'Open the zip GitHub gives you for a failed run without uploading anything.',
    title: 'logs_123.zip',
    prompt: '$ traceglass logs_123.zip',
    lines: [
      { tone: 'muted', text: 'opened 4 file(s)' },
      { tone: 'plain', text: 'jump → first error candidate' },
    ],
    tailNote: 'offline · no upload',
  },
  {
    id: 'last-green',
    label: 'Last green compare',
    description: 'Load a passing log you provide and see what changed between green and red.',
    title: 'ci-green.log',
    prompt: '$ traceglass --compare ci-green.log ci-failed.log',
    lines: [
      { tone: 'plain', text: 'compare · last green you provided' },
      { tone: 'info', text: 'setup steps folded on both sides' },
    ],
    tailNote: 'diff stays local',
  },
] as const;

export function UseCases() {
  return (
    <section id="starting-with" className="section border-y border-border/50 bg-muted/20">
      <div className="container-page flex flex-col gap-10">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
            Starting with
          </span>
          <h2 className="text-h2 font-display text-balance text-foreground">
            GitHub Actions logs.
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Failed logs and zips in v1. Other formats are not promised.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <Card key={item.id} className="site-design-card overflow-hidden border-border/60">
              <CardHeader>
                <CardTitle className="text-h4 font-display">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <Terminal title={item.title} prompt={item.prompt}>
                  <code>
                    {item.lines.map((line, index) => (
                      <span key={`${item.id}-${index}`} className="block whitespace-pre">
                        {line.text}
                      </span>
                    ))}
                    <span className="mt-2 block whitespace-pre text-muted-foreground">
                      {item.tailNote}
                    </span>
                  </code>
                </Terminal>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
