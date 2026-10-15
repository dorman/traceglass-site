// @polsia:user-owned — Notion REST helpers for the public waitlist.

import type { HeadlineVariant } from '@/lib/waitlist/schema';

const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';

export type { HeadlineVariant };

export function getNotionWaitlistConfig():
  | { ok: true; token: string; databaseId: string }
  | { ok: false } {
  const token = process.env.NOTION_TOKEN?.trim();
  const databaseId = process.env.NOTION_WAITLIST_DB_ID?.trim();

  if (!token || !databaseId) {
    return { ok: false };
  }

  return { ok: true, token, databaseId };
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

/** Returns true if a page with this Email title already exists. */
export async function findWaitlistEmail(
  token: string,
  databaseId: string,
  email: string,
): Promise<boolean> {
  const response = await notionFetch(`/databases/${databaseId}/query`, token, {
    method: 'POST',
    body: JSON.stringify({
      page_size: 1,
      filter: {
        property: 'Email',
        title: { equals: email },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('notion_query_failed');
  }

  const data = (await response.json()) as { results?: unknown[] };
  return Array.isArray(data.results) && data.results.length > 0;
}

export async function createWaitlistEntry(
  token: string,
  databaseId: string,
  email: string,
  headlineVariant: HeadlineVariant,
): Promise<void> {
  const response = await notionFetch('/pages', token, {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Email: {
          title: [{ type: 'text', text: { content: email } }],
        },
        'Signed up': {
          date: { start: new Date().toISOString() },
        },
        Source: {
          select: { name: 'website' },
        },
        'Headline variant': {
          select: { name: headlineVariant },
        },
        Notes: {
          rich_text: [],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('notion_create_failed');
  }
}
