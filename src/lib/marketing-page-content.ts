// @polsia:user-owned — versioned, client-safe snapshots for managed marketing pages.
import { PageContent, type PageContent as PageContentValue } from '@/lib/contracts/pages';

type ContentData = Record<string, unknown>;
type SnapshotSection = {
  id: string;
  kind: string;
  data: ContentData;
  assets?: PageContentValue['assets'];
  [key: string]: unknown;
};

/** Retired Features headlines — rewrite when CMS/DB still stores an older string. */
export const PREVIOUS_FEATURES_HEADINGS = [
  "Built for the developer who already knows what they're looking for.",
  "Built for support specialists who already know what they're looking for.",
  'Built for the people who read logs all day.',
] as const;
/** @deprecated Prefer PREVIOUS_FEATURES_HEADINGS — kept for existing imports/tests. */
export const PREVIOUS_FEATURES_HEADING = PREVIOUS_FEATURES_HEADINGS[0];
export const FEATURES_HEADING = 'Built for whoever gets the red build.';

const asset = (id: string, ref: string, alt?: string) => ({
  id,
  kind: 'visual',
  ref,
  ...(alt ? { alt } : {}),
});

const section = (
  id: string,
  kind: string,
  data: ContentData,
  assets: PageContentValue['assets'] = [],
) => ({
  id,
  kind,
  data,
  assets,
});

const homeSections: SnapshotSection[] = [
  section('hero', 'hero', {
    eyebrow: 'Local-first CI log triage',
    heading: 'Start at the first error candidate.',
    body: "Open a failed GitHub Actions log offline. Jump to the first error candidate, fold the setup noise, compare with your last green run. Join the waitlist to hear when it's ready.",
    inlineWaitlist: true,
    links: [{ label: 'See how it works', href: '#features' }],
    stats: [
      { value: '100%', label: 'runs locally' },
      { value: '0', label: 'log bytes uploaded' },
    ],
    terminal: {
      title: 'ci-failed.log',
      prompt: '$ traceglass ci-failed.log',
      lines: ['TraceGlass · ci-failed.log · github-actions', '1 candidate · press E to jump'],
    },
  }),
  section('features', 'features', {
    eyebrow: 'Features',
    heading: FEATURES_HEADING,
    body: 'Starting with GitHub Actions logs. Five steps from a red build to a short summary you can paste into an issue or Slack.',
    items: [
      {
        title: 'Open offline',
        body: 'Open a failed log file or the zip GitHub gives you. Nothing is uploaded to triage the log.',
        icon: 'folder-open',
      },
      {
        title: 'First error candidate',
        body: 'Jump to the earliest line that looks like a failure, with the lines around it as evidence.',
        icon: 'list-checks',
      },
      {
        title: 'Fold the noise',
        body: 'Repeated setup and install steps collapse into folded groups, and you can expand them when you need the detail.',
        icon: 'fold-vertical',
      },
      {
        title: 'Compare with last green',
        body: 'Load a passing log you provide and see what changed between green and red.',
        icon: 'git-compare',
      },
      {
        title: 'Short Markdown summary',
        body: 'Export the candidate and its evidence as Markdown for an issue, PR comment, or Slack thread.',
        icon: 'file-down',
      },
    ],
  }),
  section('privacy', 'privacy', {
    heading: 'Your logs never leave your machine.',
    body: 'Reading a log happens on your machine: no upload and no account.',
    points: ['No upload', 'No account', 'Works offline'],
  }),
  section('faq', 'faq', {
    eyebrow: 'FAQ',
    heading: 'Questions developers and on-call engineers ask first.',
    body: "If yours isn't here, write to us.",
    disclaimer:
      'TraceGlass is not affiliated with GitHub. GitHub Actions is used only to name the log format.',
    items: [
      {
        question: 'Does it upload my logs?',
        answer: 'No. Triage is designed to run on your machine. Your log file stays local.',
      },
      {
        question: 'Does it find the root cause?',
        answer:
          'No. It shows a first error candidate and the evidence around it. You decide what it means.',
      },
      {
        question: 'Which logs work?',
        answer: 'GitHub Actions logs and zips in v1. Other formats are not promised.',
      },
      {
        question: 'How is it different from searching the log?',
        answer:
          'It folds repeated setup noise, jumps to the first error candidate, and compares with a green run you provide.',
      },
      {
        question: 'How does the last-green comparison work offline?',
        answer:
          'You supply the passing log file. TraceGlass compares it with the failed log locally.',
      },
      {
        question: 'How do I get access?',
        answer: "Join the waitlist to hear when it's ready.",
      },
    ],
  }),
  section('waitlist-cta', 'waitlist-form', {
    heading: 'Join the waitlist.',
    body: 'Join the waitlist to hear when TraceGlass is ready for developers and on-call engineers. We only use your email for that note and will not share it.',
  }),
];

