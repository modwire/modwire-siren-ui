import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const internalUiImportPatterns = Object.freeze([
  "@modwire/siren-ui/*/*",
  "@modwire/siren-ui/src/*",
  "@modwire/siren-ui/dist/*",
  "../../src/*",
  "../src/*",
]);

export default defineConfig(
  {
    ignores: ["coverage", "dist"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
  },
  {
    files: ["src/domain/vocabulary/*.ts", "src/errors/code.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: internalUiImportPatterns,
        },
      ],
    },
  },
  {
    files: ["tests/**/*.ts"],
    ignores: ["tests/support/client/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["@modwire/siren-client"],
          patterns: internalUiImportPatterns,
        },
      ],
    },
  },
);
