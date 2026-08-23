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
    title: "Brutalist Urban Matrix",
    category: "Architecture / Structural Study",
    year: "2026",
    summary: "粗獷主義集合住宅與幾何結構光影",
    desc: "探索現代粗獷主義建築的幾何立面與深邃灰階張力。透過高對比立體切面與實體質感，捕捉都會巨型結構中的秩序與永恆。",
    metrics: [
      { label: "Location", value: "Taichung · #10" },
      { label: "Style", value: "Brutalism" }
    ],
    tags: ["Architecture", "Brutalism", "Urban", "Structure"],
    image: "assets/works/brutalist-building.jpg",
    url: "/mind-sync/",
    isExternal: false,
    colorScheme: {
      accent: "#D97706",
      bgSubtle: "#F5F3EF"
    },
    coverBadge: "01 / SHOWCASE"
  },
  {
    id: "sticker-to-gif",
    title: "Twilight Solitude",
    category: "Atmospheric Photography / Mood",
    year: "2026",
    summary: "黃昏城市綠洲中的微光與靜謐",
    desc: "在暮色垂降的都會邊際草坪，記錄一束溫暖地燈打在休憩身影上的寧靜切片。暖黃聚光與冷調天色形成極具電影感的詩意對比。",
    metrics: [
      { label: "Atmosphere", value: "Twilight Light" },
      { label: "Tone", value: "Cinematic" }
    ],
    tags: ["Photography", "Cinematic", "Dusk", "Moment"],
    image: "assets/works/sunset-park.jpg",
    url: "/sticker-to-gif/",
    isExternal: false,
    colorScheme: {
      accent: "#E11D48",
      bgSubtle: "#FFF1F2"
    },
    coverBadge: "02 / SHOWCASE"
  },
  {
    id: "fitstepsync",
    title: "Electric Pulse Concert",
    category: "Live Performance / Stage Lighting",
    year: "2026",
    summary: "萬人體育館的霓虹紫色光瀑與舞台聚焦",
    desc: "捕捉演唱會現場強烈紫光探照燈與聚焦背影的震撼瞬間。黑壓壓的看台人潮與舞台螢光綠焦點交織出極具張力的現場能量感。",
    metrics: [
      { label: "Arena", value: "Live Stage" },
      { label: "Lighting", value: "Neon Purple" }
    ],
    tags: ["Live Stage", "Concert", "Energy", "Visual"],
    image: "assets/works/concert-stage.jpg",
    url: "https://github.com/Louis-369/FitStepSync",
    isExternal: true,
    colorScheme: {
      accent: "#9333EA",
      bgSubtle: "#FAF5FF"
    },
    coverBadge: "03 / SHOWCASE"
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
    image: null,
    url: "#",
    isExternal: false,
    colorScheme: {
      accent: "#0D9488",
      bgSubtle: "#F0FDFA"
    },
    coverBadge: "04 / EXPERIMENTAL"
  }
];
