// @lovable.dev/vite-tanstack-config already includes the core TanStack/Lovable plugins.
// Keep the page implementation inside src/routes/index.tsx and only add Nitro here
// so Vercel deploys the app instead of falling back to a static HTML workaround.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [nitro()],
  },
});
