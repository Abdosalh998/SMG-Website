import { useState, useMemo } from 'react';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetProductsQuery
} from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import {
  Eye, Edit, Trash2, X, Search, CheckCircle, Clock,
  Package, PlusCircle, MinusCircle, Save
} from 'lucide-react';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
};

const AdminOrdersPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const { data: productsData } = useGetProductsQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const allOrders = ordersData?.data || [];
  const allProducts = productsData?.data || [];

  // --- Filters ---
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // --- Modal state ---
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  // --- Edit form ---
  const [editForm, setEditForm] = useState({
    customerName: '', phone: '', governorate: '', address: '', notes: '',
    status: 'Pending', paymentStatus: 'Pending',
    orderItems: [], subTotal: 0, shippingCost: 0
  });

  // --- Product search in the add-item UI ---
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantIdx, setSelectedVariantIdx] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [addPrice, setAddPrice] = useState('');

  // --- Client-side filter ---
  const filteredOrders = useMemo(() => {
    let list = [...allOrders];
    if (statusFilter) list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allOrders, statusFilter, search]);

  // --- Computed totals from editForm items ---
  const computedSubTotal = useMemo(() =>
    editForm.orderItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0),
    [editForm.orderItems]
  );
  const computedGrandTotal = computedSubTotal + Number(editForm.shippingCost || 0);

  // --- Status Badge ---
  const StatusBadge = ({ status }) => {
    const map = {
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-3.5 h-3.5" />, label: lang === 'ar' ? 'قيد الانتظار' : 'Pending' },
      Confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className="w-3.5 h-3.5" />, label: lang === 'ar' ? 'مؤكد' : 'Confirmed' },
      Delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: <Package className="w-3.5 h-3.5" />, label: lang === 'ar' ? 'مُسلَّم' : 'Delivered' },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <X className="w-3.5 h-3.5" />, label: lang === 'ar' ? 'ملغي' : 'Cancelled' },
    };
    const s = map[status];
    if (!s) return <span className="text-gray-400 text-xs">{status || '—'}</span>;
    return (
      <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
        {s.icon} {s.label}
      </span>
    );
  };

  // --- Quick status update from table row ---
  const handleQuickStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ id: orderId, status }).unwrap();
      refetch();
    } catch (err) {
      alert(lang === 'ar' ? 'خطأ في تحديث الحالة' : 'Error updating status');
    }
  };

  // --- Open Edit ---
  const openEdit = (order) => {
    setViewOrder(null);
    setEditOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      phone: order.phone || '',
      governorate: order.governorate || '',
      address: order.address || '',
      notes: order.notes || '',
      orderStatus: order.orderStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending',
      orderItems: (order.orderItems || []).map(item => ({
        product: item.product?._id || item.product,
        variant: item.variant?._id || item.variant || null,
        nameEn: item.nameEn || item.product?.name?.en || '',
        nameAr: item.nameAr || item.product?.name?.ar || '',
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      subTotal: order.subTotal || 0,
      shippingCost: order.shippingCost || 0
    });
    setProductSearch('');
    setSelectedProductId('');
    setSelectedVariantIdx('');
    setAddQty(1);
    setAddPrice('');
  };

  // --- Edit: update item field ---
  const updateItem = (idx, field, value) => {
    setEditForm(f => ({
      ...f,
      orderItems: f.orderItems.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    }));
  };

  // --- Edit: remove item ---
  const removeItem = (idx) => {
    setEditForm(f => ({ ...f, orderItems: f.orderItems.filter((_, i) => i !== idx) }));
  };

  const selectedProduct = allProducts.find(p => p._id === selectedProductId);

  const maxAddQty = useMemo(() => {
    if (!selectedProduct) return 999;
    if (selectedProduct.variants?.length > 0) {
      if (selectedVariantIdx !== '') {
        return selectedProduct.variants[Number(selectedVariantIdx)]?.quantity || 0;
      }
      return 0;
    }
    return selectedProduct.quantity || 0;
  }, [selectedProduct, selectedVariantIdx]);

  // --- Edit: add product ---
  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = allProducts.find(p => p._id === selectedProductId);
    if (!product) return;

    let newItem;
    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants) {
      const vIdx = Number(selectedVariantIdx);
      if (selectedVariantIdx === '' || isNaN(vIdx) || !product.variants[vIdx]) {
        alert(lang === 'ar' ? 'يرجى اختيار مقاس' : 'Please select a variant');
        return;
      }
      const v = product.variants[vIdx];
      if (Number(addQty) > v.quantity) {
        alert(lang === 'ar' ? `الكمية المطلوبة تتجاوز المخزون المتاح (${v.quantity})` : `Requested quantity exceeds available stock (${v.quantity})`);
        return;
      }
      newItem = {
        product: product._id,
        variant: v._id || null,
        nameEn: product.name.en,
        nameAr: product.name.ar,
        quantity: Number(addQty) || 1,
        price: Number(addPrice) || v.discountPrice || v.price || 0,
      };
    } else {
      if (Number(addQty) > product.quantity) {
        alert(lang === 'ar' ? `الكمية المطلوبة تتجاوز المخزون المتاح (${product.quantity})` : `Requested quantity exceeds available stock (${product.quantity})`);
        return;
      }
      newItem = {
        product: product._id,
        variant: null,
        nameEn: product.name.en,
        nameAr: product.name.ar,
        quantity: Number(addQty) || 1,
        price: Number(addPrice) || product.discountPrice || product.price || 0,
      };
    }

    setEditForm(f => ({ ...f, orderItems: [...f.orderItems, newItem] }));
    setSelectedProductId('');
    setSelectedVariantIdx('');
    setAddQty(1);
    setAddPrice('');
    setProductSearch('');
  };

  // --- Save edit ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.orderItems.length === 0) {
      alert(lang === 'ar' ? 'يجب أن يحتوي الطلب على منتج واحد على الأقل' : 'Order must have at least one item');
      return;
    }
    try {
      await updateOrderStatus({
        id: editOrder._id,
        status: editForm.orderStatus,
        paymentStatus: editForm.paymentStatus,
        customerName: editForm.customerName,
        phone: editForm.phone,
        address: editForm.address,
        governorate: editForm.governorate,
        notes: editForm.notes,
        subTotal: computedSubTotal,
        shippingCost: editForm.shippingCost,
        totalAmount: computedGrandTotal,
        orderItems: editForm.orderItems,
      }).unwrap();
      setEditOrder(null);
      refetch();
    } catch (err) {
      alert(lang === 'ar' ? 'خطأ في حفظ الطلب: ' + (err?.data?.error || '') : 'Error saving order: ' + (err?.data?.error || ''));
    }
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Delete this order?')) return;
    try {
      await deleteOrder(id).unwrap();
      refetch();
    } catch (err) {
      alert(lang === 'ar' ? 'خطأ في حذف الطلب' : 'Error deleting order');
    }
  };

  // Filtered product list for add-item search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts.slice(0, 20);
    const q = productSearch.toLowerCase();
    return allProducts.filter(p =>
      p.name?.en?.toLowerCase().includes(q) || p.name?.ar?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allProducts, productSearch]);

  return (
    <div className="space-y-6 text-start">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">{lang === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredOrders.length} {lang === 'ar' ? 'طلب إجمالي' : 'total orders'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث: رقم الطلب، عميل، هاتف...' : 'Search: Order #, Customer, Phone...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full ps-10 pe-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary px-3 py-2 font-medium text-gray-600"
          >
            <option value="">{lang === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="Confirmed">{lang === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
            <option value="Delivered">{lang === 'ar' ? 'مُسلَّم' : 'Delivered'}</option>
            <option value="Cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'رقم الطلب' : 'Order No.'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 font-semibold text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400">{lang === 'ar' ? 'لا توجد طلبات مطابقة.' : 'No orders found.'}</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 align-top">
                    <td className="px-6 py-4 font-bold text-dark">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-dark">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5" dir="ltr">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                      {order.totalAmount?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4">
                      {/* Action Buttons */}
                      <div className="flex flex-wrap justify-end items-center gap-1.5">
                        <button onClick={() => setViewOrder(order)} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                          <Eye className="w-3.5 h-3.5" /> {lang === 'ar' ? 'عرض' : 'View'}
                        </button>
                        <button onClick={() => openEdit(order)} className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                          <Edit className="w-3.5 h-3.5" /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        {order.orderStatus !== 'Confirmed' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                          <button onClick={() => handleQuickStatus(order._id, 'Confirmed')} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> {lang === 'ar' ? 'تأكيد' : 'Confirm'}
                          </button>
                        )}
                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                          <button onClick={() => handleQuickStatus(order._id, 'Cancelled')} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            <X className="w-3.5 h-3.5" /> {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(order._id)} disabled={isDeleting} className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-1.5 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════════ */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-start">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-dark">{lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">#{viewOrder.orderNumber}</span>
                <StatusBadge status={viewOrder.orderStatus} />
              </div>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{lang === 'ar' ? 'بيانات العميل' : 'Customer Info'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'الاسم' : 'Name'}</p><p className="font-semibold">{viewOrder.customerName}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'الهاتف' : 'Phone'}</p><p className="font-semibold" dir="ltr">{viewOrder.phone}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'المحافظة' : 'Governorate'}</p><p className="font-semibold">{viewOrder.governorate}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'العنوان' : 'Address'}</p><p className="font-semibold">{viewOrder.address}</p></div>
                  {viewOrder.notes && <div className="col-span-2"><p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</p><p className="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-sm">{viewOrder.notes}</p></div>}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{lang === 'ar' ? 'المنتجات' : 'Items'}</h3>
                <div className="space-y-3">
                  {viewOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100">
                      {getImageUrl(item.product?.images?.[0]) && (
                        <img src={getImageUrl(item.product.images[0])} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{lang === 'ar' ? item.nameAr : item.nameEn}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.variant.size ? `${lang === 'ar' ? 'المقاس' : 'Size'}: ${item.variant.size}` : ''}
                            {item.variant.power ? ` · ${lang === 'ar' ? 'القوة' : 'Power'}: ${item.variant.power}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{item.quantity} × {Number(item.price).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</p>
                      </div>
                      <p className="font-black text-primary shrink-0">{(Number(item.price) * Number(item.quantity)).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-5 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-600">{lang === 'ar' ? 'إجمالي المنتجات' : 'Products Subtotal'}</span>
                  <span className="font-semibold">{viewOrder.subTotal?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-primary/10 pb-2">
                  <span className="font-medium text-gray-600">{lang === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}</span>
                  <span className="font-semibold">{viewOrder.shippingCost?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-dark">{lang === 'ar' ? 'الإجمالي الكلي' : 'Grand Total'}</span>
                  <span className="text-2xl font-black text-primary">{viewOrder.totalAmount?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => openEdit(viewOrder)} className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 flex items-center gap-2">
                <Edit className="w-4 h-4" /> {lang === 'ar' ? 'تعديل الطلب' : 'Edit Order'}
              </button>
              <button onClick={() => setViewOrder(null)} className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT MODAL (with product management)
      ══════════════════════════════════════════ */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-start">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditOrder(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto relative z-10 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-dark">{lang === 'ar' ? 'تعديل الطلب' : 'Edit Order'} #{editOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{lang === 'ar' ? 'تعديل بيانات العميل، المنتجات، والحالة' : 'Modify customer info, items, and status'}</p>
              </div>
              <button onClick={() => setEditOrder(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full ms-4">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">

                {/* ── ORDER ITEMS ── */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{lang === 'ar' ? 'عناصر الطلب' : 'Order Items'}</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-600 text-start">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 text-center w-24">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 text-center w-32">{lang === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 text-end w-32">{lang === 'ar' ? 'الإجمالي' : 'Subtotal'}</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {editForm.orderItems.length === 0 ? (
                          <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400 text-sm">{lang === 'ar' ? 'لا توجد منتجات. أضف منتجاً من الأسفل.' : 'No items. Add a product below.'}</td></tr>
                        ) : editForm.orderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-dark">
                              {lang === 'ar' ? item.nameAr : item.nameEn}
                              {item.variant && <span className="text-xs text-gray-400 block mt-0.5">{lang === 'ar' ? 'مقاس' : 'Variant'}: {item.variant}</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number" min="1"
                                value={item.quantity}
                                onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-primary outline-none"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number" min="0"
                                value={item.price}
                                onChange={e => updateItem(idx, 'price', Number(e.target.value))}
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-primary outline-none"
                              />
                            </td>
                            <td className="px-4 py-3 text-end font-bold text-dark">
                              {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button type="button" onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <MinusCircle className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan="3" className="px-4 py-2 text-end font-semibold text-gray-600">{lang === 'ar' ? 'إجمالي المنتجات:' : 'Products Subtotal:'}</td>
                          <td className="px-4 py-2 text-end font-bold text-dark text-lg">
                            {computedSubTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-4 py-2 text-end font-semibold text-gray-600">{lang === 'ar' ? 'تكلفة الشحن:' : 'Shipping Cost:'}</td>
                          <td className="px-4 py-2 text-end">
                            <input
                              type="number" min="0" value={editForm.shippingCost}
                              onChange={e => setEditForm(f => ({ ...f, shippingCost: Number(e.target.value) }))}
                              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-primary outline-none inline-block"
                            />
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-primary/5 border-t border-primary/10">
                          <td colSpan="3" className="px-4 py-3 text-end font-bold text-dark">{lang === 'ar' ? 'الإجمالي الكلي:' : 'Grand Total:'}</td>
                          <td className="px-4 py-3 text-end font-black text-primary text-xl">
                            {computedGrandTotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* ADD PRODUCT */}
                  <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      {lang === 'ar' ? 'إضافة منتج للطلب' : 'Add Product to Order'}
                    </h4>

                    {/* Product Search */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{lang === 'ar' ? 'المنتج' : 'Product'}</label>
                        <select
                          value={selectedProductId}
                          onChange={e => {
                            const val = e.target.value;
                            setSelectedProductId(val);
                            setSelectedVariantIdx('');
                            const p = allProducts.find(prod => prod._id === val);
                            setAddPrice(p ? (p.discountPrice || p.price || '') : '');
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                        >
                          <option value="">{lang === 'ar' ? 'اختر منتجاً...' : 'Select a product...'}</option>
                          {allProducts.map(p => (
                            <option key={p._id} value={p._id}>
                              {lang === 'ar' ? p.name.ar : p.name.en}
                              {p.variants?.length > 0 ? ` (${p.variants.length} ${lang === 'ar' ? 'مقاسات' : 'variants'})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variant selector (if product has variants) */}
                      {selectedProduct?.variants?.length > 0 && (
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">{lang === 'ar' ? 'المقاس' : 'Variant'}</label>
                          <select
                            value={selectedVariantIdx}
                            onChange={e => {
                              setSelectedVariantIdx(e.target.value);
                              if (e.target.value !== '') {
                                const v = selectedProduct.variants[Number(e.target.value)];
                                setAddPrice(v.discountPrice || v.price || '');
                              }
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          >
                            <option value="">{lang === 'ar' ? 'اختر مقاساً' : 'Select variant'}</option>
                            {selectedProduct.variants.map((v, i) => (
                              <option key={i} value={i}>
                                {v.size ? `${lang === 'ar' ? 'المقاس' : 'Size'}: ${v.size}` : ''}
                                {v.power ? ` · ${lang === 'ar' ? 'القوة' : 'Power'}: ${v.power}` : ''}
                                {' — '}{(v.discountPrice || v.price || 0).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                                {' ('}{lang === 'ar' ? 'مخزون' : 'Stock'}: {v.quantity}{')'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{lang === 'ar' ? 'الكمية' : 'Quantity'}</label>
                        <input
                          type="number" min="1" max={maxAddQty} value={addQty}
                          onChange={e => setAddQty(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">{lang === 'ar' ? 'المتاح:' : 'Available:'} {maxAddQty}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{lang === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                        <input
                          type="number" min="0" value={addPrice}
                          onChange={e => setAddPrice(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          disabled={!selectedProductId}
                          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <PlusCircle className="w-4 h-4" /> {lang === 'ar' ? 'إضافة للطلب' : 'Add to Order'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CUSTOMER INFO ── */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{lang === 'ar' ? 'بيانات العميل' : 'Customer Info'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                      <input type="text" required value={editForm.customerName} onChange={e => setEditForm(f => ({ ...f, customerName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                      <input type="text" required dir="ltr" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none text-start" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'المحافظة' : 'Governorate'}</label>
                      <input type="text" required value={editForm.governorate} onChange={e => setEditForm(f => ({ ...f, governorate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'العنوان' : 'Address'}</label>
                      <input type="text" required value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                      <textarea rows="2" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </div>

                {/* ── STATUS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{lang === 'ar' ? 'حالة الطلب' : 'Order Status'}</label>
                    <select value={editForm.orderStatus} onChange={e => setEditForm(f => ({ ...f, orderStatus: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-primary outline-none">
                      <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                      <option value="Confirmed">{lang === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                      <option value="Delivered">{lang === 'ar' ? 'مُسلَّم' : 'Delivered'}</option>
                      <option value="Cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditOrder(null)} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={isUpdating} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-red-200">
                  <Save className="w-4 h-4" />
                  {isUpdating ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
