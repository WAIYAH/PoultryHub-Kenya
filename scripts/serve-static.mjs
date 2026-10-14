// Serves build/client the way the production static host will (API_AND_INTEGRATIONS.md §14):
// real files first, `/path` → `/path/index.html`, unknown routes → __spa-fallback.html (200),
// missing assets → 404, hashed assets cached immutably, and text compressed (Brotli, else gzip)
// as static hosts do, so Lighthouse measures what visitors download. Used by `pnpm preview` and
// Playwright.
//
// Usage: node scripts/serve-static.mjs [--dir build/client] [--port 4173] [--host 127.0.0.1]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { constants, createBrotliCompress, createGzip } from "node:zlib";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = path.resolve(option("dir", "build/client"));
const port = Number(option("port", process.env.PORT ?? "4173"));
const host = option("host", "127.0.0.1");

if (!existsSync(root)) {
  console.error(`No build found at ${root}. Run "pnpm build" first.`);
  process.exit(1);
}
const fallback = existsSync(path.join(root, "__spa-fallback.html"))
  ? "__spa-fallback.html"
  : "index.html";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".data": "text/x-script; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".data", ".xml", ".txt", ".svg"]);

/** Brotli when the browser accepts it, else gzip; images and fonts are already compressed. */
function encodingFor(request, file) {
  if (!COMPRESSIBLE.has(path.extname(file))) return null;
  const accepted = request.headers["accept-encoding"] ?? "";
  if (/\bbr\b/.test(accepted)) return "br";
  if (/\bgzip\b/.test(accepted)) return "gzip";
  return null;
}

function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = path.normalize(path.join(root, decoded));
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null; // path traversal
  for (const file of [candidate, path.join(candidate, "index.html")]) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const file = resolveFile(pathname);

  if (!file && path.extname(pathname) !== "") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const target = file ?? path.join(root, fallback);
  const encoding = encodingFor(request, target);
  response.writeHead(200, {
    ...(encoding ? { "Content-Encoding": encoding, Vary: "Accept-Encoding" } : {}),
    "Content-Type": CONTENT_TYPES[path.extname(target)] ?? "application/octet-stream",
    "Cache-Control": pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  const stream = createReadStream(target);
  if (encoding === "br") {
    stream
      .pipe(createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }))
      .pipe(response);
  } else if (encoding === "gzip") {
    stream.pipe(createGzip()).pipe(response);
  } else {
    stream.pipe(response);
  }
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port} (SPA fallback: ${fallback})`);
});
