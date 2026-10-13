// Illustrative development photos (TASKS.md P2-03, DESIGN_SYSTEM.md §8). Every licence below was
// checked at the source on 2026-10-13: CC0 1.0 or the Public Domain Mark only, so commercial use
// needs no permission. These are NOT photos of the business's farm and are replaced with real
// photography before launch (REQUIREMENTS.md A-15). No photo shows an identifiable person, and none
// shows battery cages (DESIGN_SYSTEM.md §2, §8).
//
// `crops` names the renditions each photo needs (see CROPS in scripts/build-images.mjs). `focus`
// optionally sets where each crop is anchored: a sharp position ("attention", "entropy", "top",
// "left"…) or [x, y] as fractions of the image. `quality` lowers WebP/JPEG quality for busy
// photos (grass, feathers) so cards stay within NFR-PERF-4 (≤ 40 KB at 480 px).

/** @typedef {{ id: string, title: string, source: string, page: string, author: string, authorUrl?: string, license: "CC0 1.0" | "Public Domain Mark 1.0", licenseUrl: string, location?: string, crops: string[], focus?: Record<string, string | [number, number]>, quality?: number }} Photo */

const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";
const PDM = "https://creativecommons.org/publicdomain/mark/1.0/";

/** @type {Photo[]} */
export const photos = [
  {
    id: "kenya-hen-chicks",
    title: "Hen with her chicks",
    source: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Free_Range_Chicken.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Free_Range_Chicken.jpg",
    author: "safaritravelplus",
    authorUrl: "https://www.safaritravelplus.com/images/animals/free-range-chicken/",
    license: "CC0 1.0",
    licenseUrl: CC0,
    location: "Kenya",
    crops: ["hero-mobile", "hero-desktop", "landscape", "square", "og"],
    quality: 56,
  },
  {
    id: "kenya-eggs-tray",
    title: "Chicken eggs in trays",
    source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Eggs_Chicken.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Eggs_Chicken.jpg",
    author: "safaritravelplus",
    authorUrl: "https://www.safaritravelplus.com/images/food/eggs/",
    license: "CC0 1.0",
    licenseUrl: CC0,
    location: "Kenya",
    crops: ["square", "landscape", "wide"],
  },
  {
    id: "kenya-eggs-hand",
    title: "Fresh eggs from a coop in Nairobi",
    source: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Farm-freah_eggs_from_Kenya.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Farm-freah_eggs_from_Kenya.jpg",
    author: "Yganyana",
    license: "CC0 1.0",
    licenseUrl: CC0,
    location: "Nairobi, Kenya",
    crops: ["square", "portrait"],
  },
  {
    id: "broilers-feeder",
    title: "Broiler chickens with a feeder and drinker",
    source: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Broiler_Chickens.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Broiler_Chickens.jpg",
    author: "Abza1",
    license: "CC0 1.0",
    licenseUrl: CC0,
    crops: ["square", "landscape", "wide"],
  },
  {
    id: "baby-chicks",
    title: "Baby chicks gathered in a corner",
    source: "https://pd.w.org/2025/11/697690efffeb17c60.40565088-1536x2048.jpg",
    page: "https://wordpress.org/photos/photo/697690efff/",
    author: "appealdahal",
    license: "CC0 1.0",
    licenseUrl: CC0,
    crops: ["square", "landscape", "wide"],
    quality: 58,
  },
  {
    id: "chicks-crate",
    title: "Cross-breed chicks in a crate",
    source: "https://upload.wikimedia.org/wikipedia/commons/f/f3/New_Born_Baby_Chicks.jpg",
    page: "https://commons.wikimedia.org/wiki/File:New_Born_Baby_Chicks.jpg",
    author: "Yvessurbano0",
    license: "CC0 1.0",
    licenseUrl: CC0,
    crops: ["square"],
  },
  {
    id: "rooster",
    title: "Cockerel standing on a path",
    source:
      "https://c.pxhere.com/photos/51/3f/chicken_cockerel_poultry_rooster_farm_agriculture_meat_livestock-834805.jpg!d",
    page: "https://pxhere.com/en/photo/834805",
    author: "PxHere contributor",
    license: "CC0 1.0",
    licenseUrl: CC0,
    crops: ["square"],
    focus: { square: [0.62, 0.5] },
  },
  {
    id: "hens-pasture",
    title: "Red sex-link hens on pasture",
    source: "https://live.staticflickr.com/65535/51731964071_5daff3425d_k.jpg",
    page: "https://www.flickr.com/photos/41284017@N08/51731964071/",
    author: "U.S. Department of Agriculture",
    authorUrl: "https://www.flickr.com/photos/41284017@N08/",
    license: "Public Domain Mark 1.0",
    licenseUrl: PDM,
    crops: ["square", "landscape"],
  },
  {
    id: "hens-feeder",
    title: "Hens around a hanging feeder",
    source: "https://live.staticflickr.com/65535/51731963351_3aa2d64d22_k.jpg",
    page: "https://www.flickr.com/photos/41284017@N08/51731963351/",
    author: "U.S. Department of Agriculture",
    authorUrl: "https://www.flickr.com/photos/41284017@N08/",
    license: "Public Domain Mark 1.0",
    licenseUrl: PDM,
    crops: ["square", "landscape", "wide"],
    focus: { square: [0.7, 0.55] }, // keep the feeder in frame: it illustrates the feeder product
    quality: 58,
  },
  {
    id: "hens-farm",
    title: "Hens on a diversified farm",
    source: "https://live.staticflickr.com/4806/45862540251_c57d7f3e34_k.jpg",
    page: "https://www.flickr.com/photos/41284017@N08/45862540251/",
    author: "U.S. Department of Agriculture (photo by Preston Keres)",
    authorUrl: "https://www.flickr.com/photos/41284017@N08/",
    license: "Public Domain Mark 1.0",
    licenseUrl: PDM,
    crops: ["square", "landscape", "wide"],
  },
  {
    id: "flock",
    title: "Flock of chickens on a small farm",
    source: "https://live.staticflickr.com/65535/49746529097_4db14d6275_k.jpg",
    page: "https://www.flickr.com/photos/184594136@N08/49746529097/",
    author: "Alabama Extension",
    authorUrl: "https://www.flickr.com/photos/184594136@N08/",
    license: "CC0 1.0",
    licenseUrl: CC0,
    crops: ["landscape", "band"],
    quality: 58,
  },
];
