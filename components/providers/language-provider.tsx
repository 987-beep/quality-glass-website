"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, type Dict, type Lang } from "@/lib/i18n";

type LanguageCtxValue = {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
};

const LanguageCtx = createContext<LanguageCtxValue>({
  lang: "en",
  t: dictionaries.en,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("qg-lang");
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("qg-lang", l);
  };

  const value = useMemo(
    () => ({ lang, t: dictionaries[lang], setLang }),
    [lang]
  );

  return (
    <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>
  );
}

export const useLanguage = () => useContext(LanguageCtx);
