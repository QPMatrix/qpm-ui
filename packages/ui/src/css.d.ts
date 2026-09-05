/**
 * Side-effect CSS imports.
 *
 * `.storybook/preview.ts` imports `styles/qpmatrix.css` so the preview renders
 * against the real stylesheet an app gets. TypeScript has no idea what a `.css`
 * module is and rejects the import outright (TS2882); Vite resolves it at
 * build time. This declaration is the standard way to tell the compiler the
 * import is legitimate and yields nothing.
 *
 * It affects TYPE CHECKING only — `tsconfig.build.json` includes just `src`
 * for emit, and no runtime module is created by it.
 */
declare module "*.css";
