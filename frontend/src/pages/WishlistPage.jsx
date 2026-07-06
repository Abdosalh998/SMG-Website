import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { Heart, ShoppingCart, Trash2, ImageIcon } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const WishlistPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const isInCart = (productId) => cartItems.some((x) => x._id === productId);

  const handleMoveToCart = (product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) return;
    dispatch(addToCart({ ...product, cartItemId: product._id, quantity: 1, stockLimit: product.quantity }));
    dispatch(removeFromWishlist(product._id));
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Heart className="w-7 h-7 text-primary fill-primary" />
        <h1 className="text-3xl font-bold text-dark">{t('Wishlist')}</h1>
        {wishlistItems.length > 0 && (
          <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
            {wishlistItems.length}
          </span>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-dark">{lang === 'ar' ? 'قائمة المفضلة فارغة' : 'Your Wishlist is Empty'}</h2>
          <p className="text-gray-500 max-w-sm">
            {lang === 'ar' ? 'تصفح منتجاتنا واضغط على أيقونة القلب لحفظ المنتجات التي تعجبك.' : 'Browse our products and click the heart icon to save products you like.'}
          </p>
          <Link
            to="/shop"
            className="mt-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const imgSrc = product.images && product.images.length > 0
              ? getImageUrl(product.images[0])
              : null;
            const hasVariants = product.variants && product.variants.length > 0;
            const priceDisplay = () => {
              if (hasVariants) {
                const prices = product.variants.map((v) => v.discountPrice || v.price);
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

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Image */}
                <Link to={`/product/${product._id}`} className="relative pt-[75%] overflow-hidden bg-gray-50 block">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={lang === 'ar' ? product.name.ar : product.name.en}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</span>
                    </div>
                  )}
                  {hasVariants && (
                    <span className="absolute top-3 end-3 bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {product.variants.length} {lang === 'ar' ? 'مقاسات' : 'sizes'}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow text-start">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-dark mb-1 line-clamp-2 hover:text-primary transition-colors">
                      {lang === 'ar' ? product.name.ar : product.name.en}
                    </h3>
                  </Link>
                  {product.brand && (
                    <p className="text-xs text-gray-400 mb-2">{lang === 'ar' ? product.brand?.name?.ar : product.brand?.name?.en}</p>
                  )}
                  <span className="text-lg font-black text-primary mb-4">{priceDisplay()}</span>

                  <div className="mt-auto flex gap-2">
                    {hasVariants ? (
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {lang === 'ar' ? 'اختر المقاس' : 'Select Size'}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={isInCart(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isInCart(product._id) 
                          ? (lang === 'ar' ? 'في العربة' : 'In Cart') 
                          : (lang === 'ar' ? 'أضف للعربة' : 'Add to Cart')}
                      </button>
                    )}
                    <button
                      onClick={() => dispatch(removeFromWishlist(product._id))}
                      title={lang === 'ar' ? 'حذف من المفضلة' : 'Remove from wishlist'}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
