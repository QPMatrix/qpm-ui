import {
  QP_ACCENT_TOKEN_ROLES,
  QP_THEME_ACCENTS,
  QP_THEME_MODES,
  type QpThemeMode,
} from "../src/lib/theme";
import {
  CONTRAST_USAGE_MINIMUMS,
  KNOWN_CONTRAST_WAIVERS,
  evaluateAccentContrast,
  evaluateAllContrastPairs,
  type ContrastResult,
} from "../src/testing/contrast";

/**
 * `bun run a11y:contrast` (packages/ui/package.json).
 *
 * Evaluates every pair in `APPROVED_CONTRAST_PAIRS` and every accent's
 * base/strong fill (`evaluateAccentContrast`) against WCAG 2.2 AA, across
 * both approved theme modes. Exits non-zero when:
 *   - any pair/accent fails and has no waiver, or
 *   - a waiver in `KNOWN_CONTRAST_WAIVERS` has gone stale, i.e. the pair it
 *     covers now passes, so the waiver entry is no longer accurate and must
 *     be deleted.
 * Waived failures are never silent: they print loudly, with the waiver's
 * documented reason and mitigation.
 */

interface TableRow {
  readonly id: string;
  readonly mode: QpThemeMode;
  readonly foreground: string;
  readonly background: string;
  readonly ratio: number;
  readonly required: number;
  readonly verdict: "PASS" | "FAIL" | "WAIVED" | "STALE WAIVER";
}

function verdictFor(passes: boolean, waived: boolean): TableRow["verdict"] {
  if (waived) {
    return passes ? "STALE WAIVER" : "WAIVED";
  }
  return passes ? "PASS" : "FAIL";
}

function pairRows(results: readonly ContrastResult[]): TableRow[] {
  return results.map((result) => ({
    id: result.pair.id,
    mode: result.mode,
    foreground: result.pair.foreground,
    background: result.pair.background,
    ratio: result.ratio,
    required: result.required,
    verdict: verdictFor(result.passes, result.waived),
  }));
}

function isKnownAccent(value: string): value is (typeof QP_THEME_ACCENTS)[number] {
  return (QP_THEME_ACCENTS as readonly string[]).includes(value);
}

function accentRows(): TableRow[] {
  return evaluateAccentContrast(QP_THEME_MODES).map((result) => {
    if (!isKnownAccent(result.accent)) {
      throw new Error(
        `evaluateAccentContrast returned unknown accent "${result.accent}", not present in QP_THEME_ACCENTS.`,
      );
    }
    const roles = QP_ACCENT_TOKEN_ROLES[result.accent];
    return {
      id: `accent:${result.accent}-${result.role}`,
      mode: result.mode,
      foreground: roles.foreground,
      background: roles[result.role],
      ratio: result.ratio,
      required: CONTRAST_USAGE_MINIMUMS["ui-component"],
      verdict: verdictFor(result.passes, false),
    };
  });
}

function formatTable(rows: readonly TableRow[]): string {
  const headers = ["ID", "MODE", "FOREGROUND", "BACKGROUND", "RATIO", "REQUIRED", "VERDICT"];
  const dataRows = rows.map((row) => [
    row.id,
    row.mode,
    row.foreground,
    row.background,
    row.ratio.toFixed(2),
    `${row.required.toFixed(1)}:1`,
    row.verdict,
  ]);
  const allRows = [headers, ...dataRows];
  const widths = headers.map((_header, columnIndex) =>
    Math.max(...allRows.map((row) => (row[columnIndex] ?? "").length)),
  );
  const formatRow = (cells: readonly string[]): string =>
    cells.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join("  ");
  const separator = widths.map((width) => "-".repeat(width)).join("  ");
  return [formatRow(headers), separator, ...dataRows.map(formatRow)].join("\n");
}

function main(): void {
  const pairResults = evaluateAllContrastPairs(QP_THEME_MODES);
  const rows = [...pairRows(pairResults), ...accentRows()];

  console.log(formatTable(rows));
  console.log("");

  const staleWaivers = pairResults.filter((result) => result.waived && result.passes);
  const waivedFailures = pairResults.filter((result) => result.waived && !result.passes);
  const unwaivedFailures = rows.filter((row) => row.verdict === "FAIL");

  if (waivedFailures.length > 0) {
    console.log("WAIVED — accepted, documented contrast failures (never silent):");
    for (const result of waivedFailures) {
      const waiver = KNOWN_CONTRAST_WAIVERS.find(
        (candidate) => candidate.pairId === result.pair.id && candidate.modes.includes(result.mode),
      );
      console.log(
        `  [${result.pair.id}] mode=${result.mode} ratio=${result.ratio.toFixed(2)} required=${result.required.toFixed(1)}:1`,
      );
      if (waiver === undefined) {
        console.log(
          "    WARNING: this result is waived but no matching KNOWN_CONTRAST_WAIVERS entry was found — this should be unreachable.",
        );
      } else {
        console.log(`    reason: ${waiver.reason}`);
        console.log(`    mitigation: ${waiver.mitigation}`);
      }
    }
    console.log("");
  }

  let hasError = false;

  if (staleWaivers.length > 0) {
    hasError = true;
    console.error(
      "STALE WAIVER(S) — these pairs now PASS but still carry a KNOWN_CONTRAST_WAIVERS entry. Delete the waiver:",
    );
    for (const result of staleWaivers) {
      console.error(
        `  [${result.pair.id}] mode=${result.mode} ratio=${result.ratio.toFixed(2)} (required ${result.required.toFixed(1)}:1) — now passes; the waiver is stale.`,
      );
    }
    console.error("");
  }

  if (unwaivedFailures.length > 0) {
    hasError = true;
    console.error(`FAIL — ${unwaivedFailures.length} unwaived contrast failure(s):`);
    for (const row of unwaivedFailures) {
      console.error(
        `  [${row.id}] mode=${row.mode} ratio=${row.ratio.toFixed(2)} required=${row.required.toFixed(1)}:1`,
      );
    }
    console.error("");
  }

  if (hasError) {
    process.exit(1);
  }

  console.log(
    `OK — ${rows.length} contrast check(s) evaluated across ${QP_THEME_MODES.length.toString()} approved mode(s).`,
  );
}

main();
