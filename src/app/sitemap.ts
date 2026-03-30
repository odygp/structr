import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://structr.app';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/changelog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/for/designers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/for/product-managers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/for/marketers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/for/founders`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/for/agencies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/for/content-strategists`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