const snapshots: Record<string, PageContentValue> = {
  home: PageContent.parse({
    version: 1,
    sections: homeSections,
    assets: homeSections.flatMap((item) => item.assets ?? []),
  }),
  install: PageContent.parse({
    version: 1,
    sections: [
      section('install-hero', 'hero', {
        eyebrow: 'Install · coming soon',
        heading: 'Installers are not published yet.',
        body: "TraceGlass is local-first CI log triage for developers and on-call engineers. Installers are not published yet — join the waitlist to hear when it's ready.",
        links: [
          { label: 'Join the waitlist', href: '#join-waitlist' },
          { label: 'About TraceGlass', href: '/about' },
        ],
      }),
      section('install-coming-soon', 'cta', {
        eyebrow: 'Coming soon',
        heading: 'No downloads yet — join the waitlist.',
        body: 'Signed installers for Linux, macOS, and Windows stay unpublished until TraceGlass publicly launches. We only use your email for that note and will not share it.',
        links: [{ label: 'Join the waitlist', href: '#join-waitlist' }],
      }),
    ],
    assets: [asset('install-terminal', 'terminal', 'Coming soon installers')],
  }),
  release: PageContent.parse({
    version: 1,
    sections: [
      section('release-hero', 'hero', {
        eyebrow: 'Release status',
        heading: "Join the waitlist to hear when it's ready.",
        body: "TraceGlass is pivoting to local-first GitHub Actions log triage. Installers and signed releases are not available yet. Join the waitlist to hear when it's ready.",
        links: [{ label: 'Join the waitlist', href: '#join-waitlist' }],
      }),
      section('release-features', 'features', {
        eyebrow: 'What ships with TraceGlass',
        heading: 'Local triage for failed CI logs.',
        items: [
          {
            title: 'Open offline',
            body: 'Open a failed GitHub Actions log or zip on your machine.',
          },
          {
            title: 'First error candidate',
            body: 'Jump to the earliest line that looks like a failure, with nearby lines as evidence.',
          },
          {
            title: 'Fold the noise',
            body: 'Collapse repeated setup and install steps so the failure is easier to see.',
          },
          {
            title: 'Compare with last green',
            body: 'Load a passing log you provide and review what changed.',
          },
          {
            title: 'Markdown summary',
            body: 'Export the candidate and evidence for an issue or Slack thread.',
          },
        ],
      }),
      section('release-privacy', 'privacy', {
        heading: 'Your logs never leave your machine.',
        body: 'Reading a log happens on your machine: no upload and no account.',
        points: ['No upload', 'No account', 'Works offline'],
      }),
      section('release-waitlist', 'cta', {
        eyebrow: 'Waitlist',
        heading: 'Join the waitlist.',
        body: "We are gauging demand for local-first CI log triage. We only use your email to tell you when it's ready.",
        links: [{ label: 'Join the waitlist', href: '#join-waitlist' }],
      }),
    ],
    assets: [asset('release-lock', 'lock', 'Local-only release')],
  }),
  signatures: PageContent.parse({
    version: 1,
    sections: [
      section('signature-hero', 'hero', {
        eyebrow: 'Product direction',
        heading: 'Starting with GitHub Actions logs.',
        body: "TraceGlass is focused on local-first CI log triage: first error candidates, folded setup noise, and last-green compare. Join the waitlist to hear when it's ready.",
        links: [{ label: 'Join the waitlist', href: '#join-waitlist' }],
      }),
      section('signature-waitlist', 'waitlist-form', {
        heading: 'Join the waitlist.',
        body: 'Join the waitlist to hear when TraceGlass is ready. We only use your email for that note and will not share it.',
      }),
    ],
    assets: [asset('signature-library', 'library', 'CI log triage')],
  }),
  waitlist: PageContent.parse({
    version: 1,
    sections: [
      section('waitlist-hero', 'hero', {
        eyebrow: 'Waitlist',
        heading: "Join the waitlist to hear when it's ready.",
        body: 'TraceGlass is local-first CI log triage for developers and on-call engineers. Open a failed GitHub Actions log offline, jump to the first error candidate, fold setup noise, and compare with your last green run.',
      }),
      section('waitlist-form', 'waitlist-form', {
        heading: 'Join the waitlist.',
        body: 'We only use your email to tell you when TraceGlass publicly launches and will not share it. Signing up does not start a subscription.',
      }),
    ],
    assets: [asset('waitlist-shield', 'shield-check', 'Email-only waitlist')],
  }),
};

