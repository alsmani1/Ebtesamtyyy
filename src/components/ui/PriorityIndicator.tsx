import React from 'react';
import { Flag } from 'lucide-react';

export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

interface PriorityIndicatorProps {
  priority: PriorityLevel;
  showLabel?: boolean;
  className?: string;
  isArabic?: boolean;
}

const priorityConfig: Record<PriorityLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  labelEn: string;
  labelAr: string;
}> = {
  urgent: {
    color: 'text-[#B42318]',
    bgColor: 'bg-[#FEF3F2]',
    borderColor: 'border-[#FECDCA]',
    labelEn: 'Urgent',
    labelAr: 'عاجل جداً',
  },
  high: {
    color: 'text-[#946200]',
    bgColor: 'bg-[#FFF7DF]',
    borderColor: 'border-[#FEDF89]',
    labelEn: 'High Priority',
    labelAr: 'أولوية عالية',
  },
  normal: {
    color: 'text-[#174EA6]',
    bgColor: 'bg-[#EDF4FF]',
    borderColor: 'border-[#B2DDFF]',
    labelEn: 'Normal',
    labelAr: 'عادي',
  },
  low: {
    color: 'text-[#475467]',
    bgColor: 'bg-[#F2F4F7]',
    borderColor: 'border-[#EAECF0]',
    labelEn: 'Low',
    labelAr: 'منخفض',
  },
};

export function PriorityIndicator({
  priority,
  showLabel = true,
  className = '',
  isArabic = false,
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority] || priorityConfig.normal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${config.bgColor} ${config.color} ${config.borderColor} ${className}`}
      title={`Priority: ${config.labelEn}`}
    >
      <Flag className="w-3 h-3 fill-current shrink-0" />
      {showLabel && <span>{isArabic ? config.labelAr : config.labelEn}</span>}
    </span>
  );
}

export default PriorityIndicator;
