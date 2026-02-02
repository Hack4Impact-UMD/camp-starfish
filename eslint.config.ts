import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...[...nextVitals, ...nextTs].map(config => ({
    ...config,
    files: [
      "./src/**/*.{ts,tsx}",
    ],
  })),
  {
    files: [
      "./src/**/*.{ts,tsx}",
      "./functions/src/**/*.{ts,tsx}",
      "./apps-script/src/**/*.{ts,tsx}",
    ],
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: [
      "./src/**/*.{ts,tsx}",
      "./functions/src/**/*.{ts,tsx}",
    ],
    plugins: {
      "import": importPlugin
    },
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.json"],
        },
      },
    },
    rules: {
      "import/no-unresolved": 'error',
    }
  },
]

export default eslintConfig;