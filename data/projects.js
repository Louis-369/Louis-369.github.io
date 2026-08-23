/**
 * projects.js - Portfolio Case Studies & Project Manifest
 * 
 * Declarative data structure formatted for editorial showcase.
 */

export const siteConfig = {
  name: "Louis",
  role: "Creative Developer & Builder",
  location: "Taipei · Earth",
  status: "Available for innovative projects",
  tagline: "Building digital tools that think & craft that moves people.",
  bio: "Specializing in high-performance web applications, interactive creative media, and seamless digital utility tools. Combining engineering rigor with award-winning editorial aesthetic.",
  githubUrl: "https://github.com/Louis-369",
  email: "mailto:hello@louis-369.github.io"
};

export const featuredProjects = [
  {
    id: "mind-sync",
    title: "Mind-Sync",
    category: "Interactive Tool / Web App",
    year: "2026",
    summary: "思維同步與知識視覺化畫布",
    desc: "專注於理清複雜思維脈絡與知識架構的即時視覺化工具。具備流暢的無窮畫布節點操作、智慧分層連線與直覺的雙向導航體驗。",
    metrics: [
      { label: "Architecture", value: "100% Client" },
      { label: "Rendering", value: "60 FPS Canvas" }
    ],
    tags: ["Web App", "Canvas", "Mind Map", "Interactive"],
    url: "/mind-sync/",
    isExternal: false,
    colorScheme: {
      accent: "#3B82F6",
      bgSubtle: "#EFF6FF"
    },
    coverBadge: "01 / FEATURED"
  },
  {
    id: "sticker-to-gif",
    title: "Sticker to GIF",
    category: "Media Converter / Animation",
    year: "2026",
    summary: "動態貼圖轉高畫質 GIF 轉換神器",
    desc: "極速將靜態與動態貼圖封包解析並轉化為流暢、無失真且高壓縮率的高品質 GIF 動圖。開箱即用，零伺服器上傳，保護隱私。",
    metrics: [
      { label: "Conversion", value: "Lossless" },
      { label: "Privacy", value: "Zero Upload" }
    ],
    tags: ["Media Converter", "Canvas", "Animation", "Tool"],
    url: "/sticker-to-gif/",
    isExternal: false,
    colorScheme: {
      accent: "#8B5CF6",
      bgSubtle: "#F5F3FF"
    },
    coverBadge: "02 / FEATURED"
  },
  {
    id: "fitstepsync",
    title: "FitStepSync",
    category: "Systems & Health Integration",
    year: "2026",
    summary: "智慧運動步數與跨平台健康數據橋接器",
    desc: "專注於跨平台健康步數無縫同步與底層數據格式橋接的原生高效能應用，打造零阻力的運動數據互聯體驗。",
    metrics: [
      { label: "Platform", value: "Android / Kotlin" },
      { label: "License", value: "Open Source" }
    ],
    tags: ["Android", "Kotlin", "Health API", "Automation"],
    url: "https://github.com/Louis-369/FitStepSync",
    isExternal: true,
    colorScheme: {
      accent: "#10B981",
      bgSubtle: "#ECFDF5"
    },
    coverBadge: "03 / OPEN SOURCE"
  },
  {
    id: "next-matrix",
    title: "Next Innovation Matrix",
    category: "AI Tools / In Development",
    year: "2026",
    summary: "次世代智慧工作流矩陣 (Coming Soon)",
    desc: "結合本地端輕量化模型推理與智慧自動化工作流的全新工具矩陣，正在嚴密構建中。",
    metrics: [
      { label: "Status", value: "WIP / 施工中" },
      { label: "Stage", value: "Incubating" }
    ],
    tags: ["AI Agent", "Workflow", "WIP"],
    url: "#",
    isExternal: false,
    colorScheme: {
      accent: "#F59E0B",
      bgSubtle: "#FFFBEB"
    },
    coverBadge: "04 / EXPERIMENTAL"
  }
];
