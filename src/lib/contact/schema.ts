// @polsia:user-owned
//
// Shared zod schema for the public contact form. Safe to import from a
// 'use client' file: no server-only imports.

import { z } from 'zod';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Contact topics written to the Notion select property. */
export const CONTACT_TOPICS = [
  'General question',
  'Support',
  'Security report',
  'Press',
  'Partnerships',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Max message length accepted by the form / API (before Notion truncation). */
export const CONTACT_MESSAGE_MAX = 4_000;

/** Notion rich_text text.content limit per object. */
export const NOTION_RICH_TEXT_MAX = 2_000;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .max(200, 'Name is too long.')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .max(254, 'Enter a valid email address.')
    .refine((value) => EMAIL_RE.test(value), 'Please enter a valid email address.'),
  topic: z.enum(CONTACT_TOPICS, {
    errorMap: () => ({ message: 'Please choose a topic.' }),
  }),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required.')
    .max(CONTACT_MESSAGE_MAX, `Message must be ${CONTACT_MESSAGE_MAX} characters or fewer.`),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you want us to receive this message.' }),
  }),
});

export type ContactInput = z.infer<typeof contactSchema>;
