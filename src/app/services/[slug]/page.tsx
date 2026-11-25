import React from 'react';
import ServiceDetailClient from './ServiceDetailClient';
import { CLINIC_SERVICES } from '../../../config/clinic-catalog';

export function generateStaticParams() {
  const slugs = new Set<string>([
    'general-dentistry',
    'dental-cleaning',
    'restorative-fillings',
    'root-canal',
    'crowns-bridges',
    'dental-implants',
    'orthodontics',
    'cosmetic-dentistry',
  ]);
  for (const s of CLINIC_SERVICES) {
    if (s.slug) slugs.add(s.slug);
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}

export default function ServiceDetailPage() {
  return <ServiceDetailClient />;
}
