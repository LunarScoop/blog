# Personal Knowledge Garden

## 个人学习博客开发规格文档

> **项目类型**：个人数字花园 / 学习知识库 / 项目展示 / 学习记录  
> **开发方式**：从零开发，不 Fork 第三方博客项目  
> **参考方向**：参考 Firefly 等优秀 Astro 博客的视觉设计、布局和交互思路，但不依赖其源码结构  
> **核心内容**：数学、计算机、项目、学习心得  
> **文档用途**：作为开发、AI Coding Agent、Issue 拆分、Code Review 与验收的统一规范

---

# 1. 项目定位

本项目不是单纯按照发布时间排列文章的传统博客，而是一个长期维护的个人学习空间：

```text
学习知识
↓
整理笔记
↓
建立知识结构
↓
项目实践
↓
总结思考
```

核心模块：

```text
Home
Learn
Projects
Thoughts
About
```

一句话定义：

> 一个以数学与计算机知识为核心，结合项目实践与学习思考的个人数字花园。

---

# 2. 核心设计原则

## 2.1 学科优先

知识按照：

```text
Domain
↓
Subject
↓
Topic
↓
Note
```

组织。

例如：

```text
Mathematics
↓
Calculus
↓
Limits
↓
L'Hospital's Rule
```

或者：

```text
Computer Science
↓
Operating Systems
↓
Memory
↓
Virtual Memory
```

## 2.2 不按考试组织

不建立：

```text
Prep
Exams
408 专区
数学一专区
```

408、数一只代表当前学习背景，不作为网站结构。

## 2.3 Learn 与 Thoughts 分离

`Learn`：

```text
长期维护
知识结构导向
updated 更重要
```

`Thoughts`：

```text
阶段记录
时间导向
published 更重要
```

## 2.4 内容优先

优先：

```text
阅读体验
知识目录
搜索
数学公式
代码
Markdown
移动端
暗色模式
```

暂不优先：

```text
评论
音乐播放器
Live2D
复杂动画
壁纸
相册
打赏
社交功能
```

---

# 3. 最终信息架构

```text
Home
│
├── Learn
│   │
│   ├── Mathematics
│   │   ├── Calculus
│   │   ├── Linear Algebra
│   │   └── Probability
│   │
│   └── Computer Science
│       ├── Data Structures
│       ├── Computer Organization
│       ├── Operating Systems
│       └── Computer Networks
│
├── Projects
│
├── Thoughts
│
└── About
```

主导航固定为：

```text
Home
Learn
Projects
Thoughts
About
```

辅助入口：

```text
Search
Tags
```

---

# 4. 技术栈

推荐：

```text
Astro
TypeScript
Tailwind CSS
Markdown / MDX
KaTeX
Mermaid
Expressive Code
Pagefind
```

职责：

```text
Astro            页面与静态生成
TypeScript       Schema、配置、工具函数
Tailwind CSS     UI 与响应式
Markdown / MDX   内容
KaTeX            数学公式
Mermaid          流程图、状态图、架构图
Expressive Code  代码展示
Pagefind         静态全文搜索
```

原则：

> 第一版不引入数据库，不引入登录系统，不依赖大型客户端框架。

---

# 5. Firefly 的参考方式

Firefly 仅作为设计参考。

不进行：

```text
Fork
Clone 后二改
upstream 同步
直接复用完整工程结构
```

可以参考：

```text
Navbar 的视觉层级
Sidebar 的布局
文章 TOC
卡片设计
暗色模式
响应式布局
搜索交互
Markdown 排版
文章阅读宽度
```

原则：

> 借鉴交互和视觉设计，组件与数据结构自行实现。

---

# 6. 不计划实现的娱乐型功能

第一阶段不做：

```text
音乐播放器
Live2D 看板娘
樱花 / 鼠标特效
Gallery 相册
Dynamic 短动态
Friends 友情链接
Guestbook 留言板
Sponsor 打赏
Bangumi
Anime
复杂评论系统
```

