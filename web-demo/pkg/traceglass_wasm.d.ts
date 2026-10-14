/* tslint:disable */
/* eslint-disable */

/**
 * Honest capability report for the demo UI.
 */
export function capabilities_json(): string;

/**
 * Embedded lens catalog version string (must match CLI).
 */
export function lens_catalog_version(): string;

/**
 * Scan many named sources. `sources_json` is
 * `[{"name":"a.log","content":"..."}, ...]`.
 */
export function scan_sources_json(sources_json: string, lens_id: string): string;

/**
 * Scan a single UTF-8 log (name + text). Returns `traceglass.findings.v1` JSON.
 */
export function scan_text(name: string, content: string, lens_id: string): string;

/**
 * Compact findings array JSON plus timing metadata.
 */
export function scan_with_meta(sources_json: string, lens_id: string): any;

/**
 * Scan a ZIP support bundle from raw bytes (File.arrayBuffer in the browser).
 */
export function scan_zip_bytes(data: Uint8Array, lens_id: string): any;

export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly capabilities_json: () => [number, number];
    readonly lens_catalog_version: () => [number, number];
    readonly scan_sources_json: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly scan_text: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly scan_with_meta: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly scan_zip_bytes: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly start: () => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
