import { describe, expect, test } from "bun:test";
import { $ } from "bun";

/**
 * The promise this package makes to consumers: `base.json` and `react.json`
 * are valid oxlint configuration files, on the oxlint version this package
 * declares a peer dependency on. A config that only "looks like JSON" but
 * oxlint refuses to load (an unknown rule name, a plugin oxlint doesn't
 * recognise) is the exact failure mode `oxlint --print-config` catches
 * without running a single lint pass.
 */
describe("@qpmatrix/oxlint-config", () => {
  test("base.json is accepted by oxlint", async () => {
    const result = await $`bun --bun oxlint -c ${import.meta.dir}/../base.json --print-config`
      .quiet()
      .nothrow();
    expect(result.exitCode).toBe(0);
  });

  test("react.json is accepted by oxlint", async () => {
    const result = await $`bun --bun oxlint -c ${import.meta.dir}/../react.json --print-config`
      .quiet()
      .nothrow();
    expect(result.exitCode).toBe(0);
  });

  test("react.json's printed config carries the react-only rules", async () => {
    const result = await $`bun --bun oxlint -c ${import.meta.dir}/../react.json --print-config`
      .quiet()
      .nothrow();
    expect(result.exitCode).toBe(0);
    const config = JSON.parse(result.stdout.toString()) as { rules: Record<string, unknown> };
    expect(config.rules["react/rules-of-hooks"]).toBeDefined();
    expect(config.rules["typescript/no-explicit-any"]).toBeDefined();
  });
});
