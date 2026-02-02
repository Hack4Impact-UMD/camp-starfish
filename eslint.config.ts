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
    rules: {
      "import/no-unresolved": 'error',
    }
  },
]

export default eslintConfig;