---
title: "洛必达法则"
description: "洛必达法则的适用条件、使用步骤与常见误区喵~"
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
created: 2026-07-23
updated: 2026-07-24
draft: false
---

## 一句话理解

当未定式满足条件时，可以通过比较分子与分母导数的极限来研究原极限喵~

若函数 $f(x)$ 与 $g(x)$ 满足洛必达法则的条件，则可以考察下面的关系喵~

$$
\lim_{x \to a}\frac{f(x)}{g(x)}
=
\lim_{x \to a}\frac{f'(x)}{g'(x)}
$$

## 核心条件

- 原式必须先确认是适用的未定式喵~
- 分子与分母需要在相应邻域内可导喵~
- 分母导数在所研究的邻域内不能为零喵~

| 检查项   | 需要确认的内容         | 常见结果                |
| -------- | ---------------------- | ----------------------- |
| 未定式   | 代入后是否为 $0/0$     | 可以继续检查其他条件喵~ |
| 可导性   | 去心邻域内是否可导     | 不满足时不能直接使用喵~ |
| 导数极限 | 新极限是否存在或为无穷 | 存在时可得到原极限喵~   |

> [!WARNING]
>
> 洛必达法则处理的是满足条件的未定式，不能把“分式极限”直接等同于“分子分母分别求导”喵~

## 易错点

洛必达法则不是看到分式就求导，使用前必须检查未定式与适用条件喵~

## 计算示例

下面的 TypeScript 函数用离散采样直观展示 $\frac{\sin x}{x}$ 在零点附近的趋势喵~

```ts title="limit-sample.ts" {4-6}
const sampleLimit = (step: number) => {
  const samples: Array<{ x: number; value: number }> = [];

  for (let index = 3; index >= 1; index -= 1) {
    const x = step * index;
    samples.push({ x, value: Math.sin(x) / x });
  }

  return samples;
};
```

## 判断流程

```mermaid
flowchart LR
  A[代入原式] --> B{是否为未定式}
  B -- 否 --> C[使用其他极限方法]
  B -- 是 --> D{是否满足可导等条件}
  D -- 否 --> C
  D -- 是 --> E[求分子与分母的导数比]
  E --> F{新极限是否可求}
  F -- 是 --> G[得到原极限]
  F -- 否 --> C
```

## 学习场景

![写有数学笔记的学习桌面](https://images.unsplash.com/photo-1637263492665-9dadcac6089f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000)

这张学习场景图片来自 [Sha Mala 的 Unsplash 作品](https://unsplash.com/photos/a-laptop-computer-sitting-on-top-of-a-wooden-desk-tpGlGc_Le4c) 喵~
