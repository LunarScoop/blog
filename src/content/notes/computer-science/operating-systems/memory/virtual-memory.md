---
title: "虚拟内存"
description: "虚拟内存、页表、地址转换与局部性之间的关系喵~"
domain: computer-science
subject: operating-systems
topic: memory
type: knowledge
tags:
  - 内存管理
  - 页表
  - 地址转换
difficulty: medium
status: learning
created: 2026-07-21
updated: 2026-07-24
draft: false
---

## 一句话理解

虚拟内存为每个进程提供独立、连续的地址视图，再由操作系统和硬件完成到物理内存的映射喵~

## 为什么需要它

虚拟内存能够隔离进程地址空间、简化程序装载，并允许程序按需使用超过当前物理内存容量的地址空间喵~

## 核心流程

处理器产生虚拟地址后，内存管理单元会结合页表与地址转换缓存寻找对应的物理页框喵~

## 易错点

虚拟地址空间很大并不代表对应的物理内存已经全部分配喵~
