import type { Config } from "prettier";

// Inline for now — QPMSEC-433 commit 2 ports @qpmatrix/prettier-config and
// this file switches to re-exporting it (`export { default } from
// "@qpmatrix/prettier-config"`), removing this duplication (code-craft
// rule 7). Kept inline here so the workspace scaffold commit is green on
// its own, before any package exists to depend on.
const config: Config = {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  printWidth: 100,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
};

export default config;
