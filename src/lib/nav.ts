// @polsia:user-owned — app navigation rendered by SiteNav/SiteFooter and read by
// the sitemap. Edit it as pages are added or removed.
// This list is a convenience, not module registration.

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** App route, e.g. '/' or '/dashboard'. */
  href: string;
  /** Where it renders: top-nav 'primary'/'secondary', or 'footer'. */
  group: NavGroup;
  /** Group `primary` items into a dropdown: items sharing a `menu` value collapse
   *  into one "<menu> ⌄" top-bar slot (e.g. `menu: 'Resources'` on Blog/Docs/
   *  Changelog). Keeps the bar short. Ignored for 'secondary'/'footer'. */
  menu?: string;
  /** When true, render only if a session exists (see site-nav.tsx). */
  requiresAuth?: boolean;
  /** When true, render only for a signed-in admin session. */
  requiresAdmin?: boolean;
  /** When true, render only for the configured company owner. */
  requiresOwner?: boolean;
  /** Sort key within a group (ascending); unordered items fall to the end. */
  order?: number;
}

// Keep the bar short: ~3-5 primary slots, group the tail with `menu`, push the
// rest to 'footer' (SiteNav overflows extras into a "More" dropdown). Example:
//   { label: 'Pricing', href: '/pricing', group: 'primary' },
//   { label: 'Blog',    href: '/blog',    group: 'primary', menu: 'Resources' },
//   { label: 'Docs',    href: '/docs',    group: 'primary', menu: 'Resources' },
//   { label: 'Sign in', href: '/login',   group: 'secondary' },
export const navItems: NavItem[] = [
  { label: 'Features', href: '/#features', group: 'primary', order: 1 },
  { label: 'How it works', href: '/#workflow', group: 'primary', order: 2 },
  { label: 'Sources', href: '/#sources', group: 'primary', order: 3 },
  { label: 'Try in browser', href: '/demo', group: 'primary', order: 4 },
  { label: 'FAQ', href: '/#faq', group: 'primary', order: 5 },
  // Secondary waitlist CTA opens the shared dialog (see SiteNav); href kept for
  // sitemap/llms consumers and as a progressive-enhancement fallback.
  { label: 'Notify me', href: '/waitlist', group: 'secondary', order: 2 },
  {
    label: 'Manage pages',
    href: '/admin/pages',
    group: 'secondary',
    requiresOwner: true,
    order: 3,
  },
  {
    label: 'Design site',
    href: '/admin/design',
    group: 'secondary',
    requiresOwner: true,
    order: 4,
  },
  // About + Contact stay in the footer so the primary bar (and Notify me CTA) stay uncrowded.
  { label: 'About', href: '/about', group: 'footer', order: 1 },
  { label: 'Contact', href: '/contact', group: 'footer', order: 2 },
  { label: 'Waitlist', href: '/waitlist', group: 'footer', order: 3 },
  { label: 'Release notes', href: '/release', group: 'footer', order: 4 },
  { label: 'Signatures', href: '/signatures', group: 'footer', order: 5 },
  { label: 'Install', href: '/install', group: 'footer', order: 6 },
];
