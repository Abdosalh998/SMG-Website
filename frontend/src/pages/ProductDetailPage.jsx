import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetProductQuery, useGetSettingsQuery } from '../store/apiSlice';
import { addToCart } from '../store/cartSlice';
import {
  ShoppingCart, ArrowRight, ChevronRight, ChevronLeft, CheckCircle2,
  Package, Zap, Shield, MessageCircle, ImageIcon
} from 'lucide-react';

const getImageUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: productRes, isLoading, isError } = useGetProductQuery(id);
  const product = productRes?.data;
  const { data: settingsData } = useGetSettingsQuery();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const hasVariants = product?.variants && product.variants.length > 0;

  const displayPrice = () => {
    if (hasVariants) {
      if (selectedVariant !== null) {
        const v = product.variants[selectedVariant];
        return v.discountPrice ? { price: v.price, discountPrice: v.discountPrice } : { price: v.price };
      }
      const prices = product.variants.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return { range: min === max ? `${min.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}` : `${min.toLocaleString()} – ${max.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}` };
    }
    return product?.discountPrice
      ? { price: product.price, discountPrice: product.discountPrice }
      : { price: product?.price };
  };

  const handleAddToCart = () => {
    if (hasVariants && selectedVariant === null) {
      alert(lang === 'ar' ? 'يرجى اختيار المقاس أولاً' : 'Please select a variant first');
      return;
    }

    const cartItemId = hasVariants ? `${product._id}-${selectedVariant}` : product._id;
    const maxStock = hasVariants ? product.variants[selectedVariant].quantity : product.quantity;
    
    const existingItem = cartItems.find(x => x.cartItemId === cartItemId);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    
    if (currentCartQty >= maxStock) {
      alert(lang === 'ar' ? 'لا يمكن إضافة المزيد. تم الوصول للحد الأقصى للمخزون.' : 'Cannot add more. Max stock reached.');
      return;
    }

    const cartItem = {
      ...product,
      cartItemId,
      quantity: currentCartQty + 1,
      stockLimit: maxStock,
      selectedVariant: hasVariants ? product.variants[selectedVariant] : null,
    };
    dispatch(addToCart(cartItem));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };


  const handleWhatsApp = () => {
    const waNumber = settingsData?.data?.whatsappNumber || '201207227467';
    const RTL = lang === 'ar' ? '\u200F' : '';
    const productName = lang === 'ar' ? product?.name?.ar : product?.name?.en;

    let message = `${RTL}🛒 *${lang === 'ar' ? 'استفسار عن منتج - SMG' : 'Product Inquiry - SMG'}*\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `${RTL}📦 *${lang === 'ar' ? 'المنتج:' : 'Product:'}* ${productName}\n`;

    if (hasVariants && selectedVariant !== null) {
      const v = product.variants[selectedVariant];
      if (v.size)  message += `${RTL}📐 *${lang === 'ar' ? 'المقاس:' : 'Size:'}* ${v.size} ${lang === 'ar' ? 'بوصة' : 'inches'}\n`;
      if (v.power) message += `${RTL}⚡ *${lang === 'ar' ? 'القوة:' : 'Power:'}* ${v.power}\n`;
      message += `${RTL}💰 *${lang === 'ar' ? 'السعر:' : 'Price:'}* ${v.price?.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}\n`;
    }

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `${RTL}${lang === 'ar' ? 'أرجو التواصل معي للاستفسار عن هذا المنتج.' : 'Please contact me regarding this product.'}`;

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded w-1/3 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-dark mb-4">{lang === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}</h2>
        <Link to="/shop" className="text-primary font-medium hover:underline">
          {lang === 'ar' ? '← العودة للمتجر' : '← Back to Shop'}
        </Link>
      </div>
    );
  }

  const isCurrentSelectionOutOfStock = () => {
    if (hasVariants) {
      if (selectedVariant === null) return true; // Disabled state if none selected
      return (Number(product.variants[selectedVariant].quantity) || 0) <= 0;
    }
    return (Number(product.quantity) || 0) <= 0;
  };

  const outOfStock = isCurrentSelectionOutOfStock();
  const priceInfo = displayPrice();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Link to="/shop" className="hover:text-primary">{t('Shop')}</Link>
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-dark font-medium truncate max-w-xs">
              {lang === 'ar' ? product.name.ar : product.name.en}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
              {product.images && product.images.length > 0 && getImageUrl(product.images[selectedImage]) ? (
                <img
                  src={getImageUrl(product.images[selectedImage])}
                  alt={lang === 'ar' ? product.name.ar : product.name.en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <ImageIcon className="w-16 h-16" />
                  <span className="text-sm">{lang === 'ar' ? 'لا توجد صورة متاحة' : 'No image available'}</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => {
                  const imgSrc = getImageUrl(img);
                  if (!imgSrc) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-primary' : 'border-gray-200 hover:border-primary/40'}`}
                    >
                      <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              {product.category && (
                <Link
                  to={`/shop?category=${product.category._id || product.category}`}
                  className="text-sm text-primary font-semibold uppercase tracking-wider hover:underline"
                >
                  {lang === 'ar' ? product.category?.name?.ar : product.category?.name?.en}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-black text-dark mt-2 leading-tight">
                {lang === 'ar' ? product.name.ar : product.name.en}
              </h1>
              {product.brand && (
                <p className="text-gray-500 mt-1">
                  {lang === 'ar' ? 'العلامة التجارية:' : 'Brand:'} <span className="font-semibold text-dark">{lang === 'ar' ? product.brand?.name?.ar : product.brand?.name?.en}</span>
                </p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="py-6 border-y border-gray-100 flex flex-col gap-2">
              {!hasVariants && (
                <div className="mb-2">
                  {outOfStock ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md">{lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</span>
                  ) : (
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-md">
                      {lang === 'ar' ? 'المتاح:' : 'Available:'} {product.quantity || 0}
                    </span>
                  )}
                </div>
              )}
              {priceInfo.range ? (
                <div className="text-3xl font-black text-primary">{priceInfo.range}</div>
              ) : (
                <div className="flex items-end gap-3">
                  {priceInfo.discountPrice ? (
                    <>
                      <span className="text-4xl font-black text-primary">{priceInfo.discountPrice?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                      <span className="text-xl text-gray-400 line-through mb-1">{priceInfo.price?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                      <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full mb-1">
                        -{Math.round((1 - priceInfo.discountPrice / priceInfo.price) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-primary">{priceInfo.price?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  )}
                </div>
              )}
            </div>

            {/* Variants */}
            {hasVariants && (
              <div>
                <h3 className="font-bold text-dark mb-3">
                  {lang === 'ar' ? 'اختر المقاس' : 'Select Size'} {selectedVariant !== null && (
                    <span className="text-primary text-sm font-normal">
                      — {product.variants[selectedVariant].size && `${lang === 'ar' ? 'المقاس:' : 'Size:'} ${product.variants[selectedVariant].size}`}
                      {product.variants[selectedVariant].power && ` / ${lang === 'ar' ? 'القوة:' : 'Power:'} ${product.variants[selectedVariant].power}`}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.variants.map((variant, idx) => {
                    const vStock = Number(variant.quantity) || 0;
                    const vOutOfStock = vStock <= 0;
                    return (
                      <button
                        key={idx}
                        disabled={vOutOfStock}
                        onClick={() => setSelectedVariant(idx)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 text-start transition-all ${
                          vOutOfStock
                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            : selectedVariant === idx
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/40 bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedVariant === idx ? 'border-primary' : 'border-gray-300'}`}>
                              {selectedVariant === idx && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <div>
                              {variant.size && <span className={`font-semibold ${vOutOfStock ? 'text-gray-500' : 'text-dark'}`}>{lang === 'ar' ? 'المقاس:' : 'Size:'} {variant.size}</span>}
                              {variant.power && <span className="text-gray-500 text-sm mx-2">· {lang === 'ar' ? 'القوة:' : 'Power:'} {variant.power}</span>}
                            </div>
                          </div>
                          <div className="ms-8">
                            {vOutOfStock ? (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</span>
                            ) : (
                              <span className="text-green-600 text-xs font-medium">{lang === 'ar' ? 'المتاح:' : 'Available:'} {vStock}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          {variant.discountPrice ? (
                            <div>
                              <div className={`font-black ${vOutOfStock ? 'text-gray-500' : 'text-primary'}`}>{variant.discountPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                              <div className="text-xs text-gray-400 line-through">{variant.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                            </div>
                          ) : (
                            <div className={`font-black ${vOutOfStock ? 'text-gray-500' : 'text-primary'}`}>{variant.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (product.description.ar || product.description.en) && (
              <div>
                <h3 className="font-bold text-dark mb-3">{lang === 'ar' ? 'الوصف' : 'Description'}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-start">
                  {lang === 'ar' ? (product.description.ar || product.description.en) : (product.description.en || product.description.ar)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || (hasVariants && selectedVariant === null)}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : outOfStock || (hasVariants && selectedVariant === null)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-red-700 shadow-lg shadow-red-200'
                }`}
              >
                {addedToCart ? (
                  <><CheckCircle2 className="w-5 h-5" /> {lang === 'ar' ? 'تمت الإضافة للعربة!' : 'Added to cart!'}</>
                ) : outOfStock ? (
                  <><ShoppingCart className="w-5 h-5" /> {lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> {lang === 'ar' ? 'أضف للعربة' : 'Add to Cart'}</>
                )}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-4 rounded-xl transition-colors shadow-lg shadow-green-200"
                title={lang === 'ar' ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, text: lang === 'ar' ? 'ضمان رسمي' : 'Official Warranty' },
                { icon: Zap, text: lang === 'ar' ? 'جودة أصلية' : 'Original Quality' },
                { icon: Package, text: lang === 'ar' ? 'توصيل سريع' : 'Fast Delivery' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-2 p-3 bg-gray-100 rounded-xl text-center">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
            {lang === 'ar' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
            {lang === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
