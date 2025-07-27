import { createContext } from "react";
import type { ThemeContextType } from "@ui/theme/types";
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
