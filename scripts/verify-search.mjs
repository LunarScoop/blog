import assert from "node:assert/strict";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const distDirectory = resolve("dist");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
    let filePath = resolve(distDirectory, relativePath);

    if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
      response.writeHead(403).end();
      return;
    }

    const fileStats = await stat(filePath);

    if (fileStats.isDirectory()) {
      filePath = resolve(filePath, "index.html");
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));

const address = server.address();

assert(address && typeof address === "object", "本地验证服务器启动失败喵~");

const baseUrl = `http://127.0.0.1:${address.port}/pagefind/`;
const pagefindModuleUrl = pathToFileURL(resolve(distDirectory, "pagefind/pagefind.js")).href;
const pagefind = await import(`${pagefindModuleUrl}?audit=${Date.now()}`);

const expectations = [
  { query: "极限", url: "/learn/math/calculus/limits/" },
  { query: "TCP", url: "/learn/cs/network/transport/tcp/" },
  { query: "虚拟内存", url: "/learn/cs/os/memory/virtual-memory/" },
];

try {
  await pagefind.options({
    basePath: baseUrl,
    language: "zh-cn",
    noWorker: true,
  });

  for (const expectation of expectations) {
    const response = await pagefind.search(expectation.query);
    const resultData = await Promise.all(response.results.map((result) => result.data()));
    const match = resultData.find((result) => result.url.includes(expectation.url));

    assert(match, `搜索“${expectation.query}”未命中 ${expectation.url} 喵~`);
    assert.equal(match.meta.type, "Learn", `搜索“${expectation.query}”缺少内容类型喵~`);
    console.log(`✓ ${expectation.query} → ${match.url} [${match.meta.type}]`);
  }
} finally {
  await pagefind.destroy();
  await new Promise((resolveClose) => server.close(resolveClose));
}
