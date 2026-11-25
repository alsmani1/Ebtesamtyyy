import React from 'react';
import BranchDetailClient from './BranchDetailClient';
import { CLINIC_BRANCHES } from '../../../config/clinic-catalog';

export function generateStaticParams() {
  const codes = new Set<string>(['BR-A', 'BR-B', 'BR-C', 'br-a', 'br-b', 'br-c']);
  for (const b of CLINIC_BRANCHES) {
    codes.add(b.code);
    if (b.slug) codes.add(b.slug);
  }
  return Array.from(codes).map((code) => ({ code }));
}

export default function BranchDetailPage() {
  return <BranchDetailClient />;
}
