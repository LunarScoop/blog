import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkCallouts from "./src/plugins/remark-callouts.mjs";
import remarkMermaid from "./src/plugins/remark-mermaid.mjs";

const site = process.env.SITE_URL ?? "https://knowledge-garden.example";

export default defineConfig({
  site,
  integrations: [
    expressiveCode(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/preview/") && !page.endsWith("/search/") && !page.endsWith("/404/"),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts, remarkMermaid],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 700,
    },
  },
});
