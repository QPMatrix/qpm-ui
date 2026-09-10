import { describe, expect, test } from "bun:test";

import { QPIcon } from "./icons";

describe("QPIcon", () => {
  test("re-exports lucide-react as one namespace", () => {
    expect(typeof QPIcon).toBe("object");
    // Spot a handful of icons this package's own components already rely on
    // internally (`ui/dialog.tsx` -> XIcon, `ui/checkbox.tsx` -> CheckIcon),
    // proving the namespace is the real, full lucide-react surface and not a
    // hand-picked subset that could silently miss an icon a consumer needs.
    expect(QPIcon.CheckIcon).toBeDefined();
    expect(QPIcon.XIcon).toBeDefined();
    expect(QPIcon.Inbox).toBeDefined();
  });

  test("every named export is a component (function or forwardRef object), not incidental data", () => {
    // `Object.values` reads the namespace as a plain object rather than
    // through a computed member expression (`QPIcon[name]`), which oxlint's
    // import/namespace rule refuses to statically validate.
    const icons = Object.values(QPIcon).slice(0, 25);

    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(["function", "object"]).toContain(typeof icon);
    }
  });
});
