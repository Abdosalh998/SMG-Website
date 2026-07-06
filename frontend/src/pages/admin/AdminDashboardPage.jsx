import { useGetOrdersQuery, useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '../../store/apiSlice';
import { Package, ShoppingBag, List, Bookmark, Users, Banknote, Clock, CheckCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: ordersRes, isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: productsRes, isLoading: productsLoading } = useGetProductsQuery();
  const { data: categoriesRes, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: brandsRes, isLoading: brandsLoading } = useGetBrandsQuery();

  const isLoading = ordersLoading || productsLoading || categoriesLoading || brandsLoading;

  if (isLoading) return <div className="p-4">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>;

  const allOrders = ordersRes?.data || [];
  const allProducts = productsRes?.data || [];
  const allCategories = categoriesRes?.data || [];
  const allBrands = brandsRes?.data || [];

  const totalRevenue = allOrders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const stats = {
    totalProducts: allProducts.length,
    totalOrders: allOrders.length,
    totalCategories: allCategories.length,
    totalRevenue: totalRevenue,
    recentOrders: [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  };

  const statCards = [
    { title: lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
    { title: lang === 'ar' ? 'إجمالي المنتجات' : 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-primary' },
    { title: lang === 'ar' ? 'التصنيفات' : 'Categories', value: stats.totalCategories, icon: List, color: 'bg-green-500' },
    { title: lang === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`, icon: Banknote, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-dark">{lang === 'ar' ? 'نظرة عامة' : 'Dashboard Overview'}</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl text-white flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-dark">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-dark">{lang === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline font-medium">
            {lang === 'ar' ? 'عرض الكل' : 'View All'}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-dark">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-dark">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-green-600" />
                        {order.totalAmount?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.orderStatus === 'Pending' && <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5"/> {lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</span>}
                      {order.orderStatus === 'Confirmed' && <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5"/> {lang === 'ar' ? 'مؤكد' : 'Confirmed'}</span>}
                      {order.orderStatus === 'Delivered' && <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold"><Package className="w-3.5 h-3.5"/> {lang === 'ar' ? 'مُسلَّم' : 'Delivered'}</span>}
                      {order.orderStatus === 'Cancelled' && <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold"><X className="w-3.5 h-3.5"/> {lang === 'ar' ? 'ملغي' : 'Cancelled'}</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {lang === 'ar' ? 'لا توجد طلبات حديثة.' : 'No recent orders.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
