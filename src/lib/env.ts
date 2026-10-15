// @polsia:shared — edit only through declared slots. Code installed by polsia/template-next@0.3.0.
//
// Typed env via @t3-oss/env-nextjs.
//
// Modules contribute env vars via their manifest `contributions` block.
// The installer regenerates this file's slots between the markers below.
// Hand-editing outside those slots is rejected by the ownership validator.
//
// The `no-secrets-in-client-bundle` validator scans the build output and rejects
// the install if any non-NEXT_PUBLIC_ env name appears in client chunks.
//
// Public marketing deploy (Vercel): only NEXT_PUBLIC_APP_URL is required at
// build time. NOTION_TOKEN + NOTION_WAITLIST_DB_ID are needed at runtime for
// waitlist signups. DATABASE_URL / BETTER_AUTH_* / POLSIA_* remain optional so
// auth, admin, Stripe, and Prisma CMS stay available when those vars are set.

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Optional: Postgres for auth/admin/CMS. Public marketing pages fall back
    // to in-repo defaults when unset.
    DATABASE_URL: z.string().url().optional(),
    // Notion waitlist (public marketing). Validated at request time by the
    // waitlist route; missing values yield HTTP 503 rather than a build failure.
    NOTION_TOKEN: z.string().min(1).optional(),
    NOTION_WAITLIST_DB_ID: z.string().min(1).optional(),
    // @polsia:slot env_vars_server start
    // Modules append additional server-side env vars here at install time.
    // @polsia:contrib stripe-billing start
    POLSIA_API_BASE_URL: z.string().url().default('https://polsia.com'),
    POLSIA_API_KEY: z.string().min(1).optional(),
    POLSIA_API_TOKEN: z.string().min(1).optional(),
    // @polsia:contrib stripe-billing end
    // @polsia:contrib better-auth start
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    POLSIA_OWNER_EMAIL: z.string().optional(),
    // @polsia:contrib better-auth end
    // @polsia:contrib email start
    POLSIA_EMAIL_PROXY_URL: z.string().url().optional(),
    POLSIA_COMPANY_EMAIL: z.string().optional(),
    // @polsia:contrib email end
    // @polsia:slot env_vars_server end
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    // Base for @/lib/api-client + proxy.ts connect-src. Default-empty
    // (unset) means same-origin `/api`; set only for an external API origin.
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    // @polsia:slot env_vars_client start
    // Modules append NEXT_PUBLIC_* env vars here at install time.
    // @polsia:slot env_vars_client end
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_WAITLIST_DB_ID: process.env.NOTION_WAITLIST_DB_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // @polsia:slot env_runtime start
    // Modules append runtime-env entries here at install time.
    // @polsia:contrib stripe-billing start
    POLSIA_API_BASE_URL: process.env.POLSIA_API_BASE_URL,
    POLSIA_API_KEY: process.env.POLSIA_API_KEY,
    POLSIA_API_TOKEN: process.env.POLSIA_API_TOKEN,
    // @polsia:contrib stripe-billing end
    // @polsia:contrib better-auth start
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    POLSIA_OWNER_EMAIL: process.env.POLSIA_OWNER_EMAIL,
    // @polsia:contrib better-auth end
    // @polsia:contrib email start
    POLSIA_EMAIL_PROXY_URL: process.env.POLSIA_EMAIL_PROXY_URL,
    POLSIA_COMPANY_EMAIL: process.env.POLSIA_COMPANY_EMAIL,
    // @polsia:contrib email end
    // @polsia:slot env_runtime end
  },
  emptyStringAsUndefined: true,
  // SKIP_ENV_VALIDATION=1 bypasses validation for envless builds (lint/CI/local).
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

/** True when Postgres is configured for Prisma-backed features. */
export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

/** True when better-auth secrets are present. */
export function isAuthConfigured(): boolean {
  return Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_URL);
}

/** True when the Polsia email proxy URL is set. */
export function isEmailProxyConfigured(): boolean {
  return Boolean(env.POLSIA_EMAIL_PROXY_URL);
}
