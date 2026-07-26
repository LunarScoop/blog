# Personal Knowledge Garden 维护文档

## 1. 当前状态

- 维护日期：2026-07-26 喵~
- 当前版本：`0.10.0` 喵~
- 已完成阶段：Phase 0 至 Phase 10 喵~
- 规格来源：`personal-knowledge-garden-development-spec.md` 喵~
- 当前交付形态：Astro 静态站点，无数据库、登录系统或服务端运行时喵~

Phase 0 至 Phase 10 的功能基线保持完成状态，本轮额外完成 ulBo 视觉迁移、图片 Hero、Material 风格交互与全站响应式视觉回归喵~

下一阶段是 Phase 11 内容扩充，本轮没有提前执行 Phase 12 部署喵~

## 2. 技术基线

| 项目               | 当前版本或要求 |
| ------------------ | -------------- |
| Node.js            | `>= 22.12.0`   |
| pnpm               | `>= 11.9.0`    |
| Astro              | `7.1.3`        |
| TypeScript         | `6.0.3`        |
| Tailwind CSS       | `4.3.3`        |
| Astro MDX          | `7.0.3`        |
| KaTeX              | `0.18.1`       |
| Mermaid            | `11.16.0`      |
| Expressive Code    | `0.44.1`       |
| Pagefind Extended  | `1.5.2`        |
| `@astrojs/sitemap` | `3.7.3`        |
| `@astrojs/rss`     | `4.0.19`       |

TypeScript 暂时固定在 `6.0.x`，因为当前 Astro 静态检查工具尚不能使用 TypeScript 7 的程序接口喵~

pnpm 11 默认阻止未经确认的依赖构建脚本，项目通过 `pnpm-workspace.yaml` 只允许已确认的安装脚本喵~

`style-to-js@^1.0.0` 固定为 `1.1.21`，用于规避旧版 CommonJS 导出在当前 MDX 与 Rolldown 构建链路中的兼容问题喵~

## 3. 已实现路由

### 基础页面

```text
/
/about
/search
/404.html
```

### Learn 聚合页面

```text
/learn
/learn/math
/learn/math/calculus
/learn/math/linear-algebra
/learn/math/probability
/learn/cs
/learn/cs/data-structures
/learn/cs/computer-organization
/learn/cs/os
/learn/cs/network
```

### Learn 正文页面

```text
/learn/math/calculus/limits/equivalent-infinitesimal
/learn/math/calculus/limits/lhopital-rule
/learn/cs/data-structures/complexity/time-complexity
/learn/cs/os/memory/virtual-memory
/learn/cs/network/transport/tcp
```

### Projects 与 Thoughts

```text
/projects
/projects/tiny-web-server
/thoughts
/thoughts/why-i-built-this-blog
```

### 机器可读端点

```text
/rss.xml
/robots.txt
/sitemap-index.xml
/sitemap-0.xml
```

生产构建当前生成 24 个 HTML 文件，Pagefind 只索引 5 篇 Learn、1 个 Project 与 1 篇 Thought，共 7 个正文页面喵~

`/preview/markdown/` 仅用于 Markdown 与 MDX 回归检查，并设置 `noindex,nofollow` 喵~

## 4. 目录与职责

```text
public/
├── images/
│   └── ulbo-hero.webp
└── og.png
scripts/
├── audit-build.mjs
└── verify-search.mjs
src/
├── components/
│   ├── home/
│   ├── learn/
│   ├── markdown/
│   ├── projects/
│   ├── shared/
│   └── thoughts/
├── config/
│   ├── navigation.ts
│   ├── site.ts
│   └── subjects.ts
├── content/
│   ├── notes/
│   ├── projects/
│   └── thoughts/
├── layouts/
│   ├── BaseLayout.astro
│   ├── KnowledgeLayout.astro
│   ├── ProjectLayout.astro
│   └── ThoughtLayout.astro
├── pages/
├── plugins/
├── styles/
└── utils/
```

