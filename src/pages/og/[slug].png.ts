import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

let fontCache: { serifBold: ArrayBuffer; monoMedium: ArrayBuffer } | null = null;

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const cssRes = await fetch(cssUrl, {
    headers: {
      // User-Agent that triggers TrueType (.ttf) / OpenType (.otf) format from Google Fonts
      'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
    }
  });
  const cssText = await cssRes.text();
  const match = cssText.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:truetype|opentype|woff)['"]?\)/i) || cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match || !match[1]) {
    throw new Error(`Failed to resolve font URL for ${family}`);
  }
  const fontRes = await fetch(match[1]);
  return await fontRes.arrayBuffer();
}

async function getFonts() {
  if (!fontCache) {
    const [serifBold, monoMedium] = await Promise.all([
      fetchGoogleFont('Noto Serif TC', 700),
      fetchGoogleFont('Geist Mono', 500)
    ]);
    fontCache = { serifBold, monoMedium };
  }
  return fontCache;
}

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: CollectionEntry<'blog'> };
  const { serifBold, monoMedium } = await getFonts();
  const dateStr = post.data.pubDate.toISOString().slice(0, 10);
  const categoryStr = post.data.category.toUpperCase();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          backgroundColor: '#F9F8F5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px',
          fontFamily: '"Noto Serif TC"',
          color: '#121316',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                border: '1.5px solid rgba(18, 19, 22, 0.16)',
                borderRadius: '12px',
                padding: '52px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#F9F8F5',
              },
              children: [
                // Top Meta Row
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(18, 19, 22, 0.1)',
                      paddingBottom: '24px',
                      fontFamily: '"Geist Mono"',
                      fontSize: '20px',
                      letterSpacing: '0.1em',
                      color: '#6E6A63',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: '12px' },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: {
                                  color: '#121316',
                                  fontWeight: 600,
                                  padding: '4px 14px',
                                  border: '1px solid rgba(18, 19, 22, 0.25)',
                                  borderRadius: '999px',
                                  fontSize: '18px',
                                },
                                children: categoryStr,
                              },
                            },
                            {
                              type: 'span',
                              props: { children: '·  EDITORIAL ESSAY' },
                            },
                          ],
                        },
                      },
                      {
                        type: 'span',
                        props: { children: dateStr },
                      },
                    ],
                  },
                },
                // Center Title & Description
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '22px',
                      marginTop: '12px',
                      marginBottom: '12px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: post.data.title.length > 26 ? '48px' : '56px',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            color: '#121316',
                            letterSpacing: '-0.02em',
                          },
                          children: post.data.title,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '24px',
                            lineHeight: 1.55,
                            color: '#5A564F',
                          },
                          children:
                            post.data.description.length > 85
                              ? post.data.description.slice(0, 85) + '…'
                              : post.data.description,
                        },
                      },
                    ],
                  },
                },
                // Bottom Brand Footer
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      borderTop: '1px solid rgba(18, 19, 22, 0.1)',
                      paddingTop: '24px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: '"Geist Mono"',
                            fontSize: '18px',
                            letterSpacing: '0.08em',
                            color: '#6E6A63',
                          },
                          children: 'LOUIS-369.IS-A.DEV · THOUGHTS & SYSTEMS',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'baseline',
                            fontSize: '42px',
                            fontWeight: 700,
                            color: '#121316',
                            letterSpacing: '-0.03em',
                          },
                          children: [
                            { type: 'span', props: { children: 'Louis' } },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '999px',
                                  backgroundColor: '#121316',
                                  marginLeft: '6px',
                                  boxShadow: '0 0 0 4px rgba(18, 19, 22, 0.12)',
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Serif TC',
          data: serifBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Geist Mono',
          data: monoMedium,
          weight: 500,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
