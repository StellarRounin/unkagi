import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/unkagi/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
    }),
  ],
});
