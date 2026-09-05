import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Storybook is @qpmatrix/ui's PREVIEW surface.
 *
 * It is not decoration: it is where a component is proven to work before it is
 * registered. `addon-a11y` runs axe against every story on render, catching the
 * structural violations `bun test` also checks, plus the colour-contrast ones
 * that axe cannot evaluate under happy-dom (see src/testing/axe.ts) because
 * there is no real layout or compositing there. `bun run a11y:contrast` covers
 * contrast at the token layer; this covers it as rendered.
 *
 * Vite (not Bun's bundler) is used here only because Storybook's React
 * framework builds on it. Nothing in `src/` may depend on Vite — it exists
 * inside this directory and nowhere else.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],

  addons: [
    // Runs axe-core on every story render and reports in the a11y panel.
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  // Tailwind v4 is a Vite plugin, not a PostCSS config. Without this the
  // preview would load styles/qpmatrix.css as inert text and every component
  // would render unstyled — which reads as "the tokens are broken" rather than
  // "Tailwind never ran".
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), tailwindcss()],
  }),

  typescript: {
    // react-docgen-typescript feeds the autodocs prop tables. It is the only
    // reason `argTypes` in a story can be terse: descriptions come from the
    // TSDoc on each prop, so the doc comment in the component IS the API doc.
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