- `src/config/site.ts` 统一维护站点名称、描述、语言、作者与默认社交图喵~
- `src/config/subjects.ts` 统一维护领域、学科、公开路径、章节顺序与显示文案喵~
- `src/content.config.ts` 是 Notes、Projects 与 Thoughts 的唯一 Schema 来源喵~
- `src/utils` 统一负责内容过滤、排序、链接与知识导航算法喵~
- `BaseLayout` 统一负责页面骨架、主题、canonical、Open Graph、Twitter Card 与 RSS 发现链接喵~
- 三个正文 Layout 分别负责 Learn、Projects 与 Thoughts 的稳定文章结构喵~
- `scripts/verify-search.mjs` 会在本地 HTTP 环境加载真实 Pagefind 索引并验证规定关键词喵~
- `scripts/audit-build.mjs` 会审计路由、唯一 H1、站内链接、SEO、Learn 可达性、RSS、Sitemap 与社交图尺寸喵~

## 5. 首页与聚合页约定

首页固定包含 Hero、Currently Learning、Knowledge Overview、Recent Notes、Featured Projects 与 Latest Thoughts 六个区块喵~

首页展示的是站点身份和学习概览，不应退化为按时间排列的文章列表喵~

Learn 首页按照数学与计算机两大领域展示所有学科，领域页展示学科，学科页按照章节顺序展示可见笔记喵~

每篇生产环境可见的 Learn 笔记必须能够从 `/learn` 开始，不依赖搜索逐层进入喵~

Projects 与 Thoughts 列表页只能读取 Content Collection，不要在页面里维护重复数据喵~

Thoughts 必须按照 `published` 降序排列，Projects 按最近更新或创建时间降序排列喵~

Project 的 GitHub 与 Demo 链接是可选字段，只有 Frontmatter 提供合法 URL 时才显示对应按钮喵~

## 6. 内容模型与写作约定

Notes 的核心字段如下喵~

```text
title
description
domain
subject
topic
type
tags
difficulty
status
related
created
updated
draft
```

Projects 使用 `status`、`technologies`、`github`、`demo`、`featured`、日期与草稿字段喵~

Thoughts 使用 `published` 作为主要日期，并支持 `updated`、`tags` 与草稿字段喵~

Notes 与 Projects 的 `updated` 不能早于 `created`，Thoughts 的 `updated` 不能早于 `published` 喵~

查询工具在开发环境默认包含草稿，在生产构建中默认排除 `draft: true` 内容，也允许调用方显式覆盖喵~

知识笔记、项目与随想正文都从二级标题开始，页面唯一的一级标题由对应 Layout 根据 Frontmatter 生成喵~

新增知识笔记后需要确认 `src/config/subjects.ts` 已包含对应学科和主题，并运行完整构建审计喵~

公式、代码、Callout、Mermaid、表格与图片必须放在 `MarkdownContent` 内，继续复用统一增强管线与样式喵~

## 7. Knowledge Layout 约定

桌面端在 `xl` 断点启用课程树、正文与本页目录三栏布局，较小尺寸通过左右两个原生 `dialog` Drawer 展示章节和目录喵~

知识顺序先遵循学科配置，再遵循章节配置，最后使用稳定内容 ID 排序，不依赖更新时间喵~

上一篇与下一篇只在当前学科内选择，相关文章依次参考显式关联、主题、标签与学科喵~

本页目录只展示二级和三级标题，并在滚动时更新 `aria-current="location"` 喵~

内容正文使用 `data-pagefind-body`，课程树、目录、导航、相关文章与页脚不进入搜索索引喵~

## 8. Pagefind 搜索

`pnpm build` 会在 Astro 静态构建成功后执行 `pagefind --site dist`，生产索引位于 `dist/pagefind` 喵~

项目使用 Pagefind Extended 包，以支持中文与日文分词能力喵~

搜索范围只有 Learn、Projects 与 Thoughts 正文，聚合页、搜索页、导航和页脚不会进入索引喵~

