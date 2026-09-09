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
  | "gold"
  | "emerald"
  | "rose"
  | "sapphire"
  | "platinum"
  | "amber";

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
    id: "gold",
    name: "Luxe Gold",
    hindi: "सुनहरा लक्ज़री",
    tagline: "The classic Quality Glass look",
    swatch: "#C9A24B",
    swatchLight: "#E8CF8F",
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
    id: "amber",
    name: "Warm Amber",
    hindi: "गर्म अम्बर",
    tagline: "Sunset warmth, fireside feel",
    swatch: "#D98A3A",
    swatchLight: "#F2C186",
  },
];

export const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

export const DEFAULT_THEME: ThemeId = "gold";

/** Sanitise any incoming value so we never apply an unknown theme. */
export function safeTheme(id: unknown): ThemeId {
  return typeof id === "string" && THEME_IDS.has(id) ? (id as ThemeId) : DEFAULT_THEME;
}
