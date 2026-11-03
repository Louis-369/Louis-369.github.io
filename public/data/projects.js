/**
 * @file data/projects.js
 * @description Declarative content manifest for featured works, ethos stories, and capabilities.
 */

export const siteConfig = {
  name: "Louis",
  role: "Creative Developer & Builder",
  location: "Taipei · Earth",
  status: "Available for innovative projects",
  tagline: "I build digital tools, write about how things work, and take photos along the way.",
  bio: "寫點實用的程式，記下值得深思的想法，拍點喜歡的風景。結合工程嚴謹度與高工藝社論美學，打造流暢且耐看的數位產品。",
  githubUrl: "https://github.com/Louis-369",
  email: "mailto:contact.louis369@gmail.com"
};

export const featuredProjects = [
  {
    id: "mind-sync-core",
    title: "Mind Sync · 心天秤",
    category: "Multiplayer Web App / Game System",
    year: "2026",
    summary: "現代和風多人即時價值觀卡牌桌遊",
    desc: "玩家抽取標有 1 至 100 的天然和紙卡牌，透過直覺與默契在冷暖色溫光譜插槽上達成價值觀與數字平衡。內建 3D 金箔視差反光、即時安全水位線與全舞台沉浸 HUD。",
    metrics: [
      { label: "Architecture", value: "Next.js · v0.7" },
      { label: "Experience", value: "Realtime Sync" }
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Game Design"],
    image: "/assets/works/mind-sync-arch.svg",
    url: "https://mind-sync-sigma.vercel.app",
    repoUrl: "https://github.com/Louis-369/mind-sync",
    isExternal: true
  },
  {
    id: "mind-sync-protocol",
    title: "Mind Sync · Seeded Shuffle",
    category: "Cryptographic Deck / Network Protocol",
    year: "2026",
    summary: "零狀態洩漏確定性洗牌與 Emoji 暗號配對",
    desc: "以三組 Emoji 生成免密碼暗號房間，結合 Fisher-Yates 確定性種子洗牌演算法（Seeded PRNG），在不傳輸完整牌組狀態的前提下達成跨端手牌隱私隔離與極致頻寬節省。",
    metrics: [
      { label: "Payload", value: "< 1.2 KB / 局" },
      { label: "Test Coverage", value: "Vitest 100%" }
    ],
    tags: ["Seeded Shuffle", "Ubiquitous Language", "Vitest", "Zero-Leakage"],
    image: "/assets/works/mind-sync-shuffle.svg",
    url: "https://mind-sync-sigma.vercel.app",
    repoUrl: "https://github.com/Louis-369/mind-sync",
    isExternal: true
  },
  {
    id: "mind-sync-audio",
    title: "Mind Sync · Tactile Audio HUD",
    category: "Procedural Web Audio / Interactive UI",
    year: "2026",
    summary: "純代碼五聲音階合成與 ASCII 破綻特效",
    desc: "0 KB 外部音訊依賴，以純 Web Audio API 實時合成和風五聲音階（宮商角徵羽）翻牌遞增結算與三味線撞席瞬態警示音，搭配雙階段 ASCII Glitch 破綻抽搐與離線防死鎖代翻機制。",
    metrics: [
      { label: "Audio Assets", value: "0 KB Pure Synth" },
      { label: "Topic Deck", value: "30+ 價值主題" }
    ],
    tags: ["Web Audio API", "Procedural Synth", "ASCII Glitch", "3D Foil"],
    image: "/assets/works/mind-sync-audio.svg",
    url: "https://mind-sync-sigma.vercel.app",
    repoUrl: "https://github.com/Louis-369/mind-sync",
    isExternal: true
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
    video: "/assets/videos/architecture.mp4"
  },
  {
    id: "webgl",
    name: "Interactive WebGL",
    video: "/assets/videos/webgl.mp4"
  },
  {
    id: "uiux",
    name: "Fluid UI/UX Design",
    video: "/assets/videos/uiux.mp4"
  },
  {
    id: "ai",
    name: "AI Workflow Tools",
    video: "/assets/videos/ai.mp4"
  },
  {
    id: "eng",
    name: "Creative Engineering",
    video: "/assets/videos/engineering.mp4"
  }
];
