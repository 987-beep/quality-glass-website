"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, safeTheme, type ThemeId } from "@/lib/theme";

type ThemeCtxValue = {
  theme: ThemeId;
  /** Apply a theme immediately (used by the owner's Settings tab for live preview). */
  setTheme: (t: ThemeId) => void;
};

const ThemeCtx = createContext<ThemeCtxValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

/** Applies / persists the theme id as <html data-theme="…">. */
function applyTheme(t: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = t;
  }
}

export function ThemeProvider({
  children,
  initial = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  initial?: ThemeId;
}) {
  const [theme, setThemeState] = useState<ThemeId>(safeTheme(initial));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Honour any fresh value from the server on hydration.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    applyTheme(safeTheme(attr ?? theme));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<ThemeCtxValue>(
    () => ({
      theme,
      setTheme: (t) => {
        const id = safeTheme(t);
        setThemeState(id);
        applyTheme(id);
      },
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
