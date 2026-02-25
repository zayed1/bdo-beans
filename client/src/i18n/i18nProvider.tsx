import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import arMessages from "./ar.json";
import enMessages from "./en.json";

type Locale = "ar" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
}

const messages: Record<Locale, Record<string, any>> = {
  ar: arMessages,
  en: enMessages,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bdo-beans-locale");
      if (saved === "ar" || saved === "en") return saved;
    }
    return "ar";
  });

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("bdo-beans-locale", locale);
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.style.fontFamily =
      locale === "ar"
        ? "'IBM Plex Sans Arabic', sans-serif"
        : "'Inter', sans-serif";
  }, [locale, dir]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(messages[locale], key);
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{{${paramKey}}}`, String(paramValue));
        });
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
