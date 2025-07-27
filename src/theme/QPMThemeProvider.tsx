import { useEffect, useState, type FC, type ReactNode } from "react";
import type { ThemeMode } from "./types";
import { ThemeContext } from "./context";

interface QPMThemeProviderProps {
  defaultTheme?: ThemeMode;
  children: ReactNode;
}
export const QPMThemeProvider: FC<QPMThemeProviderProps> = ({
  defaultTheme = "auto",
  children,
}) => {
  const [themeMode, setTheme] = useState<ThemeMode>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      if (themeMode === "auto") {
        root.removeAttribute("data-theme");
        localStorage.removeItem("theme");

        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.setAttribute("data-theme", systemDark ? "dark" : "light");
        setIsDark(systemDark);
      } else {
        root.setAttribute("data-theme", themeMode);
        localStorage.setItem("theme", themeMode);
        setIsDark(themeMode === "dark");
      }
    };
    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "auto") {
        applyTheme();
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);
  return (
    <ThemeContext.Provider value={{ theme: themeMode, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
