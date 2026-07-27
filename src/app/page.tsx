import Link from "next/link";

const categories = [
  "الأزياء",
  "المكياج",
  "المطاعم والمقاهي",
  "المجمعات السكنية",
  "المنتجات الغذائية",
];

const steps = [
  {
    title: "لأصحاب العلامات التجارية",
    description:
      "أنشئ حملتك الإعلانية، حدّد ميزانيتك، واختر صناع المحتوى الأنسب لعلامتك التجارية.",
  },
  {
    title: "لصناع المحتوى",
    description:
      "تصفّح الحملات المتاحة في مجالك، تواصل مع العلامات التجارية، وابدأ التعاون بسهولة.",
  },
  {
    title: "عمولة عادلة",
    description:
      "منصة وصلة تأخذ نسبة عمولة بسيطة من كل حملة ناجحة فقط — لا رسوم اشتراك، لا مفاجآت.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* الشريط العلوي */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-extrabold text-emerald-700">وصلة</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            سجل الآن
          </Link>
        </nav>
      </header>

      {/* قسم البطل */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
          نوصل علامتك التجارية بالمؤثرين المناسبين
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          منصة وصلة تجمع أصحاب العلامات التجارية مع صناع المحتوى لإنشاء حملات
          إعلانية ناجحة في مجالات الأزياء، المكياج، المطاعم، المقاهي،
          المجمعات السكنية، والمنتجات الغذائية.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            سجل الآن
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100"
          >
            تسجيل الدخول
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      {/* قسم كيف تعمل المنصة */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* تذييل */}
      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} وصلة (Wassla) — جميع الحقوق محفوظة
      </footer>
    </main>
  );
}
