import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the Personal Daily Task Manager.
// The react() plugin enables JSX support and fast refresh during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // The dev server runs on http://localhost:5173
    open: false, // Set to true to auto-open the browser when you run "npm run dev"
    // 👇 Forward API calls to the Express backend (which talks to MongoDB).
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
});
