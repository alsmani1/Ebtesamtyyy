export interface NavItemConfig {
  id: string;
  labelEn: string;
  labelAr: string;
  href: string;
  iconName: string;
  exact?: boolean;
}

export interface WorkspaceConfig {
  id: string;
  titleEn: string;
  titleAr: string;
  defaultRoute: string;
  allowedRoles: string[];
  navItems: NavItemConfig[];
}

export const WORKSPACE_CONFIGS: Record<string, WorkspaceConfig> = {
  PATIENT: {
    id: 'PATIENT',
    titleEn: 'Patient Self-Service Portal (Minya)',
    titleAr: 'بوابة المريض الذكية (فروع المنيا)',
    defaultRoute: '/patient/dashboard',
    allowedRoles: ['PATIENT', 'OWNER_ADMIN'],
    navItems: [
      { id: 'patient-dashboard', labelEn: 'Dashboard', labelAr: 'لوحة الرعاية الشخصية', href: '/patient/dashboard', iconName: 'LayoutDashboard', exact: true },
      { id: 'patient-appointments', labelEn: 'My Appointments', labelAr: 'المواعيد والحجز (المنيا)', href: '/patient/appointments', iconName: 'Calendar' },
      { id: 'patient-treatment-plan', labelEn: 'Treatment Plan', labelAr: 'خطة العلاج ومخطط الأسنان', href: '/patient/treatment-plan', iconName: 'Stethoscope' },
      { id: 'patient-imaging', labelEn: 'My X-Rays', labelAr: 'الأشعة وفحوصات CBCT', href: '/patient/imaging', iconName: 'Scan' },
      { id: 'patient-billing', labelEn: 'Billing & Wallet', labelAr: 'الفواتير والأقساط', href: '/patient/billing', iconName: 'CreditCard' },
      { id: 'patient-inbox', labelEn: 'Clinic Chat', labelAr: 'مراسلة العيادة وواتساب', href: '/patient/inbox', iconName: 'MessageCircle' },
      { id: 'patient-reviews', labelEn: 'Reviews', labelAr: 'تقييم الزيارات', href: '/patient/reviews', iconName: 'Star' },
    ],
  },
  RECEPTIONIST: {
    id: 'RECEPTIONIST',
    titleEn: 'Receptionist / Front Desk (Minya)',
    titleAr: 'مكتب الاستقبال (فرع المنيا)',
    defaultRoute: '/reception/dashboard',
    allowedRoles: ['RECEPTIONIST', 'BRANCH_MANAGER', 'OWNER_ADMIN'],
    navItems: [
      { id: 'rec-dashboard', labelEn: 'Dashboard', labelAr: 'لوحة الاستقبال اليومية', href: '/reception/dashboard', iconName: 'LayoutDashboard', exact: true },
      { id: 'rec-appointments', labelEn: 'Appointments', labelAr: 'تقويم المواعيد والحجوزات', href: '/reception/appointments', iconName: 'Calendar' },
      { id: 'rec-patients', labelEn: 'Patient Records', labelAr: 'سجلات وتسجيل المرضى', href: '/reception/patients', iconName: 'Users' },
      { id: 'rec-finance', labelEn: 'Finance & POS', labelAr: 'المركز المالي والتحصيل', href: '/reception/finance', iconName: 'CreditCard' },
      { id: 'rec-lab', labelEn: 'Lab Logistics', labelAr: 'تتبع طلبات المعمل', href: '/reception/lab', iconName: 'FlaskConical' },
      { id: 'rec-inventory', labelEn: 'Inventory', labelAr: 'استلام وجرد المخزون', href: '/reception/inventory', iconName: 'Boxes' },
      { id: 'rec-crm', labelEn: 'CRM Leads', labelAr: 'متابعة العملاء المحتملين CRM', href: '/reception/crm', iconName: 'UserPlus' },
      { id: 'rec-inbox', labelEn: 'Inbox and WhatsApp', labelAr: 'صندوق الرسائل وواتساب', href: '/reception/inbox', iconName: 'MessageCircle' },
      { id: 'rec-attendance', labelEn: 'Attendance', labelAr: 'الحضور والانصراف الشخصي', href: '/reception/attendance', iconName: 'Clock' },
      { id: 'rec-reviews', labelEn: 'Reviews', labelAr: 'تقييمات المرضى', href: '/reception/reviews', iconName: 'Star' },
    ],
  },
  DENTIST: {
    id: 'DENTIST',
    titleEn: 'Doctor / Clinical Workspace (Minya)',
    titleAr: 'مساحة الطبيب السريرية (فرع المنيا)',
    defaultRoute: '/doctor/dashboard',
    allowedRoles: ['DENTIST', 'OWNER_ADMIN'],
    navItems: [
      { id: 'doc-dashboard', labelEn: 'Dashboard', labelAr: 'لوحة الطبيب اليومية', href: '/doctor/dashboard', iconName: 'LayoutDashboard', exact: true },
      { id: 'doc-appointments', labelEn: 'My Schedule', labelAr: 'جدول مواعيدي', href: '/doctor/appointments', iconName: 'Calendar' },
      { id: 'doc-patients', labelEn: 'Patient Records', labelAr: 'السجلات الطبية لمرضاي', href: '/doctor/patients', iconName: 'Users' },
      { id: 'doc-exam-room', labelEn: 'Exam Room & Chart', labelAr: 'غرفة الكشف ومخطط الأسنان', href: '/doctor/exam-room', iconName: 'Stethoscope' },
      { id: 'doc-imaging', labelEn: 'X-Ray & CBCT', labelAr: 'عارض الأشعة و CBCT', href: '/doctor/imaging', iconName: 'Scan' },
      { id: 'doc-lab', labelEn: 'Lab Orders', labelAr: 'طلبات المعمل والتركيبات', href: '/doctor/lab', iconName: 'FlaskConical' },
      { id: 'doc-inventory', labelEn: 'Inventory', labelAr: 'طلب مستلزمات الكشف', href: '/doctor/inventory', iconName: 'Boxes' },
      { id: 'doc-inbox', labelEn: 'Clinical Inbox', labelAr: 'متابعة المرضى والرسائل', href: '/doctor/inbox', iconName: 'MessageCircle' },
      { id: 'doc-attendance', labelEn: 'Attendance', labelAr: 'الحضور والانصراف الشخصي', href: '/doctor/attendance', iconName: 'Clock' },
      { id: 'doc-reports', labelEn: 'My Stats', labelAr: 'إحصائياتي السريرية', href: '/doctor/reports', iconName: 'BarChart3' },
    ],
  },
  OWNER: {
    id: 'OWNER',
    titleEn: 'Clinic Owner / Executive (Minya Branches A, B & C)',
    titleAr: 'لوحة مالك العيادة (فروع المنيا أ، ب، ج)',
    defaultRoute: '/owner/dashboard',
    allowedRoles: ['OWNER_ADMIN', 'BRANCH_MANAGER'],
    navItems: [
      { id: 'own-dashboard', labelEn: 'Dashboard', labelAr: 'لوحة القيادة التنفيذية', href: '/owner/dashboard', iconName: 'LayoutDashboard', exact: true },
      { id: 'own-appointments', labelEn: 'Appointments', labelAr: 'المواعيد والسجلات (كل الفروع)', href: '/owner/appointments', iconName: 'Calendar' },
      { id: 'own-patients', labelEn: 'Patient Records', labelAr: 'سجلات المرضى', href: '/owner/patients', iconName: 'Users' },
      { id: 'own-clinical-audit', labelEn: 'Clinical Audit', labelAr: 'غرفة الكشف والأشعة (مراجعة)', href: '/owner/clinical-audit', iconName: 'Stethoscope' },
      { id: 'own-finance', labelEn: 'Finance Center', labelAr: 'المركز المالي', href: '/owner/finance', iconName: 'CreditCard' },
      { id: 'own-expenses', labelEn: 'Expenses', labelAr: 'المصروفات', href: '/owner/expenses', iconName: 'Wallet' },
      { id: 'own-profitability', labelEn: 'Profitability', labelAr: 'الأرباح والربحية', href: '/owner/profitability', iconName: 'TrendingUp' },
      { id: 'own-inventory', labelEn: 'Inventory', labelAr: 'المخزون والمستلزمات', href: '/owner/inventory', iconName: 'Boxes' },
      { id: 'own-lab', labelEn: 'Lab Management', labelAr: 'طلبات المعمل', href: '/owner/lab', iconName: 'FlaskConical' },
      { id: 'own-crm', labelEn: 'CRM Leads', labelAr: 'العملاء المتوقعون CRM', href: '/owner/crm', iconName: 'UserPlus' },
      { id: 'own-inbox', labelEn: 'Inbox and WhatsApp', labelAr: 'صندوق الرسائل وواتساب', href: '/owner/inbox', iconName: 'MessageCircle' },
      { id: 'own-attendance', labelEn: 'Attendance', labelAr: 'الحضور والرواتب', href: '/owner/attendance', iconName: 'Clock' },
      { id: 'own-reviews', labelEn: 'Reviews', labelAr: 'تقييمات الموقع', href: '/owner/reviews', iconName: 'Star' },
      { id: 'own-reports', labelEn: 'Reports', labelAr: 'الإحصائيات والتقارير', href: '/owner/reports', iconName: 'BarChart3' },
    ],
  },
  FINANCE: {
    id: 'FINANCE',
    titleEn: 'Finance & Accounting (Minya)',
    titleAr: 'المالية والحسابات (المنيا)',
    defaultRoute: '/owner/finance',
    allowedRoles: ['FINANCE', 'OWNER_ADMIN'],
    navItems: [
      { id: 'billing', labelEn: 'Finance Center', labelAr: 'المركز المالي', href: '/owner/finance', iconName: 'Receipt', exact: true },
      { id: 'profitability', labelEn: 'Profit and Profitability', labelAr: 'الأرباح والربحية', href: '/owner/profitability', iconName: 'TrendingUp' },
    ],
  },
  INVENTORY: {
    id: 'INVENTORY',
    titleEn: 'Inventory & Procurement (Minya)',
    titleAr: 'المخزون والمشتريات (المنيا)',
    defaultRoute: '/owner/inventory',
    allowedRoles: ['INVENTORY', 'OWNER_ADMIN'],
    navItems: [
      { id: 'stock', labelEn: 'Inventory and Supplies', labelAr: 'المخزون والمستلزمات', href: '/owner/inventory', iconName: 'Boxes', exact: true },
      { id: 'lab', labelEn: 'Lab Management', labelAr: 'طلبات المعمل', href: '/owner/lab', iconName: 'FlaskConical' },
    ],
  },
  CRM: {
    id: 'CRM',
    titleEn: 'Marketing, CRM & Retention (Minya)',
    titleAr: 'التسويق وعلاقات المرضى (المنيا)',
    defaultRoute: '/owner/crm',
    allowedRoles: ['CRM', 'OWNER_ADMIN', 'RECEPTIONIST'],
    navItems: [
      { id: 'inquiries', labelEn: 'Lead Follow-up (CRM)', labelAr: 'العملاء المتوقعون CRM', href: '/owner/crm', iconName: 'Users', exact: true },
      { id: 'inbox', labelEn: 'Inbox and WhatsApp', labelAr: 'صندوق الرسائل وواتساب', href: '/owner/inbox', iconName: 'MessageCircle' },
      { id: 'reviews', labelEn: 'Reviews', labelAr: 'تقييمات الموقع', href: '/owner/reviews', iconName: 'Star' },
    ],
  },
  ADMIN: {
    id: 'ADMIN',
    titleEn: 'Super Admin / Configuration',
    titleAr: 'إدارة النظام والإعدادات',
    defaultRoute: '/admin',
    allowedRoles: ['OWNER_ADMIN'],
    navItems: [
      { id: 'audit-system', labelEn: 'Audit & Security Logs', labelAr: 'سجل التدقيق والأمان', href: '/admin', iconName: 'ShieldCheck', exact: true },
    ],
  },
};

