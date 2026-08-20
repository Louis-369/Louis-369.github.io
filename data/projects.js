/**
 * projects.js - Sector Manifest & Projects Configuration
 * 
 * Central declarative source of truth for continental sectors,
 * coordinates, theme tints, and project landmark records.
 */

export const siteConfig = {
  name: "Louis",
  title: "Developer & Creator",
  tagline: "Building tools that think & craft that inspires.",
  githubUrl: "https://github.com/Louis-369",
  defaultCoords: { lat: 20.0, lon: 45.0 }
};

export const sectors = [
  {
    id: "ai",
    label: "AI & 認知板塊",
    englishLabel: "Cognitive & AI Sector",
    coordinateCode: "LAT 25.0°N · LON 105.0°E",
    tagline: "探索思維脈絡、知識圖譜與智慧輔助工具的實驗場。",
    globeCoords: { lat: 25.0, lon: 105.0 },
    stageOffset: { x: -260, y: -120, scale: 0.82 },
    hueShift: {
      bg: "#FAF7FB",
      accent: "#7C3AED",
      dotAccent: "#8B5CF6",
      border: "rgba(124, 58, 237, 0.12)"
    },
    projects: [
      {
        id: "mind-sync",
        title: "Mind-Sync",
        subtitle: "思維同步與知識視覺化畫布",
        desc: "幫助理清複雜思維脈絡、梳理架構邏輯，並透過即時互動節點激發創意思維的知識工具。",
        tags: ["Web App", "Interactive", "Mind Map", "Canvas"],
        icon: "🧠",
        url: "/mind-sync/",
        isExternal: false,
        status: "Online"
      }
    ]
  },
  {
    id: "creative",
    label: "創意媒體群島",
    englishLabel: "Creative Media Archipelago",
    coordinateCode: "LAT 20.0°S · LON 175.0°E",
    tagline: "流暢的動態影像轉換、自訂貼圖與視覺創作工具群。",
    globeCoords: { lat: -20.0, lon: 175.0 },
    stageOffset: { x: 260, y: -120, scale: 0.82 },
    hueShift: {
      bg: "#FAF6F1",
      accent: "#D97706",
      dotAccent: "#F59E0B",
      border: "rgba(217, 119, 6, 0.12)"
    },
    projects: [
      {
        id: "sticker-to-gif",
        title: "Sticker to GIF",
        subtitle: "動態貼圖轉高品質 GIF 工具",
        desc: "極速將靜態與動態貼圖封包轉換為流暢、無失真且高壓縮率的高畫質 GIF 動圖神器。",
        tags: ["Media Converter", "Canvas", "Tool", "Animation"],
        icon: "🎬",
        url: "/sticker-to-gif/",
        isExternal: false,
        status: "Online"
      }
    ]
  },
  {
    id: "labs",
    label: "極客工坊",
    englishLabel: "Core Utility & Systems",
    coordinateCode: "LAT 48.0°N · LON 42.0°W",
    tagline: "效率工具、底層系統整合與現代化開源實驗。",
    globeCoords: { lat: 48.0, lon: -42.0 },
    stageOffset: { x: -240, y: 130, scale: 0.82 },
    hueShift: {
      bg: "#F5F8F6",
      accent: "#0D9488",
      dotAccent: "#14B8A6",
      border: "rgba(13, 148, 136, 0.12)"
    },
    projects: [
      {
        id: "fitstepsync",
        title: "FitStepSync",
        subtitle: "智慧運動步數與健康數據橋接器",
        desc: "專注於跨平台健康步數無縫同步與數據格式橋接的原生 Android 高效能應用。",
        tags: ["Android", "Kotlin", "Health API", "Automation"],
        icon: "⚡",
        url: "https://github.com/Louis-369/FitStepSync",
        isExternal: true,
        status: "Open Source"
      }
    ]
  },
  {
    id: "hub",
    label: "星海中樞",
    englishLabel: "Hub Abyss & Identity",
    coordinateCode: "LAT 32.0°S · LON 120.0°W",
    tagline: "關於 Louis、個人技術背景與全域中轉通道。",
    globeCoords: { lat: -32.0, lon: -120.0 },
    stageOffset: { x: 240, y: 130, scale: 0.82 },
    hueShift: {
      bg: "#F5F7FA",
      accent: "#2563EB",
      dotAccent: "#3B82F6",
      border: "rgba(37, 99, 235, 0.12)"
    },
    projects: [
      {
        id: "github-profile",
        title: "GitHub Headquarters",
        subtitle: "Louis-369 開源世界",
        desc: "探索 Louis 的所有開源 Repository、程式碼提交歷史與最新技術探索專案。",
        tags: ["Profile", "Open Source", "Codebase"],
        icon: "🚀",
        url: "https://github.com/Louis-369",
        isExternal: true,
        status: "Active"
      }
    ]
  }
];
