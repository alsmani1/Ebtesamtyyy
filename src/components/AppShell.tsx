'use client';

import { TranslatedText } from '@/components/TranslatedText';
import { localizedText } from '@/lib/interface-messages';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './ui/BrandLogo';
import { PresentationAccess } from './PresentationAccess';
import { StaffTopbarUtilities, PatientMobileBottomNav } from './StaffUtilityModals';
import EbtesamtyFloatingAiAssistant from './phase3/EbtesamtyFloatingAiAssistant';
import { PatientNotificationsBell } from './PatientNotifications';
import { CareThemeBackdrop } from './workspace/CareThemeBackdrop';
import { resolveAuthenticatedIdentity } from '@/config/minya-clinic-store';
import { getStaticSessionUser, logoutStaticUser, STATIC_AUTH_EVENT, FALLBACK_DEMO_USERS } from '@/lib/auth';
import { isAssistantConfigured } from '@/lib/assistant-api';
import {
  WORKSPACE_CONFIGS,
  resolveActiveWorkspace,
  getAuthorizedWorkspacesForRole,
  NavItemConfig,
} from '../config/workspace-navigation';
import {
  Calendar,
  Users,
  CreditCard,
  Stethoscope,
  ClipboardCheck,
  LayoutDashboard,
  Building2,
  BarChart3,
  Boxes,
  ShoppingCart,
  Truck,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  User,
  HeartPulse,
  Clock,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Layers,
  Home,
  Pill,
  QrCode,
  Package,
  AlertCircle,
  Scan,
  FlaskConical,
  MessageCircle,
  Star,
  TrendingUp,
  UserPlus,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface AppShellProps {
  currentUser?: {
    id: string;
    fullName: string;
    email?: string | null;
    staffProfile?: { title: string } | null;
    roleGrants: { role: string; branch?: { code: string; name: string } | null }[];
  } | null;
  children: React.ReactNode;
}

const WORKSPACE_PREFIXES = [
  '/owner',
  '/doctor',
  '/patient',
  '/portal',
  '/reception',
  '/dentist',
  '/management',
  '/billing',
  '/inventory',
  '/purchasing',
  '/operations',
  '/crm',
  '/admin',
  '/supplier',
];

function renderNavIcon(iconName: string, className: string = 'w-5 h-5') {
  switch (iconName) {
    case 'Home':
      return <Home className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'ClipboardCheck':
      return <ClipboardCheck className={className} />;
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'Boxes':
    case 'Package':
      return <Boxes className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'AlertTriangle':
    case 'AlertCircle':
      return <AlertTriangle className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'User':
      return <User className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'Scan':
      return <Scan className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'MessageCircle':
      return <MessageCircle className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'UserPlus':
      return <UserPlus className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    default:
      return <LayoutDashboard className={className} />;
  }
}

function AppShellInner({ currentUser: initialUser, children }: AppShellProps) {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const isAr = locale === 'ar';

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<AppShellProps['currentUser']>(initialUser || null);

  useEffect(() => {
    const sync = () => {
      const stored = getStaticSessionUser();
      if (stored) {
        setSessionUser(stored);
      } else if (isAssistantConfigured()) {
        setSessionUser(null);
      } else if (pathname.startsWith('/patient') || pathname.startsWith('/portal')) {
        setSessionUser(FALLBACK_DEMO_USERS['hassan.patient@ebtesamty.dev']);
      } else if (pathname.startsWith('/reception')) {
        setSessionUser(FALLBACK_DEMO_USERS['mariam.reception@ebtesamty.dev']);
      } else if (pathname.startsWith('/doctor') || pathname.startsWith('/dentist')) {
        setSessionUser(FALLBACK_DEMO_USERS['dr.sandy@ebtesamty.dev']);
      } else if (pathname.startsWith('/owner') || pathname.startsWith('/management') || pathname.startsWith('/admin') || pathname.startsWith('/billing') || pathname.startsWith('/inventory') || pathname.startsWith('/crm')) {
        setSessionUser(FALLBACK_DEMO_USERS['admin@ebtesamty.dev']);
      } else {
        setSessionUser(initialUser || null);
      }
    };
    sync();
    window.addEventListener(STATIC_AUTH_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STATIC_AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [initialUser, pathname]);

  const currentUser = sessionUser;

  const handleStaticLogout = () => {
    setProfileMenuOpen(false);
    logoutStaticUser();
    router.push('/auth/login');
  };

  const primaryRole = currentUser?.roleGrants?.some((g) => g.role === 'OWNER_ADMIN')
    ? 'OWNER_ADMIN'
    : currentUser?.roleGrants?.[0]?.role || null;
  const branchCode = currentUser?.roleGrants?.[0]?.branch?.code || null;
  const branchFull = currentUser?.roleGrants?.[0]?.branch?.name || null;

  const displayRoleLabel = (() => {
    const profileTitle = currentUser?.staffProfile?.title;
    if (
      profileTitle &&
      [
        'OWNER / EXECUTIVE',
        'FINANCE / ACCOUNTANT',
        'INVENTORY & PROCUREMENT',
        'MARKETING & CRM',
        'SUPER ADMIN',
        'OPERATIONS & FINANCE',
      ].includes(profileTitle)
    ) {
      return profileTitle;
    }
    if (primaryRole === 'BRANCH_MANAGER' || primaryRole === 'OWNER_ADMIN') {
      return 'OWNER / EXECUTIVE';
    }
    return primaryRole || 'PATIENT';
  })();

  const isPatientRoute =
    pathname === '/portal' ||
    pathname.startsWith('/portal/') ||
    pathname === '/patient' ||
    pathname.startsWith('/patient/');
  const isClinicalDark =
    pathname === '/dentist' ||
    pathname.startsWith('/dentist/') ||
    pathname === '/doctor/exam-room' ||
    pathname === '/doctor/imaging';
  const isReceptionCommand = pathname === '/reception' || pathname.startsWith('/reception/');
  const careWorkspaceRole = isPatientRoute
    ? 'patient'
    : isReceptionCommand
    ? 'receptionist'
    : null;
  const isWorkspaceRoute = WORKSPACE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const resolvedIdentity = resolveAuthenticatedIdentity(
    currentUser,
    isPatientRoute
      ? 'patient'
      : pathname.startsWith('/doctor') || pathname.startsWith('/dentist')
      ? 'doctor'
      : pathname.startsWith('/reception')
      ? 'receptionist'
      : 'clinic_owner'
  );

  const isNavItemActive = (item: NavItemConfig) => {
    const [targetPath, targetQuery] = item.href.split('?');
    if (targetQuery) {
      const params = new URLSearchParams(targetQuery);
      for (const [k, v] of params.entries()) {
        if (searchParams?.get(k) !== v) return false;
      }
      return pathname === targetPath;
    }
    if (item.exact) {
      const hasViewParam = searchParams?.get('view') || searchParams?.get('mode');
      return pathname === targetPath && !hasViewParam;
    }
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  const isLoginRoute = pathname === '/auth/login' || pathname.startsWith('/auth/register');

  // Public & auth routes inherit the fixed Ebtesamty marble corridor background (100% clarity on Login)
  if (!isWorkspaceRoute) {
    return (
      <div className="min-h-screen relative bg-transparent text-[#0B2528]">
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/ebtesamty-bg.jpg')" }}
        >
          {!isLoginRoute && (
            <div className="absolute inset-0 bg-[#FAF9F6]/50 backdrop-blur-[2px]" />
          )}
        </div>
        <div className="relative z-10 bg-transparent">{children}</div>
        <EbtesamtyFloatingAiAssistant />
      </div>
    );
  }

  const activeWorkspace = isPatientRoute
    ? WORKSPACE_CONFIGS.PATIENT
    : resolveActiveWorkspace(pathname, primaryRole);

  const authorizedWorkspaces = Array.from(
    new Map(
      (currentUser?.roleGrants || [])
        .flatMap((g) => getAuthorizedWorkspacesForRole(g.role))
        .map((w) => [w.id, w])
    ).values()
  );

  const activeNavItem = activeWorkspace.navItems.find((item) => isNavItemActive(item));
  const subPageBreadcrumb = activeNavItem
    ? isAr
      ? activeNavItem.labelAr
      : activeNavItem.labelEn
    : isAr
    ? activeWorkspace.titleAr
    : activeWorkspace.titleEn;

  return (
    <div
      className={`min-h-screen flex font-sans relative bg-transparent transition-colors duration-300 ${
        careWorkspaceRole ? 'care-shell' : ''
      } ${isClinicalDark ? 'text-slate-100' : 'text-[#0B2528]'}`}
      dir={localizedText(isAr ? 'ar' : 'en', 'text_52b133b060')}
      data-theme={isClinicalDark ? 'clinical-dark' : 'hospitality'}
      data-workspace-role={careWorkspaceRole || undefined}
    >
      {careWorkspaceRole ? (
        <CareThemeBackdrop variant={careWorkspaceRole} />
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/ebtesamty-bg.jpg')" }}
        >
          <div
            className={`absolute inset-0 ${
              isClinicalDark
                ? 'bg-[#090D16]/72 backdrop-blur-[2px]'
                : 'bg-[#FAF9F6]/50 backdrop-blur-[2px]'
            }`}
          />
        </div>
      )}

      {/* ====================================================================
          UNIVERSAL COMPACT LABELED LEFT SIDEBAR (Fit-to-Text + Collapse Toggle)
         ==================================================================== */}
      <aside
        aria-label={isPatientRoute ? 'Patient Portal Navigation' : 'Workspace Navigation'}
        className={`hidden md:flex flex-col items-center justify-between ${
          sidebarCollapsed ? 'w-[68px] px-2' : 'w-fit min-w-[176px] max-w-[205px] px-3'
        } shrink-0 sticky top-3 h-[calc(100vh-1.5rem)] my-3 ms-3 rounded-3xl z-30 pt-4 pb-16 transition-all overflow-y-auto ${
          isClinicalDark
            ? 'bg-[#0E1525]/92 backdrop-blur-md border border-slate-800/90 shadow-sm'
            : isReceptionCommand
            ? 'bg-[#0B2528]/95 backdrop-blur-md border border-[#143D42] text-white shadow-sm'
            : 'bg-white/92 backdrop-blur-md border border-slate-200/80 shadow-sm'
        }`}
      >
        {/* Top Brand Logo (Official Circular Ebtesamty Clinic Logo) */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Link
            href={activeWorkspace.defaultRoute}
            className="flex items-center justify-center p-1 rounded-2xl hover:scale-105 transition-transform w-full"
            title={isAr ? activeWorkspace.titleAr : activeWorkspace.titleEn}
          >
            <img
              src="/images/ebtesamty-logo.png"
              alt="Ebtesamty Dental Clinic"
              className={
                sidebarCollapsed
                  ? 'w-10 h-10 rounded-full object-contain mx-auto bg-white p-0.5 shadow-xs'
                  : 'w-16 h-16 rounded-full object-contain mx-auto bg-white p-0.5 shadow-xs'
              }
            />
          </Link>

          <div
            className={`w-8 h-px ${
              isClinicalDark || isReceptionCommand ? 'bg-white/10' : 'bg-slate-200/80'
            }`}
          />

          {/* Icon Rail Navigation Items */}
          <nav
            aria-label="Primary Role Navigation"
            className="flex flex-col items-stretch gap-1.5 w-full"
          >
            {activeWorkspace.navItems.map((item) => {
              const active = isNavItemActive(item);
              const label = isAr ? item.labelAr : item.labelEn;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={label}
                  className={`group relative h-11 rounded-2xl flex items-center ${
                    sidebarCollapsed ? 'w-11 justify-center' : 'w-full gap-3 px-3'
                  } transition-all duration-150 active:scale-95 ${
                    active
                      ? isClinicalDark
                        ? 'bg-[#14B8A6]/20 text-white ring-1 ring-[#14B8A6] shadow-[0_0_16px_rgba(20,184,166,0.35)]'
                        : 'bg-[#0F2926] text-white shadow-[0_6px_16px_rgba(15,41,38,0.25)]'
                      : isClinicalDark
                      ? 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      : isReceptionCommand
                      ? 'text-white/70 hover:bg-white/10 hover:text-white'
                      : 'text-[#0F2926]/80 hover:bg-[#F9F5EB] hover:text-[#0F2926]'
                  }`}
                >
                  {renderNavIcon(
                    item.iconName,
                    `w-5 h-5 shrink-0 ${
                      active
                        ? 'text-[#C8A96E]'
                        : isClinicalDark || isReceptionCommand
                        ? ''
                        : 'text-[#C8A96E]'
                    }`
                  )}
                  <span
                    className={`text-[13px] font-bold whitespace-nowrap ${
                      sidebarCollapsed ? 'sr-only' : ''
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail Controls: Public Website & Settings/Branch */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              isClinicalDark || isReceptionCommand
                ? 'text-white/70 hover:bg-white/10'
                : 'text-slate-400 hover:bg-[#F7F6F2] hover:text-[#0B2528]'
            }`}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
          <span
            className="sr-only"
            title={branchFull || (primaryRole === 'OWNER_ADMIN' ? 'All authorized branches' : 'Branch not assigned')}
          >
            <TranslatedText
              text={branchFull || (primaryRole === 'OWNER_ADMIN' ? 'All authorized branches' : 'Branch not assigned')}
            />
          </span>
          <Link
            href="/"
            title={isAr ? 'الموقع العام' : 'Public Website'}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              isClinicalDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : isReceptionCommand
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-slate-400 hover:bg-[#F7F6F2] hover:text-[#0B2528]'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="sr-only">{localizedText(isAr ? 'ar' : 'en', 'text_41607e621c')}</span>
          </Link>

          {currentUser && (
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title={resolvedIdentity.fullName}
              className={`w-10 h-10 rounded-full font-extrabold text-xs flex items-center justify-center transition-transform hover:scale-105 ${
                isClinicalDark
                  ? 'bg-[#14B8A6] text-slate-950 ring-2 ring-[#14B8A6]/40'
                  : 'bg-[#0B2528] text-[#C8A96E] ring-2 ring-[#C8A96E]/40'
              }`}
            >
              {resolvedIdentity.initials}
            </button>
          )}
        </div>
      </aside>

      {/* ====================================================================
          MAIN WORKSPACE COLUMN: FLOATING FROSTED TOP PILL BAR + CONTENT
         ==================================================================== */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header
          className={`eb-staff-topbar sticky top-3 z-30 mx-3 sm:mx-5 mt-3 px-3 sm:px-4 h-14 rounded-full backdrop-blur-xl border flex items-center justify-between gap-2 transition-all ${
            isClinicalDark
              ? 'bg-slate-900/85 border-slate-800 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
              : 'bg-white/85 border-slate-200/80 text-[#0B2528] shadow-[0_4px_20px_rgba(11,37,40,0.05)]'
          }`}
        >
          {/* Left: Mobile Menu Button + Workspace Identity + Dynamic Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className={`md:hidden p-2 rounded-full border ${
                isClinicalDark
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 text-[#0B2528] hover:bg-[#F7F6F2]'
              }`}
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="md:hidden">
                <BrandLogo size="sm" variant="mark" isArabic={isAr} dark={isClinicalDark} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-extrabold tracking-tight truncate ${
                      isClinicalDark ? 'text-white' : 'text-[#0B2528]'
                    }`}
                  >
                    {isAr ? activeWorkspace.titleAr : activeWorkspace.titleEn}
                  </span>
                  <span className={isClinicalDark ? 'text-slate-600' : 'text-slate-300'}>/</span>
                  <span
                    className={`text-xs font-bold truncate px-2.5 py-0.5 rounded-full ${
                      isClinicalDark
                        ? 'bg-slate-800 text-[#14B8A6] border border-slate-700'
                        : 'bg-[#F9F5EB] text-[#0B2528] border border-[#C8A96E]/35'
                    }`}
                  >
                    {subPageBreadcrumb}
                  </span>
                </div>
              </div>

              {!isPatientRoute && (
                <span
                  className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isClinicalDark
                      ? 'bg-slate-800/90 text-slate-300 border-slate-700'
                      : 'bg-[#E6F0EE] text-[#0B2528] border-[#0B2528]/10'
                  }`}
                >
                  <Building2 className="w-3 h-3 text-[#C8A96E]" />
                  <span>{branchCode || 'ALL-BR'}</span>
                </span>
              )}

              {/* Optional Multi-Workspace Switcher for Owner/Multi-Role Users */}
              {authorizedWorkspaces.length > 1 && (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                      isClinicalDark
                        ? 'bg-slate-800 border-slate-700 text-[#14B8A6]'
                        : 'bg-[#F7F6F2] border-slate-200/80 text-[#0B2528] hover:border-[#C8A96E]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {workspaceSwitcherOpen && (
                    <div className="menu-enter absolute start-0 mt-2 w-56 bg-white text-[#0B2528] rounded-3xl border border-slate-200/80 shadow-2xl py-2 z-50">
                      {authorizedWorkspaces.map((ws) => (
                        <Link
                          key={ws.id}
                          href={ws.defaultRoute}
                          onClick={() => setWorkspaceSwitcherOpen(false)}
                          className={`block px-4 py-2 text-xs font-bold transition-colors ${
                            ws.id === activeWorkspace.id
                              ? 'bg-[#0B2528] text-white'
                              : 'text-slate-700 hover:bg-[#F7F6F2]'
                          }`}
                        >
                          {isAr ? ws.titleAr : ws.titleEn}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Clean breathing space so top bar never crowds Search Ctrl+K */}
          <div className="hidden xl:block" />

          {/* Right: Utilities, Presentation Access Pill, Profile Avatar Chip, and EN / AR Pill Switcher */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {!isPatientRoute && (
              <StaffTopbarUtilities primaryRole={primaryRole} userFullName={currentUser?.fullName} />
            )}
            {isPatientRoute && (
              <PatientNotificationsBell patientId={resolvedIdentity.patientId} />
            )}

            <PresentationAccess compactHeader />

            {/* Dual-State EN / AR Pill Switcher matching Reference Mockup 1 */}
            <div
              className={`inline-flex items-center p-0.5 rounded-full border ${
                isClinicalDark
                  ? 'bg-slate-950 border-slate-700'
                  : 'bg-[#F7F6F2] border-[#C8A96E]/50'
              }`}
            >
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
                  locale === 'en'
                    ? isClinicalDark
                      ? 'bg-[#14B8A6] text-slate-950 shadow-xs'
                      : 'bg-[#0B2528] text-white shadow-xs'
                    : isClinicalDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#0B2528]/70 hover:text-[#0B2528]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('ar')}
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
                  locale === 'ar'
                    ? isClinicalDark
                      ? 'bg-[#14B8A6] text-slate-950 shadow-xs'
                      : 'bg-[#0B2528] text-white shadow-xs'
                    : isClinicalDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#0B2528]/70 hover:text-[#0B2528]'
                }`}
              >
                AR
              </button>
            </div>

            {currentUser && (
              <div className="relative flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2 ps-1.5 pe-3 py-1 rounded-full border transition-all active:scale-95 ${
                    isClinicalDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 hover:border-[#14B8A6]'
                      : 'bg-white border-slate-200/90 text-[#0B2528] hover:border-[#C8A96E]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      isClinicalDark ? 'bg-[#14B8A6] text-slate-950' : 'bg-[#0B2528] text-[#C8A96E]'
                    }`}
                  >
                    {resolvedIdentity.initials}
                  </div>
                  <div className="hidden sm:block text-start">
                    <span className="block text-xs font-bold leading-tight max-w-[110px] truncate">
                      {resolvedIdentity.fullName}
                    </span>
                    <span className="block text-[10px] opacity-70 truncate">
                      <TranslatedText text={displayRoleLabel} />
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {profileMenuOpen && (
                  <div className="menu-enter absolute end-0 top-full mt-2 w-60 rounded-3xl bg-white text-[#0B2528] border border-slate-200/80 shadow-2xl py-2.5 z-50 text-xs font-sans">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-extrabold text-[#0B2528]">{resolvedIdentity.fullName}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                    </div>

                    {authorizedWorkspaces.length > 1 && (
                      <div className="py-1 border-b border-slate-100">
                        <span className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          {localizedText(isAr ? 'ar' : 'en', 'text_448b0b8e39')}
                        </span>
                        {authorizedWorkspaces.map((ws) => (
                          <Link
                            key={ws.id}
                            href={ws.defaultRoute}
                            onClick={() => setProfileMenuOpen(false)}
                            className="block px-4 py-2 text-slate-700 hover:bg-[#F7F6F2] hover:text-[#0B2528] font-semibold"
                          >
                            {isAr ? ws.titleAr : ws.titleEn}
                          </Link>
                        ))}
                      </div>
                    )}

                    <Link
                      href="/"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-slate-600 hover:bg-[#F7F6F2]"
                    >
                      <span>{localizedText(isAr ? 'ar' : 'en', 'text_92f408c003')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {process.env.NODE_ENV !== 'production' && (
                      <Link
                        href="/demo"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-[#85652B] bg-[#F9F5EB] hover:bg-[#F3EBDD] font-bold"
                      >
                        <span>{localizedText(isAr ? 'ar' : 'en', 'text_8cce5c53a3')}</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleStaticLogout}
                        aria-label="Logout"
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isPatientRoute && (
                  <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={handleStaticLogout}
                      aria-label="Logout"
                      title={t.logout}
                      className={`p-2 rounded-full transition-colors ${
                        isClinicalDark
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Responsive Drawer */}
        {mobileDrawerOpen && (
          <div
            className={`menu-enter md:hidden mx-3 mt-2 rounded-3xl p-4 space-y-2 shadow-2xl border z-40 ${
              isClinicalDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200/80 text-[#0B2528]'
            }`}
          >
            <div className="pb-2 border-b border-slate-200/50 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider opacity-70">
                {isAr ? activeWorkspace.titleAr : activeWorkspace.titleEn}
              </span>
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-xs text-[#C8A96E] font-bold inline-flex items-center gap-1"
              >
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_54a2498927')}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {activeWorkspace.navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold ${
                    active
                      ? isClinicalDark
                        ? 'bg-[#14B8A6] text-slate-950'
                        : 'bg-[#0B2528] text-white'
                      : 'hover:bg-slate-100/50'
                  }`}
                >
                  {renderNavIcon(item.iconName, 'w-4 h-4')}
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 relative pb-16 md:pb-6">{children}</main>
        {isPatientRoute && <PatientMobileBottomNav />}
        <EbtesamtyFloatingAiAssistant />
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent">{props.children}</div>}>
      <AppShellInner {...props} />
    </Suspense>
  );
}
