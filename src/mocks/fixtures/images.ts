// Builds ImageAsset values for the illustrative photos from the generated rendition list
// (scripts/build-images.mjs). Paths and dimensions therefore always match the files on disk.
import type { ImageAsset, ImageSource } from "@/types/domain";

import { photoRenditions, type PhotoId } from "./photos.generated";

const BASE = "/images/photos";

type CropOf<Id extends PhotoId> = keyof (typeof photoRenditions)[Id] & string;

interface Rendition {
  ratio: readonly [number, number];
  widths: readonly number[];
  formats: readonly string[];
  jpegWidth: number | null;
}

function rendition(id: PhotoId, crop: string): Rendition {
  const found = (photoRenditions[id] as Record<string, Rendition | undefined>)[crop];
  if (!found)
    throw new Error(
      `No "${crop}" rendition for photo ${id}; add it in scripts/images/manifest.mjs`,
    );
  return found;
}

const height = (width: number, [rw, rh]: readonly [number, number]) =>
  Math.round((width * rh) / rw);
const file = (id: string, crop: string, width: number, format: string) =>
  `${BASE}/${id}-${crop}-${width}.${format}`;
const srcSet = (id: string, crop: string, r: Rendition, format: string) =>
  r.widths.map((w) => `${file(id, crop, w, format)} ${w}w`).join(", ");

/** A single-crop photo (WebP renditions, plus a JPEG when the crop has one). */
export function photo<Id extends PhotoId>(id: Id, crop: CropOf<Id>, alt: string): ImageAsset {
  const r = rendition(id, crop);
  const largest = r.widths.at(-1) ?? 480;
  return {
    src: file(id, crop, largest, "webp"),
    srcSet: srcSet(id, crop, r, "webp"),
    alt,
    width: largest,
    height: height(largest, r.ratio),
    ...(r.jpegWidth ? { jpegSrc: file(id, crop, r.jpegWidth, "jpg") } : {}),
  };
}

/** The art-directed hero: 4:5 on phones, 16:10 from `sm`, AVIF with WebP fallback. */
export function heroPhoto(id: PhotoId, alt: string): ImageAsset {
  const mobile = rendition(id, "hero-mobile");
  const desktop = rendition(id, "hero-desktop");
  const mobileLargest = mobile.widths.at(-1) ?? 480;
  const desktopLargest = desktop.widths.at(-1) ?? 960;
  const desktopSize = { width: desktopLargest, height: height(desktopLargest, desktop.ratio) };
  const sources: ImageSource[] = [
    {
      media: "(min-width: 640px)",
      type: "image/avif",
      srcSet: srcSet(id, "hero-desktop", desktop, "avif"),
      ...desktopSize,
    },
    {
      media: "(min-width: 640px)",
      type: "image/webp",
      srcSet: srcSet(id, "hero-desktop", desktop, "webp"),
      ...desktopSize,
    },
    {
      type: "image/avif",
      srcSet: srcSet(id, "hero-mobile", mobile, "avif"),
      width: mobileLargest,
      height: height(mobileLargest, mobile.ratio),
    },
  ];
  return {
    src: file(id, "hero-mobile", mobileLargest, "webp"),
    srcSet: srcSet(id, "hero-mobile", mobile, "webp"),
    alt,
    width: mobileLargest,
    height: height(mobileLargest, mobile.ratio),
    sources,
  };
}
