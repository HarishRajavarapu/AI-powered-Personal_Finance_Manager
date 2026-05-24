import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "finance-ui-theme",
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return window.localStorage.getItem(storageKey) || defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(getSystemTheme());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const resolvedTheme = theme === "system" ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, systemTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme === "system" ? systemTheme : theme,
      setTheme,
    }),
    [systemTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

