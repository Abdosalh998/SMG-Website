import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="SMG Logo" className="h-16 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="text-dark hover:text-primary font-medium transition-colors">{t('Products')}</Link>
            <Link to="/categories" className="text-dark hover:text-primary font-medium transition-colors">{t('Categories')}</Link>
            <Link to="/brands" className="text-dark hover:text-primary font-medium transition-colors">{t('Brands')}</Link>
            <Link to="/faq" className="text-dark hover:text-primary font-medium transition-colors">{t('FAQ')}</Link>
          </div>

          {/* Icons & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <LanguageSwitcher />
            
            <Link to="/wishlist" className="text-dark hover:text-primary transition-colors relative">
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -end-2 bg-red-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-dark hover:text-primary transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -end-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <Link to="/cart" className="text-dark relative">
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -end-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
             </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-dark hover:text-primary focus:outline-none">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4 shadow-inner pt-4 border-t border-gray-100">
            <Link to="/shop" className="block text-dark hover:text-primary font-medium py-2" onClick={() => setIsOpen(false)}>{t('Products')}</Link>
            <Link to="/categories" className="block text-dark hover:text-primary font-medium py-2" onClick={() => setIsOpen(false)}>{t('Categories')}</Link>
            <Link to="/brands" className="block text-dark hover:text-primary font-medium py-2" onClick={() => setIsOpen(false)}>{t('Brands')}</Link>
            <Link to="/faq" className="block text-dark hover:text-primary font-medium py-2" onClick={() => setIsOpen(false)}>{t('FAQ')}</Link>
            <Link to="/wishlist" className="block text-dark hover:text-primary font-medium py-2" onClick={() => setIsOpen(false)}>{t('Wishlist')}</Link>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
