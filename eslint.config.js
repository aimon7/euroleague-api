import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint, { parser as eslintParserTypeScript } from "typescript-eslint";

import prettierConfig from "./prettier.config.mjs";

export default tseslint.config([
  {
    ignores: ["**/.git", "**/.svn", "**/.hg", "**/node_modules", "coverage", "dist", "dist/**", "**/dist/**"]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,cts,mts}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parser: eslintParserTypeScript,
      parserOptions: {
        project: {
          extends: "./tsconfig.json",
          include: ["src/**/*.ts", "scripts/**/*.ts", "examples/**/*.ts", "*.config.ts", "*.config.js", "*.config.mjs"],
          exclude: ["node_modules", "dist", "build", "coverage"]
        },
        sourceType: "module"
      }
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      curly: ["error", "all"],
      "no-console": "warn",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^node:"],
            ["^@?\\w"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"]
          ]
        }
      ]
    }
  },
  {
    files: ["**/*"],
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      "prettier/prettier": ["error", prettierConfig]
    }
  },
  eslintConfigPrettier
]);
