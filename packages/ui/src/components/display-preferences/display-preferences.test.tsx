import "../../test-setup";

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QP_REDUCED_MOTION_ATTRIBUTE } from "../../lib/motion/motion-core.constants";
import { QPDisplayPreferences } from "./display-preferences";
import { QP_DISPLAY_PREFERENCES_NOOP_ADAPTER } from "./display-preferences.constants";
import type {
  QPDisplayPreferencesPersistedState,
  QPDisplayPreferencesStorageAdapter,
} from "./display-preferences.types";
import {
  qpIsColorScheme,
  qpIsTextSize,
  qpParsePersistedPreferences,
  qpResolveEffectiveThemeMode,
  qpResolveFontScale,
  qpSerializePreferences,
} from "./display-preferences.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

function fakeAdapter(initial?: Partial<QPDisplayPreferencesPersistedState>): {
  adapter: QPDisplayPreferencesStorageAdapter;
  writes: string[];
} {
  const writes: string[] = [];
  let stored: string | null = initial === undefined ? null : JSON.stringify(initial);
  return {
    adapter: {
      read: () => stored,
      write: (_key, value) => {
        stored = value;
        writes.push(value);
      },
    },
    writes,
  };
}

const textSizeItems = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const colorSchemeItems = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const BASE = {
  legend: "Display",
  textSizeLabel: "Text size",
  textSizeItems,
  reducedMotionLabel: "Reduce motion",
  colorSchemeLabel: "Colour scheme",
  colorSchemeItems,
  storageAdapter: QP_DISPLAY_PREFERENCES_NOOP_ADAPTER,
} as const;

afterEach(() => {
  cleanup();
});

