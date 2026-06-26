import { defineConfig } from 'vite'

// store (Food-Store-client) — vite.config.ts
export default defineConfig({
  server: {
    host: "localhost",
    port: 5174,
    allowedHosts: ["client.localtest.me"],
  },
});