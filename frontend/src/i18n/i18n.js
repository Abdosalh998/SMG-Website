import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  en: {
    translation: {
      "Welcome": "Welcome to SMG",
      "ShopNow": "Shop Now",
      "Cart": "Cart",
      "Wishlist": "Wishlist",
      "Products": "Products",
      "Categories": "Categories",
      "Brands": "Brands",
      "Admin": "Admin Dashboard",
      "Login": "Login",
      "Logout": "Logout",
      "OrderOnWhatsApp": "Order on WhatsApp",
      "Checkout": "Checkout",
      "FAQ": "FAQ"
    }
  },
  ar: {
    translation: {
      "Welcome": "مرحباً بكم في SMG",
      "ShopNow": "تسوق الآن",
      "Cart": "عربة التسوق",
      "Wishlist": "المفضلة",
      "Products": "المنتجات",
      "Categories": "التصنيفات",
      "Brands": "العلامات التجارية",
      "Admin": "لوحة الإدارة",
      "Login": "تسجيل الدخول",
      "Logout": "تسجيل الخروج",
      "OrderOnWhatsApp": "الطلب عبر واتساب",
      "Checkout": "إتمام الطلب",
      "FAQ": "الأسئلة الشائعة"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
