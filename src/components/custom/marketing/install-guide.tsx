// @polsia:user-owned — public install surface while the engine repo is private.
'use client';

import Link from 'next/link';
import { JoinWaitlistButton } from '@/components/custom/waitlist-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

export function InstallGuide() {
  return (
    <section className="mt-10 flex flex-col gap-8">
      <Card className="site-design-card border-[#2B3040] bg-zinc-950/80">
        <CardHeader className="gap-4">
          <Badge
            variant="outline"
            className="w-fit border-[color:var(--signal-accent)]/50 px-3 py-1 text-eyebrow text-[color:var(--signal-accent)]"
          >
            Coming soon
          </Badge>
          <CardTitle className="font-display text-h2 text-balance">
            Installers are not available yet.
          </CardTitle>
          <CardDescription className="max-w-2xl text-body-lg text-muted-foreground">
            TraceGlass is local-first CI log triage getting ready to publicly launch. Join the
            waitlist to hear when signed installers are available. Your email is only used for that
            note and is never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <JoinWaitlistButton
            className={cn('h-11 px-6 text-sm font-semibold', WAITLIST_PRIMARY_BUTTON_CLASS)}
          >
            Join the waitlist
          </JoinWaitlistButton>
          <Button asChild variant="ghost" size="lg" className="h-11 px-5 text-sm font-semibold">
            <Link href="/about">About TraceGlass</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
