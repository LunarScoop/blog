import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL("https://knowledge-garden.example");
  const sitemapUrl = new URL("sitemap-index.xml", siteUrl);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /preview/",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