export function resolveActiveWorkspace(
  pathname: string,
  primaryRole?: string | null
): WorkspaceConfig {
  // Strictly enforce the 4 primary dashboards based on signed-in role and route prefix
  if (
    primaryRole === 'PATIENT' ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/patient')
  ) {
    return WORKSPACE_CONFIGS.PATIENT;
  }
  if (primaryRole === 'RECEPTIONIST') {
    return WORKSPACE_CONFIGS.RECEPTIONIST;
  }
  if (primaryRole === 'DENTIST') {
    return WORKSPACE_CONFIGS.DENTIST;
  }
  if (primaryRole === 'OWNER_ADMIN' || primaryRole === 'BRANCH_MANAGER') {
    return WORKSPACE_CONFIGS.OWNER;
  }

  if (pathname.startsWith('/reception')) return WORKSPACE_CONFIGS.RECEPTIONIST;
  if (pathname.startsWith('/dentist') || pathname.startsWith('/doctor'))
    return WORKSPACE_CONFIGS.DENTIST;
  return WORKSPACE_CONFIGS.OWNER;
}

export function getAuthorizedWorkspacesForRole(primaryRole?: string | null): WorkspaceConfig[] {
  if (primaryRole === 'PATIENT') return [WORKSPACE_CONFIGS.PATIENT];
  if (primaryRole === 'RECEPTIONIST') return [WORKSPACE_CONFIGS.RECEPTIONIST];
  if (primaryRole === 'DENTIST') return [WORKSPACE_CONFIGS.DENTIST];
  if (primaryRole === 'OWNER_ADMIN' || primaryRole === 'BRANCH_MANAGER') return [WORKSPACE_CONFIGS.OWNER];
  if (primaryRole === 'SYSTEM_ADMIN') return [WORKSPACE_CONFIGS.OWNER];
  if (primaryRole === 'FINANCE') return [WORKSPACE_CONFIGS.FINANCE];
  if (primaryRole === 'INVENTORY') return [WORKSPACE_CONFIGS.INVENTORY];
  if (primaryRole === 'CRM') return [WORKSPACE_CONFIGS.CRM];
  return [];
}
