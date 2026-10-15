// @polsia:user-owned — shared waitlist dialog for nav + marketing CTAs.
'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { WaitlistForm } from '@/components/custom/waitlist-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Marketing href that opens the shared waitlist dialog instead of navigating. */
export const JOIN_WAITLIST_HREF = '#join-waitlist';

type WaitlistDialogContextValue = {
  open: boolean;
  openWaitlist: () => void;
  closeWaitlist: () => void;
};

const WaitlistDialogContext = createContext<WaitlistDialogContextValue | null>(null);

export function useWaitlistDialog(): WaitlistDialogContextValue {
  const value = useContext(WaitlistDialogContext);
  if (!value) {
    throw new Error('useWaitlistDialog must be used within WaitlistDialogProvider');
  }
  return value;
}

export function useOptionalWaitlistDialog(): WaitlistDialogContextValue | null {
  return useContext(WaitlistDialogContext);
}

export function isJoinWaitlistHref(href: string): boolean {
  return href === JOIN_WAITLIST_HREF || href === 'waitlist:' || href === '#waitlist';
}

export function WaitlistDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openWaitlist = useCallback(() => setOpen(true), []);
  const closeWaitlist = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openWaitlist, closeWaitlist }),
    [open, openWaitlist, closeWaitlist],
  );

  return (
    <WaitlistDialogContext.Provider value={value}>
      {children}
      <WaitlistDialog open={open} onOpenChange={setOpen} />
    </WaitlistDialogContext.Provider>
  );
}

export function JoinWaitlistButton({
  children = 'Join the waitlist',
  className,
  variant = 'default',
  size = 'lg',
  ...props
}: React.ComponentProps<typeof Button>) {
  const dialog = useOptionalWaitlistDialog();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => dialog?.openWaitlist()}
      {...props}
    >
      {children}
    </Button>
  );
}

function WaitlistDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Keep body scroll locked without horizontal overflow on narrow viewports.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'site-design-card dark max-h-[min(92vh,40rem)] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl shadow-black/50 sm:p-6',
          'border-[#2B3040] sm:rounded-lg',
        )}
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, rgba(62,224,216,0.12), transparent 55%), radial-gradient(100% 70% at 100% 0%, rgba(139,124,246,0.14), transparent 50%), #0F1117',
        }}
      >
        <DialogHeader className="gap-3 text-left">
          <p className="text-eyebrow font-mono text-[#3EE0D8]">Public launch · mid-November 2026</p>
          <DialogTitle className="font-display text-h3 text-balance text-zinc-50">
            Get one email when TraceGlass launches
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-zinc-400 sm:text-[0.95rem]">
            TraceGlass is a local-first log triage tool for support specialists who dig through
            noisy diagnostic files. We are getting ready for a public launch and collecting a
            waitlist to understand demand. This is not early access — we will email you once when
            TraceGlass officially releases, around mid-November. We only use your email for that
            launch note and will not share it.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
          <WaitlistForm
            idPrefix="dialog"
            consentLabel="I agree that TraceGlass may email me once when it publicly launches. My email is only used for that note and is never shared."
            successMessage="You're on the launch list. We'll send one email around mid-November when TraceGlass is publicly available. We only keep your email for that note."
            submitLabel="Join the waitlist"
            onSuccess={() => {
              // Keep the dialog open so the success state is visible.
            }}
          />
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">
          Prefer a full page?{' '}
          <a href="/waitlist" className="text-[#8B7CF6] underline-offset-2 hover:underline">
            Open the waitlist page
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
