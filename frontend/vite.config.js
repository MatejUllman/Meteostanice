import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["mstanice.cz"],
    host: true,
  },
  plugins: [react(), tailwindcss()],
});
