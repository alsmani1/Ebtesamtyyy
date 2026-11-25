import { MetadataRoute } from 'next';
import { CLINIC_BRANCHES, CLINIC_SERVICES } from '../config/clinic-catalog';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ebtesamty.eg';
  const staticRoutes = [
    '',
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const serviceRoutes = CLINIC_SERVICES.map((srv) => ({
    url: `${baseUrl}/services/${srv.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const branchRoutes = CLINIC_BRANCHES.map((branch) => ({
    url: `${baseUrl}/branches/${branch.code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...serviceRoutes, ...branchRoutes];
}
