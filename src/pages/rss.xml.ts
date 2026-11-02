import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://louis-369.is-a.dev';
  const allPosts = await getCollection('blog', ({ data }) => !data.draft);
  const posts = allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.id}/`;
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(post.data.category)}</category>
      <description>${escapeXml(post.data.description)}</description>
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Louis · Thoughts &amp; Essays</title>
    <description>Essays on AI workflows, autonomous systems, creative engineering, and digital craftsmanship.</description>
    <link>${baseUrl}/blog/</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>zh-Hant</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
