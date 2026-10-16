// @polsia:user-owned
'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { HeadlineVariant } from '@/lib/waitlist/schema';
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

const HEADLINE_VARIANT_KEY = 'tg_headline_variant';
export const CONSENT_REQUIRED = 'Please tick the box to join the waitlist.';
export const WAITLIST_FORM_ERROR =
  'Something went wrong. Please try again in a moment.';

/** Default inline success body (heading is always "You're on the list."). */
export const WAITLIST_SUCCESS_BODY =
  "We'll send one email when TraceGlass is publicly available. We only keep your email for that note.";

export const WAITLIST_CONSENT_LABEL =
  'I agree that TraceGlass may email me once when it publicly launches. Signing up does not start a subscription. My email is never shared.';

function readHeadlineVariant(): HeadlineVariant {
  if (typeof window === 'undefined') return 'A';
  try {
    const stored = window.localStorage.getItem(HEADLINE_VARIANT_KEY);
    if (stored === 'A' || stored === 'B') return stored;
    const next: HeadlineVariant = Math.random() < 0.5 ? 'A' : 'B';
    window.localStorage.setItem(HEADLINE_VARIANT_KEY, next);
    return next;
  } catch {
    return 'A';
  }
}

export type WaitlistFormProps = {
  /** Prefix form control ids when more than one form can mount (page + dialog). */
  idPrefix?: string;
  consentLabel?: string;
  successMessage?: string;
  submitLabel?: string;
  /** Extra note rendered under the submit button (dialog trust line). */
  footerNote?: string;
  onSuccess?: () => void;
};

// Composes the template's base shadcn primitives (Button/Input/Label) styled
// through the theme tokens. Restyle via the brand_tokens slot + cva variants,
// or pull more primitives with `npx shadcn add` and compose them.
export function WaitlistForm({
  idPrefix,
  consentLabel = WAITLIST_CONSENT_LABEL,
  successMessage = WAITLIST_SUCCESS_BODY,
  submitLabel = 'Notify me when available',
  footerNote,
  onSuccess,
}: WaitlistFormProps = {}) {
  const reactId = useId();
  const prefix = idPrefix ?? reactId.replace(/:/g, '');
  const emailId = `waitlist-email-${prefix}`;
  const consentId = `waitlist-consent-${prefix}`;
  const companyId = `waitlist-company-${prefix}`;
  const consentErrorId = `waitlist-consent-error-${prefix}`;
  const formErrorId = `waitlist-form-error-${prefix}`;

  // Consent must start (and stay until the user acts) unchecked — never default-checked.
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [headlineVariant, setHeadlineVariant] = useState<HeadlineVariant>('A');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setHeadlineVariant(readHeadlineVariant());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setFormError(undefined);
      setErrors({ consent: CONSENT_REQUIRED });
      return;
    }
    setPending(true);
    setErrors({});
    setFormError(undefined);
    // apiFetch resolves on 2xx and throws on non-2xx with the parsed body on
    // `error.cause` — so the route's { errors: { email } } (400/409/503) is readable.
    try {
      await apiFetch('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          email,
          consent,
          company,
          headlineVariant,
        }),
      });
      setOk(true);
      // Inline success state is enough — no toast that repeats the heading.
      onSuccess?.();
    } catch (err) {
      const cause = (err as { cause?: { errors?: { email?: string; consent?: string } } }).cause;
      const fieldErrors = cause?.errors ?? {};
      const next: { email?: string; consent?: string } = {};
      if (fieldErrors.email) next.email = fieldErrors.email;
      if (fieldErrors.consent) next.consent = fieldErrors.consent;
      setErrors(next);
      if (!next.email && !next.consent) {
        setFormError(WAITLIST_FORM_ERROR);
      }
    } finally {
      setPending(false);
    }
  }

  if (ok) {
    return (
      <output
        className="flex flex-col items-start gap-3 rounded-lg border border-[color:var(--signal-accent)]/40 bg-[color:var(--signal-accent)]/10 p-5"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="size-5 text-[color:var(--signal-accent)]" />
          <p className="text-base font-semibold text-foreground">You&apos;re on the list.</p>
        </div>
        <p className="text-sm text-muted-foreground">{successMessage}</p>
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor={emailId}>Email address</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={errors.email ? true : undefined}
          autoComplete="email"
        />
        {errors.email ? (
          <p className="text-sm font-medium text-red-400" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      {/* Honeypot — hidden from users; bots that fill it get a fake success. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <Label htmlFor={companyId}>Company</Label>
        <Input
          id={companyId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id={consentId}
            name="consent"
            checked={consent}
            onCheckedChange={(state) => {
              const next = state === true;
              setConsent(next);
              if (next) {
                setErrors((prev) => ({ ...prev, consent: undefined }));
              }
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrorId : undefined}
            className="mt-0.5"
          />
          <Label
            htmlFor={consentId}
            className="cursor-pointer text-sm font-normal leading-snug text-foreground"
          >
            {consentLabel}
          </Label>
        </div>
        {errors.consent ? (
          <p id={consentErrorId} className="text-sm font-medium text-red-400" role="alert">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className={cn('w-full font-semibold', WAITLIST_PRIMARY_BUTTON_CLASS)}
        onClick={(event) => {
          if (!consent) {
            event.preventDefault();
            setFormError(undefined);
            setErrors((prev) => ({ ...prev, consent: CONSENT_REQUIRED }));
          }
        }}
      >
        {pending ? 'Sending request…' : submitLabel}
      </Button>

      {formError ? (
        <p
          id={formErrorId}
          className="rounded-md border border-red-500/50 bg-red-950/60 px-3 py-2 text-sm font-medium text-red-200"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      {footerNote ? (
        <p className="text-sm font-medium text-[color:var(--signal-accent)]">{footerNote}</p>
      ) : null}
    </form>
  );
}
