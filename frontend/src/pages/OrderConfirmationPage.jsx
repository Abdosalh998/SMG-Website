import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ShoppingBag, MapPin, Phone, User, Package, MessageCircle } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const location = useLocation();
  const navigate = useNavigate();
  const { order, cartItems, cartTotal, waUrl } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/80x80/f8f9fa/e60000?text=SMG';
    if (img.startsWith('http')) return img;
    return `${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const getItemPrice = (item) => {
    if (item.selectedVariant) return item.selectedVariant.discountPrice || item.selectedVariant.price;
    return item.discountPrice || item.price;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-start">
      <div className="max-w-2xl w-full mx-auto">

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">{lang === 'ar' ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}</h1>
          <p className="text-gray-500 text-lg">{lang === 'ar' ? 'تم تسجيل طلبك بنجاح.' : 'Your order has been placed successfully.'}</p>
          <div className="inline-block mt-3 px-4 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm tracking-widest">
            #{order.orderNumber}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Customer Details */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'بيانات العميل' : 'Customer Details'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</p>
                  <p className="font-semibold text-dark">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</p>
                  <p className="font-semibold text-dark" dir="ltr">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{lang === 'ar' ? 'المحافظة والعنوان' : 'Governorate & Address'}</p>
                  <p className="font-semibold text-dark">{order.governorate} - {order.address}</p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                    <p className="font-semibold text-dark">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'عناصر الطلب' : 'Order Items'}
            </h2>
            <div className="space-y-4">
              {cartItems.map((item, idx) => {
                const price = getItemPrice(item);
                const v = item.selectedVariant;
                return (
                  <div key={idx} className="flex items-center gap-4 text-start">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={lang === 'ar' ? item.name?.ar : item.name?.en}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark truncate">{lang === 'ar' ? item.name?.ar : item.name?.en}</p>
                      {v && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {v.size ? `${lang === 'ar' ? 'المقاس' : 'Size'}: ${v.size}"` : ''}{v.size && v.power ? ' · ' : ''}{v.power ? `${lang === 'ar' ? 'القوة' : 'Power'}: ${v.power}` : ''}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-0.5">
                        {lang === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity} × {price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                    <p className="font-bold text-dark shrink-0">{(price * item.quantity).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-5 bg-gray-50 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{lang === 'ar' ? 'إجمالي المنتجات' : 'Products Subtotal'}</span>
              <span className="font-semibold text-dark">{order.subTotal?.toLocaleString() || cartTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-medium">{lang === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}</span>
              <span className="font-semibold text-dark">{order.shippingCost?.toLocaleString() || 0} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-800 font-bold">{lang === 'ar' ? 'الإجمالي الكلي' : 'Grand Total'}</span>
              <span className="text-2xl font-bold text-primary">{order.totalAmount?.toLocaleString() || cartTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
            </div>
          </div>
        </div>

        {/* Status Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{lang === 'ar' ? 'مطلوب التأكيد عبر واتساب' : 'WhatsApp Confirmation Required'}</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              {lang === 'ar' ? 'يرجى إرسال الرسالة الجاهزة عبر واتساب لإكمال طلبك. طلبك قيد الانتظار حتى يتم تأكيده من قبل المتجر.' : 'Please send the prepared message via WhatsApp to complete your order. Your order is pending until confirmed by the store.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {lang === 'ar' ? 'فتح واتساب' : 'Open WhatsApp'}
            </a>
          )}
          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-bold py-4 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
