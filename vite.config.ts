/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * The app is served from https://<user>.github.io/bks-learning/,
 * so every asset URL must be prefixed with the repository name.
 */
const BASE_PATH = "/bks-learning/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "BKS Vokabeltrainer",
        short_name: "BKS",
        description: "Kroatisch-Vokabeln lernen",
        lang: "de",
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: "standalone",
        theme_color: "#c8102e",
        background_color: "#ffffff",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
