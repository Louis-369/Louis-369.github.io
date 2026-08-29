/**
 * @file data/projects.js
 * @description Declarative content manifest for featured works, ethos stories, and capabilities.
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
    isExternal: false
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
    isExternal: false
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
    isExternal: true
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
    isExternal: false
  }
];

export const aboutStories = [
  {
    id: "craft",
    quote: "The gap between an ordinary digital tool and a memorable experience is relentless craft and intention.",
    body: "I engineer web systems from scratch with deep respect for typography, fluid physics, and uncompromising client-side speed.",
    tag: "(PHILOSOPHY & ETHOS)"
  },
  {
    id: "tactile",
    quote: "Computing is tactile. Physics, typography, and motion are not decorations—they are the interface.",
    body: "Every interaction should feel organic, responsive, and weighted with natural physical feedback.",
    tag: "(TACTILE INTERACTION)"
  },
  {
    id: "utility",
    quote: "Building digital tools that amplify human thought and deliver transformative utility.",
    body: "Combining architectural rigor with editorial aesthetics to build software that stands the test of time.",
    tag: "(AUGMENTED INTELLIGENCE)"
  },
  {
    id: "longevity",
    quote: "Timeless software is born where raw engineering discipline meets timeless graphic design.",
    body: "Focusing on zero-dependency lightweight performance, robust architecture, and tactile digital craftsmanship.",
    tag: "(TIMELESS ARCHITECTURE)"
  }
];

export const capabilities = [
  {
    id: "arch",
    name: "Web Architecture",
    video: "assets/videos/architecture.mp4"
  },
  {
    id: "webgl",
    name: "Interactive WebGL",
    video: "assets/videos/webgl.mp4"
  },
  {
    id: "uiux",
    name: "Fluid UI/UX Design",
    video: "assets/videos/uiux.mp4"
  },
  {
    id: "ai",
    name: "AI Workflow Tools",
    video: "assets/videos/ai.mp4"
  },
  {
    id: "eng",
    name: "Creative Engineering",
    video: "assets/videos/engineering.mp4"
  }
];
