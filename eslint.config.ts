import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { Linter } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig: Linter.Config[] = [
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
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
];

export default eslintConfig;
