// @polsia:user-owned — seeded by polsia/modules/better-auth; restyle freely.
'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';

export function AuthNav() {
  const { data: session, isPending } = useSession();

  // Render nothing until the session resolves — avoids a flash of auth chrome.
  if (isPending) return null;

  // Anonymous marketing nav: no Sign in / Sign up (Notify me is the only CTA).
  if (!session?.user) return null;

  return (
    <nav className="flex items-center gap-2" aria-label="Account">
      <Button asChild variant="ghost">
        <a href="/profile">Profile</a>
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          await signOut();
          window.location.assign('/');
        }}
      >
        Sign out
      </Button>
    </nav>
  );
}
