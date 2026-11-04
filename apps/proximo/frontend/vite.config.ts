// Copie de travail : PWA désactivée jusqu'à extraction du métier immobilier.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:3100", changeOrigin: true },
      "/rails": { target: "http://localhost:3100", changeOrigin: true },
    },
  },
});
