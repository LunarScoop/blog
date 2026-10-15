# 实验可视化接入指南

项目采用 Astro 6、静态构建、Markdown/MDX、KaTeX 和 `data-theme` 主题。实验组件使用 Apache ECharts 6 SVG renderer，按需加载，只在含组件的页面请求图表包；无需 React、外部 CDN 或后端服务。

## 已有页面与文件

- `/blog/viewsrd-3d-visual-grounding/`：2026-10-12 论文笔记，图表邻近相应分析。
- `/experiments/`：实际示例页，分组柱状图、折线图、真实稀疏热力图及完整 Benchmark 表。
- `src/data/experiments/viewsrd.json`：原表转录与可直接传入组件的 JSON 配置。
- `scripts/create-viewsrd-data.py`：从经过目视核对的表值重新生成 JSON，UTF-8 写入。
- `src/components/ExperimentChart.astro`：页面结构、主题样式、无脚本数据表。
- `src/scripts/experiment-chart.ts`：交互、ResizeObserver、主题更新、销毁与导出。

这些数据是论文报告值，非本地实验日志。表 3 的 BUTD-DETR+SRD 疑点保留原值并明确标注。没有训练日志，不生成虚构训练曲线。原始数据、配置、分析之间由数据完整性测试约束。

## MDX 中复用

将新配置保存到 `src/data/experiments/my-run.json`，在 `.mdx` 文章中直接导入：

```mdx
import ExperimentChart from '../../components/ExperimentChart.astro';
import experiment from '../../data/experiments/my-run.json';

## 实验结果

<ExperimentChart config={experiment} />
```

文章默认隐藏 SVG、PNG 和“取消固定”按钮，仍可通过点击空白、再次点击或 Esc 取消固定。需要导出工具栏时，显式传入 `showControls`，例如 `<ExperimentChart config={experiment} showControls />`；示例页保留该工具栏。

图表正常显示时不附带操作说明，Tooltip 仅显示实验名称、方法和指标值。键盘操作说明保留在图表的无障碍标签中；加载失败时显示状态信息并展开数据表。

目录更深的文章需相应调整导入路径。普通 `.astro` 页面也可直接使用这个组件。文章仍使用原有 frontmatter 和博客布局。

## 配置字段

下表描述结构，不包含合成的实验结果。先从真实 CSV/JSON/训练日志整理数值，再填写 `categories` 和 `series[].values`。

| 字段 | 含义 |
| --- | --- |
| `id` | 唯一名称，用于定位组件与导出文件名 |
| `title` | 实验标题 |
| `kind` | `comparison`、`ablation`、`training`、`hyperparameter`、`benchmark` |
| `chart` | `auto`（默认）、`bar`、`line`、`heatmap`、`table` |
| `metric`、`unit` | 指标名称与单位；无量纲使用空字符串 |
| `valueFormat` | `number` 普通数值；`percent` 原值为 63.1；`fraction` 原值为 0.631，显示 63.1% |
| `decimals` | 显示小数位，0–10；原始 JSON 保留测量精度 |
| `xLabel`、`categories` | 横轴语义及按顺序的分类／训练步／超参数字符串 |
| `series` | 每项有 `name`、可选六位 HEX `color`、与分类等长的 `values` |
| `source` | `label` 来源名称、`url` HTTP(S) 文件/论文链接、`note` 协议、版本及不确定性说明 |
| `yMin`、`yMax` | 可选显示范围，按显示后的单位配置；不得截掉数据，柱状图从 0 开始 |

`null` 表示缺失，保留为空，不补零、不插值；零是实际测量值。单个配置中的系列应具有相同单位和可比较的指标尺度，Loss 与百分比 Accuracy 应分为两张图。多个 IoU 阈值可以作为同单位的独立系列，但必须明确标记。

自动规则：性能比较、消融及 Benchmark 使用分组柱状图；训练过程使用折线图；单系列超参数使用折线图，多系列超参数使用热力图。热力图各系列对应纵轴分类，`values` 对应横轴，适用于二维参数组合；不要把两条不同训练协议曲线误当成参数矩阵。可显式覆盖 `chart`。数值型折线横轴按真实数值间距绘制；文本分类保持分类轴。超过 12 个分类的折线提供缩放条；手机上的柱状图自动横排，长标签换行。

## 普通 Markdown 嵌入

普通 `.md` 无法执行 Astro import。已有独立静态嵌入路由，可放入 HTML iframe，不向 Markdown 插入脚本：

```html
<iframe
  src="/experiments/embed/viewsrd-nr3d/"
  title="ViewSRD Nr3D 定位准确率"
  style="width:100%;height:860px;border:0;border-radius:16px"
  loading="lazy"
></iframe>
```

