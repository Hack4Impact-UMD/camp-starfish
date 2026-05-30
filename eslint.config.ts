import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    files: ["./**/*.{ts,tsx}",],
    plugins: {
      "@typescript-eslint": tsPlugin,
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
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        },
      ],
      "import/no-unresolved": 'error',
    },
  },
  ...[...nextVitals, ...nextTs].map(config => ({
    ...config,
    files: [
      "./src/**/*.{ts,tsx}",
    ],
  })),
]

export default eslintConfig;