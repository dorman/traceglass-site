// @polsia:user-owned — public contact form (Notion-backed via POST /api/contact).
'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api-client';
import { CONTACT_MESSAGE_MAX, CONTACT_TOPICS, type ContactTopic } from '@/lib/contact/schema';
import { cn } from '@/lib/utils';
import { WAITLIST_PRIMARY_BUTTON_CLASS } from '@/lib/waitlist/ui';

type FieldErrors = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  form?: string;
};

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function ContactForm() {
  const reactId = useId();
  const prefix = reactId.replace(/:/g, '');
  const nameId = `contact-name-${prefix}`;
  const emailId = `contact-email-${prefix}`;
  const topicId = `contact-topic-${prefix}`;
  const messageId = `contact-message-${prefix}`;
  const companyId = `contact-company-${prefix}`;
  const statusId = `contact-status-${prefix}`;
  const successRef = useRef<HTMLOutputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<ContactTopic | ''>('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ok) return;
    successRef.current?.focus();
  }, [ok]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(trimmedEmail)) next.email = 'Please enter a valid email address.';
    if (!topic) next.topic = 'Please choose a topic.';
    if (!message.trim()) next.message = 'Message is required.';
    else if (message.trim().length > CONTACT_MESSAGE_MAX) {
      next.message = `Message must be ${CONTACT_MESSAGE_MAX} characters or fewer.`;
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setPending(true);
    setErrors({});
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: trimmedEmail,
          topic,
          message,
          // Consent is implied by submitting; the API always treats it as true.
          consent: true,
          company,
        }),
      });
      setOk(true);
    } catch (err) {
      const cause = (err as { cause?: { errors?: FieldErrors } }).cause;
      const fieldErrors = cause?.errors ?? {};
      const mapped: FieldErrors = {};
      for (const key of ['name', 'email', 'topic', 'message', 'form'] as const) {
        if (fieldErrors[key]) mapped[key] = fieldErrors[key];
      }
      if (Object.keys(mapped).length === 0) {
        mapped.form = 'Something went wrong. Please try again.';
      }
      setErrors(mapped);
    } finally {
      setPending(false);
    }
  }

  if (ok) {
    return (
      <output
        ref={successRef}
        id={statusId}
        tabIndex={-1}
        data-contact-status="success"
        className="flex scroll-mt-20 flex-col items-start gap-3 rounded-md border border-border bg-muted/40 p-5 outline-none sm:p-5 dark:bg-muted/20"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2
            aria-hidden="true"
            className="size-5 text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]"
          />
          <p className="text-base font-semibold text-foreground">Message sent.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Thanks — we received your note and will reply by email when we can.
        </p>
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5" noValidate>
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground dark:bg-muted/20">
        Please don&apos;t paste logs or sensitive data into this form.
      </p>

      <div className="grid gap-2">
        <Label htmlFor={nameId}>
          Name <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email ? (
          <p
            data-contact-status="error"
            className="scroll-mt-20 text-sm text-destructive"
            role="alert"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={topicId}>Topic</Label>
        <Select
          value={topic || undefined}
          onValueChange={(value) => {
            setTopic(value as ContactTopic);
            setErrors((prev) => ({ ...prev, topic: undefined }));
          }}
        >
          <SelectTrigger
            id={topicId}
            aria-invalid={errors.topic ? true : undefined}
            className="w-full"
          >
            <SelectValue placeholder="Choose a topic" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_TOPICS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.topic ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={messageId}>Message</Label>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {message.length}/{CONTACT_MESSAGE_MAX}
          </span>
        </div>
        <Textarea
          id={messageId}
          name="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={CONTACT_MESSAGE_MAX}
          required
          aria-invalid={errors.message ? true : undefined}
          className="min-h-[8rem] resize-y"
        />
        {errors.message ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.message}
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

      {errors.form ? (
        <p id={statusId} className="text-sm text-destructive" role="alert" aria-live="assertive">
          {errors.form}
        </p>
      ) : (
        <p id={statusId} className="sr-only" aria-live="polite" />
      )}

      <Button
        type="submit"
        disabled={pending}
        className={cn(
          'w-full font-semibold sm:w-auto sm:min-w-[12rem]',
          WAITLIST_PRIMARY_BUTTON_CLASS,
        )}
      >
        {pending ? 'Sending…' : 'Send message'}
      </Button>
      <p className="text-sm text-muted-foreground">
        We&apos;ll only use your email to reply to this message.
      </p>
    </form>
  );
}
