import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      include: ["src"],
      exclude: ["**/*.stories.tsx", "**/*.test.tsx", "**/*.spec.tsx"],
      copyDtsFiles: false,
      rollupTypes: true,
      insertTypesEntry: true,
      outDir: "dist/types",
      entryRoot: "src",
      staticImport: true,
      compilerOptions: {
        declarationMap: true,
        sourceMap: true,
      },
      beforeWriteFile: (filePath, content) => {
        // Ensure CSS module declarations are included
        if (filePath.includes("index.d.ts")) {
          const cssModuleDeclaration = `
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
`;
          return {
            filePath,
            content: content + cssModuleDeclaration,
          };
        }
        return { filePath, content };
      },
    }),
  ],

  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "QPMUi",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "index.css";
          return assetInfo.name || "";
        },
      },
    },
    sourcemap: true,
    minify: "esbuild",
  },

  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "qpm-[local]-[hash:base64:5]",
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
