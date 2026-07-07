import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        if (data.user.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SMG Logo" className="h-24 object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <input 
              type="email" required dir="ltr"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-start"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input 
              type="password" required dir="ltr"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-start"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
            {lang === 'ar' ? 'دخول' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
