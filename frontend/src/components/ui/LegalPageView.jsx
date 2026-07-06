import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Printer, ArrowUp } from 'lucide-react';
import { useGetLegalPageQuery } from '../../store/apiSlice';
import { Link } from 'react-router-dom';

/**
 * Reusable legal page display component.
 * @param {string} slug      - "terms" | "privacy"
 * @param {string} icon      - A rendered icon element
 * @param {string} pagePath  - breadcrumb path e.g. "/terms"
 */
const LegalPageView = ({ slug, icon, pagePath }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [activeSection, setActiveSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading } = useGetLegalPageQuery(slug);
  const page = data?.data;
  const sections = (page?.sections || []).slice().sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(s => {
      const el = document.getElementById(`section-${s._id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('•')) {
        return (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <span className="text-primary font-bold mt-0.5 shrink-0">•</span>
            <span>{line.slice(1).trim()}</span>
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
    });
  };

  const formattedDate = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : null;

  const pageTitle = page ? (lang === 'ar' ? page.titleAr : page.titleEn) : '';
  const intro = page ? (lang === 'ar' ? page.introAr : page.introEn) : '';

  const breadcrumbLabel =
    slug === 'terms'
      ? (lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions')
      : (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description: intro,
        url: `https://smgturbofan.com${pagePath}`,
        dateModified: page?.lastUpdated
      })}</script>

      {/* Hero */}
      <header className="relative bg-dark text-white py-16 md:py-20 overflow-hidden print:hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,_#e60000,_transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                <Link to="/" className="hover:text-white transition-colors">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-white">{breadcrumbLabel}</span>
              </nav>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  {isLoading ? (lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...') : pageTitle}
                </h1>
              </div>
              {formattedDate && (
                <p className="text-gray-400 text-sm">
                  {lang === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}{' '}
                  <time className="text-white font-medium" dateTime={page?.lastUpdated}>{formattedDate}</time>
                </p>
              )}
            </div>
            <button
              onClick={() => window.print()}
              aria-label="Print page"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              {lang === 'ar' ? 'طباعة' : 'Print'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Table of Contents */}
          {!isLoading && sections.length > 0 && (
            <aside aria-label="Table of Contents" className="lg:w-72 shrink-0 print:hidden">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  {lang === 'ar' ? 'محتويات الصفحة' : 'Table of Contents'}
                </h2>
                <nav>
                  <ul className="space-y-0.5">
                    {sections.map(s => {
                      const title = lang === 'ar' ? s.titleAr : s.titleEn;
                      const isActive = activeSection === `section-${s._id}`;
                      return (
                        <li key={s._id}>
                          <button
                            onClick={() => scrollToSection(s._id)}
                            className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
                            }`}
                          >
                            {title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

          {/* Main article */}
          <article className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-4 animate-pulse" />
                    <div className="space-y-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className={`h-4 bg-gray-100 rounded animate-pulse ${j === 3 ? 'w-4/6' : ''}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !page ? (
              <div className="text-center py-20 text-gray-500">
                {lang === 'ar' ? 'الصفحة غير متاحة حالياً.' : 'This page is not available.'}
              </div>
            ) : (
              <>
                {/* Intro callout */}
                {intro && (
                  <div role="note" className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 text-sm text-gray-700 leading-relaxed">
                    {intro}
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-5">
                  {sections.map((s, idx) => {
                    const title = lang === 'ar' ? s.titleAr : s.titleEn;
                    const content = lang === 'ar' ? s.contentAr : s.contentEn;
                    return (
                      <section
                        key={s._id}
                        id={`section-${s._id}`}
                        aria-labelledby={`heading-${s._id}`}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-28"
                      >
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50/70">
                          <span
                            aria-hidden="true"
                            className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-black flex items-center justify-center shrink-0"
                          >
                            {idx + 1}
                          </span>
                          <h2 id={`heading-${s._id}`} className="font-bold text-dark text-base leading-snug">
                            {title}
                          </h2>
                        </div>
                        <div className="px-6 py-5">
                          <ul className="space-y-2" role="list">
                            {formatContent(content)}
                          </ul>
                        </div>
                      </section>
                    );
                  })}
                </div>

                {/* Footer note */}
                <footer className="mt-10 text-xs text-gray-400 text-center print:hidden">
                  {lang === 'ar'
                    ? `آخر تعديل: ${formattedDate} — SMG جميع الحقوق محفوظة.`
                    : `Last modified: ${formattedDate} — SMG All rights reserved.`}
                </footer>
              </>
            )}
          </article>
        </div>
      </div>

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 end-6 w-11 h-11 bg-primary text-white rounded-full shadow-lg hover:bg-red-700 flex items-center justify-center transition-all print:hidden z-40"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { font-size: 12pt; color: #111; }
          article { width: 100% !important; }
          .bg-white { background: white !important; }
          .shadow-sm { box-shadow: none !important; }
          .border { border: 1px solid #e5e7eb !important; }
          .scroll-mt-28 { scroll-margin-top: 0; }
        }
      `}</style>
    </div>
  );
};

export default LegalPageView;
