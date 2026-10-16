// @polsia:user-owned — typed static release catalog for the public install API.
// Public site no longer advertises GitHub downloads while the engine repo is private.

const unavailablePlatform = (platform: {
  name: string;
  os: 'Linux' | 'macOS' | 'Windows';
  architecture: string;
  target: string;
  installerName: string;
  installerFormat: 'binary' | 'exe';
  note: string;
}) => ({
  ...platform,
  availability: 'unavailable' as const,
  downloadUrl: null,
  sha256: null,
  signatureUrl: null,
  signingKeyId: null,
  permissionNote:
    'The beta installer will default to a current-user location and ask before PATH or shortcut changes.',
  launchNote:
    'After explicit consent, it will open a new terminal and start the no-argument interactive TUI.',
});

export const installCatalog = {
  releases: {
    releaseStatus: 'unpublished' as const,
    version: null,
    heading: 'One-click installers arrive at public launch',
    description:
      'Signed installers for Linux, macOS, and Windows stay unpublished until TraceGlass publicly launches. Join the waitlist for one email when they are available.',
    releasePageUrl: 'https://traceglass.dev/release',
    verification: {
      manifestUrl: null,
      manifestSignatureUrl: null,
      signatureScheme: 'Ed25519' as const,
      signingKeyId: 'traceglass-release-ed25519-2026',
      status: 'not-published' as const,
      osSigningLimitations:
        'Release signatures verify the publisher and payload. Windows Authenticode, macOS Developer ID, and notarization are separate publisher credentials and are not claimed until configured.',
    },
    platforms: [
      unavailablePlatform({
        name: 'Linux · x86_64 · glibc',
        os: 'Linux',
        architecture: 'x86_64',
        target: 'x86_64-unknown-linux-gnu',
        installerName: 'traceglass-installer-x86_64-unknown-linux-gnu',
        installerFormat: 'binary',
        note: 'Planned target: glibc-based Linux on Intel or AMD 64-bit systems.',
      }),
      unavailablePlatform({
        name: 'macOS · Apple silicon',
        os: 'macOS',
        architecture: 'aarch64',
        target: 'aarch64-apple-darwin',
        installerName: 'traceglass-installer-aarch64-apple-darwin',
        installerFormat: 'binary',
        note: 'Planned target: macOS on Apple silicon.',
      }),
      unavailablePlatform({
        name: 'macOS · Intel',
        os: 'macOS',
        architecture: 'x86_64',
        target: 'x86_64-apple-darwin',
        installerName: 'traceglass-installer-x86_64-apple-darwin',
        installerFormat: 'binary',
        note: 'Planned target: macOS on Intel Macs.',
      }),
      unavailablePlatform({
        name: 'Windows · x86_64',
        os: 'Windows',
        architecture: 'x86_64',
        target: 'x86_64-pc-windows-msvc',
        installerName: 'traceglass-installer-x86_64-pc-windows-msvc.exe',
        installerFormat: 'exe',
        note: 'Planned target: 64-bit Windows on the MSVC toolchain.',
      }),
    ],
    fallback: {
      label: 'Coming soon',
      command: 'join the waitlist for launch notification',
      details:
        'Installers and signed release artifacts are not published yet. Join the waitlist for one email when TraceGlass publicly launches.',
      docsUrl: 'https://traceglass.dev/waitlist',
    },
  },
} as const;
