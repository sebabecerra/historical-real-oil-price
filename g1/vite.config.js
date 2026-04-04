import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "historical-real-oil-price";

export default defineConfig({
  base: isGithubActions ? `/${repoName}/` : "/",
  plugins: [react()],
  server: {
    port: 5174,
  },
});
