import { createTw } from "react-pdf-tailwind";
import tailwindConfig from "../../tailwind.config";

/**
 * React-PDF Tailwind utility using styles from tailwind.config.ts
 * Adapts the Tailwind config for use with react-pdf-tailwind
 */
export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Helvetica"],
      "ui-sans-serif": ["Helvetica"],
    },
    extend: {
      colors: {
        ...(tailwindConfig.theme?.extend?.colors || {}),
        header: "#000",
        bunk: "#d3d3d3",
        "gray-light": "#f0f0f0",
        "gray-medium": "#d9d9d9",
        "gray-50": "#f8f9fa",
        "gray-400": "#b8b8b8",
        "gray-700": "#495057",
        "gray-900": "#333",
      },
    },
  },
});