原因：

```text
与学习知识库核心目标无关
增加维护成本
增加视觉干扰
```

# 7. Content Collections

核心 Collection：

```text
notes
projects
thoughts
```

其中 Notes 的类型：

```text
knowledge
problem
mistake
```

不单独创建：

```text
problems
mistakes
```

Collection，避免过度拆分。

---

# 8. 内容目录

```text
src/content/

├── notes/
│   ├── mathematics/
│   │   ├── calculus/
│   │   │   ├── functions/
│   │   │   ├── limits/
│   │   │   ├── derivatives/
│   │   │   ├── integrals/
│   │   │   ├── multivariable/
│   │   │   ├── series/
│   │   │   └── differential-equations/
│   │   ├── linear-algebra/
│   │   └── probability/
│   │
│   └── computer-science/
│       ├── data-structures/
│       ├── computer-organization/
│       ├── operating-systems/
│       └── computer-networks/
│
├── projects/
└── thoughts/
```

---

# 9. Notes Schema

推荐字段：

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

示例 Schema：

```ts
const notesCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/notes",
  }),

  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(""),

    domain: z.enum(["mathematics", "computer-science"]),

    subject: z.enum([
      "calculus",
      "linear-algebra",
      "probability",
      "data-structures",
      "computer-organization",
      "operating-systems",
      "computer-networks",
    ]),

    topic: z.string().optional().default(""),

    type: z.enum(["knowledge", "problem", "mistake"]).default("knowledge"),

    tags: z.array(z.string()).optional().default([]),

    difficulty: z.enum(["easy", "medium", "hard"]).optional(),

    status: z.enum(["todo", "learning", "reviewing", "completed"]).default("learning"),

    related: z.array(z.string()).optional().default([]),

    created: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(false),
  }),
});
```

---

# 10. Frontmatter 示例

数学：

```yaml
---
title: "洛必达法则"
description: "洛必达法则的适用条件、常见题型与易错点"

domain: mathematics
subject: calculus
topic: limits

type: knowledge

tags:
  - 极限
  - 导数

difficulty: medium
status: reviewing

related:
  - mathematics/calculus/limits/equivalent-infinitesimal
  - mathematics/calculus/series/taylor-formula

created: 2026-07-23
updated: 2026-07-23

draft: false
---
```

计算机：

```yaml
---
title: "虚拟内存"
description: "虚拟内存、页表、TLB 与地址转换"

domain: computer-science
subject: operating-systems
topic: memory

type: knowledge

tags:
  - 内存管理
  - 页表
  - TLB

difficulty: medium
status: learning

created: 2026-07-23
updated: 2026-07-23

draft: false
---
```

---

# 11. 笔记模板

## 数学

```markdown
# 标题

## 一句话理解

## 定义

## 核心公式

## 定理

## 推导

## 常见题型

## 典型例题

## 解题思路

## 常见变形

## 易错点

## 我的理解

## 相关知识
```

## 计算机

```markdown
# 标题

## 一句话理解

## 为什么需要它

## 核心概念

## 工作原理

## 执行流程

## 示例

## 常考点

## 易错点

## 我的理解

## 相关知识
```

## Problem

```yaml
type: problem
```

```markdown
# 题型名称

## 识别特征

## 常见问法

## 核心方法

## 解题步骤

## 典型例题

## 常见变形

## 易错点

## 相关知识
```

## Mistake

```yaml
type: mistake
```

```markdown
# 易错点

## 错误理解

## 正确结论

## 为什么容易错

## 例子

## 记忆方式

## 相关知识
```

# 12. Projects

Schema：

```text
title
description
status
technologies
github
demo
featured
created
updated
draft
```

状态：

```text
planning
building
completed
archived
```

页面模板：

