// @polsia:user-owned — shared waitlist dialog for nav + marketing CTAs.
'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

/** Marketing href that opens the shared waitlist dialog instead of navigating. */
export const JOIN_WAITLIST_HREF = '#join-waitlist';

type WaitlistDialogContextValue = {
  open: boolean;
  openWaitlist: (trigger?: HTMLElement | null) => void;
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

function clearJoinWaitlistHash() {
  if (typeof window === 'undefined') return;
  if (!isJoinWaitlistHref(window.location.hash)) return;
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', url);
}

export function WaitlistDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openWaitlist = useCallback((trigger?: HTMLElement | null) => {
    const active =
      trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    triggerRef.current = active;
    setOpen(true);
  }, []);

  const closeWaitlist = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      clearJoinWaitlistHash();
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger) {
        requestAnimationFrame(() => {
          trigger.focus();
        });
      }
    }
  }, []);

  // Deep-link from static /demo (and other pages): /#join-waitlist opens this dialog.
  useEffect(() => {
    const syncFromHash = () => {
      if (isJoinWaitlistHref(window.location.hash)) {
        openWaitlist();
        clearJoinWaitlistHash();
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [openWaitlist]);

  const value = useMemo(
    () => ({ open, openWaitlist, closeWaitlist }),
    [open, openWaitlist, closeWaitlist],
  );

  return (
    <WaitlistDialogContext.Provider value={value}>
      {children}
      <WaitlistDialog open={open} onOpenChange={handleOpenChange} />
    </WaitlistDialogContext.Provider>
  );
}

export function JoinWaitlistButton({
  children = 'Join the waitlist',
  className,
  variant = 'default',
  size = 'lg',
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const dialog = useOptionalWaitlistDialog();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(WAITLIST_PRIMARY_BUTTON_CLASS, className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        dialog?.openWaitlist(event.currentTarget);
      }}
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
  // Remount the form on every open so consent resets to unchecked after close/reopen.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setFormKey((key) => key + 1);
  }, [open]);

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
          <p className="text-eyebrow font-mono text-[#3EE0D8]">PUBLIC LAUNCH · MID-NOVEMBER 2026</p>
          <DialogTitle className="font-display text-h3 text-balance text-zinc-50">
            Get one email when TraceGlass launches
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-zinc-400 sm:text-[0.95rem]">
            TraceGlass is a local-first log triage tool. We&apos;re gauging interest ahead of a
            public launch around mid-November, and we&apos;ll email you once when it ships. No early
            access, no newsletter, and your email is never shared.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
          <WaitlistForm
            key={formKey}
            idPrefix="dialog"
            consentLabel="I agree that TraceGlass may email me once when it publicly launches. My email is only used for that note and is never shared."
            submitLabel="Join the waitlist"
            footerNote="Your logs are never uploaded."
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
