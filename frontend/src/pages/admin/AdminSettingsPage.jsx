import React, { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';

const AdminSettingsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data: settingsResponse, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [settings, setSettings] = useState({
    siteNameEn: '',
    siteNameAr: '',
    whatsappNumber: '',
    contactEmail: '',
    seoTitleEn: '',
    seoTitleAr: '',
    seoDescriptionEn: '',
    seoDescriptionAr: ''
  });

  useEffect(() => {
    if (settingsResponse?.data) {
      setSettings(settingsResponse.data);
    }
  }, [settingsResponse]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings).unwrap();
      alert(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings updated successfully!');
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert(lang === 'ar' ? 'خطأ في حفظ الإعدادات' : 'Error updating settings');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">{lang === 'ar' ? 'جارٍ تحميل الإعدادات...' : 'Loading settings...'}</div>;
  }

  return (
    <div className="text-start">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">{lang === 'ar' ? 'الإعدادات العامة' : 'Global Settings'}</h1>
        <p className="text-gray-500 text-sm mt-1">{lang === 'ar' ? 'إدارة إعدادات الموقع والتواصل والـ SEO' : 'Manage site settings, contact info and SEO'}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-dark border-b border-gray-100 pb-2 mb-4">
              {lang === 'ar' ? 'معلومات الموقع' : 'General Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'اسم الموقع (إنجليزي)' : 'Site Name (EN)'}</label>
                <input type="text" name="siteNameEn" dir="ltr" value={settings.siteNameEn || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none text-start" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'اسم الموقع (عربي)' : 'Site Name (AR)'}</label>
                <input type="text" name="siteNameAr" dir="rtl" value={settings.siteNameAr || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div>
            <h3 className="text-lg font-semibold text-dark border-b border-gray-100 pb-2 mb-4">
              {lang === 'ar' ? 'التواصل والدفع' : 'Contact & Checkout'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {lang === 'ar' ? 'رقم واتساب (للطلبات)' : 'WhatsApp Number (For Checkout)'}
                </label>
                <input
                  type="text" name="whatsappNumber" dir="ltr"
                  value={settings.whatsappNumber || ''} onChange={handleChange}
                  placeholder="+201207227467"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none text-start"
                />
                <p className="text-xs text-gray-500">
                  {lang === 'ar' ? 'أدخل الرقم مع مفتاح الدولة. يُستخدم لتحويل الطلبات عبر واتساب.' : 'Include country code. Used to redirect orders to WhatsApp.'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {lang === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}
                </label>
                <input
                  type="email" name="contactEmail" dir="ltr"
                  value={settings.contactEmail || ''} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none text-start"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div>
            <h3 className="text-lg font-semibold text-dark border-b border-gray-100 pb-2 mb-4">
              {lang === 'ar' ? 'إعدادات SEO' : 'SEO Configuration'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'عنوان SEO (إنجليزي)' : 'SEO Title (EN)'}</label>
                <input type="text" name="seoTitleEn" dir="ltr" value={settings.seoTitleEn || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none text-start" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'عنوان SEO (عربي)' : 'SEO Title (AR)'}</label>
                <input type="text" name="seoTitleAr" dir="rtl" value={settings.seoTitleAr || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-primary focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الوصف التعريفي (إنجليزي)' : 'Meta Description (EN)'}</label>
                <textarea name="seoDescriptionEn" dir="ltr" value={settings.seoDescriptionEn || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none h-24 text-start" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الوصف التعريفي (عربي)' : 'Meta Description (AR)'}</label>
                <textarea name="seoDescriptionAr" dir="rtl" value={settings.seoDescriptionAr || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-primary focus:outline-none h-24" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" disabled={isUpdating}
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isUpdating ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
