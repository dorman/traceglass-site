import init, {
  capabilities_json,
  scan_with_meta,
  scan_zip_bytes,
} from "../pkg/traceglass_wasm.js";
import wasmUrl from "../pkg/traceglass_wasm_bg.wasm?url";

type Finding = {
  source_file: string;
  line: number;
  severity: string;
  signature_id: string;
  title: string;
  category: string;
  explanation: string;
  evidence: string;
  lens_id: string;
  lens_group: string;
  lens_priority: number;
};

type ScanWithMeta = {
  findings: Finding[];
  meta: {
    source_count: number;
    total_bytes: number;
    elapsed_ms: number;
    finding_count: number;
    capabilities: Record<string, boolean>;
  };
};

const SAMPLE_FILES = [
  "samples/demo-bundle-case/app/api.log",
  "samples/demo-bundle-case/k8s/events.log",
  "samples/demo-bundle-case/edge/nginx-error.log",
  "samples/demo-bundle-case/db/postgres.log",
  "samples/demo-bundle-case/db/mysql.log",
  "samples/demo-bundle-case/system/journal.log",
] as const;

const LENS = "incident-reliability";

const REQUIRED_SIGNATURES = [
  "fatal-error-crash",
  "resource-exhaustion",
  "kubernetes-workload-failure",
  "container-runtime-failure",
  "nginx-upstream-failure",
  "postgresql-connection-transaction-failure",
  "mysql-storage-concurrency-failure",
  "connection-refused-reset",
  "systemd-unit-failure",
  "diagnostic-assertion-traceback",
] as const;

let ready: Promise<void> | null = null;

