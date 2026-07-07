import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, ImageIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/wishlistSlice';

const getImageUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  return `${path.startsWith('/') ? '' : '/'}${path}`;
};

const ProductCard = ({ product }) => {
  const { i18n, t } = useTranslation();
  const lang = i18n.language;
  const dispatch = useDispatch();

  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isWishlisted = wishlistItems.some((x) => x._id === product._id);

  const hasVariants = product.variants && product.variants.length > 0;

  const totalStock = hasVariants
    ? product.variants.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
    : (Number(product.quantity) || 0);

  const isOutOfStock = totalStock <= 0;

  const priceDisplay = () => {
    if (hasVariants) {
      const prices = product.variants.map(v => v.discountPrice || v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max
        ? `${min.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
        : `${min.toLocaleString()} – ${max.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`;
    }
    return product.discountPrice
      ? `${product.discountPrice.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
      : `${(product.price || 0).toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (hasVariants || isOutOfStock) return;
    dispatch(addToCart({ ...product, cartItemId: product._id, quantity: 1, stockLimit: product.quantity }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
  };

  const imgSrc = product.images && product.images.length > 0
    ? getImageUrl(product.images[0])
    : null;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative pt-[80%] overflow-hidden bg-gray-50">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={lang === 'ar' ? product.name?.ar : product.name?.en}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</span>
          </div>
        )}

        {/* Badges — using start/end for logical RTL support */}
        <div className="absolute top-3 start-3 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
              {lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
            </span>
          ) : (
            <>
              {(product.discountPrice || (hasVariants && product.variants.some(v => v.discountPrice))) && (
                <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{lang === 'ar' ? 'تخفيض' : 'Sale'}</span>
              )}
              {hasVariants && (
                <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  {product.variants.length} {lang === 'ar' ? 'مقاسات' : 'sizes'}
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist button — using start/end for logical RTL support */}
        <button
          onClick={handleWishlist}
          title={isWishlisted ? (lang === 'ar' ? 'حذف من المفضلة' : 'Remove from wishlist') : (lang === 'ar' ? 'أضف للمفضلة' : 'Add to wishlist')}
          className={`absolute top-3 end-3 p-2 rounded-full shadow transition-all duration-200
            ${isWishlisted
              ? 'bg-primary text-white'
              : 'bg-white/80 text-gray-400 hover:text-primary hover:bg-white'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow text-start">
        <h3 className="font-semibold text-base text-dark mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {lang === 'ar' ? product.name?.ar : product.name?.en}
        </h3>

        {product.brand && (
          <p className="text-xs text-gray-400 mb-2">{lang === 'ar' ? product.brand?.name?.ar : product.brand?.name?.en}</p>
        )}

        {!isOutOfStock && (
          <p className="text-xs font-medium text-green-600 mb-3 bg-green-50 w-fit px-2 py-0.5 rounded">
            {lang === 'ar' ? 'المتاح:' : 'Available:'} {totalStock}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div>
            {!hasVariants && product.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through text-xs">{(product.price || 0).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                <span className="text-lg font-black text-primary">{priceDisplay()}</span>
              </div>
            ) : (
              <span className="text-lg font-black text-primary">{priceDisplay()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? (lang === 'ar' ? 'نفذت الكمية' : 'Out of stock') : hasVariants ? (lang === 'ar' ? 'اختر المقاس' : 'Select variant') : (lang === 'ar' ? 'أضف للعربة' : 'Add to cart')}
            className={`p-3 rounded-full transition-all duration-200 ${isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-primary hover:text-white text-dark group-hover:shadow-md'}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