```markdown
# 项目名称

## 项目简介

## 为什么做

## 技术栈

## 功能

## 系统设计

## Architecture

## 核心实现

## 遇到的问题

## 解决方案

## 最终结果

## 我学到了什么

## 后续计划
```

---

# 13. Thoughts

Thoughts 用于：

```text
学习总结
阶段复盘
项目心得
技术思考
博客开发记录
```

Schema：

```text
title
description
published
updated
tags
draft
```

按照：

```text
published DESC
```

排列。

---

# 14. 页面路由

```text
src/pages/

├── index.astro
│
├── learn/
│   ├── index.astro
│   ├── math/
│   │   ├── index.astro
│   │   └── ...
│   └── cs/
│       ├── index.astro
│       └── ...
│
├── projects/
│   ├── index.astro
│   └── [slug].astro
│
├── thoughts/
│   ├── index.astro
│   └── [slug].astro
│
├── about.astro
├── search.astro
├── 404.astro
└── rss.xml.ts
```

---

# 15. URL 规范

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

知识：

```text
/learn/math/calculus/limits/lhopital-rule
/learn/cs/os/memory/virtual-memory
/learn/cs/network/transport/tcp
```

项目：

```text
/projects
/projects/tiny-web-server
```

随笔：

```text
/thoughts
/thoughts/why-i-built-this-blog
```

---

# 16. Learn 首页

只展示两个一级领域：

```text
Learn

Mathematics
Computer Science
```

示例：

```text
┌────────────────────────────┐
│ Mathematics                │
│                            │
│ Calculus                   │
│ Linear Algebra             │
│ Probability                │
│                            │
│ 42 Notes                   │
└────────────────────────────┘

┌────────────────────────────┐
│ Computer Science           │
│                            │
│ Data Structures            │
│ Computer Organization      │
│ Operating Systems          │
│ Computer Networks          │
│                            │
│ 38 Notes                   │
└────────────────────────────┘
```

---

# 17. Subject 页面

例如：

```text
/learn/math/calculus
```

按照章节而不是时间排序：

```text
01 函数

02 极限
   ├ 两个重要极限
   ├ 等价无穷小
   ├ 洛必达法则
   └ Taylor 公式

03 连续
04 导数与微分
05 中值定理
06 积分
...
```

章节顺序使用配置文件维护，不依赖日期。

---

# 18. Knowledge Layout

桌面三栏：

```text
┌─────────────────┬────────────────────────────┬─────────────────┐
│ Knowledge Tree  │          Article           │      TOC        │
└─────────────────┴────────────────────────────┴─────────────────┘
```

左：

```text
课程知识树
```

中：

```text
正文
```

右：

```text
本页目录
```

移动端：

```text
[章节] [目录]
正文
```

使用 Drawer 展开。

---

# 19. Knowledge Sidebar

组件：

```text
KnowledgeSidebar.astro
KnowledgeTree.astro
SubjectProgress.astro
```

要求：

```text
当前章节高亮
当前 Note 高亮
章节折叠
文章跳转
移动端适配
```

---

# 20. Note Header / Footer

Header：

```text
Operating Systems / Memory

虚拟内存

理解虚拟内存、页表和地址转换。

Medium · Learning

Updated 2026-07-23
```

显示：

```text
Subject
Topic
Difficulty
Status
Updated
Tags
```

不强调：

```text
作者
阅读量
评论
大封面
```

Footer：

```text
← 上一知识
下一知识 →

Related Notes

Back to Operating Systems
```

Related Notes 优先级：

```text
related
>
same topic
>
same tags
>
same subject
```

# 21. 首页设计

首页不是 Article Feed。

结构：

```text
Hero
↓
Currently Learning
↓
Knowledge Overview
↓
Recently Updated
↓
Featured Projects
↓
Latest Thoughts
```

Hero：

```text
Hi, I'm XXX.

这里记录我的数学、计算机学习，
项目实践和一些思考。

[ Explore Learn ]
[ Projects ]
```

