# 项目维护说明

## 当前架构

本项目以 ulBo 为主题基线，只保留 Blog 与 Projects 两类内容喵~

```text
Base Theme: ulBo
Upstream: https://github.com/xxy1103/ulbo-astro-theme-template
Pinned Commit: 605de8fdb5fee7f0e92583b6c621b558710467ec
Migration Date: 2026-07-26
Local Extensions: Projects
Content: Blog + Projects
```

迁移前的 Knowledge Garden 已由 Git 提交 `59c55e9a9c48b70999901bc50036b21d7da4dfbc` 和标签 `knowledge-garden-v0.10` 完整保存喵~

上游的 `LICENSE` 必须始终保留，因为项目直接使用并修改了 ulBo 的 MIT 许可源码喵~

## 本地修改边界

相对于固定的 ulBo 上游提交，本项目只维护以下功能性改动喵~

- 在桌面和移动端 Header 中增加 Projects 链接喵~
- 增加独立的 Projects Content Collection 与公开内容筛选喵~
- 增加 `/projects` 列表页、`/projects/[...slug]` 详情页和 ulBo 风格的 Project Card 喵~
- 在首页增加 `03 Featured Projects`，最多显示四个精选项目喵~
- 将公开 Projects 合并进原有 Fuse.js 搜索索引，但不改变搜索界面和交互喵~
- 写入个人站点配置，并保留统一的 Blog 内容目录喵~

`ProjectPost.astro` 是一个薄适配层，它复用 ulBo `BlogPost.astro` 的 Hero、正文排版、TOC、KaTeX、Mermaid、代码块、表格、图片和响应式能力喵~

Projects 在类型层继续使用 `CollectionEntry<'projects'>`，详情页输出 `SoftwareSourceCode` structured data，不会强制转换为 Blog Collection，也不会输出 `BlogPosting` 喵~

为了允许薄适配层复用正文视图，`BlogPost.astro` 只增加了 structured data、Open Graph 类型与两个元数据插槽，没有进行大规模结构重构喵~

## 内容维护

Blog 内容统一放在 `src/content/blog/`，当前目录为空并使用 `.gitkeep` 保留，后续文章通过 `categories` 与 `tags` 组织喵~

Projects 内容放在 `src/content/projects/`，frontmatter 只使用以下字段喵~

```text
title
description
status: active | completed | archived
technologies
github
demo
featured
created
updated
cover
draft
```

Projects 目录当前为空并使用 `.gitkeep` 保留，后续项目可按上述字段新增喵~

没有 cover 的项目会使用完整的无图卡片，不会生成随机封面喵~

`draft: true` 的项目不会生成公开列表、详情页、搜索结果或 Sitemap 地址喵~

RSS 继续只读取 Blog，Projects 不进入 RSS 喵~

## 文章日历维护

Blog 归档首页 `/blog` 会在文章列表之前显示年度文章日历，分页页不会重复显示日历喵~

日历在构建时合并公开 Blog 与非草稿 Projects，Blog 使用规范化后的 `pubDate` 字段，Projects 使用 `created` 字段，不需要维护额外 JSON 数据喵~

Blog 的 `pubDate` 与兼容字段 `date` 至少需要填写一个，缺少发布日期的内容会在 Content Collections 校验阶段报错喵~

日期分组统一使用 `src/config/site.ts` 中的 `siteTimeZone`，当前值为 `Asia/Shanghai`，更换站点主要时区时应同步修改此配置喵~

日历数据聚合与日期计算位于 `src/lib/content/article-calendar.ts`，Astro 静态界面位于 `src/components/ArticleCalendar.astro`，轻量交互位于 `src/scripts/article-calendar.ts` 喵~

发布数量等级固定为零篇、1 篇、2 篇、3 篇、4 篇及以上五档，颜色从 `--accent`、主题表面色与边框变量计算，因此浅色和深色主题不需要分别维护颜色喵~

年份选择器只展示实际存在内容的年份与当前年份，选择有内容的日期后会在日历下方按 Blog 分类或 Projects 分组显示可点击条目喵~

手机端保留 16 像素日期格并通过横向滚动浏览全年，维护样式时不要为了适配窄屏继续压缩日期格喵~

日期、闰年、星期布局和数量等级的回归测试位于 `src/lib/content/article-calendar.test.ts` 喵~

About 页面个人资料统一在 `src/config/profile.ts` 中维护，当前名称为 `LunarScoop`、身份标题为 `Learner`，并显示城市 `Guangzhou`、邮箱 `1493195049@qq.com` 与 GitHub `https://github.com/LunarScoop`，未配置 X 和个人网站喵~

About 头像使用从该 GitHub 账号同步到 `src/assets/github-avatar.png` 的本地副本，GitHub 头像变化后需要重新同步此文件喵~

首页、Blog、Projects、Tags、About 与内容详情页的 Hero 文案统一维护在 `src/config/hero.ts` 中，并共用 `src/assets/hero-lunarscoop-alt.jpg` 作为默认背景喵~

首页 Hero 当前主标题为 `Writing down what I learn along the way`，副标题为 `Learning as I go`，对应功能提交为 `255bc30` 喵~

浏览器标签页图标使用 `public/favicon.svg`，由 `src/config/site.ts` 中的 `faviconIco` 统一引用喵~

桌面端 Header 右上角的 GitHub 图标链接由 `src/config/site.ts` 中的 `headerGithubRepoUrl` 维护，当前指向 `https://github.com/LunarScoop` 喵~

站点目前使用 `http://localhost:4321` 作为 canonical 基地址，正式部署前必须在 `src/config/site.ts` 中替换为真实公开域名喵~

## 依赖与运行

依赖版本沿用固定 ulBo 基线，包管理器统一为 pnpm，并维护 `pnpm-lock.yaml` 喵~

上游 CI 已同步为 pnpm 安装、检查、测试和构建流程，避免在移除 `package-lock.json` 后继续执行 npm 命令喵~

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

Projects 不应引入额外第三方依赖，新增界面优先复用 ulBo 的组件、CSS 变量与交互喵~

## 上游升级流程

升级前先确认工作区干净并创建新的可恢复提交或标签，然后单独比较当前固定提交与目标 ulBo 提交喵~

升级时优先逐项重放上面的本地修改边界，不要直接追踪 main，也不要重新引入 Learn、Knowledge Tree、Notes Collection、Thoughts Collection、Pagefind 或 Tailwind 喵~

如果上游改动使 Projects 需要大规模重构，应先保持现有固定基线，再选择更小侵入的适配方式喵~