export function getDefaultMarketingPageContent(templateKey: string): PageContentValue {
  return snapshots[templateKey] ?? PageContent.parse({ version: 1, sections: [], assets: [] });
}

export const defaultMarketingPageContent = getDefaultMarketingPageContent;

export function legacyMarketingPageContent(input: {
  title: string;
  body: string;
  seoDescription?: string;
  templateKey?: string | null;
  sourceKey?: string | null;
  content?: unknown;
}): PageContentValue {
  const parsed = PageContent.safeParse(input.content);
  if (parsed.success) return parsed.data;
  const template = input.templateKey ?? input.sourceKey;
  const baseline = template ? snapshots[template] : undefined;
  if (baseline && (input.sourceKey || input.templateKey)) return baseline;
  return PageContent.parse({
    version: 1,
    sections: [
      section('legacy-body', 'legacy-body', {
        heading: input.title,
        body: input.body,
        seoDescription: input.seoDescription ?? '',
      }),
    ],
    assets: [],
  });
}

/** Replace the retired Features headline in managed home content (seed + runtime). */
export function rewriteFeaturesHeadline(content: unknown): {
  content: unknown;
  changed: boolean;
} {
  if (!isJsonRecord(content) || !Array.isArray(content.sections)) {
    return { content, changed: false };
  }

  let changed = false;
  const sections = content.sections.map((section) => {
    if (!isJsonRecord(section) || !isJsonRecord(section.data)) return section;
    if (section.id !== 'features' && section.kind !== 'features') return section;
    if (
      typeof section.data.heading !== 'string' ||
      !(PREVIOUS_FEATURES_HEADINGS as readonly string[]).includes(section.data.heading)
    ) {
      return section;
    }
    changed = true;
    return { ...section, data: { ...section.data, heading: FEATURES_HEADING } };
  });

  if (!changed || !isJsonRecord(content.richText)) {
    return {
      content: changed ? { ...content, sections } : content,
      changed,
    };
  }

  // Rich-text overrides keyed like `features:data.heading` may still hold an old string.
  const richText = { ...content.richText };
  for (const [key, document] of Object.entries(richText)) {
    if (!key.includes('features') || !key.includes('heading')) continue;
    let serialized = JSON.stringify(document);
    let keyChanged = false;
    for (const previous of PREVIOUS_FEATURES_HEADINGS) {
      if (!serialized.includes(previous)) continue;
      serialized = serialized.replaceAll(previous, FEATURES_HEADING);
      keyChanged = true;
    }
    if (!keyChanged) continue;
    richText[key] = JSON.parse(serialized);
    changed = true;
  }

  return {
    content: { ...content, sections, richText },
    changed,
  };
}

export function normalizeMarketingPageContent(input: {
  title: string;
  body: string;
  seoDescription?: string;
  templateKey?: string | null;
  sourceKey?: string | null;
  content?: unknown;
}): PageContentValue {
  const baseline = legacyMarketingPageContent(input);
  const scrubbedGithub = scrubPublicGitHubLinks(baseline);
  const scrubbedAudience = scrubDeveloperAudienceCopy(scrubbedGithub.content);
  const rewritten = rewriteFeaturesHeadline(scrubbedAudience.content);
  return PageContent.parse(rewritten.content);
}

