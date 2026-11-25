'use client';

import { TranslatedText } from '@/components/TranslatedText';
import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'horizontal' | 'official';
  showSubtitle?: boolean;
  isArabic?: boolean;
  useOfficialImage?: boolean;
  dark?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  isArabic = false,
  dark = false,
}: BrandLogoProps) {
  const isCompactMark = variant === 'mark' || variant === 'official';

  const LogoImg = (
    <img
      src="/images/ebtesamty-logo.png"
      alt="Ebtesamty Dental Clinic"
      className={
        isCompactMark
          ? 'w-10 h-10 rounded-full object-contain bg-white p-0.5 shadow-xs transition-transform duration-200 hover:scale-105'
          : 'w-11 h-11 rounded-full object-contain bg-white p-0.5 shadow-xs transition-transform duration-200 hover:scale-105'
      }
    />
  );

  if (isCompactMark) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoImg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {LogoImg}
      <div className="flex flex-col text-start">
        <span
          className={`font-sans font-extrabold tracking-tight leading-tight ${
            dark ? 'text-white' : 'text-[#0B2528]'
          } ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}
        >
          <TranslatedText text={String(isArabic ? 'عيادات ابتسامتي' : 'Ebtesamty Dental Clinic')} />
        </span>
        {showSubtitle && (
          <span
            className={`font-sans text-[11px] font-semibold ${
              dark ? 'text-[#14B8A6]' : 'text-[#C8A96E]'
            }`}
          >
            <TranslatedText text={String(isArabic ? 'المنيا • مصر' : 'Minya Branches A, B & C')} />
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
