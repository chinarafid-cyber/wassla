const ar = {
  common: {
    brand: "وصلة",
    loading: "جارٍ التحميل...",
    submit: "إرسال",
    cancel: "إلغاء",
    back: "رجوع",
    language: "اللغة",
    theme: "المظهر",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSystem: "تلقائي",
  },
  nav: {
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    admin: "الإدارة",
    merchant: "التاجر",
    logout: "تسجيل الخروج",
  },
  landing: {
    login: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
    heroTitle: "نوصل علامتك التجارية بالمؤثرين المناسبين",
    heroSubtitle:
      "منصة وصلة تجمع أصحاب العلامات التجارية مع صناع المحتوى لإنشاء حملات إعلانية ناجحة في مجالات الأزياء، المكياج، المطاعم، المقاهي، المجمعات السكنية، والمنتجات الغذائية.",
    categories: ["الأزياء", "المكياج", "المطاعم والمقاهي", "المجمعات السكنية", "المنتجات الغذائية"],
    steps: [
      {
        title: "لأصحاب العلامات التجارية",
        description: "أنشئ حملتك الإعلانية، حدّد ميزانيتك، واختر صناع المحتوى الأنسب لعلامتك التجارية.",
      },
      {
        title: "لصناع المحتوى",
        description: "تصفّح الحملات المتاحة في مجالك، تواصل مع العلامات التجارية، وابدأ التعاون بسهولة.",
      },
      {
        title: "عمولة عادلة",
        description: "منصة وصلة تأخذ نسبة عمولة بسيطة من كل حملة ناجحة فقط — لا رسوم اشتراك، لا مفاجآت.",
      },
    ],
    footer: "جميع الحقوق محفوظة",
  },
  auth: {
    login: {
      title: "تسجيل الدخول",
      subtitle: "أدخل رقم هاتفك وسنرسل لك رمز تحقق",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+9665XXXXXXXX",
      submit: "إرسال رمز التحقق",
      submitting: "جارٍ الإرسال...",
    },
    verify: {
      title: "أدخل رمز التحقق",
      subtitle: "أرسلنا رمزًا مكوّنًا من 6 أرقام إلى",
      codeLabel: "رمز التحقق",
      submit: "تحقق",
      submitting: "جارٍ التحقق...",
      resend: "إعادة إرسال الرمز",
      resendIn: "يمكنك إعادة الإرسال خلال {seconds} ثانية",
      changeNumber: "تغيير رقم الهاتف",
      expiresIn: "صلاحية الرمز تنتهي خلال {seconds} ثانية",
      expired: "انتهت صلاحية الرمز",
    },
    completeProfile: {
      title: "أكمل ملفك الشخصي",
      subtitle: "خطوة أخيرة قبل البدء",
      fullNameLabel: "الاسم الكامل",
      fullNamePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني (اختياري)",
      emailPlaceholder: "you@example.com",
      submit: "إنشاء الحساب",
      submitting: "جارٍ الإنشاء...",
      ticketMissing: "انتهت صلاحية جلسة التحقق، الرجاء البدء من جديد",
    },
  },
  dashboard: {
    title: "لوحة التحكم",
    welcome: "أهلاً بك، {name}",
    welcomeNoName: "أهلاً بك",
    roleLabel: "الدور",
    phoneLabel: "رقم الهاتف",
    profileIncomplete: "ملفك الشخصي غير مكتمل",
  },
  profile: {
    title: "الملف الشخصي",
    phoneLabel: "رقم الهاتف",
    emailLabel: "البريد الإلكتروني",
    fullNameLabel: "الاسم الكامل",
    roleLabel: "الدور",
    statusLabel: "الحالة",
    notProvided: "غير محدد",
  },
  admin: {
    title: "لوحة تحكم الإدارة",
    subtitle: "هذه المنطقة مخصصة للمسؤولين فقط",
  },
  merchant: {
    title: "لوحة تحكم التاجر",
    subtitle: "إدارة حملاتك الإعلانية",
  },
  roles: {
    VISITOR: "زائر",
    CUSTOMER: "عميل",
    MERCHANT: "تاجر",
    ADMIN: "مسؤول",
  },
  errors: {
    generic: "حدث خطأ ما، حاول مرة أخرى",
    invalidPhone: "أدخل رقم هاتف صحيح بالصيغة الدولية، مثل +9665XXXXXXXX",
    invalidCode: "رمز التحقق يجب أن يكون 6 أرقام",
    networkError: "تعذّر الاتصال بالخادم",
  },
};

export type Dictionary = typeof ar;
export default ar;
