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
            className="w-fit border-[#3EE0D8]/50 px-3 py-1 text-eyebrow text-[#3EE0D8]"
          >
            Coming soon · mid-November 2026
          </Badge>
          <CardTitle className="font-display text-h2 text-balance">
            Installers are not available yet.
          </CardTitle>
          <CardDescription className="max-w-2xl text-body-lg text-muted-foreground">
            TraceGlass is a local-first log triage tool getting ready for its public launch. We are
            collecting a waitlist to understand demand — not early access. We will email you once
            when signed installers are officially available. Your email is only used for that note
            and is never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <JoinWaitlistButton
            className={cn('h-11 px-6 text-sm font-semibold', WAITLIST_PRIMARY_BUTTON_CLASS)}
          >
            Join the waitlist
          </JoinWaitlistButton>
          <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm font-semibold">
            <Link href="/demo">Try the browser demo</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="h-11 px-5 text-sm font-semibold">
            <Link href="/release">Read release notes</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
