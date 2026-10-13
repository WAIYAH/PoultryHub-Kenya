// Generates responsive renditions of the illustrative photos (TASKS.md P2-03, DESIGN_SYSTEM.md §8).
//
//   pnpm images            download sources (cached) and write public/images/photos/*
//
// Outputs, all committed so builds never need the network:
//   public/images/photos/<id>-<crop>-<width>.<webp|avif|jpg>
//   public/images/CREDITS.md                    licence and author of every photo
//   src/mocks/fixtures/photos.generated.ts      which renditions exist, for the fixtures
// Sources are cached in node_modules/.cache/phk-images and never committed.
import { mkdirSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { photos } from "./images/manifest.mjs";

const root = path.resolve(import.meta.dirname, "..");
const cacheDir = path.join(root, "node_modules/.cache/phk-images");
const outDir = path.join(root, "public/images/photos");
const USER_AGENT = "PoultryHubKenya-image-build/1.0 (illustrative development photos)";

/**
 * Crop name → aspect ratio, target widths and formats. Sizes follow NFR-PERF-4 (hero ≤ 150 KB at
 * 1280 px, cards ≤ 40 KB at 480 px): the desktop hero sits in a ~540 px column, so 1280 px covers
 * 2× screens.
 */
const CROPS = {
  square: { ratio: [1, 1], widths: [480, 960], formats: ["webp"], jpegWidth: 960 },
  landscape: { ratio: [4, 3], widths: [480, 960], formats: ["webp"] },
  portrait: { ratio: [4, 5], widths: [480, 800], formats: ["webp"] },
  wide: { ratio: [16, 9], widths: [640, 1280], formats: ["webp"] },
  band: { ratio: [12, 5], widths: [960, 1600], formats: ["webp"] },
  "hero-mobile": { ratio: [4, 5], widths: [480, 720], formats: ["avif", "webp"] },
  "hero-desktop": { ratio: [16, 10], widths: [960, 1280], formats: ["avif", "webp"] },
  og: { ratio: [1200, 630], widths: [1200], formats: [], jpegWidth: 1200 },
};

/** `quality` is the WebP quality; AVIF and JPEG scale from it. Busy photos set a lower one. */
const ENCODERS = {
  webp: (img, quality) => img.webp({ quality, effort: 6, smartSubsample: true }),
  avif: (img, quality) => img.avif({ quality: quality - 20, effort: 5 }),
  jpg: (img, quality) => img.jpeg({ quality: quality + 10, mozjpeg: true }),
};
const DEFAULT_QUALITY = 66;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(photo) {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(photo.source, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (response.status !== 429 || attempt === 6) {
      throw new Error(`Download failed for ${photo.id}: HTTP ${response.status}`);
    }
    const wait = Number(response.headers.get("retry-after")) * 1000 || attempt * 15_000;
    console.log(`  rate limited on ${photo.id}; retrying in ${Math.round(wait / 1000)} s`);
    await sleep(wait);
  }
}

async function source(photo) {
  mkdirSync(cacheDir, { recursive: true });
  const file = path.join(
    cacheDir,
    `${photo.id}${path.extname(new URL(photo.source).pathname) || ".jpg"}`,
  );
  if (!existsSync(file)) {
    writeFileSync(file, await download(photo));
    console.log(`  downloaded ${photo.id}`);
  }
  return file;
}

function heightFor(width, [rw, rh]) {
  return Math.round((width * rh) / rw);
}

async function main() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const renditions = {};
  let totalBytes = 0;

  for (const photo of photos) {
    const file = await source(photo);
    const meta = await sharp(file).rotate().metadata();
    // EXIF orientation 5–8 swaps width and height once rotated.
    const [srcW, srcH] =
      (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
    renditions[photo.id] = {};

    for (const cropName of photo.crops) {
      const crop = CROPS[cropName];
      if (!crop) throw new Error(`Unknown crop "${cropName}" for ${photo.id}`);
      const [rw, rh] = crop.ratio;
      const maxWidth = Math.floor(Math.min(srcW, (srcH * rw) / rh));
      // Never upscale: keep the widths the source can supply (at least one).
      let widths = crop.widths.filter((w) => w <= maxWidth);
      if (widths.length === 0) widths = [maxWidth];
      const focus = photo.focus?.[cropName] ?? "attention";

      const encode = async (width, format) => {
        const height = heightFor(width, crop.ratio);
        let pipeline = sharp(file).rotate();
        if (Array.isArray(focus)) {
          // Explicit focal point: crop the largest box of this ratio centred on it, then resize.
          const boxW = Math.min(srcW, Math.floor((srcH * rw) / rh));
          const boxH = Math.round((boxW * rh) / rw);
          const left = Math.round(Math.min(Math.max(focus[0] * srcW - boxW / 2, 0), srcW - boxW));
          const top = Math.round(Math.min(Math.max(focus[1] * srcH - boxH / 2, 0), srcH - boxH));
          pipeline = pipeline
            .extract({ left, top, width: boxW, height: boxH })
            .resize(width, height);
        } else {
          pipeline = pipeline.resize(width, height, { fit: "cover", position: focus });
        }
        const name = `${photo.id}-${cropName}-${width}.${format}`;
        const info = await ENCODERS[format](pipeline, photo.quality ?? DEFAULT_QUALITY).toFile(
          path.join(outDir, name),
        );
        totalBytes += info.size;
        return { name, size: info.size };
      };

      const sizes = [];
      for (const width of widths) {
        for (const format of crop.formats) sizes.push(await encode(width, format));
      }
      let jpeg = null;
      if (crop.jpegWidth) {
        const width = Math.min(crop.jpegWidth, maxWidth);
        sizes.push(await encode(width, "jpg"));
        jpeg = width;
      }
      renditions[photo.id][cropName] = {
        ratio: crop.ratio,
        widths,
        formats: crop.formats,
        jpegWidth: jpeg,
      };
      console.log(
        `  ${photo.id} ${cropName}: ${sizes.map((s) => `${s.name.split("-").at(-1)} ${(s.size / 1024).toFixed(0)}KB`).join(", ")}`,
      );
    }
  }

  writeFileSync(
    path.join(root, "src/mocks/fixtures/photos.generated.ts"),
    `// GENERATED by scripts/build-images.mjs (pnpm images). Do not edit by hand.\n` +
      `// Which renditions exist for each illustrative photo; see public/images/CREDITS.md.\n\n` +
      `export const photoRenditions = ${JSON.stringify(renditions, null, 2)} as const;\n\n` +
      `export type PhotoId = keyof typeof photoRenditions;\n`,
  );

  const credits = [
    "# Image credits",
    "",
    "Illustrative development photos only. **They are not photos of the business's farm, products or staff**, and are replaced with real photography before launch (REQUIREMENTS.md A-15, DESIGN_SYSTEM.md §8).",
    "",
    "Every licence was checked at the source on 2026-10-13. All are CC0 1.0 or the Public Domain Mark 1.0, which allow commercial use without permission; credit is given anyway. Generated by `pnpm images` from `scripts/images/manifest.mjs`.",
    "",
    "| File prefix | Description | Author | Licence | Source |",
    "|---|---|---|---|---|",
    ...photos.map(
      (p) =>
        `| \`photos/${p.id}-*\` | ${p.title}${p.location ? ` (${p.location})` : ""} | ${p.authorUrl ? `[${p.author}](${p.authorUrl})` : p.author} | [${p.license}](${p.licenseUrl}) | [${new URL(p.page).hostname}](${p.page}) |`,
    ),
    "",
    "The placeholder logo, favicon and brand icons are original artwork or come from Simple Icons (CC0), as noted in their source files.",
    "",
  ].join("\n");
  writeFileSync(path.join(root, "public/images/CREDITS.md"), credits);

  const files = readdirSync(outDir).length;
  console.log(
    `\n${files} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB in public/images/photos`,
  );
}

await main();
