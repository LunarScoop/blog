import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";

const distDirectory = resolve("dist");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : entryPath;
    }),
  );

  return files.flat();
}

async function assertFile(relativePath) {
  await access(resolve(distDirectory, relativePath));
}

const requiredFiles = [
  "index.html",
  "404.html",
  "about/index.html",
  "learn/index.html",
  "learn/math/index.html",
  "learn/math/calculus/index.html",
  "learn/math/linear-algebra/index.html",
  "learn/math/probability/index.html",
  "learn/cs/index.html",
  "learn/cs/data-structures/index.html",
  "learn/cs/computer-organization/index.html",
  "learn/cs/os/index.html",
  "learn/cs/network/index.html",
  "projects/index.html",
  "projects/tiny-web-server/index.html",
  "thoughts/index.html",
  "thoughts/why-i-built-this-blog/index.html",
  "search/index.html",
  "robots.txt",
  "rss.xml",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "og.png",
  "pagefind/pagefind.js",
];

await Promise.all(requiredFiles.map(assertFile));

const allFiles = await collectFiles(distDirectory);
const htmlFiles = allFiles.filter((file) => extname(file) === ".html");
const htmlDocuments = await Promise.all(
  htmlFiles.map(async (file) => ({
    file,
    relativePath: relative(distDirectory, file).split(sep).join("/"),
    html: await readFile(file, "utf8"),
  })),
);

for (const document of htmlDocuments) {
  const context = `${document.relativePath} 缺少`;
  assert.match(document.html, /<title>[^<]+<\/title>/, `${context} title 喵~`);
  assert.match(
    document.html,
    /<meta name="description" content="[^"]+">/,
    `${context} description 喵~`,
  );
  assert.match(
    document.html,
    /<link rel="canonical" href="https?:\/\/[^"]+">/,
    `${context} canonical 喵~`,
  );
  assert.match(
    document.html,
    /<meta property="og:title" content="[^"]+">/,
    `${context} og:title 喵~`,
  );
  assert.match(
    document.html,
    /<meta property="og:description" content="[^"]+">/,
    `${context} og:description 喵~`,
  );
  assert.match(
    document.html,
    /<meta property="og:url" content="https?:\/\/[^"]+">/,
    `${context} og:url 喵~`,
  );
  assert.match(
    document.html,
    /<meta property="og:image" content="https?:\/\/[^"]+\/og\.png">/,
    `${context} og:image 喵~`,
  );

  if (!document.relativePath.startsWith("preview/")) {
    const h1Count = document.html.match(/<h1(?:\s|>)/g)?.length ?? 0;
    assert.equal(h1Count, 1, `${document.relativePath} 应当只有一个 H1 喵~`);
  }
}

for (const specialPage of ["404.html", "search/index.html", "preview/markdown/index.html"]) {
  const document = htmlDocuments.find(({ relativePath }) => relativePath === specialPage);
  assert(
    document?.html.includes('name="robots" content="noindex,nofollow"'),
    `${specialPage} 应当禁止索引喵~`,
  );
}

const resolveInternalTarget = (href, sourceFile) => {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(href)) {
    return undefined;
  }

  const sourceRoute = `/${relative(distDirectory, dirname(sourceFile)).split(sep).join("/")}/`;
  const pathname = new URL(href, `https://audit.invalid${sourceRoute}`).pathname;
  const normalizedPath = decodeURIComponent(pathname).replace(/^\/+/, "");

  if (!normalizedPath) {
    return resolve(distDirectory, "index.html");
  }

  if (extname(normalizedPath)) {
    return resolve(distDirectory, normalizedPath);
  }

  return resolve(distDirectory, normalizedPath, "index.html");
};

for (const document of htmlDocuments) {
  for (const [, href] of document.html.matchAll(/href="([^"]+)"/g)) {
    const target = resolveInternalTarget(href, document.file);

    if (target) {
      await access(target).catch(() => {
        assert.fail(`${document.relativePath} 的站内链接 ${href} 没有对应构建产物喵~`);
      });
    }
  }
}

const learnAggregateHtml = htmlDocuments
  .filter(
    ({ relativePath, html }) =>
      relativePath.startsWith("learn/") && !html.includes('data-pagefind-meta="type:Learn"'),
  )
  .map(({ html }) => html)
  .join("\n");
const learnDocuments = htmlDocuments.filter(({ html }) =>
  html.includes('data-pagefind-meta="type:Learn"'),
);

for (const document of learnDocuments) {
  const route = `/${dirname(document.relativePath).split(sep).join("/")}/`;
  const routeWithoutTrailingSlash = route.replace(/\/$/, "");
  assert(
    learnAggregateHtml.includes(`href="${route}"`) ||
      learnAggregateHtml.includes(`href="${routeWithoutTrailingSlash}"`),
    `${route} 无法从 Learn 聚合页面进入喵~`,
  );
}

const sitemap = await readFile(resolve(distDirectory, "sitemap-0.xml"), "utf8");
const requiredSitemapPaths = [
  "/",
  "/about/",
  "/learn/",
  "/learn/cs/network/transport/tcp/",
  "/projects/",
  "/projects/tiny-web-server/",
  "/thoughts/",
  "/thoughts/why-i-built-this-blog/",
];

requiredSitemapPaths.forEach((path) => {
  assert(sitemap.includes(`https://knowledge-garden.example${path}`), `Sitemap 缺少 ${path} 喵~`);
});
["/preview/", "/search/", "/404/"].forEach((path) => {
  assert(!sitemap.includes(path), `Sitemap 不应包含 ${path} 喵~`);
});

const rss = await readFile(resolve(distDirectory, "rss.xml"), "utf8");
assert(rss.includes("/thoughts/why-i-built-this-blog/"), "RSS 缺少已发布 Thoughts 喵~");
assert(!rss.includes("/learn/") && !rss.includes("/projects/"), "RSS V1 只能包含 Thoughts 喵~");

const robots = await readFile(resolve(distDirectory, "robots.txt"), "utf8");
assert(
  robots.includes("Sitemap: https://knowledge-garden.example/sitemap-index.xml"),
  "robots 缺少 Sitemap 地址喵~",
);

const socialImage = await readFile(resolve(distDirectory, "og.png"));
assert.equal(socialImage.readUInt32BE(16), 1200, "Open Graph 图片宽度必须是 1200 像素喵~");
assert.equal(socialImage.readUInt32BE(20), 630, "Open Graph 图片高度必须是 630 像素喵~");

console.log(
  `✓ 构建审计通过：${htmlDocuments.length} 个 HTML、${learnDocuments.length} 篇 Learn 正文、站内链接、SEO、RSS、Sitemap 与社交分享图均正常喵~`,
);
