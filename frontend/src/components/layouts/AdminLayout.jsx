import { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, ShoppingBag, List, Tag, Settings, LogOut, Bookmark, Menu, X, Globe, Truck, HelpCircle, Scale, MessageCircle } from 'lucide-react';
import { logout } from '../../store/authSlice';

const AdminLayout = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 text-dark overflow-hidden text-start">
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 start-0 z-50 w-64 bg-white border-e border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">SMG Admin</Link>
          <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <Link to="/admin" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" /> {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
          <Link to="/admin/orders" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" /> {lang === 'ar' ? 'الطلبات' : 'Orders'}
          </Link>
          <Link to="/admin/products" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <Tag className="w-5 h-5" /> {lang === 'ar' ? 'المنتجات' : 'Products'}
          </Link>
          <Link to="/admin/categories" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <List className="w-5 h-5" /> {lang === 'ar' ? 'التصنيفات' : 'Categories'}
          </Link>
          <Link to="/admin/brands" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <Bookmark className="w-5 h-5" /> {lang === 'ar' ? 'العلامات التجارية' : 'Brands'}
          </Link>
          <Link to="/admin/shipping" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <Truck className="w-5 h-5" /> {lang === 'ar' ? 'إدارة الشحن' : 'Shipping'}
          </Link>
          <Link to="/admin/faq" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <HelpCircle className="w-5 h-5" /> {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </Link>
          <Link to="/admin/legal" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <Scale className="w-5 h-5" /> {lang === 'ar' ? 'الصفحات القانونية' : 'Legal Pages'}
          </Link>
          <Link to="/admin/settings" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" /> {lang === 'ar' ? 'الإعدادات' : 'Settings'}
          </Link>
          <Link to="/admin/settings/social-media" onClick={closeSidebar} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors">
            <MessageCircle className="w-5 h-5" /> {lang === 'ar' ? 'منصات التواصل' : 'Social Media'}
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
            <LogOut className="w-5 h-5" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Hamburger */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 p-4 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold text-dark hidden sm:block">SMG Admin</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-dark"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full">{user.name || 'Admin'}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
