import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import plugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript").map(config => ({
    ...config,
    files: ["./src/**/*.{ts,tsx}"]
  })),
  {
    files: [
      "./src/**/*.{ts,tsx}",
      "./functions/src/**/*.{ts,tsx}",
      "./apps-script/src/**/*.{ts,tsx}",
    ],
    plugins: {
      "@typescript-eslint": plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
])