function ensureWasm(): Promise<void> {
  if (!ready) {
    ready = init({ module_or_path: wasmUrl }).then(() => undefined);
  }
  return ready;
}

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadSampleSources(): Promise<{ name: string; content: string }[]> {
  // Embed samples at build time so scanning never fetches log bytes over the network.
  const modules = import.meta.glob("../public/samples/demo-bundle-case/**/*.log", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const sources: { name: string; content: string }[] = [];
  for (const path of SAMPLE_FILES) {
    const suffix = path.replace(/^samples\//, "");
    const match = Object.keys(modules).find(
      (k) => k.endsWith(suffix) || k.endsWith(path.split("/").slice(-2).join("/")),
    );
    if (!match) {
      throw new Error(`sample not embedded: ${path}`);
    }
    const content = modules[match];
    const name = path.replace(/^samples\/demo-bundle-case\//, "");
    sources.push({ name, content });
  }
  return sources;
}

function severityRank(s: string): number {
  return s === 'critical' ? 4 : s === 'high' ? 3 : s === 'medium' ? 2 : 1;
}

type FindingGroup = {
  key: string;
  title: string;
  severity: string;
  signature_id: string;
  lens_group: string;
  lens_priority: number;
  items: Finding[];
};

function groupFindings(findings: Finding[]): FindingGroup[] {
  const map = new Map<string, FindingGroup>();
  for (const f of findings) {
    const key = `${f.signature_id}::${f.title}`;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(f);
      if (severityRank(f.severity) > severityRank(existing.severity)) {
        existing.severity = f.severity;
      }
    } else {
      map.set(key, {
        key,
        title: f.title,
        severity: f.severity,
        signature_id: f.signature_id,
        lens_group: f.lens_group,
        lens_priority: f.lens_priority,
        items: [f],
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const d = severityRank(b.severity) - severityRank(a.severity);
    if (d !== 0) return d;
    if (b.items.length !== a.items.length) return b.items.length - a.items.length;
    return a.lens_priority - b.lens_priority || a.title.localeCompare(b.title);
  });
}

function renderFindings(listEl: HTMLElement, findings: Finding[]): void {
  listEl.replaceChildren();
  const groups = groupFindings(findings);
  for (const group of groups) {
    const li = document.createElement('li');
    li.className = 'finding-group';

    const head = document.createElement('div');
    head.className = 'finding-group__head';

    const sev = document.createElement('span');
    sev.className = `sev-chip ${group.severity}`;
    sev.textContent = group.severity.toUpperCase();

    const title = document.createElement('span');
    title.className = 'finding-group__title';
    title.textContent = group.title;

    head.append(sev, title);
    if (group.items.length > 1) {
      const count = document.createElement('span');
      count.className = 'finding-group__count';
      count.textContent = `×${group.items.length}`;
      head.append(count);
    }

    const meta = document.createElement('div');
    meta.className = 'finding-group__meta';
    const locs = group.items
      .slice()
      .sort((a, b) => a.source_file.localeCompare(b.source_file) || a.line - b.line)
      .map((f) => `${f.source_file}:${f.line}`);
    meta.textContent =
      group.items.length === 1
        ? `${locs[0]} · ${group.signature_id} · ${group.lens_group}`
        : `${group.items.length} matches · ${group.signature_id} · ${group.lens_group}`;

    head.append(meta);
    li.append(head);

    const lines = document.createElement('ul');
    lines.className = 'finding-group__lines';
    const expand = group.items.length > 1;
    if (expand) lines.hidden = true;

    for (const f of group.items) {
      const row = document.createElement('li');
      row.className = 'finding-line';
      const where = document.createElement('div');
      where.className = 'where';
      where.textContent = `${f.source_file}:${f.line}`;
      const evidence = document.createElement('p');
      evidence.className = 'evidence';
      evidence.textContent = f.evidence;
      row.append(where, evidence);
      lines.append(row);
    }

    if (expand) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'finding-group__toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = `Show ${group.items.length} matching lines`;
      toggle.addEventListener('click', () => {
        const open = lines.hidden;
        lines.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open
          ? 'Hide matching lines'
          : `Show ${group.items.length} matching lines`;
      });
      li.append(toggle);
    }

    li.append(lines);
    listEl.append(li);
  }
}

function setTermSev(findings: Finding[]): void {
  const crit = findings.filter((f) => f.severity === 'critical').length;
  const high = findings.filter((f) => f.severity === 'high').length;
  const med = findings.length - crit - high;
  $('term-crit').textContent = String(crit);
  $('term-high').textContent = String(high);
  $('term-med').textContent = String(med);
  $('term-sev').hidden = false;
}

function setTermStatus(mode: string, mid: string, right: string): void {
  $('term-mode').textContent = mode;
  $('term-status-mid').textContent = mid;
  $('term-status').textContent = right;
}

async function typeLine(body: HTMLElement, text: string, cls: string, delay = 18): Promise<void> {
  const line = document.createElement("div");
  line.className = cls;
  body.append(line);
  body.parentElement?.scrollTo({ top: body.scrollHeight });
  for (let i = 0; i < text.length; i++) {
    line.textContent = text.slice(0, i + 1);
    if (delay > 0 && i % 3 === 0) await sleep(delay);
  }
  line.textContent = text;
}

async function runReplay(): Promise<void> {
  const btn = $('btn-replay') as HTMLButtonElement;
  const body = $('term-body');
  const meta = $('replay-meta');
  const findingsPanel = $('replay-findings');
  const list = $('replay-list');

  btn.disabled = true;
  body.replaceChildren();
  findingsPanel.hidden = true;
  $('term-sev').hidden = true;
  setTermStatus('NORMAL', 'loading wasm…', 'busy');
  meta.textContent = '';

  try {
    await ensureWasm();
    setTermStatus('NORMAL', 'scanning…', 'scan');
    await typeLine(
      body,
      '$ traceglass --lens incident-reliability samples/demo-bundle/case',
      'line-in',
      8,
    );
    await typeLine(body, 'loading built-in signature library…', 'line-out', 4);

    const sources = await loadSampleSources();
    await typeLine(
      body,
      `opened ${sources.length} text sources (${sources.reduce((n, s) => n + s.content.length, 0)} bytes)`,
      'line-out',
      4,
    );

    const started = performance.now();
    const result = (await scan_with_meta(JSON.stringify(sources), LENS)) as ScanWithMeta;
    const elapsed = performance.now() - started;

    const ids = new Set(result.findings.map((f) => f.signature_id));
    for (const required of REQUIRED_SIGNATURES) {
      if (!ids.has(required)) {
        throw new Error(`missing planted signature: ${required}`);
      }
    }

    await typeLine(
      body,
      `scan complete — ${result.findings.length} findings in ${elapsed.toFixed(1)} ms (wasm meta ${result.meta.elapsed_ms.toFixed(1)} ms)`,
      'line-out',
      4,
    );

    const crit = result.findings.filter((f) => f.severity === 'critical');
    const high = result.findings.filter((f) => f.severity === 'high');
    await typeLine(
      body,
      `severity mix: ${crit.length} critical · ${high.length} high · ${result.findings.length - crit.length - high.length} medium`,
      'line-find',
      4,
    );

    for (const f of result.findings.slice(0, 8)) {
      const cls = f.severity === 'critical' ? 'line-crit' : 'line-find';
      await typeLine(
        body,
        `  ${f.severity.toUpperCase().padEnd(8)} ${f.source_file}:${f.line}  ${f.title}`,
        cls,
        2,
      );
    }
    if (result.findings.length > 8) {
      await typeLine(body, `  … ${result.findings.length - 8} more`, 'line-out', 2);
    }

    setTermSev(result.findings);
    renderFindings(list, result.findings);
    findingsPanel.hidden = false;
    setTermStatus(
      'NORMAL',
      `${result.findings.length} findings · press s to review`,
      'done',
    );
    meta.textContent = `${result.findings.length} findings · ${elapsed.toFixed(1)} ms · ${result.meta.total_bytes} bytes`;

    const caps = $('caps');
    caps.textContent = capabilities_json();
  } catch (err) {
    setTermStatus('NORMAL', 'scan failed', 'error');
    await typeLine(body, `error: ${err instanceof Error ? err.message : String(err)}`, 'line-crit', 0);
  } finally {
    btn.disabled = false;
  }
}

function isZipFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  );
}

async function scanUserFile(file: File): Promise<void> {
  const meta = $("try-meta");
  const panel = $("try-findings");
  const list = $("try-list");
  meta.textContent = `reading ${file.name}…`;
  panel.hidden = true;

  await ensureWasm();

  const started = performance.now();
  let rich: ScanWithMeta;

  if (isZipFile(file)) {
    if (file.size > 256 * 1024 * 1024) {
      meta.textContent = "zip exceeds 256 MiB demo limit";
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    rich = (await scan_zip_bytes(bytes, LENS)) as ScanWithMeta;
  } else {
    const content = await file.text();
    if (content.length > 50 * 1024 * 1024) {
      meta.textContent = "file exceeds 50 MiB demo limit";
      return;
    }
    rich = (await scan_with_meta(
      JSON.stringify([{ name: file.name, content }]),
      LENS,
    )) as ScanWithMeta;
  }

  const elapsed = performance.now() - started;
  renderFindings(list, rich.findings);
  panel.hidden = false;
  meta.textContent = `${file.name}: ${rich.findings.length} findings · ${elapsed.toFixed(1)} ms · ${rich.meta.total_bytes.toLocaleString()} bytes across ${rich.meta.source_count} source(s) (local only)`;
}

function wireDropzone(): void {
  const zone = $("dropzone");
  const input = $("file-input") as HTMLInputElement;

  const openPicker = () => input.click();
  zone.addEventListener("click", openPicker);
  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  });

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) void scanUserFile(file);
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag");
    const file = e.dataTransfer?.files?.[0];
    if (file) void scanUserFile(file);
  });
}