Knowledge Overview：

```text
Mathematics
XX Notes

Computer Science
XX Notes
```

Recently Updated：

```text
标题
Subject
Topic
更新时间
```

---

# 22. Search

使用 Pagefind。

搜索范围：

```text
Learn
Projects
Thoughts
```

搜索结果显示类型：

```text
洛必达法则
Learn · Calculus

高数阶段复盘
Thought

Tiny Web Server
Project
```

索引：

```text
title
description
正文
tags
```

避免索引：

```text
Navbar
Footer
Sidebar
TOC
重复 UI 文案
```

---

# 23. Markdown 能力

## KaTeX

```markdown
$\lim_{x	o0}rac{\sin x}{x}=1$
```

```markdown
$$
e^x
=
1+x+rac{x^2}{2!}
+rac{x^3}{3!}
+o(x^3)
$$
```

## Callout

```markdown
> [!warning]
> 等价无穷小一般用于乘除结构。
```

```markdown
> [!important]
> TCP 是面向字节流的协议。
```

## Mermaid

用于：

```text
流程图
状态图
协议过程
数据结构关系
系统架构
```

## Code

要求：

```text
Syntax Highlight
Copy
Line Number
Highlight Lines
Horizontal Scroll
```

---

# 24. UI 风格

目标：

```text
极简
清晰
轻技术感
高可读性
有个人风格
```

可参考 Firefly：

```text
圆角
轻阴影
柔和背景
卡片层级
暗色模式
响应式
```

减少：

```text
大型随机封面
强二次元装饰
复杂背景
大量 Hover 动画
视觉噪音
```

目标：

> Personal Blog 的亲和感 + Documentation 的秩序感。

---

# 25. Layout

```text
src/layouts/

BaseLayout.astro
KnowledgeLayout.astro
ProjectLayout.astro
ThoughtLayout.astro
```

职责：

```text
BaseLayout       Navbar / SEO / Footer / Theme
KnowledgeLayout  Learn Note
ProjectLayout    Project
ThoughtLayout    Thought
```

---

# 26. 组件目录

```text
src/components/

home/
├── Hero.astro
├── LearningNow.astro
├── KnowledgeOverview.astro
├── RecentNotes.astro
├── FeaturedProjects.astro
└── LatestThoughts.astro

learn/
├── KnowledgeSidebar.astro
├── KnowledgeTree.astro
├── SubjectCard.astro
├── NoteMeta.astro
├── NoteStatus.astro
├── NoteNavigation.astro
├── RelatedNotes.astro
└── SubjectProgress.astro

projects/
├── ProjectCard.astro
└── ProjectMeta.astro

thoughts/
└── ThoughtCard.astro

shared/
├── Navbar.astro
├── Footer.astro
├── ThemeToggle.astro
├── SearchButton.astro
└── MobileDrawer.astro
```

---

# 27. 配置与工具函数

配置：

```text
src/config/

site.ts
subjects.ts
navigation.ts
learning.ts
```

工具：

```text
src/utils/

notes.ts
subjects.ts
related.ts
projects.ts
thoughts.ts
```

建议函数：

```ts
getNotes();
getNotesByDomain();
getNotesBySubject();
getNotesByTopic();
getRelatedNotes();
getRecentNotes();
getFeaturedProjects();
getLatestThoughts();
```

页面中不要散落重复查询逻辑。

# 28. Git 开发方式

本项目从零开发，不存在：

```text
Fork
upstream
同步第三方仓库
```

创建自己的 GitHub Repository。

本地：

```bash
git init
git branch -M main
```

个人项目推荐简单分支策略：

```text
main
│
├── feature/base-layout
├── feature/content-model
├── feature/learn
├── feature/search
├── feature/projects
└── feature/home
```

`main` 应始终保持：

```text
可以运行
可以 Build
可以部署
```

大功能开 `feature/*`。

