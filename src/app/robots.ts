import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/services',
          '/dentists',
          '/branches',
          '/about',
          '/new-patients',
          '/emergency',
          '/pricing',
          '/education',
          '/faqs',
          '/contact',
          '/policies',
          '/book',
        ],
        disallow: [
          '/portal',
          '/reception',
          '/dentist',
          '/management',
          '/billing',
          '/inventory',
          '/purchasing',
          '/crm',
          '/admin',
          '/api',
        ],
      },
    ],
    sitemap: 'https://ebtesamty.eg/sitemap.xml',
  };
}
