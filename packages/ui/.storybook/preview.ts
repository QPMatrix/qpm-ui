import type { Preview } from "@storybook/react-vite";

// The real stylesheet an app imports — Tailwind, shadcn's variants, and
// @qpmatrix/tokens in the exact order the cascade requires. Importing anything
// narrower here would make the preview lie about what consumers get.
import "../styles/qpmatrix.css";

import { QP_THEME_MODES, themeAttributes } from "../src/lib/theme";

/**
 * Theme switching mirrors production exactly: dark is `:root` and light is
 * `[data-theme="light"]`, so the toolbar toggle sets one attribute on
 * `<html>` — the same single attribute an app sets server-side. There is no
 * provider to mount, and nothing here that an app would not also do.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // "todo" surfaces violations in the panel without failing the render.
      // CI runs the real gate (`bun run a11y:validate`); this is the authoring
      // loop, where a hard failure on every keystroke helps nobody.
      test: "todo",
    },

    backgrounds: { disable: true },
  },

  globalTypes: {
    theme: {
      description: "QPMatrix theme mode",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: QP_THEME_MODES.map((mode) => ({ value: mode, title: mode })),
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: "dark",
  },

  decorators: [
    (Story, context) => {
      const mode = context.globals.theme === "light" ? "light" : "dark";
      const attributes = themeAttributes({ mode, accent: "brand" });
      const root = document.documentElement;

      // `themeAttributes` deliberately OMITS data-theme for dark (dark is the
      // token default), so a stale attribute has to be removed rather than
      // overwritten — otherwise switching light → dark would leave light on.
      root.removeAttribute("data-theme");
      for (const [attribute, value] of Object.entries(attributes)) {
        root.setAttribute(attribute, value);
      }

      return Story();
    },
  ],
};

export default preview;