小修复可以直接在 `main` 完成。

---

# 29. SEO / RSS / Sitemap

每页：

```text
title
description
canonical
Open Graph
```

例如：

```text
洛必达法则 | Site Name
```

RSS：

```text
V1 只提供 Thoughts RSS
```

Sitemap：

```text
Home
Learn
所有 Notes
Projects
Thoughts
About
```

---

# 30. 部署

推荐：

```text
Cloudflare Pages
或
Vercel
```

流程：

```text
GitHub Push
↓
Build
↓
Deploy
```

无需：

```text
服务器
数据库
后台管理
```

---

# 31. 最终项目目录

```text
src/

├── components/
│   ├── home/
│   ├── learn/
│   ├── projects/
│   ├── thoughts/
│   └── shared/
│
├── config/
│   ├── site.ts
│   ├── subjects.ts
│   ├── learning.ts
│   └── navigation.ts
│
├── content/
│   ├── notes/
│   ├── projects/
│   └── thoughts/
│
├── layouts/
│   ├── BaseLayout.astro
│   ├── KnowledgeLayout.astro
│   ├── ProjectLayout.astro
│   └── ThoughtLayout.astro
│
├── pages/
│   ├── learn/
│   ├── projects/
│   ├── thoughts/
│   ├── index.astro
│   ├── about.astro
│   └── search.astro
│
├── styles/
├── utils/
└── content.config.ts
```

---

# 32. 开发阶段

```text
Phase 0   项目初始化
Phase 1   基础视觉系统
Phase 2   Content Model
Phase 3   Markdown / Math / Code
Phase 4   Knowledge Layout
Phase 5   Learn
Phase 6   Home
Phase 7   Projects
Phase 8   Thoughts
Phase 9   Search
Phase 10  SEO / RSS / Sitemap
Phase 11  内容填充
Phase 12  上线
```

---

# 33. Phase 0 — 初始化

```bash
pnpm create astro@latest
```

建议：

```text
TypeScript Strict
Git
基础 Astro 模板
```

安装 Tailwind。

创建：

```text
components
layouts
content
config
utils
```

验收：

```bash
pnpm dev
pnpm build
```

成功。

---

# 34. Phase 1 — 基础视觉

先实现：

```text
BaseLayout
Navbar
Footer
Theme
Dark Mode
Container
Typography
Card
Button
Mobile Navigation
```

验收：

```text
Desktop
Tablet
Mobile
Light
Dark
```

都正常。

---

# 35. Phase 2 — Content Model

实现：

```text
notes
projects
thoughts
```

准备测试：

```text
Math Note × 2
CS Note × 2
Project × 1
Thought × 1
```

验收：

```bash
pnpm build
```

通过。

---

# 36. Phase 3 — Markdown

配置：

```text
KaTeX
Mermaid
Expressive Code
Callout
```

测试：

```text
公式
代码
表格
图片
Mermaid
MDX
```

---

# 37. Phase 4 — Knowledge Layout

实现：

```text
KnowledgeLayout
KnowledgeSidebar
TOC
NoteMeta
Previous / Next
Related Notes
```

验收：

```text
桌面三栏
移动端 Drawer
```

---

# 38. Phase 5 — Learn

实现：

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

要求：

> 不依赖 Search，也可以从 Learn 访问所有 Note。

---

# 39. Phase 6 — Home

实现：

```text
Hero
Currently Learning
Knowledge Overview
Recent Notes
Featured Projects
Latest Thoughts
```

验收：

> 用户进入首页 10 秒内能理解你是谁、在学什么、网站有什么。

---

# 40. Phase 7 — Projects

实现：

```text
/projects
/projects/[slug]
```

功能：

```text
ProjectCard
ProjectLayout
Featured
GitHub
Demo
```

---

# 41. Phase 8 — Thoughts

实现：

```text
/thoughts
/thoughts/[slug]
```

