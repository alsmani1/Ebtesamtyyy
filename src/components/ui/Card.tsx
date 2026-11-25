'use client';

import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bento-card bg-white rounded-3xl border border-slate-200/70 shadow-[0_2px_12px_rgba(11,37,40,0.04)] p-6 hover:-translate-y-0.5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#C8A96E] hover:shadow-[0_12px_28px_rgba(11,37,40,0.08)] active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 flex flex-col gap-1.5 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-lg font-extrabold text-[#0B2528] tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-xs text-slate-500 leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
}