/** Exact retired audience strings rewritten for developers / on-call (non-Features). */
const RETIRED_AUDIENCE_REPLACEMENTS: ReadonlyArray<{ from: string; to: string }> = [
  {
    from: 'Questions a developer asks before installing a CLI.',
    to: 'Questions developers and on-call engineers ask first.',
  },
  {
    from: 'Questions support specialists ask before installing a CLI.',
    to: 'Questions developers and on-call engineers ask first.',
  },
];

/** Rewrite known retired audience headings in managed page content (seed + runtime). */
export function scrubDeveloperAudienceCopy(content: unknown): {
  content: unknown;
  changed: boolean;
} {
  if (!isJsonRecord(content) || !Array.isArray(content.sections)) {
    return { content, changed: false };
  }

  let changed = false;
  const sections = content.sections.map((section) => {
    if (!isJsonRecord(section) || !isJsonRecord(section.data)) return section;
    const data = { ...section.data };
    let sectionChanged = false;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') continue;
      for (const { from, to } of RETIRED_AUDIENCE_REPLACEMENTS) {
        if (value === from) {
          data[key] = to;
          sectionChanged = true;
          break;
        }
      }
    }
    if (!sectionChanged) return section;
    changed = true;
    return { ...section, data };
  });

  return {
    content: changed ? { ...content, sections } : content,
    changed,
  };
}

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Remove retired pricing sections while preserving all unrelated managed-page content. */
export function cleanupRetiredPricingContent(input: {
  sourceKey: string | null | undefined;
  title: string;
  content: unknown;
}): { title: string; content: unknown; titleChanged: boolean; contentChanged: boolean } {
  const nextTitle = input.sourceKey === 'home' ? 'TraceGlass' : input.title;
  const titleChanged = nextTitle !== input.title;
  if (
    (input.sourceKey !== 'home' && input.sourceKey !== 'release') ||
    !isJsonRecord(input.content) ||
    !Array.isArray(input.content.sections)
  ) {
    return { title: nextTitle, content: input.content, titleChanged, contentChanged: false };
  }

  const sections = input.content.sections.filter((section) => {
    if (!isJsonRecord(section)) return true;
    const isRetiredOffer =
      section.id === 'pricing' ||
      section.kind === 'pricing' ||
      section.id === 'billing-card' ||
      section.kind === 'billing-card';
    return !isRetiredOffer && (input.sourceKey !== 'release' || section.id !== 'release-cta');
  });
  const contentChanged = sections.length !== input.content.sections.length;
  return {
    title: nextTitle,
    content: contentChanged ? { ...input.content, sections } : input.content,
    titleChanged,
    contentChanged,
  };
}

const generatedWaitlistCopy = {
  title: 'TraceGlass launch waitlist',
  body: 'Join the TraceGlass waitlist to hear when local-first CI log triage is ready.',
  seoDescription:
    "Join the TraceGlass waitlist to hear when it's ready. Local-first CI log triage for developers and on-call engineers.",
  heroEyebrow: 'Waitlist',
  heroHeading: "Join the waitlist to hear when it's ready.",
  heroBody:
    'TraceGlass is local-first CI log triage for developers and on-call engineers. Open a failed GitHub Actions log offline, jump to the first error candidate, fold setup noise, and compare with your last green run.',
  formHeading: 'Join the waitlist.',
  formBody:
    'We only use your email to tell you when TraceGlass publicly launches and will not share it. Signing up does not start a subscription.',
} as const;