嵌入页本身具有全部交互和数据表，同源嵌入自动跟随父页面主题；单独打开默认深色。固定高度容器允许内部滚动，大数据表可增大高度。新增数据后，在 `src/pages/experiments/embed/[id].astro` 的 `getStaticPaths` 中加入新配置即可生成嵌入 URL。优先用 MDX 获得自然高度的布局。

## 交互与生命周期

悬停显示实验、分类、系列及指标值；其他数据透明度降至 0.22。点击/轻触固定，再次点击同一点、点击图表空白或页面外部、Esc 或“取消固定”释放。方向键逐点浏览（包含缺失项），Home/End 首尾跳转，Enter/空格固定；数据表的每项也可 Tab 聚焦、按 Enter 固定。

SVG/PNG 导出保留标题、图例、指标及来源标签，去除临时高亮；PNG 由同源 SVG 本地转换为二倍分辨率，无上传。浏览器支持 JavaScript 时启用导出按钮；禁用脚本时仍可展开 SSR 数据表。没有图表动画，尊重 reduced-motion。

组件通过 Web Component 连接时初始化，在 Astro `before-swap` 或移出 DOM 时释放 ECharts、观察器和事件监听器，避免客户端导航重复创建。主题仅影响图表与组件局部样式，不修改全站默认主题或其他文章。

## 验证

`pnpm check`、`pnpm test`、`pnpm build` 为常规检查。启动 `pnpm preview --host 127.0.0.1` 后，从正式输出检查悬停、固定、触摸、键盘、主题、导出与导航返回；不要只验证开发服务器。

`scripts/verify-experiment-browser.mjs` 可重复执行上述浏览器检查，默认使用 Playwright 和本机 Edge。Playwright 仅用于检查，不属于博客运行依赖；已安装时运行 `node scripts/verify-experiment-browser.mjs`。若模块位于单独目录，设置 `PLAYWRIGHT_MODULE` 为该模块绝对路径；可用 `PLAYWRIGHT_CHANNEL` 指定 Chrome 等通道，`EXPERIMENT_BASE_URL` 指定预览地址。截图、实际下载及报告默认写入 `tmp_pdf/viewsrd-browser/`。

论文原表重新核对时运行 `python scripts/create-viewsrd-data.py`，再运行测试。对新日志，记录实验配置、种子、数据划分、指标定义及预处理版本；多次运行的均值和方差须来自真实重复实验，当前组件不推断误差线。

## 本次验收记录

在本地正式静态构建及 `astro preview` 上执行：

- `pnpm check`：105 个文件，0 errors / warnings / hints。
- `pnpm test`：15 个测试文件、68 项测试通过；新增 8 项检查数据与原表转录一致、百分比格式、缺失值及配置边界。
- `pnpm build`：成功生成 28 个静态页面，含新文章、示例页及 9 个独立嵌入页。
- Edge / Playwright：桌面真实 SVG 悬停与变暗、固定与取消、键盘、两种主题、实际 SVG/PNG 下载、热力图数值、客户端导航返回、原有 MiKASA 页面、同源 iframe 主题联动、禁用 JavaScript 的数据表均通过。
- 390px 与 768px 模拟触摸视口：点击固定和取消、新文章及示例页无水平溢出；检查长标签、超参数轴和手机导出图片。此项是浏览器设备模拟，未声称已在实体设备上测试。
- 浏览器未捕获到应用 pageerror 或 console error；`git diff --check` 通过。

截图、实际 SVG/PNG 导出文件及 14 类检查的报告位于 `tmp_pdf/viewsrd-browser/`。构建仍提示项目已有的 Markdown 配置弃用、空 projects 集合，以及大于 500 kB 的客户端 chunk；这些不是构建失败。ECharts 按需加载，普通文章无需请求图表包。

修改 `src/layouts/BlogPost.astro` 的默认可见状态，修复 Astro 在 reduced-motion 模式禁用入场动画时正文保持透明的问题；原有文章也已验证。其余既有未提交修改均保留。

2026-10-15 文章格式复查：启用与数学插件共存的 GFM 表格解析；6 张正文表格逐单元格与源文件核对，加粗标记与 KaTeX 均正确解析。宽表使用可聚焦的滚动区域，窄屏不会把英文名称挤成碎片或撑宽页面。文章及嵌入图表默认隐藏工具栏，示例页通过 `showControls` 显式启用导出；无工具栏时的悬停、固定及 Esc 取消已验证。视角权重说明按原文式（2）的矩阵乘法重述，区分加权聚合与逐 Token 缩放，并保留原文归一化系数及实现疑点。完整浏览器报告现包含 15 类检查。
