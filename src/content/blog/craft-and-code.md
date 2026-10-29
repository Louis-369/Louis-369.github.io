---
title: "在像素與物理之間：現代網頁的高工藝美學"
description: "探討真實物理模擬、社論排版字體學與客戶端極致載入速度的融合之道。"
pubDate: 2026-10-25
category: "engineering"
tags: ["Creative Engineering", "WebGL", "Typography"]
cover: "/assets/works/brutalist-building.jpg"
coverAlt: "粗獷主義幾何結構"
draft: false
---

在前端框架與模板庫氾濫的今天，很多網站看起來千篇一律：相同的卡片陰影、相同的按鈕懸停效果、相同的死板過場。

但**計算本該是有觸感的（Computing is tactile）**。物理、字體排印與流暢動態不該只是裝飾，它們本身就是介面。

## 墨流與黑洞：為什麼堅持原生 WebGL？

當我們把水墨擴散（Suminagashi）或克卜勒差動旋轉寫進 GLSL 著色器時，我們在追求的不是花俏的炫技，而是「介面與自然法則的共鳴」：

```glsl
// 簡化之差動流體角速度
float omega = 1.0 / pow(radius, 1.5);
vec2 rotatedCoord = rotate(uv, omega * u_time);
```

當游標滑過螢幕，黑洞產生的引力不是生硬的線性位移，而是符合反平方定律的引力井。這種微妙的微互動，在使用者大腦中會留下真實、沉穩且難以言喻的質感。

![現場舞臺光影氛圍](/assets/works/concert-stage.jpg)

## 永恆的設計不喧賓奪主

最好的數位工具，往往擁有最克制的視覺節奏。以米白紙感為底，配以高對比襯線文字，讓內容沉澱下來，技術則在背後安靜而精密地運轉。
