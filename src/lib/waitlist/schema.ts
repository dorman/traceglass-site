// @polsia:user-owned
//
// Shared zod schema for the waitlist email + explicit consent. Safe to import
// from a 'use client' file: it has no server-only imports, so the client form
// can reuse the input TYPE without pulling in the route handler or Notion helpers.

import { z } from 'zod';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .max(254, 'Enter a valid email address.')
    .refine((value) => EMAIL_RE.test(value), 'Please enter a valid email address.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you want launch updates.' }),
  }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

/** Sticky A/B assignment stored with each Notion waitlist row. */
export type HeadlineVariant = 'A' | 'B';
