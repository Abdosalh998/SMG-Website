import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <footer className="bg-dark text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand & About */}
          <div className="space-y-4">
            <img src="/logo.png" alt="SMG Logo" className="h-20 object-contain" />
            <p className="text-gray-400 text-sm leading-relaxed">
              {lang === 'ar'
                ? 'شركة SMG توربو فان متخصصة في أنظمة التهوية والطرد المركزي، نقدم أفضل المنتجات الصناعية بجودة عالية.'
                : 'SMG Turbo Fan specializes in ventilation and centrifugal systems, offering the best industrial products with high quality.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">{t('ShopNow')}</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors">{t('Products')}</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors">{t('Categories')}</Link></li>
              <li><Link to="/brands" className="text-gray-400 hover:text-white transition-colors">{t('Brands')}</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">{t('Cart')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">
              {lang === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">{lang === 'ar' ? 'شروط وأحكام الاستخدام' : 'Terms & Conditions'}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 uppercase tracking-wider">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-gray-400 text-sm">{lang === 'ar' ? '112 شارع عمر بن الخطاب زهراء مدينة نصر القاهرة' : '112 Omar Ibn Al-Khattab Street, Zahraa Nasr City, Cairo'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-gray-400 text-sm" dir="ltr">01203509668</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-gray-400 text-sm" dir="ltr">smgturbofan@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} SMG Platform. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="text-gray-500 text-sm">
            {lang === 'ar' ? 'تطوير: م. عبدالرحمن محمد' : 'Developed By Eng.Abdelrahman Mohamed'}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
