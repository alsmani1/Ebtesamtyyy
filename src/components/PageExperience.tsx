'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageExperienceInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const view = useSearchParams()?.get('view') || '';
  const workspace = pathname.split('/')[1] || 'public';
  const careWorkspaceRole =
    workspace === 'patient' || workspace === 'portal'
      ? 'patient'
      : workspace === 'reception'
      ? 'receptionist'
      : null;
  const isClinicalDark =
    pathname === '/dentist' ||
    pathname.startsWith('/dentist/') ||
    pathname === '/doctor/exam-room' ||
    pathname === '/doctor/imaging';
  const themeMode = isClinicalDark ? 'clinical-dark' : 'hospitality';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    return () => {
      document.documentElement.setAttribute('data-theme', 'hospitality');
    };
  }, [themeMode]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const page = document.querySelector<HTMLElement>('.page-experience');
    if (reduced || !page) return;

    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const isCareWorkspace = careWorkspaceRole !== null;
    const revealSelector = '.surface-card, .bento-card, .rounded-3xl, [data-reveal]';
    const animations: Animation[] = [];
    let started = false;
    const reveal = () => {
      if (started || !page.querySelector('h1, .surface-card, .bento-card, [data-reveal]')) return;
      started = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      animations.push(page.animate(
        [{ opacity: 0.72 }, { opacity: 1 }],
        { duration: isCareWorkspace ? 720 : 360, easing }
      ));
      const cards = Array.from(page.querySelectorAll<HTMLElement>(revealSelector))
        .filter((card) => !card.parentElement?.closest(revealSelector))
        .slice(0, 12);

      cards.forEach((card, index) => {
        animations.push(card.animate(
          [
            { opacity: 0, transform: 'translateY(14px) scale(0.99)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ],
          {
            duration: isCareWorkspace ? 900 : 480,
            delay: (isCareWorkspace ? 100 : 70) + index * (isCareWorkspace ? 75 : 45),
            easing,
            fill: 'backwards',
          }
        ));
      });
    };
    const observer = new MutationObserver(reveal);
    observer.observe(page, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 2000);
    reveal();

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname, view, careWorkspaceRole]);

  return (
    <div
      className={`page-experience relative z-10 min-h-screen w-full bg-transparent leading-relaxed ${
        isClinicalDark ? 'text-slate-100' : 'text-[#0B2528]'
      }`}
      data-workspace={workspace}
      data-workspace-role={careWorkspaceRole || undefined}
      data-theme={themeMode}
    >
      {children}
    </div>
  );
}

export function PageExperience({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-transparent">{children}</div>}>
      <PageExperienceInner>{children}</PageExperienceInner>
    </Suspense>
  );
}