每个索引页面都提供 `type` 元数据，结果页会显示 `Learn`、`Project` 或 `Thought` 类型喵~

搜索页使用原生 DOM API 安全创建结果结构，只有 Pagefind 生成的高亮摘要写入结果摘要容器喵~

运行下面的命令可以验证三个规格关键词喵~

```bash
pnpm verify:search
```

当前验证映射如下喵~

```text
极限 -> /learn/math/calculus/limits/lhopital-rule/
TCP -> /learn/cs/network/transport/tcp/
虚拟内存 -> /learn/cs/os/memory/virtual-memory/
```

## 9. SEO、RSS 与 Sitemap

`BaseLayout` 为每个页面输出唯一 title、description、canonical、Open Graph 与 Twitter Card 元信息喵~

Learn、Project 与 Thought 详情页使用 `og:type=article`，并按内容日期输出发布时间和更新时间喵~

`public/og.png` 是 1200×630 的默认社交分享图，由内置图像生成流程制作并压缩到项目内喵~

RSS V1 只收录已发布 Thoughts，不包含 Learn 或 Projects 喵~

Sitemap 收录首页、About、全部 Learn 聚合页和正文、Projects 与 Thoughts，并排除 Search、404 与 Preview 喵~

Search、404 与 Preview 页面均设置 `noindex,nofollow` 喵~

`robots.txt` 允许抓取公开内容、禁止抓取 Preview，并指向 Sitemap Index 喵~

站点 URL 从 `SITE_URL` 环境变量读取，未设置时使用保留示例域名 `https://knowledge-garden.example` 以保证本地构建完整喵~

真实部署前必须复制 `.env.example` 的配置方式，并把 `SITE_URL` 替换为正式 HTTPS 域名后重新构建喵~

## 10. 本地开发与验证

安装依赖喵~

```bash
pnpm install
```

启动开发服务喵~

```bash
pnpm dev
```

执行 Astro 与 TypeScript 检查喵~

```bash
pnpm check
```

执行单元测试喵~

```bash
pnpm test
```

执行生产构建并生成 Pagefind 索引喵~

```bash
pnpm build
```

验证生产搜索索引喵~

```bash
pnpm verify:search
```

审计构建产物喵~

```bash
pnpm verify:build
```

检查格式喵~

```bash
pnpm format:check
```

自动格式化喵~

```bash
pnpm format
```

推荐在提交前依次运行 `pnpm format:check`、`pnpm test`、`pnpm build`、`pnpm verify:search` 与 `pnpm verify:build` 喵~

## 11. 验证记录

Phase 0 至 Phase 10 当前通过以下检查喵~

- `pnpm check`：69 个文件，0 errors、0 warnings、0 hints 喵~
- `pnpm test`：内容工具、知识导航与 Markdown 插件共 10 项测试全部通过喵~
- `pnpm build`：成功生成 24 个 HTML 文件、RSS、robots、Sitemap 与 Pagefind 索引喵~
- Pagefind：索引 7 个正文页面和 489 个词，三个规定关键词全部命中预期内容喵~
- Build Audit：所有公开页面具备 title、description、canonical 与 Open Graph 元信息喵~
- H1 Audit：除专用 Markdown 回归页外，每个 HTML 页面都只有一个 H1 喵~
- Link Integrity：构建产物中的全部站内链接都能解析到实际文件喵~
- Learn Reachability：5 篇生产知识笔记都能从 Learn 聚合体系进入喵~
- RSS Audit：只包含已发布 Thoughts，不包含 Learn 或 Projects 喵~
- Sitemap Audit：包含规格要求的公开页面，并排除 Search、404 与 Preview 喵~
- Social Image Audit：`og.png` 尺寸为 1200×630，且 Open Graph 与 Twitter Card 均使用绝对 URL 喵~
- Draft Strategy：查询层仍支持开发预览与生产过滤，当前示例内容均为正式发布状态喵~
- Browser QA：首页图片 Hero、桌面导航、移动端菜单、暗色模式、Knowledge 三栏和 Search 结果均已验证，浏览器控制台没有错误喵~

