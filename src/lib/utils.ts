import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom utilities so `cn("text-h2", "text-ink-900")` keeps both
// (otherwise "text-h2" is mistaken for a text colour and dropped).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "lead", "eyebrow"] }],
      shadow: [{ shadow: ["xs", "card", "raised", "overlay"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
