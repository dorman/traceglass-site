// @polsia:user-owned — public read-only preview of the versioned signature catalog.
import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import {
  loadSignatureManifest,
  SIGNATURE_SEVERITIES,
  SignatureCatalogResponse,
} from '@/lib/contracts/signatures';

export const dynamic = 'force-dynamic';

const SIGNATURE_FILES = [
  'splunk-search-errors.json',
  'windows-event-anomalies.json',
  'antivirus-edr-alerts.json',
] as const;

type SignatureFile = (typeof SIGNATURE_FILES)[number];

const SAMPLE_LINES: Record<SignatureFile, readonly [string, string, string]> = {
  'splunk-search-errors.json': [
    'ERROR search peer idx-01 failed to respond',
    'WARN Search job sid=1742 timed out after 300 seconds',
    'ERROR Unable to initialize search bundle',
  ],
  'windows-event-anomalies.json': [
    'Security EventID=4625: An account failed to log on',
    'System Event ID: 7045: A new service was installed',
    'The system time has changed',
  ],
  'antivirus-edr-alerts.json': [
    'Microsoft Defender Threat detected: Trojan:Win32/Example',
    'CrowdStrike detection prevented execution of suspicious.exe',
    'SentinelOne incident mitigated on endpoint WIN-042',
  ],
};

const SIGNATURES_DIR = join(process.cwd(), 'signatures', 'v0.2.0');

export function GET() {
  try {
    const sets = SIGNATURE_FILES.map((file) => {
      const parsed: unknown = JSON.parse(readFileSync(join(SIGNATURES_DIR, file), 'utf8'));
      const manifest = loadSignatureManifest(parsed).manifest;
      const severity =
        SIGNATURE_SEVERITIES.find((candidate) =>
          manifest.patterns.some((pattern) => pattern.severity === candidate),
        ) ?? 'debug';

      return {
        set: manifest.set,
        title: manifest.title,
        description: manifest.description,
        version: manifest.version,
        severity,
        sample: [...SAMPLE_LINES[file]],
      };
    });

    const payload = SignatureCatalogResponse.parse({
      eyebrow: 'Legacy preview',
      heading: 'Product focus is CI log triage.',
      intro:
        'TraceGlass is pivoting to local-first GitHub Actions log triage. This endpoint remains for compatibility while the marketing site points visitors to the waitlist.',
      version: 'v0.2.0',
      sets,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
