import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '../store/apiSlice';
import ProductCard from '../components/ui/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

const ShopPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    setSearchParams(params);
  }, [selectedCategory, selectedBrand]);

  const { data: productsData, isLoading } = useGetProductsQuery({
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
  });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') {
      const aPrice = a.variants?.length ? Math.min(...a.variants.map(v => v.price)) : (a.price || 0);
      const bPrice = b.variants?.length ? Math.min(...b.variants.map(v => v.price)) : (b.price || 0);
      return aPrice - bPrice;
    }
    if (sortBy === 'price-desc') {
      const aPrice = a.variants?.length ? Math.min(...a.variants.map(v => v.price)) : (a.price || 0);
      const bPrice = b.variants?.length ? Math.min(...b.variants.map(v => v.price)) : (b.price || 0);
      return bPrice - aPrice;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
  };

  const hasFilters = selectedCategory || selectedBrand;

  const FilterPanel = () => (
    <div className="space-y-8">
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-primary font-medium hover:text-red-700 transition-colors"
        >
          <X className="w-4 h-4" /> {lang === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
        </button>
      )}

      {/* Categories Filter */}
      <div>
        <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">{t('Categories')}</h3>
        <ul className="space-y-2 text-start">
          <li>
            <button
              onClick={() => setSelectedCategory('')}
              className={`text-sm text-start w-full py-1.5 transition-colors ${selectedCategory === '' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
            >
              {lang === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
            </button>
          </li>
          {categories.map(c => (
            <li key={c._id}>
              <button
                onClick={() => setSelectedCategory(c._id)}
                className={`text-sm text-start w-full py-1.5 transition-colors ${selectedCategory === c._id ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
              >
                {lang === 'ar' ? c.name.ar : c.name.en}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">{t('Brands')}</h3>
          <ul className="space-y-2 text-start">
            <li>
              <button
                onClick={() => setSelectedBrand('')}
                className={`text-sm text-start w-full py-1.5 transition-colors ${selectedBrand === '' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
              >
                {lang === 'ar' ? 'جميع العلامات' : 'All Brands'}
              </button>
            </li>
            {brands.map(b => (
              <li key={b._id}>
                <button
                  onClick={() => setSelectedBrand(b._id)}
                  className={`text-sm text-start w-full py-1.5 transition-colors ${selectedBrand === b._id ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
                >
                  {lang === 'ar' ? b.name.ar : b.name.en}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-black text-dark mb-2">{t('Products')}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            <span>/</span>
            <span className="text-dark font-medium">{t('Shop')}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-8">
          {/* Sidebar Filter — Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24 shadow-sm">
              <h2 className="font-bold text-dark mb-6 text-lg">{lang === 'ar' ? 'الفلاتر' : 'Filters'}</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 mb-6 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              {/* Mobile Filter Toggle */}
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-dark"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {lang === 'ar' ? 'فلاتر' : 'Filters'} {hasFilters && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{lang === 'ar' ? 'مفعّل' : 'Active'}</span>}
              </button>

              <p className="text-sm text-gray-500 hidden lg:block">
                {lang === 'ar' ? 'عرض' : 'Showing'} <span className="font-semibold text-dark">{sortedProducts.length}</span> {lang === 'ar' ? 'منتج' : 'product(s)'}
              </p>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">{lang === 'ar' ? 'ترتيب:' : 'Sort by:'}</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="newest">{lang === 'ar' ? 'الأحدث' : 'Newest'}</option>
                  <option value="price-asc">{lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-desc">{lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (() => {
                  const cat = categories.find(c => c._id === selectedCategory);
                  return cat ? (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                      {lang === 'ar' ? cat.name.ar : cat.name.en}
                      <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })()}
                {selectedBrand && (() => {
                  const b = brands.find(b => b._id === selectedBrand);
                  return b ? (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                      {lang === 'ar' ? b.name.ar : b.name.en}
                      <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })()}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
                <div className="text-gray-300 text-7xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-dark mb-2">{lang === 'ar' ? 'لا توجد منتجات' : 'No products found'}</h3>
                <p className="text-gray-500 mb-6">{lang === 'ar' ? 'جرب تعديل الفلاتر' : 'Try adjusting the filters'}</p>
                <button onClick={clearFilters} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                  {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer - uses logical position start/end */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 end-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-dark text-lg">{lang === 'ar' ? 'الفلاتر' : 'Filters'}</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-8 w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-red-700 transition"
            >
              {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