async function boot(): Promise<void> {
  $("btn-replay").addEventListener("click", () => void runReplay());
  wireDropzone();
  // Warm WASM in the background so the first click is snappy.
  void ensureWasm().catch(() => {
    /* surfaced on first action */
  });
}

void boot();

// Exported for Playwright tests via window
declare global {
  interface Window {
    __tgDemo?: {
      ensureWasm: typeof ensureWasm;
      loadSampleSources: typeof loadSampleSources;
      scanSample: () => Promise<ScanWithMeta>;
      scanSources: (
        sources: { name: string; content: string }[],
        lens?: string,
      ) => Promise<ScanWithMeta>;
      scanZipBytes: (bytes: Uint8Array, lens?: string) => Promise<ScanWithMeta>;
      requiredSignatures: typeof REQUIRED_SIGNATURES;
    };
  }
}

window.__tgDemo = {
  ensureWasm,
  loadSampleSources,
  requiredSignatures: REQUIRED_SIGNATURES,
  async scanSample() {
    await ensureWasm();
    const sources = await loadSampleSources();
    return (await scan_with_meta(JSON.stringify(sources), LENS)) as ScanWithMeta;
  },
  async scanSources(sources, lens = LENS) {
    await ensureWasm();
    return (await scan_with_meta(JSON.stringify(sources), lens)) as ScanWithMeta;
  },
  async scanZipBytes(bytes, lens = LENS) {
    await ensureWasm();
    return (await scan_zip_bytes(bytes, lens)) as ScanWithMeta;
  },
};
