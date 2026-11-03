/**
 * @file src/utils/readingTime.ts
 * @description Calculates estimated reading time for bilingual (zh-Hant + English) Markdown content.
 */

export function getReadingTime(markdownBody: string = ''): string {
  const cleanText = markdownBody
    .replace(/```[\s\S]*?```/g, ' ') // Remove code blocks
    .replace(/`[^`]*`/g, ' ')        // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // Remove images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Keep link text
    .replace(/<[^>]+>/g, ' ')        // Remove HTML tags
    .replace(/[#>*_~\-|]/g, ' ');    // Remove Markdown symbols

  // Count CJK characters (Chinese / Japanese / Korean)
  const cjkMatches = cleanText.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // Count Latin words
  const nonCjkText = cleanText.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ');
  const wordMatches = nonCjkText.trim().match(/\S+/g);
  const wordCount = wordMatches ? wordMatches.length : 0;

  // 350 CJK chars/min, 200 English words/min
  const minutes = Math.max(1, Math.ceil(cjkCount / 350 + wordCount / 200));
  return `${minutes}\u00A0MIN\u00A0READ`;
}
