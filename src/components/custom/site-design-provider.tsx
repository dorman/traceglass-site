// @polsia:user-owned — loads public appearance settings and applies safe CSS tokens.
'use client';

import { type ReactNode, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import {
  DEFAULT_SITE_DESIGN,
  type SiteDesign,
  SiteDesignResponse,
  SiteDesignSchema,
  siteDesignCssVariables,
} from '@/lib/contracts/site-design';

const SITE_ONLY_VARS = new Set([
  '--site-primary',
  '--site-accent',
  '--site-background',
  '--site-surface',
  '--site-text',
  '--site-muted-text',
  '--site-border',
  '--font-display',
  '--font-body',
  '--radius',
]);

function applyDesign(design: SiteDesign) {
  const root = document.documentElement;
  root.dataset.siteDesign = 'active';
  root.dataset.siteCardTreatment = design.cardTreatment;
  root.dataset.siteButtonTreatment = design.buttonTreatment;
  const vars = siteDesignCssVariables(design);
  const isDark = root.classList.contains('dark');

  for (const [name, value] of Object.entries(vars)) {
    // Nav/footer chrome always uses site-* tokens (dark branded bar).
    if (SITE_ONLY_VARS.has(name)) {
      root.style.setProperty(name, value);
      continue;
    }
    // Role tokens (--background, --foreground, …): apply in dark mode only so
    // next-themes light mode keeps light surfaces for AA text accents.
    if (isDark) {
      root.style.setProperty(name, value);
    } else {
      root.style.removeProperty(name);
    }
  }
}

export function SiteDesignProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let savedDesign = DEFAULT_SITE_DESIGN;
    applyDesign(savedDesign);

    const handleSavedEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const parsed = SiteDesignSchema.safeParse(event.detail);
      if (!parsed.success) return;
      savedDesign = parsed.data;
      applyDesign(parsed.data);
    };

    const handleThemeMutation = () => applyDesign(savedDesign);
    const themeObserver = new MutationObserver(handleThemeMutation);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('site-design:saved', handleSavedEvent);
    void apiFetch('/api/site-design', { schema: SiteDesignResponse })
      .then((response) => {
        savedDesign = response.design;
        applyDesign(response.design);
      })
      .catch(() => applyDesign(DEFAULT_SITE_DESIGN));

    return () => {
      window.removeEventListener('site-design:saved', handleSavedEvent);
      themeObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
}
