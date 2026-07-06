import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { removeFromCart, clearCartItems, addToCart } from '../store/cartSlice';
import { useCreateOrderMutation, useGetSettingsQuery, useGetShippingsQuery } from '../store/apiSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CartPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(state => state.cart.cartItems);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: settingsData } = useGetSettingsQuery();
  const { data: shippingsData } = useGetShippingsQuery({ isActive: 'true' });
  const shippings = shippingsData?.data || [];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    governorateId: '',
    address: '',
    notes: ''
  });

  const selectedShipping = shippings.find(s => s._id === formData.governorateId);
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;

  const getItemPrice = (item) => {
    if (item.selectedVariant) {
      return item.selectedVariant.discountPrice || item.selectedVariant.price;
    }
    return item.discountPrice || item.price;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.quantity * getItemPrice(item), 0);
  const grandTotal = cartTotal + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!formData.governorateId) {
      alert(lang === 'ar' ? 'الرجاء اختيار المحافظة' : 'Please select a governorate');
      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName,
        phone: formData.phone,
        governorate: lang === 'ar' ? selectedShipping.governorateAr : selectedShipping.governorateEn,
        address: formData.address,
        notes: formData.notes,
        orderItems: cartItems.map(item => ({
          product: item._id,
          variant: item.selectedVariant?._id,
          nameEn: item.name?.en || '',
          nameAr: item.name?.ar || '',
          quantity: item.quantity,
          price: getItemPrice(item)
        })),
        subTotal: cartTotal,
        shippingCost: shippingCost,
        totalAmount: grandTotal,
        paymentMethod: 'WhatsApp'
      };

      const res = await createOrder(orderData).unwrap();

      const itemsSnapshot = [...cartItems];
      dispatch(clearCartItems());

      const waNumber = settingsData?.data?.whatsappNumber || '201207227467';
      const RTL = lang === 'ar' ? '\u200F' : '';
      let message = `${RTL} *${lang === 'ar' ? 'طلب جديد - SMG' : 'New Order - SMG'}*\n`;
      message += `━━━━━━━━━━━━━━━━\n`;
      message += `${RTL} *${lang === 'ar' ? 'رقم الطلب:' : 'Order Number:'}* ${res.data.orderNumber}\n`;
      message += `${RTL} *${lang === 'ar' ? 'الاسم:' : 'Customer Name:'}* ${formData.customerName}\n`;
      message += `${RTL} *${lang === 'ar' ? 'الهاتف:' : 'Phone:'}* ${formData.phone}\n`;
      message += `${RTL} *${lang === 'ar' ? 'المحافظة:' : 'Governorate:'}* ${orderData.governorate}\n`;
      message += `${RTL} *${lang === 'ar' ? 'العنوان:' : 'Address:'}* ${formData.address}\n`;
      message += `━━━━━━━━━━━━━━━━\n`;
      message += `${RTL} *${lang === 'ar' ? 'المنتجات:' : 'Products:'}*\n`;

      itemsSnapshot.forEach((item, index) => {
        const p = getItemPrice(item);
        const productName = lang === 'ar' ? (item.name?.ar || item.name?.en || 'منتج') : (item.name?.en || item.name?.ar || 'Product');
        const v = item.selectedVariant;

        message += `${RTL}${index + 1}. *${productName}*\n`;
        if (v) {
          if (v.size) message += `${RTL}    ${lang === 'ar' ? 'المقاس:' : 'Size:'} ${v.size}\n`;
          if (v.power) message += `${RTL}    ${lang === 'ar' ? 'القوة:' : 'Power:'} ${v.power}\n`;
        }
        message += `${RTL}   ${lang === 'ar' ? 'الكمية:' : 'Qty:'} ${item.quantity} × ${p.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'} = *${(p * item.quantity).toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}*\n`;
      });

      message += `━━━━━━━━━━━━━━━━\n`;
      message += `${RTL} *${lang === 'ar' ? 'إجمالي المنتجات:' : 'Products Total:'} ${cartTotal.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}*\n`;
      message += `${RTL} *${lang === 'ar' ? 'تكلفة الشحن:' : 'Shipping Cost:'} ${shippingCost.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}*\n`;
      message += `${RTL} *${lang === 'ar' ? 'الإجمالي الكلي:' : 'Grand Total:'} ${grandTotal.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}*\n`;
      if (formData.notes) message += `\n${RTL} *${lang === 'ar' ? 'ملاحظات:' : 'Notes:'}*\n${formData.notes}\n`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

      window.open(waUrl, '_blank');
      navigate('/order-confirmation', {
        state: {
          order: res.data,
          cartItems: itemsSnapshot,
          cartTotal,
          waUrl,
        }
      });
    } catch (err) {
      console.error('Failed to create order', err);
      alert(lang === 'ar' ? 'فشل في إرسال الطلب. يرجى المحاولة مجدداً.' : 'Failed to submit order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('Cart')}</h2>
        <p className="text-gray-500 mb-8">{lang === 'ar' ? 'عربة التسوق فارغة.' : 'Your cart is empty.'}</p>
        <Link to="/shop" className="bg-primary text-white px-6 py-3 rounded hover:bg-red-700">
          {t('ShopNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-dark mb-8">{t('Cart')}</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold text-start">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="p-4 font-semibold text-start">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="p-4 font-semibold text-start">{lang === 'ar' ? 'الكمية' : 'Quantity'}</th>
                  <th className="p-4 font-semibold text-start">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="p-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => {
                  const imgSrc = item.images && item.images[0]
                    ? `http://localhost:5000${item.images[0].startsWith('/') ? '' : '/'}${item.images[0]}`
                    : 'https://placehold.co/100x100/f8f9fa/e60000?text=SMG';

                  return (
                    <tr key={item.cartItemId} className="border-b border-gray-50">
                      <td className="p-4 flex items-center gap-4">
                        <img
                          src={imgSrc}
                          alt={lang === 'ar' ? item.name?.ar : item.name?.en}
                          className="w-16 h-16 object-cover rounded bg-gray-100"
                        />
                        <span className="font-medium text-dark line-clamp-2">
                          {lang === 'ar' ? item.name?.ar : item.name?.en}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {getItemPrice(item).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center border rounded w-max">
                          <button
                            onClick={() => dispatch(addToCart({ ...item, quantity: Math.max(1, item.quantity - 1) }))}
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                          >-</button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const maxQty = item.stockLimit || 1000;
                              if (item.quantity < maxQty) {
                                dispatch(addToCart({ ...item, quantity: item.quantity + 1 }));
                              } else {
                                alert(lang === 'ar' ? 'لا يمكن تجاوز الكمية المتاحة في المخزون.' : 'Cannot exceed available stock.');
                              }
                            }}
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                          >+</button>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-dark">
                        {(getItemPrice(item) * item.quantity).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </td>
                      <td className="p-4 text-end">
                        <button
                          onClick={() => dispatch(removeFromCart(item.cartItemId || item._id))}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors inline-block"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold mb-4 border-b pb-4">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
            <div className="flex justify-between mb-3 text-gray-600">
              <span>{lang === 'ar' ? 'إجمالي المنتجات' : 'Products Subtotal'}</span>
              <span>{cartTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className="flex justify-between mb-4 border-b pb-4 text-gray-600">
              <span>{lang === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}</span>
              <span>{shippingCost > 0 ? `${shippingCost.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}` : (lang === 'ar' ? 'يتم حسابه عند اختيار المحافظة' : 'Calculated at next step')}</span>
            </div>
            <div className="flex justify-between mb-6 font-bold text-lg">
              <span>{lang === 'ar' ? 'الإجمالي الكلي:' : 'Grand Total:'}</span>
              <span className="text-primary">{grandTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text" required
                  value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input
                  type="tel" required dir="ltr"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-start"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'المحافظة' : 'Governorate'}</label>
                <select
                  required
                  value={formData.governorateId}
                  onChange={e => setFormData({ ...formData, governorateId: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
                >
                  <option value="" disabled>{lang === 'ar' ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
                  {shippings.map(s => (
                    <option key={s._id} value={s._id}>
                      {lang === 'ar' ? s.governorateAr : s.governorateEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'العنوان' : 'Address'}</label>
                <textarea
                  required rows="3"
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</label>
                <textarea
                  rows="2"
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
              >
                {isLoading ? (lang === 'ar' ? 'جارٍ المعالجة...' : 'Processing...') : (lang === 'ar' ? 'الطلب عبر واتساب' : 'Order via WhatsApp')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