describe("QPDisplayPreferences", () => {
  test("AC-6 — the panel is a labelled group", () => {
    const { getByRole } = render(<QPDisplayPreferences {...BASE} />);

    expect(getByRole("group", { name: "Display" })).toBeInTheDocument();
  });

  test("AC-6 — every control has a visible label", () => {
    const { getByText, getByRole } = render(<QPDisplayPreferences {...BASE} />);

    expect(getByText("Text size")).toBeInTheDocument();
    expect(getByText("Reduce motion")).toBeInTheDocument();
    expect(getByText("Colour scheme")).toBeInTheDocument();
    expect(getByRole("group", { name: "Text size" })).toBeInTheDocument();
    expect(getByRole("group", { name: "Colour scheme" })).toBeInTheDocument();
    expect(getByRole("switch", { name: "Reduce motion" })).toBeInTheDocument();
  });

  test("copy is a prop — RTL labels render untouched", () => {
    const { getByText } = render(
      <QPDisplayPreferences
        {...BASE}
        legend="العرض"
        textSizeLabel="حجم النص"
        reducedMotionLabel="تقليل الحركة"
        colorSchemeLabel="نظام الألوان"
      />,
    );

    expect(getByText("حجم النص")).toBeInTheDocument();
    expect(getByText("تقليل الحركة")).toBeInTheDocument();
    expect(getByText("نظام الألوان")).toBeInTheDocument();
  });

  test("className merges last without clobbering the component's own classes", () => {
    const { container } = render(<QPDisplayPreferences {...BASE} className="max-w-sm" />);

    expect(container.querySelector('[data-slot="display-preferences"]')?.className).toContain(
      "max-w-sm",
    );
  });

  describe("AC-6 — text size updates the root font-size percentage", () => {
    test("defaults to 100% and updates when a segment is chosen", async () => {
      const user = await setupUser();
      const target = document.createElement("div");
      const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

      expect(target.style.fontSize).toBe("100%");

      await user.click(getByRole("button", { name: "Large" }));
      expect(target.style.fontSize).toBe("112.5%");

      await user.click(getByRole("button", { name: "Small" }));
      expect(target.style.fontSize).toBe("87.5%");
    });

    test("defaultTextSize seeds the initial percentage", () => {
      const target = document.createElement("div");
      render(<QPDisplayPreferences {...BASE} defaultTextSize="lg" root={() => target} />);

      expect(target.style.fontSize).toBe("112.5%");
    });
  });

  describe("AC-6 — reduced motion sets the root attribute the kit's motion utilities read", () => {
    test("off by default; the switch enables it and sets the attribute value", async () => {
      const user = await setupUser();
      const target = document.createElement("div");
      const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

      expect(target.hasAttribute(QP_REDUCED_MOTION_ATTRIBUTE)).toBe(false);

      const toggle = getByRole("switch", { name: "Reduce motion" });
      await user.click(toggle);

      expect(target.getAttribute(QP_REDUCED_MOTION_ATTRIBUTE)).toBe("reduce");
      expect(toggle).toHaveAttribute("aria-checked", "true");

      await user.click(toggle);
      expect(target.hasAttribute(QP_REDUCED_MOTION_ATTRIBUTE)).toBe(false);
    });

    test("is reachable and operable by keyboard alone (WCAG 2.2 SC 2.1.1)", async () => {
      const user = await setupUser();
      const target = document.createElement("div");
      const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

      const toggle = getByRole("switch", { name: "Reduce motion" });
      toggle.focus();
      expect(toggle).toHaveFocus();

      await user.keyboard(" ");
      expect(target.getAttribute(QP_REDUCED_MOTION_ATTRIBUTE)).toBe("reduce");
    });
  });

  describe("colour scheme applies through the kit's theme contract", () => {
    test("selecting light sets data-theme, selecting dark clears it", async () => {
      const user = await setupUser();
      const target = document.createElement("div");
      const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

      await user.click(getByRole("button", { name: "Light" }));
      expect(target.getAttribute("data-theme")).toBe("light");
      expect(target.getAttribute("data-qp-accent")).toBe("brand");

      await user.click(getByRole("button", { name: "Dark" }));
      expect(target.hasAttribute("data-theme")).toBe(false);
      expect(target.getAttribute("data-qp-accent")).toBe("brand");
    });
  });

  describe("persistence", () => {
    test("reads an existing preference on mount", () => {
      const { adapter } = fakeAdapter({
        textSize: "lg",
        reducedMotion: true,
        colorScheme: "light",
      });
      const target = document.createElement("div");
      const { getByRole } = render(
        <QPDisplayPreferences {...BASE} storageAdapter={adapter} root={() => target} />,
      );

      expect(target.style.fontSize).toBe("112.5%");
      expect(target.getAttribute(QP_REDUCED_MOTION_ATTRIBUTE)).toBe("reduce");
      expect(target.getAttribute("data-theme")).toBe("light");
      expect(getByRole("button", { name: "Large" })).toHaveAttribute("aria-pressed", "true");
    });

    test("writes the full preference state after a change", async () => {
      const user = await setupUser();
      const { adapter, writes } = fakeAdapter();
      const { getByRole } = render(<QPDisplayPreferences {...BASE} storageAdapter={adapter} />);

      await user.click(getByRole("button", { name: "Large" }));

      await waitFor(() => {
        expect(writes.length).toBeGreaterThan(0);
      });
      const last = JSON.parse(
        writes[writes.length - 1] ?? "{}",
      ) as QPDisplayPreferencesPersistedState;
      expect(last.textSize).toBe("lg");
    });

    test("AC-6 (renders correctly when storage throws) — a throwing custom adapter never crashes the panel", async () => {
      const user = await setupUser();
      const throwingAdapter: QPDisplayPreferencesStorageAdapter = {
        read: () => {
          throw new Error("storage disabled");
        },
        write: () => {
          throw new Error("quota exceeded");
        },
      };
      const target = document.createElement("div");

      const { getByRole } = render(
        <QPDisplayPreferences {...BASE} storageAdapter={throwingAdapter} root={() => target} />,
      );

      // The component guards a caller-supplied adapter defensively (belt and
      // suspenders on top of the shipped default adapter's own try/catch),
      // so even an adapter that throws on every call never breaks the panel.
      expect(getByRole("group", { name: "Display" })).toBeInTheDocument();
      await user.click(getByRole("button", { name: "Large" }));
      expect(target.style.fontSize).toBe("112.5%");
    });

    test("the default adapter renders correctly when localStorage itself throws", async () => {
      const user = await setupUser();
      const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
      const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
      window.localStorage.getItem = () => {
        throw new Error("storage disabled");
      };
      window.localStorage.setItem = () => {
        throw new Error("quota exceeded");
      };

      try {
        const target = document.createElement("div");
        const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

        expect(getByRole("group", { name: "Display" })).toBeInTheDocument();

        await user.click(getByRole("button", { name: "Large" }));
        expect(target.style.fontSize).toBe("112.5%");
      } finally {
        window.localStorage.getItem = originalGetItem;
        window.localStorage.setItem = originalSetItem;
      }
    });

    test("QP_DISPLAY_PREFERENCES_NOOP_ADAPTER persists nothing but every control still works", async () => {
      const user = await setupUser();
      const target = document.createElement("div");
      const { getByRole } = render(<QPDisplayPreferences {...BASE} root={() => target} />);

      await user.click(getByRole("button", { name: "Large" }));
      expect(target.style.fontSize).toBe("112.5%");
      expect(QP_DISPLAY_PREFERENCES_NOOP_ADAPTER.read("anything")).toBeNull();
    });
  });

  test("onTextSizeChange / onReducedMotionChange / onColorSchemeChange fire with the new value", async () => {
    const user = await setupUser();
    const onTextSizeChange = mock<(value: string) => void>();
    const onReducedMotionChange = mock<(value: boolean) => void>();
    const onColorSchemeChange = mock<(value: string) => void>();
    const { getByRole } = render(
      <QPDisplayPreferences
        {...BASE}
        onTextSizeChange={onTextSizeChange}
        onReducedMotionChange={onReducedMotionChange}
        onColorSchemeChange={onColorSchemeChange}
      />,
    );

    await user.click(getByRole("button", { name: "Small" }));
    expect(onTextSizeChange).toHaveBeenCalledWith("sm");

    await user.click(getByRole("switch", { name: "Reduce motion" }));
    expect(onReducedMotionChange).toHaveBeenCalledWith(true);

    await user.click(getByRole("button", { name: "Dark" }));
    expect(onColorSchemeChange).toHaveBeenCalledWith("dark");
  });

  describe("pure helpers", () => {
    test("qpIsTextSize / qpIsColorScheme narrow correctly", () => {
      expect(qpIsTextSize("sm")).toBe(true);
      expect(qpIsTextSize("xl")).toBe(false);
      expect(qpIsColorScheme("system")).toBe(true);
      expect(qpIsColorScheme("solarized")).toBe(false);
    });

    test("qpResolveFontScale maps every step", () => {
      expect(qpResolveFontScale("sm")).toBe("87.5%");
      expect(qpResolveFontScale("md")).toBe("100%");
      expect(qpResolveFontScale("lg")).toBe("112.5%");
    });

    test("qpResolveEffectiveThemeMode resolves system against the OS preference", () => {
      expect(qpResolveEffectiveThemeMode("light", false)).toBe("light");
      expect(qpResolveEffectiveThemeMode("dark", true)).toBe("dark");
      expect(qpResolveEffectiveThemeMode("system", true)).toBe("light");
      expect(qpResolveEffectiveThemeMode("system", false)).toBe("dark");
    });

    test("qpParsePersistedPreferences drops an invalid field without dropping the valid ones", () => {
      expect(qpParsePersistedPreferences(null)).toEqual({});
      expect(qpParsePersistedPreferences("not json")).toEqual({});
      expect(
        qpParsePersistedPreferences(
          JSON.stringify({ textSize: "xl", reducedMotion: true, colorScheme: "dark" }),
        ),
      ).toEqual({ reducedMotion: true, colorScheme: "dark" });
    });

    test("qpSerializePreferences round-trips through qpParsePersistedPreferences", () => {
      const state = { textSize: "lg", reducedMotion: true, colorScheme: "light" } as const;
      expect(qpParsePersistedPreferences(qpSerializePreferences(state))).toEqual(state);
    });
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPDisplayPreferences {...BASE} />);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});