const previousGeneratedWaitlistCopy = {
  title: ['Get the email when Pro ships.', 'TraceGlass paid plan updates'],
  body: [
    'Join the email-only waitlist for curated packs that stay separate from your local watchlist.',
    'Join the email-only waitlist for curated local watchlists.',
    'A paid TraceGlass plan is planned, but it isn’t available yet. Request one email update; signup does not start a subscription.',
    'Join the TraceGlass launch waitlist for one email when the local-first log triage tool is publicly available around mid-November 2026.',
    'Join the TraceGlass waitlist for early access to local-first CI log triage.',
  ],
  seoDescription: [
    'Join the TraceGlass Pro waitlist for weekly curated packs. No log content or diagnostic data is collected. Target launch: November 15, 2026.',
    'Join the TraceGlass Pro waitlist for weekly curated watchlists. No log content or diagnostic data is collected.',
    'A paid TraceGlass plan is planned, but it isn’t available yet. Request one email update; signup does not start a subscription. Target date: November 15, 2026.',
    'Join the TraceGlass launch waitlist. Local-first log triage for support specialists — one email at public launch around mid-November 2026. Not early access.',
    'Join the TraceGlass waitlist for early access. Local-first CI log triage for developers and on-call engineers.',
  ],
  heroEyebrow: [
    'Pro · launching soon',
    'Paid plan · not available yet',
    'Public launch · mid-November 2026',
    'Early access waitlist',
  ],
  heroHeading: [
    'Get the email when Pro ships.',
    'A paid TraceGlass plan is planned, but it isn’t available yet.',
    'Get one email when TraceGlass launches.',
    'Join the waitlist for early access.',
  ],
  heroBody: [
    "Pro brings weekly curated, domain-tuned packs for Splunk, Docker, Kubernetes, Endpoint Detection, and CI runners — delivered to your local TraceGlass CLI without changing your editable local watchlist. We'll send exactly one message on the target launch date, November 15, 2026.",
    "Pro brings weekly curated, domain-tuned watchlists for Splunk, Docker, Kubernetes, Endpoint Detection, and CI runners — delivered to your local TraceGlass CLI. We'll send exactly one message on launch day.",
    'Request one email update about availability. Signing up does not start a subscription. Target launch date: November 15, 2026.',
    'TraceGlass is a local-first log triage tool for support specialists. We are collecting a waitlist to understand demand ahead of the public launch — not early access. We will email you once around mid-November when it is officially available.',
  ],
  formHeading: ['Join the launch list.', 'Request one email update.'],
  formBody: [
    'Your email address — and only your email address. No log content, source code, or filenames. Target launch: November 15, 2026; the product remains unpublished until a real release exists.',
    'Your email address — and only your email address. No log content, source code, or filenames.',
    'A paid TraceGlass plan is planned, but it isn’t available yet. We’ll use your email only to send one update. Signing up does not start a subscription. Target launch date: November 15, 2026.',
    'We only use your email for one launch note and will not share it. Signing up does not start a subscription. Target launch: around mid-November 2026.',
    'We only use your email for early-access notes and will not share it. Signing up does not start a subscription.',
  ],
} as const;

const previousWaitlistTitles = new Set<string>(previousGeneratedWaitlistCopy.title);
const previousWaitlistBodies = new Set<string>(previousGeneratedWaitlistCopy.body);
const previousWaitlistDescriptions = new Set<string>(previousGeneratedWaitlistCopy.seoDescription);