## 12. 响应式、无障碍与代码质量约定

- 所有交互控件必须提供可读名称、可见焦点态与至少 44 像素的触控区域喵~
- 移动端菜单与知识 Drawer 必须支持关闭按钮、遮罩关闭、Escape 和焦点返回喵~
- 动画必须兼容 `prefers-reduced-motion`，页面不得产生横向滚动喵~
- 宽表格、公式、代码与 Mermaid 图表必须在自身容器内处理溢出喵~
- 新页面应优先复用 Layout、Container、卡片与查询工具，不复制 Schema、路由映射或排序逻辑喵~
- 客户端脚本只用于主题、导航、目录、Mermaid 与搜索等必要交互喵~
- 读取与维护文本文件时统一使用 UTF-8 编码喵~
- 不要手工编辑 `dist`、`.astro` 或 `dist/pagefind`，这些目录都应由构建流程重新生成喵~

## 13. ulBo 视觉迁移维护约定

本轮只迁移 ulBo 的视觉语言，没有替换现有 Astro 架构、路由、内容模型、搜索范围、SEO、RSS、Sitemap 或 Markdown 与 MDX 管线喵~

全局颜色、字体、表面、边框、阴影、圆角和 Material 缓动令牌集中维护在 `src/styles/global.css`，新增页面应优先复用这些令牌喵~

强调色从原有青绿色调整为浅色模式 `#2337ff` 与暗色模式 `#7b8cff`，正文和组件不要再直接引入新的品牌强调色喵~

页面标题统一使用 `font-display`，该字体栈只复用系统字体与已有字体，不加载 Google Fonts，也没有新增运行时依赖喵~

通用视觉类的职责如下喵~

```text
material-surface  静态内容表面
material-card     可交互卡片表面
section-kicker    首页与分区英文眉题
section-title     分区标题
page-kicker       页面眉题
page-title        页面主标题
page-description  页面引导描述
material-link     轻量导航链接
tag-chip          标签与技术栈
```

首页 Hero 使用 `public/images/ulbo-hero.webp`，该文件来自 ulBo 主题仓库的 `src/assets/blog-placeholder-1.webp`，当前作为过渡背景资源使用喵~

正式公开发布前应再次确认该摄影图片的原始授权范围，或者用自有图片替换同一路径，避免后续版权来源不清晰喵~

Hero 图片通过 CSS `background-image` 加载并配合双层深色遮罩，替换图片时应继续保证白色标题、按钮和统计数据达到可读对比度喵~

顶部导航高度现在固定为 64px，Knowledge 移动工具栏使用 `top-16`，桌面侧栏与目录使用 `top-22`，目录滚动判定偏移为 124px，修改 Header 高度时必须同步调整这三个位置喵~

首页首个内容区块以轻量负边距覆盖 Hero 底部，其余区块通过边框、编号和交替表面建立层级，不要重新加入大面积玻璃拟态喵~

卡片默认使用 16px 圆角、1px 边框和低透明度阴影，悬浮位移限制为 2px，并继续兼容 `prefers-reduced-motion` 喵~

`public/og.png` 与全部社交元数据本轮保持不变，后续只有在品牌文案或站点身份变化时才需要重新生成喵~

## 14. 下一阶段边界

Phase 11 应扩充数学、计算机、项目和随想内容，并保持所有 Collection 字段、公开路径与搜索元数据一致喵~

每新增一篇内容，都要验证聚合页可达性、唯一 H1、相关链接、Pagefind 命中、Sitemap 收录与全量构建喵~

Phase 12 部署前必须先确定正式域名和托管平台，再设置 `SITE_URL`、执行完整审计并验证线上 RSS、Sitemap 与社交分享图喵~

每次阶段开发完成后，都需要更新本文档的状态、版本、路由、依赖、验证记录与下一阶段边界喵~
