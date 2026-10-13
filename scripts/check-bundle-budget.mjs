// Initial-JavaScript budget for public pages (NFR-PERF-3, TESTING.md §6.7).
// For every pre-rendered HTML page, sums the gzipped size of the JS modules it loads up front
// (module scripts + modulepreload links) and fails if any page exceeds the budget.
//
// Usage: node scripts/check-bundle-budget.mjs [buildDir] [--budget-kb=170]
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const buildDir = path.resolve(args.find((arg) => !arg.startsWith("--")) ?? "build/client");
const budgetKb = Number(args.find((arg) => arg.startsWith("--budget-kb="))?.split("=")[1] ?? 170);
const budgetBytes = budgetKb * 1024;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "assets" ? [] : htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

const gzipCache = new Map();
function gzippedSize(assetPath) {
  if (!gzipCache.has(assetPath)) {
    gzipCache.set(
      assetPath,
      gzipSync(readFileSync(path.join(buildDir, assetPath)), { level: 9 }).length,
    );
  }
  return gzipCache.get(assetPath);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const pattern =
  /<link rel="modulepreload" href="([^"]+\.js)"|<script[^>]+type="module"[^>]+src="([^"]+\.js)"/g;

let failures = 0;
const rows = [];
for (const file of htmlFiles(buildDir)) {
  const html = readFileSync(file, "utf8");
  const scripts = new Set([...html.matchAll(pattern)].map((match) => match[1] ?? match[2]));
  const total = [...scripts].reduce((sum, src) => sum + gzippedSize(src.replace(/^\//, "")), 0);
  const page =
    "/" +
    path
      .relative(buildDir, file)
      .replaceAll("\\", "/")
      .replace(/index\.html$/, "");
  const over = total > budgetBytes;
  if (over) failures += 1;
  rows.push({ page, total, count: scripts.size, over });
}

rows.sort((a, b) => b.total - a.total);
console.log(`Initial JS per pre-rendered page (gzip), budget ${budgetKb} KB:\n`);
for (const row of rows) {
  console.log(
    `${row.over ? "✖" : "✓"} ${kb(row.total).padStart(9)}  ${String(row.count).padStart(3)} modules  ${row.page}`,
  );
}

const heaviest = [...gzipCache.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log("\nLargest shared modules (gzip):");
for (const [asset, size] of heaviest) console.log(`  ${kb(size).padStart(9)}  ${asset}`);

if (failures > 0) {
  console.error(`\n${failures} page(s) exceed the ${budgetKb} KB budget.`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} pages are within budget.`);
