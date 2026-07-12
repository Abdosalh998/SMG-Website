import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '../store/apiSlice';
import ProductCard from '../components/ui/ProductCard';
import { ArrowRight, ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsQuery();

  const getImageUrl = (path) => {
    if (!path || path === 'no-photo.jpg') return null;
    return `${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const featuredProducts = productsData?.data?.slice(0, 8) || [];
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative bg-dark text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent"></div>
        <div className="absolute -top-40 -end-40 w-[600px] h-[600px] rounded-full border border-gray-800/50"></div>
        <div className="absolute -top-20 -end-20 w-[400px] h-[400px] rounded-full border border-gray-700/50"></div>
        <div className="absolute -bottom-10 -start-10 w-[300px] h-[300px] rounded-full border border-red-500/10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold mb-6 border border-red-500/20 flex items-center gap-2 w-max">
              <Zap className="w-4 h-4" /> 
              {lang === 'ar' ? 'معدات صناعية متميزة' : 'Premium Industrial Equipment'}
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              {lang === 'ar' ? (
                <>منتجات عالية الجودة <br /> <span className="text-primary">مصنوعة لتدوم</span></>
              ) : (
                <>High Quality Products <br /> <span className="text-primary">Built to Last</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              {lang === 'ar' 
                ? 'استكشف مجموعتنا الواسعة من المنتجات الصناعية والتجارية — من البلاورات وأنظمة التهوية إلى الآلات والمعدات.'
                : 'Explore our vast collection of industrial and commercial products — from blowers and ventilation systems to machinery and equipment.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2">
                {t('ShopNow')} {lang === 'ar' ? <ArrowRight className="w-5 h-5 rotate-180" /> : <ArrowRight className="w-5 h-5" />}
              </Link>
              <Link to="/categories" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition-all text-center">
                {lang === 'ar' ? 'عرض التصنيفات' : 'View Categories'}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative huge SMG text */}
        <div className="absolute bottom-0 end-0 select-none pointer-events-none opacity-[0.03] text-[20vw] font-black leading-none translate-y-1/4">
          SMG
        </div>
      </section>

      {/* Categories Section */}
      {!categoriesLoading && categories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-dark mb-2">{t('Categories')}</h2>
                <p className="text-gray-500">{lang === 'ar' ? 'تصفح حسب اهتماماتك' : 'Browse by your interests'}</p>
              </div>
              <Link to="/categories" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:text-red-700 transition-colors">
                {lang === 'ar' ? 'عرض الكل' : 'View All'} {lang === 'ar' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
            
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={2}
              navigation
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 6 },
              }}
              className="px-2 py-4 home-swiper"
            >
              {categories.map((category) => (
                <SwiperSlide key={category._id} className="h-auto">
                  <Link to={`/shop?category=${category._id}`} className="block h-full group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 overflow-hidden group-hover:scale-110 transition-transform">
                      {category.image && category.image !== 'no-photo.jpg' ? (
                        <img src={getImageUrl(category.image)} alt={lang === 'ar' ? category.name.ar : category.name.en} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-2xl font-black text-gray-300">{(lang === 'ar' ? category.name.ar : category.name.en)[0]}</div>
                      )}
                    </div>
                    <h3 className="font-bold text-dark group-hover:text-primary transition-colors text-sm">{lang === 'ar' ? category.name.ar : category.name.en}</h3>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-dark mb-2">{lang === 'ar' ? 'أحدث المنتجات' : 'Latest Products'}</h2>
              <p className="text-gray-500">{lang === 'ar' ? 'اكتشف الإضافات الجديدة' : 'Discover our newest additions'}</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:text-red-700 transition-colors">
              {lang === 'ar' ? 'عرض المتجر' : 'View Shop'} {lang === 'ar' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1.2}
              navigation
              breakpoints={{
                640: { slidesPerView: 2.5 },
                1024: { slidesPerView: 4 },
              }}
              className="px-2 py-4 home-swiper"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id} className="h-auto pb-4">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-dark text-white py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-800">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? 'ضمان الجودة' : 'Quality Guaranteed'}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{lang === 'ar' ? 'جميع منتجاتنا تأتي مع ضمان الجودة والأداء.' : 'All our products come with a guarantee of quality and performance.'}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? 'أداء عالي' : 'High Performance'}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{lang === 'ar' ? 'معدات مصممة للعمل الشاق في أقسى الظروف.' : 'Equipment designed for heavy-duty work in the toughest conditions.'}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <PhoneCall className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? 'دعم فني' : 'Technical Support'}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{lang === 'ar' ? 'فريقنا جاهز دائماً للرد على استفساراتكم.' : 'Our team is always ready to answer your inquiries.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      {!brandsLoading && brands.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-dark mb-10">{lang === 'ar' ? 'العلامات التجارية الموثوقة' : 'Trusted Brands'}</h2>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView={2}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
              }}
              className="py-4"
            >
              {brands.map((brand) => (
                <SwiperSlide key={brand._id} className="h-auto">
                  <Link to={`/shop?brand=${brand._id}`} className="block h-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all">
                    {brand.image && brand.image !== 'no-photo.jpg' ? (
                      <img src={getImageUrl(brand.image)} loading="lazy" alt={lang === 'ar' ? brand.name.ar : brand.name.en} className="h-16 w-full object-contain" />
                    ) : (
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-xl font-black text-gray-800">{lang === 'ar' ? brand.name.ar : brand.name.en}</span>
                      </div>
                    )}
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
