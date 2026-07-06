import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';
import { useGetFAQsQuery } from '../store/apiSlice';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const { data: faqData, isLoading } = useGetFAQsQuery({ isActive: 'true' });
  const faqs = faqData?.data || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(faq => {
      const question = lang === 'ar' ? faq.questionAr : faq.questionEn;
      const answer = lang === 'ar' ? faq.answerAr : faq.answerEn;
      return question?.toLowerCase().includes(q) || answer?.toLowerCase().includes(q);
    });
  }, [faqs, search, lang]);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  // JSON-LD FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: lang === 'ar' ? faq.questionAr : faq.questionEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'ar' ? faq.answerAr : faq.answerEn
      }
    }))
  };

  return (
    <>
      {/* SEO JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

        {/* Hero Section */}
        <section className="relative bg-dark text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_#e60000,_transparent_60%)]" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'تجد هنا إجابات على الأسئلة الأكثر شيوعاً. إذا لم تجد ما تبحث عنه، لا تتردد في التواصل معنا.'
                : 'Find answers to the most common questions. If you can\'t find what you\'re looking for, feel free to contact us.'}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 max-w-3xl">

          {/* Search Bar */}
          <div className="relative mb-10">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="faq-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في الأسئلة...' : 'Search questions...'}
              className="w-full ps-12 pe-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* FAQ Accordion */}
          {!isLoading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((faq, idx) => {
                const question = lang === 'ar' ? faq.questionAr : faq.questionEn;
                const answer = lang === 'ar' ? faq.answerAr : faq.answerEn;
                const isOpen = openIndex === idx;

                return (
                  <div
                    key={faq._id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-primary/40 shadow-md shadow-primary/5' : 'border-gray-100 shadow-sm hover:border-gray-200'
                      }`}
                  >
                    <button
                      id={`faq-item-${faq._id}`}
                      onClick={() => toggle(idx)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start"
                      aria-expanded={isOpen}
                    >
                      <span className={`font-semibold text-base leading-relaxed ${isOpen ? 'text-primary' : 'text-dark'}`}>
                        {question}
                      </span>
                      <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    {/* Animated answer panel */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="px-6 pb-5">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-600 leading-relaxed text-sm">{answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">
                {lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                {lang === 'ar'
                  ? `لم نعثر على نتائج لـ "${search}". جرّب كلمات بحث مختلفة.`
                  : `We couldn't find results for "${search}". Try different keywords.`}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-primary text-sm font-medium hover:underline"
                >
                  {lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                </button>
              )}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 p-8 bg-dark rounded-2xl text-center text-white">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              {lang === 'ar' ? 'لم تجد إجابتك؟' : 'Didn\'t find your answer?'}
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              {lang === 'ar'
                ? 'تواصل معنا مباشرة عبر واتساب وسيقوم فريقنا بمساعدتك.'
                : 'Contact us directly via WhatsApp and our team will help you.'}
            </p>
            <a
              href="https://wa.me/201203509668"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
            </a>
          </div>

        </div>
      </div>
    </>
  );
};

export default FAQPage;
