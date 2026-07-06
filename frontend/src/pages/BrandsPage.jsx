import { Link } from 'react-router-dom';
import { useGetBrandsQuery } from '../store/apiSlice';
import { ArrowRight, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getImageUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const BrandsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: brandsData, isLoading, isError } = useGetBrandsQuery();
  const brands = brandsData?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-black text-dark mb-2">{t('Brands')}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            <span>/</span>
            <span className="text-dark font-medium">{t('Brands')}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-xl mb-4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded mx-auto w-3/4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-red-500 font-medium">{lang === 'ar' ? 'خطأ في تحميل العلامات التجارية.' : 'Error loading brands.'}</div>
        ) : brands.length === 0 ? (
          <div className="text-center py-24">
            <Bookmark className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">{lang === 'ar' ? 'لا توجد علامات تجارية بعد' : 'No brands yet'}</h3>
            <p className="text-gray-500">{lang === 'ar' ? 'ستظهر العلامات التجارية هنا بمجرد إضافتها.' : 'Brands will appear here once added.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {brands.map((brand) => {
              const imgSrc = getImageUrl(brand.image);
              return (
                <Link
                  key={brand._id}
                  to={`/shop?brand=${brand._id}`}
                  className="group flex flex-col items-center bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 bg-gray-100 flex items-center justify-center">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={lang === 'ar' ? brand.name.ar : brand.name.en}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-4xl font-black text-gray-200">
                        {(lang === 'ar' ? brand.name.ar : brand.name.en)[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-dark text-center group-hover:text-primary transition-colors text-sm mb-1">
                    {lang === 'ar' ? brand.name.ar : brand.name.en}
                  </h3>
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'} {lang === 'ar' ? <ArrowRight className="w-3 h-3 rotate-180" /> : <ArrowRight className="w-3 h-3" />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
