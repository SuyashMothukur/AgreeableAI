import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/scenario": "http://localhost:3001",
      "/chat": "http://localhost:3001",
      "/submit": "http://localhost:3001",
      "/stats": "http://localhost:3001",
      "/api": "http://localhost:3001",
    },
  },
});
