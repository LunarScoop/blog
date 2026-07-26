import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { SITE } from "../config/site";
import { getThoughtHref } from "../utils/routes";
import { getThoughts } from "../utils/thoughts";

export const GET: APIRoute = async ({ site }) => {
  const thoughts = await getThoughts({ includeDrafts: false });

  return rss({
    title: `${SITE.name} · Thoughts`,
    description: "Knowledge Garden 的学习总结、阶段复盘与技术思考喵~",
    site: site ?? "https://knowledge-garden.example",
    items: thoughts.map((thought) => ({
      title: thought.data.title,
      description: thought.data.description,
      pubDate: thought.data.published,
      link: getThoughtHref(thought.id),
      categories: thought.data.tags,
    })),
    customData: `<language>${SITE.language}</language>`,
  });
};