按照：

```text
published DESC
```

排列。

---

# 42. Phase 9 — Search

集成 Pagefind。

测试：

```text
极限
TCP
虚拟内存
```

要求搜索结果没有大量 Sidebar / Footer 噪音。

---

# 43. Phase 10 — SEO

实现：

```text
Meta
Canonical
Open Graph
RSS
Sitemap
404
```

---

# 44. Phase 11 — 首批内容

Mathematics：

```text
极限
两个重要极限
等价无穷小
洛必达法则
Taylor 公式
```

Data Structures：

```text
时间复杂度
线性表
栈
队列
二叉树
```

Operating Systems：

```text
进程与线程
进程状态
进程调度
虚拟内存
页表
```

Computer Networks：

```text
TCP
UDP
三次握手
四次挥手
HTTP
```

Projects：

```text
至少 1 个
```

Thoughts：

```text
为什么建立这个博客
阶段学习总结
```

---

# 45. Phase 12 — 上线

上线前检查：

```text
Build
404
Search
Mobile
Dark Mode
Math
Code
Mermaid
SEO
```

部署：

```text
Cloudflare Pages
或
Vercel
```

# 46. MVP

V1 必须：

```text
Home

Learn
├ Mathematics
└ Computer Science

Projects
Thoughts
About

Markdown / MDX
KaTeX
Mermaid
Code
Callout

Knowledge Sidebar
TOC
Previous / Next
Related Notes

Search
Dark Mode
Responsive

SEO
RSS
Sitemap
```

---

# 47. V1.5

```text
Related Notes 自动推荐
学习状态过滤
Subject Progress
Tags 页面
new-note CLI
阅读进度
更完善的移动端导航
```

---

# 48. V2

```text
随机易错点
复习模式
知识图谱
学习进度 Dashboard
笔记历史版本展示
更高级搜索
互动式数学 / CS Demo
```

---

# 49. 明确不做

第一阶段：

```text
数据库
用户注册
登录
点赞
收藏
复杂评论
在线 Markdown 编辑器
后台 CMS
AI Chat
多人协作
音乐播放器
Live2D
复杂视觉特效
```

核心内容始终：

```text
Markdown + Git
```

---

# 50. 开发验收清单

## Foundation

- [ ] Astro
- [ ] TypeScript
- [ ] Tailwind
- [ ] BaseLayout
- [ ] Navbar
- [ ] Footer
- [ ] Dark Mode
- [ ] Responsive

## Content

- [ ] Notes Collection
- [ ] Projects Collection
- [ ] Thoughts Collection
- [ ] Schema Validation
- [ ] Draft Filter

## Markdown

- [ ] Markdown
- [ ] MDX
- [ ] KaTeX
- [ ] Code Highlight
- [ ] Mermaid
- [ ] Callout
- [ ] Tables
- [ ] Images

## Learn

- [ ] Learn 首页
- [ ] Mathematics
- [ ] Computer Science
- [ ] Subject 页面
- [ ] Topic 排序
- [ ] Knowledge Sidebar
- [ ] TOC
- [ ] Related
- [ ] Previous / Next

## Home

- [ ] Hero
- [ ] Currently Learning
- [ ] Knowledge Overview
- [ ] Recent Notes
- [ ] Featured Projects
- [ ] Latest Thoughts

## Projects

- [ ] Projects 首页
- [ ] Project 页面
- [ ] Featured
- [ ] GitHub
- [ ] Demo

## Thoughts

- [ ] Thoughts 首页
- [ ] Thought 页面
- [ ] Date
- [ ] Tags
- [ ] RSS

## Search

- [ ] Pagefind
- [ ] Notes
- [ ] Projects
- [ ] Thoughts
- [ ] 无导航噪音

## SEO

- [ ] Meta
- [ ] Canonical
- [ ] Open Graph
- [ ] Sitemap
- [ ] RSS
- [ ] 404

