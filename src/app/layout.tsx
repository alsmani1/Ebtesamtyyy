import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { AppShell } from '../components/AppShell';
import { Footer } from '../components/Footer';
import { PageExperience } from '@/components/PageExperience';
import { PresentationAccess } from '@/components/PresentationAccess';

export const metadata: Metadata = {
  title: 'Ebtesamty Dental Clinics (ابتسامتي) — Minya Multi-Branch Dental Care',
  description:
    'Warm, trustworthy, evidence-based dental care across three Minya branches (Branch A, Branch B, Branch C). Online appointment booking, patient portal, and integrated clinical care.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/ebtesamty-logo.png',
    shortcut: '/images/ebtesamty-logo.png',
    apple: '/images/ebtesamty-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="bg-transparent">
      <body className="min-h-screen flex flex-col font-sans bg-transparent text-[#0B2528] antialiased">
        <LanguageProvider initialLocale="en">
          <Navbar currentUser={null} />
          <AppShell currentUser={null}>
            <PageExperience>{children}</PageExperience>
          </AppShell>
          <PresentationAccess />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
