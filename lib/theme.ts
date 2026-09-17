/**
 * Premium site themes — the owner picks one from Owner Studio → Settings.
 * These swap the golden accent colour across the WHOLE site (buttons, badges,
 * links, highlights, glows and the scroll-frame) by overriding CSS variables
 * via the `data-theme` attribute set on <html>.
 *
 * The physical frame mouldings (.gold-frame / .wood-frame / .black-frame) stay
 * as they are — those are the product, not the site accent.
 */

export type ThemeId =
  | "santi-maroon"
  | "emerald"
  | "rose"
  | "sapphire"
  | "platinum"
  | "amber"
  | "crimson"
  | "maroon"
  | "vermilion";

export type Theme = {
  id: ThemeId;
  name: string;
  hindi: string;
  /** short line shown in the theme picker */
  tagline: string;
  /** preview swatch colours (hex, for the picker only) */
  swatch: string;
  swatchLight: string;
};

export const THEMES: Theme[] = [
  {
    id: "santi-maroon",
    name: "Santi Maroon",
    hindi: "सांती लाल",
    tagline: "Santi Sharee combo — deep maroon + teal stars",
    swatch: "#D63F3F",
    swatchLight: "#F49A9C",
  },
  {
    id: "emerald",
    name: "Emerald & Gold",
    hindi: "पन्ना और सोना",
    tagline: "Regal green, tonic for your wall",
    swatch: "#26A877",
    swatchLight: "#6FD8AF",
  },
  {
    id: "rose",
    name: "Champagne Rose",
    hindi: "शैम्पेन गुलाब",
    tagline: "Soft romantic blush",
    swatch: "#D08A9B",
    swatchLight: "#EEC2CD",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    hindi: "शाही नीलम",
    tagline: "Deep dignified blue",
    swatch: "#5B8FE3",
    swatchLight: "#ABC9F7",
  },
  {
    id: "platinum",
    name: "Radiant Platinum",
    hindi: "चाँदी जैसा",
    tagline: "Cool, minimal, gallery-white",
    swatch: "#C4C6D2",
    swatchLight: "#E7E9F0",
  },
  {
    id: "crimson",
    name: "Imperial Crimson",
    hindi: "सिंदूरी लाल",
    tagline: "Classic deep red — shagun, sindoor, auspicious",
    swatch: "#E5484D",
    swatchLight: "#FF8A8F",
  },
  {
    id: "maroon",
    name: "Royal Maroon",
    hindi: "शाही मैरून",
    tagline: "Rich wine red — wedding-card regal",
    swatch: "#D44557",
    swatchLight: "#F59BAA",
  },
  {
    id: "vermilion",
    name: "Vermilion Fire",
    hindi: "अग्नि लाल",
    tagline: "Hot sale energy — Printo/PureHome style",
    swatch: "#FF5A1F",
    swatchLight: "#FFB198",
  },
  {
    id: "amber",
    name: "Warm Amber",
    hindi: "गर्म अम्बर",
    tagline: "Sunset warmth, fireside feel",
    swatch: "#D98A3A",
    swatchLight: "#F2C186",
  },
];

export const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

export const DEFAULT_THEME: ThemeId = "santi-maroon";

/** Sanitise any incoming value so we never apply an unknown theme. */
export function safeTheme(id: unknown): ThemeId {
  return typeof id === "string" && THEME_IDS.has(id) ? (id as ThemeId) : DEFAULT_THEME;
}
