'use client';
import {LocalizedInput} from '@/components/LocalizedControls';


import React from 'react';
import { BrandLogo } from './BrandLogo';
import { StatusTag } from './StatusTag';
import { Building2, Clock, Search, HelpCircle, LucideIcon } from 'lucide-react';

interface RolePageHeaderProps {
  roleTitle: string;
  roleBadge: string;
  roleBadgeVariant?: 'action' | 'warning' | 'verified' | 'proposed';
  branchName?: string;
  onBranchChange?: (branch: string) => void;
  branches?: Array<{ id: string; name: string }>;
  quickSearchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  isArabic?: boolean;
}

export function RolePageHeader({
  roleTitle,
  roleBadge,
  roleBadgeVariant = 'action',
  branchName = 'Heliopolis Branch',
  quickSearchPlaceholder = 'Search patient, phone, ID...',
  onSearch,
  actions,
  isArabic = false,
}: RolePageHeaderProps) {
  // Current Cairo time
  const [cairoTime, setCairoTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCairoTime(
        now.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [isArabic]);

  return (
    <header className="bg-white border-b border-eb-line sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Role identity & Branch context */}
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" variant="mark" />
          <div className="border-r border-eb-line h-7 mx-1 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-eb-ink leading-tight">
                {roleTitle}
              </h1>
              <StatusTag
                variant={roleBadgeVariant}
                label={roleBadge}
                size="sm"
                icon={false}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-eb-muted mt-0.5">
              <span className="flex items-center gap-1 font-medium text-eb-navy">
                <Building2 className="w-3.5 h-3.5" />
                {branchName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-eb-orange" />
                {cairoTime || 'Cairo, EG'}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Universal search & Context actions */}
        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
          {onSearch && (
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-eb-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                type="search"
                placeholder={quickSearchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-eb-ivory border border-eb-line rounded-lg text-eb-ink placeholder:text-eb-muted focus:bg-white focus:border-eb-blue transition-colors"
              />
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

export default RolePageHeader;
