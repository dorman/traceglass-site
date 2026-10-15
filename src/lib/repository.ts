// @polsia:user-owned — internal engine-repo helpers for build/CI only.
// Deliberately NOT linked from the public marketing site while dorman/traceglass
// is private ahead of the Nov 15, 2026 launch. Do not reintroduce these URLs into
// nav, hero CTAs, install/release/signatures pages, or the WASM demo.

export const canonicalRepositoryUrl = 'https://github.com/dorman/traceglass';
export const canonicalReleasesUrl = `${canonicalRepositoryUrl}/releases`;

export function canonicalRepositoryBlobUrl(path: string): string {
  return `${canonicalRepositoryUrl}/blob/main/${path}`;
}
