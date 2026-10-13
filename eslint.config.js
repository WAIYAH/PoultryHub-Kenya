// ESLint flat config. Layering rules mirror ARCHITECTURE.md §5; a violation fails CI.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const fixtures = {
  group: ["@/mocks", "@/mocks/**"],
  message: "Sample fixtures may only be imported by src/services/mock.",
};
const serviceImplementations = {
  group: ["@/services/mock", "@/services/mock/**", "@/services/supabase", "@/services/supabase/**"],
  message: "Use the services entry point (@/services) or a feature hook, never an implementation.",
};
const react = {
  group: ["react", "react/**", "react-dom", "react-dom/**", "react-router", "react-router/**"],
  message: "This layer must stay framework-free.",
};

export default defineConfig([
  globalIgnores([
    "build/",
    ".react-router/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "blob-report/",
  ]),

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.browser },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/only-throw-error": "off", // React Router uses `throw data(...)` / `throw redirect(...)`
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended],
  },

  // Node-side files: configs, scripts, tests.
  {
    files: ["*.config.{js,ts}", "scripts/**", "e2e/**", "react-router.config.ts", "vite.config.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },

  // ---- Layering rules (ARCHITECTURE.md §5) ----
  {
    files: ["src/routes/**", "src/layouts/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [fixtures, serviceImplementations] }] },
  },
  {
    files: ["src/features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            fixtures,
            serviceImplementations,
            {
              group: ["@/features/*/**"],
              message:
                "Import other features through their index.ts (e.g. @/features/cart); use relative paths inside a feature.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            fixtures,
            {
              group: ["@/features", "@/features/**"],
              message: "Shared components must not depend on features.",
            },
            {
              group: ["@/services", "@/services/**"],
              message: "Shared components receive data through props.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/services/**"],
    ignores: ["src/services/mock/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            fixtures,
            react,
            {
              group: ["@/components/**", "@/features/**", "@/routes/**"],
              message: "Services must not import UI.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/services/mock/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            react,
            {
              group: ["@/components/**", "@/features/**", "@/routes/**"],
              message: "Services must not import UI.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            react,
            fixtures,
            {
              group: [
                "@/components/**",
                "@/features/**",
                "@/services/**",
                "@/lib/**",
                "@supabase/*",
              ],
              message:
                "Domain logic is pure TypeScript: no UI, services, browser or Supabase imports.",
            },
          ],
        },
      ],
    },
  },
]);