## Quality

- [ ] Mobile
- [ ] Tablet
- [ ] Desktop
- [ ] Light Mode
- [ ] Dark Mode
- [ ] pnpm build
- [ ] 无明显控制台错误

---

# 51. MVP 上线标准

至少：

```text
10 篇 Mathematics Notes
10 篇 Computer Science Notes
1 个 Project
2 篇 Thoughts
```

并满足：

```text
Learn 正常
Knowledge Sidebar 正常
KaTeX 正常
Code 正常
Mermaid 正常
TOC 正常
Search 正常
Dark Mode 正常
Mobile 正常
SEO 正常
```

即可上线。

不要等所有课程整理完成。

---

# 52. Coding Agent 开发策略

不要一次要求 AI：

```text
“完成整个博客”
```

建议拆分：

```text
Task 1  初始化 Astro / Tailwind / TypeScript
Task 2  BaseLayout / Navbar / Footer / Theme
Task 3  Content Collections
Task 4  Markdown / KaTeX / Mermaid / Code
Task 5  KnowledgeLayout
Task 6  Learn
Task 7  Home
Task 8  Projects
Task 9  Thoughts
Task 10 Pagefind
Task 11 SEO / Deployment
```

每次：

```text
实现
↓
pnpm build
↓
人工查看
↓
Git Commit
↓
下一任务
```

---

# 53. 推荐 AGENTS.md

```markdown
# Project Rules

This project is a personal knowledge garden built with Astro.

## Main sections

- Home
- Learn
- Projects
- Thoughts
- About

Learn contains only two top-level domains:

- Mathematics
- Computer Science

## Principles

1. Markdown is the source of truth.
2. Knowledge is organized by domain / subject / topic.
3. Do not create exam-specific content trees.
4. Do not introduce a database.
5. Do not introduce authentication.
6. Prefer Astro components.
7. Keep client-side JavaScript minimal.
8. Reading experience is more important than visual effects.
9. Do not add entertainment-oriented blog features.
10. Keep URLs stable.

## Collections

- notes
- projects
- thoughts

## Note types

- knowledge
- problem
- mistake

## Main routes

- /
- /learn
- /projects
- /thoughts
- /about

## Design direction

Firefly may be used as visual and interaction inspiration only.

Do not copy its overall application architecture.

Desired style:

Personal Blog warmth +
Documentation clarity +
Knowledge Base structure
```

---

# 54. 最终结构

```text
                    Home
                     │
        ┌────────────┼────────────┐
        │            │            │
      Learn       Projects     Thoughts
        │
   ┌────┴────┐
   │         │
Mathematics  Computer Science
   │         │
   │         ├ Data Structures
   │         ├ Computer Organization
   │         ├ Operating Systems
   │         └ Computer Networks
   │
   ├ Calculus
   ├ Linear Algebra
   └ Probability

                    About
```

---

# 55. 最重要的产品链路

```text
创建 Markdown
↓
填写 Frontmatter
↓
自动归类到正确 Subject / Topic
↓
Learn 页面自动显示
↓
Knowledge Sidebar 自动显示
↓
全文搜索可检索
↓
Related Notes 建立关联
↓
阅读体验良好
```

只要这条链路跑通：

> 博客的核心价值就已经成立。

---

# 56. 推荐立即执行的下一步

```text
1. 创建新的 GitHub Repository
2. 创建 Astro 项目
3. 配置 TypeScript
4. 配置 Tailwind
5. 建立 BaseLayout
6. 建立 Notes Collection
7. 写 4 篇真实测试笔记
8. 实现 KnowledgeLayout
9. 实现 Learn
10. 实现首页
11. 再做 Projects / Thoughts / Search
```

不要先做：

```text
复杂动画
评论
知识图谱
学习统计
AI
```

优先保证：

> 写一篇笔记 → 自动进入知识体系 → 阅读舒服 → 可以搜索。
