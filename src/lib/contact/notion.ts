// @polsia:user-owned — Notion REST helpers for the public contact form.

import { type ContactTopic, NOTION_RICH_TEXT_MAX } from '@/lib/contact/schema';

const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';

export function getNotionContactConfig():
  | { ok: true; token: string; databaseId: string }
  | { ok: false } {
  const token = process.env.NOTION_TOKEN?.trim();
  const databaseId = process.env.NOTION_CONTACT_DB_ID?.trim();

  if (!token || !databaseId) {
    return { ok: false };
  }

  return { ok: true, token, databaseId };
}

/** Truncate to a single Notion rich_text text.content object. */
export function truncateForNotionRichText(message: string): string {
  if (message.length <= NOTION_RICH_TEXT_MAX) return message;
  return message.slice(0, NOTION_RICH_TEXT_MAX);
}

async function notionFetch(path: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

export async function createContactEntry(
  token: string,
  databaseId: string,
  input: {
    name?: string;
    email: string;
    topic: ContactTopic;
    message: string;
  },
): Promise<void> {
  const title = (input.name?.trim() || input.email).slice(0, 200);
  const message = truncateForNotionRichText(input.message);

  const response = await notionFetch('/pages', token, {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ type: 'text', text: { content: title } }],
        },
        Email: {
          email: input.email,
        },
        Topic: {
          select: { name: input.topic },
        },
        Message: {
          rich_text: [{ type: 'text', text: { content: message } }],
        },
        Received: {
          date: { start: new Date().toISOString() },
        },
        Status: {
          select: { name: 'New' },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('notion_create_failed');
  }
}
