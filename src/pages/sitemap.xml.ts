import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://louis-369.is-a.dev';
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const categories = Array.from(new Set(posts.map((p) => p.data.category)));

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0' },
    { loc: `${baseUrl}/blog/`, priority: '0.9' },
    { loc: `${baseUrl}/photos/`, priority: '0.8' },
  ];

  const categoryUrls = categories.map((cat) => ({
    loc: `${baseUrl}/blog/category/${cat}/`,
    priority: '0.7',
  }));

  const postUrls = posts.map((post) => ({
    loc: `${baseUrl}/blog/${post.id}/`,
    lastmod: post.data.pubDate.toISOString().slice(0, 10),
    priority: '0.8',
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${'lastmod' in u && u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