/** Update only unchanged generated waitlist copy, leaving custom sections and edits intact. */
export function reconcileGeneratedWaitlistCopy(input: {
  title: string;
  body: string;
  seoDescription: string;
  content: unknown;
}): {
  title: string;
  body: string;
  seoDescription: string;
  content: unknown;
  changed: boolean;
  contentChanged: boolean;
} {
  const titleChanged = previousWaitlistTitles.has(input.title);
  const bodyChanged = previousWaitlistBodies.has(input.body);
  const descriptionChanged = previousWaitlistDescriptions.has(input.seoDescription);
  const title = titleChanged ? generatedWaitlistCopy.title : input.title;
  const body = bodyChanged ? generatedWaitlistCopy.body : input.body;
  const seoDescription = descriptionChanged
    ? generatedWaitlistCopy.seoDescription
    : input.seoDescription;

  if (!isJsonRecord(input.content) || !Array.isArray(input.content.sections)) {
    return {
      title,
      body,
      seoDescription,
      content: input.content,
      changed: titleChanged || bodyChanged || descriptionChanged,
      contentChanged: false,
    };
  }

  let contentChanged = false;
  const sections = input.content.sections.map((value) => {
    if (!isJsonRecord(value)) return value;
    const sectionData = value.data;
    if (!isJsonRecord(sectionData)) return value;
    const replacements: Record<string, { previous: readonly string[]; next: string }> =
      value.id === 'waitlist-hero'
        ? {
            eyebrow: {
              previous: [...previousGeneratedWaitlistCopy.heroEyebrow],
              next: generatedWaitlistCopy.heroEyebrow,
            },
            heading: {
              previous: [...previousGeneratedWaitlistCopy.heroHeading],
              next: generatedWaitlistCopy.heroHeading,
            },
            body: {
              previous: [...previousGeneratedWaitlistCopy.heroBody],
              next: generatedWaitlistCopy.heroBody,
            },
          }
        : value.id === 'waitlist-form'
          ? {
              heading: {
                previous: [...previousGeneratedWaitlistCopy.formHeading],
                next: generatedWaitlistCopy.formHeading,
              },
              body: {
                previous: [...previousGeneratedWaitlistCopy.formBody],
                next: generatedWaitlistCopy.formBody,
              },
            }
          : {};
    const updates = Object.fromEntries(
      Object.entries(replacements)
        .filter(
          ([field, copy]) =>
            typeof sectionData[field] === 'string' &&
            copy.previous.includes(sectionData[field]) &&
            sectionData[field] !== copy.next,
        )
        .map(([field, copy]) => [field, copy.next]),
    );
    if (Object.keys(updates).length === 0) return value;
    contentChanged = true;
    return { ...value, data: { ...sectionData, ...updates } };
  });

  return {
    title,
    body,
    seoDescription,
    content: contentChanged ? { ...input.content, sections } : input.content,
    changed: titleChanged || bodyChanged || descriptionChanged || contentChanged,
    contentChanged,
  };
}

export type MarketingSnapshotSection = SnapshotSection;

const GITHUB_DORMAN_RE = /https?:\/\/(?:www\.)?github\.com\/dorman\/traceglass\b[^"'\\\s]*/gi;

function rewriteGitHubLinkLabel(label: string): string {
  const normalized = label.trim().toLowerCase();
  if (
    normalized.includes('github') ||
    normalized.includes('view source') ||
    normalized.includes('star on') ||
    normalized.includes('check release status')
  ) {
    return 'Join the waitlist';
  }
  return label;
}

/** Strip dorman/traceglass GitHub URLs from managed page content (seed + runtime). */
export function scrubPublicGitHubLinks(content: unknown): {
  content: unknown;
  changed: boolean;
} {
  if (!isJsonRecord(content) || !Array.isArray(content.sections)) {
    return { content, changed: false };
  }

  let changed = false;
  const sections = content.sections.map((section) => {
    if (!isJsonRecord(section) || !isJsonRecord(section.data)) return section;
    const data = { ...section.data };
    let sectionChanged = false;

    if (Array.isArray(data.links)) {
      const links = data.links.map((link) => {
        if (!isJsonRecord(link)) return link;
        const href = typeof link.href === 'string' ? link.href : '';
        if (!GITHUB_DORMAN_RE.test(href) && !href.includes('github.com/dorman/traceglass')) {
          GITHUB_DORMAN_RE.lastIndex = 0;
          return link;
        }
        GITHUB_DORMAN_RE.lastIndex = 0;
        sectionChanged = true;
        return {
          ...link,
          href: '#join-waitlist',
          label:
            typeof link.label === 'string'
              ? rewriteGitHubLinkLabel(link.label)
              : 'Join the waitlist',
        };
      });
      if (sectionChanged) data.links = links;
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') continue;
      if (!GITHUB_DORMAN_RE.test(value) && !value.includes('github.com/dorman/traceglass')) {
        GITHUB_DORMAN_RE.lastIndex = 0;
        continue;
      }
      GITHUB_DORMAN_RE.lastIndex = 0;
      data[key] = value.replace(GITHUB_DORMAN_RE, '#join-waitlist');
      sectionChanged = true;
    }

    if (!sectionChanged) return section;
    changed = true;
    return { ...section, data };
  });

  return {
    content: changed ? { ...content, sections } : content,
    changed,
  };
}
