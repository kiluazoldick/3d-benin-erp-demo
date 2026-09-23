// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette 3N BENIN (alignée sur la V1 DeepSite)
        night: "#04122B",
        deep: "#0A2A6B", // bleu principal
        royal: "#12459E",
        azure: "#2C6BE0",
        ink: "#0B0B0C",
        smoke: "#F4F6FA",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(4,18,43,.12)",
        card: "0 18px 40px -18px rgba(10,42,107,.28)",
      },
    },
  },
  plugins: [],
};

export default config;
