import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const translations = {
  en: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    searchPlaceholder: 'Search...',
    name: 'Name',
    status: 'Status',
    machine: 'Machine',
    mold: 'Mold',
    operator: 'Operator',
    date: 'Date',
    time: 'Time',
    startTime: 'Start Time',
    endTime: 'End Time',
    notes: 'Notes',
    quantity: 'Quantity',
    material: 'Material',
    description: 'Description',
    location: 'Location',
    tonnage: 'Tonnage',
    active: 'Active',
    idle: 'Idle',
    running: 'Running',
    maintenance: 'Maintenance',
    broken: 'Broken',
    completed: 'Completed',
    scheduled: 'Scheduled',
    inProgress: 'In Progress',
    noData: 'No data found',
    confirmDelete: 'Are you sure you want to delete?',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    loading: 'Loading...',
    all: 'All',
    total: 'Total',
    production: 'Production',
    dailyWork: 'Daily Work',
    machines: 'Machines',
    molds: 'Molds',
    rayoun: 'Rayoun',
    users: 'Users',
    materials: 'Materials',
    maintenanceTitle: 'Maintenance',
    dashboard: 'Dashboard',
    dashboardTitle: 'Dashboard',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember Me',
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Sign in to your account',
    moldSelect: 'Select Mold',
    machineSelect: 'Select Machine',
    operatorSelect: 'Select Operator',
    compatibleMachines: 'Compatible Machines',
    autoAssign: 'Auto Assign',
    bestMatch: 'Best Match',
    selectMoldFirst: 'Select a mold to see compatible machines',
    noCompatibleMachines: 'No compatible machines found',
    operationType: 'Operation Type',
    quantityProduced: 'Quantity Produced',
    quantityRejected: 'Quantity Rejected',
    selectDate: 'Select Date',
    today: 'Today',
    now: 'Now',
    aiServices: 'AI Services',
    findCompatible: 'Find Compatible',
    parameterCheck: 'Parameter Check',
    reportsLabel: 'Reports',
    locations: 'Locations',
    collapse: 'Collapse',
    app: { subtitle: 'Factory Operations Management System' },
    nav: { machines: 'Machines', users: 'Users', maintenance: 'Maintenance' },
    common: { filters: 'Filters', all: 'All', noData: 'No data found', loading: 'Loading...' },
    dashboardPage: { title: 'Dashboard', totalMachines: 'Total Machines', todayProduction: 'Today Production', defectRate: 'Defect Rate', oee: 'OEE', overview: 'Overview' },
    status: { running: 'Running', idle: 'Idle', maintenance: 'Maintenance', broken: 'Broken' },
    reportsLabel: { export: 'Export', productionReport: 'Production Report' },
  },
  ar: {
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث',
    searchPlaceholder: 'بحث...',
    name: 'الاسم',
    status: 'الحالة',
    machine: 'الآلة',
    mold: 'القالب',
    operator: 'المشغل',
    date: 'التاريخ',
    time: 'الوقت',
    startTime: 'وقت البدء',
    endTime: 'وقت الانتهاء',
    notes: 'ملاحظات',
    quantity: 'الكمية',
    material: 'المادة',
    description: 'الوصف',
    location: 'الموقع',
    tonnage: 'القوة بالطن',
    active: 'نشط',
    idle: 'خامل',
    running: 'قيد التشغيل',
    maintenance: 'صيانة',
    broken: 'معطل',
    completed: 'مكتمل',
    scheduled: 'مجدول',
    inProgress: 'قيد التنفيذ',
    noData: 'لا توجد بيانات',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    success: 'نجاح',
    error: 'خطأ',
    warning: 'تحذير',
    loading: 'جاري التحميل...',
    all: 'الكل',
    total: 'الإجمالي',
    production: 'الإنتاج',
    dailyWork: 'العمل اليومي',
    machines: 'الآلات',
    molds: 'القوالب',
    rayoun: 'رايون',
    users: 'المستخدمون',
    materials: 'المواد',
    maintenanceTitle: 'الصيانة',
    dashboard: 'لوحة التحكم',
    dashboardTitle: 'لوحة التحكم',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    welcomeBack: 'مرحباً بعودتك',
    loginSubtitle: 'سجل الدخول إلى حسابك',
    moldSelect: 'اختر القالب',
    machineSelect: 'اختر الآلة',
    operatorSelect: 'اختر المشغل',
    compatibleMachines: 'الآلات المتوافقة',
    autoAssign: 'تعيين تلقائي',
    bestMatch: 'أفضل تطابق',
    selectMoldFirst: 'اختر القالب لرؤية الآلات المتوافقة',
    noCompatibleMachines: 'لا توجد آلات متوافقة',
    operationType: 'نوع العملية',
    quantityProduced: 'الكمية المنتجة',
    quantityRejected: 'الكمية المرفوضة',
    selectDate: 'اختر التاريخ',
    today: 'اليوم',
    now: 'الآن',
    aiServices: 'خدمات الذكاء الاصطناعي',
    findCompatible: 'البحث عن متوافقة',
    parameterCheck: 'فحص المعاملات',
    reportsLabel: 'التقارير',
    locations: 'المواقع',
    collapse: 'طي',
    app: { subtitle: 'نظام إدارة عمليات المصنع' },
    nav: { machines: 'الآلات', users: 'المستخدمون', maintenance: 'الصيانة' },
    common: { filters: 'الفلترة', all: 'الكل', noData: 'لا توجد بيانات', loading: 'جاري التحميل...' },
    dashboardPage: { title: 'لوحة التحكم', totalMachines: 'إجمالي الآلات', todayProduction: 'إنتاج اليوم', defectRate: 'معدل العيوب', oee: 'الكفاءة الكلية', overview: 'نظرة عامة' },
    status: { running: 'قيد التشغيل', idle: 'خامل', maintenance: 'صيانة', broken: 'معطل' },
    reportsLabel: { export: 'تصدير', productionReport: 'تقرير الإنتاج' },
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('foms-lang') || localStorage.getItem('language') || 'en';
    const isRTL = stored === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = stored;
    return stored;
  });

  useEffect(() => {
    const isRTL = language === 'ar';
    
    // Add smooth transition class before switching
    document.body.classList.add('dir-transition');
    document.body.classList.remove('dir-ltr', 'dir-rtl');
    document.body.classList.add(isRTL ? 'dir-rtl' : 'dir-ltr');
    
    localStorage.setItem('foms-lang', language);
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Clean up transition class after animation completes
    const cleanupTimer = setTimeout(() => {
      document.body.classList.remove('dir-transition');
    }, 350);
    
    return () => clearTimeout(cleanupTimer);
  }, [language]);

  const t = (key) => {
    if (!key || typeof key !== 'string') {
      console.warn('Translation key must be a string, got:', typeof key);
      return typeof key === 'string' ? key : String(key);
    }
    const keys = key.split('.');
    let value = translations[language];
    let fallback = translations.en;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
        fallback = fallback?.[k];
      } else {
        break;
      }
    }
    const result = value ?? fallback ?? key;
    if (typeof result === 'object' || result === null || result === undefined) {
      console.warn('Translation resolved to non-string for key:', key, typeof result);
      return key;
    }
    return String(result);
  };
  const setLanguageSafe = (lang) => {
    if (!lang || typeof lang !== 'string') {
      console.warn('setLanguage received non-string:', lang);
      return;
    }
    if (lang !== 'en' && lang !== 'ar') {
      console.warn('Unsupported language:', lang);
      return;
    }
    setLanguage(lang);
  };
  const toggleLanguage = (lang) => {
    if (lang && typeof lang === 'string') {
      if (lang === 'en' || lang === 'ar') {
        setLanguage(lang);
      }
    } else {
      const next = language === 'en' ? 'ar' : 'en';
      setLanguage(next);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
