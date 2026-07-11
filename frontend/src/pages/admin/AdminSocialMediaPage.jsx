import React, { useState, useEffect } from 'react';
import { useGetSocialMediaQuery, useUpdateSocialMediaMutation } from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';

const AdminSocialMediaPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: platformsResponse, isLoading, refetch } = useGetSocialMediaQuery();
  const [updateSocialMedia, { isLoading: isUpdating }] = useUpdateSocialMediaMutation();

  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    if (platformsResponse?.data) {
      setPlatforms(platformsResponse.data);
    }
  }, [platformsResponse]);

  const handleToggle = (index) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], isActive: !newPlatforms[index].isActive };
    setPlatforms(newPlatforms);
  };

  const handleUrlChange = (index, value) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], url: value };
    setPlatforms(newPlatforms);
  };

  const handleSave = async (platform) => {
    try {
      await updateSocialMedia({
        platform: platform.platform,
        data: { url: platform.url, isActive: platform.isActive, displayOrder: platform.displayOrder }
      }).unwrap();
      alert(lang === 'ar' ? `تم حفظ إعدادات ${platform.platform} بنجاح!` : `Saved settings for ${platform.platform} successfully!`);
    } catch (err) {
      console.error('Failed to update social media:', err);
      alert(lang === 'ar' ? 'خطأ في الحفظ. تأكد من صحة الرابط.' : 'Error saving. Please ensure URL is valid.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="text-start">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">{lang === 'ar' ? 'إعدادات وسائل التواصل' : 'Social Media Settings'}</h1>
          <p className="text-gray-500 text-sm mt-1">{lang === 'ar' ? 'إدارة روابط منصات التواصل وعرضها في أيقونة الدعم العائمة' : 'Manage social media links for the floating contact widget'}</p>
        </div>
        <button onClick={refetch} className="p-2 text-gray-500 hover:text-primary transition-colors bg-white rounded-lg border border-gray-200">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 mb-8 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
            <p>
              {lang === 'ar' 
                ? 'قم بتفعيل المنصات التي تريد ظهورها للعملاء. روابط WhatsApp يجب أن تكون بصيغة https://wa.me/رقم_الهاتف.'
                : 'Enable the platforms you want to display to customers. WhatsApp URLs should be in the format https://wa.me/phoneNumber.'
              }
            </p>
          </div>

          <div className="space-y-6">
            {platforms.map((platform, index) => (
              <div key={platform._id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-colors bg-gray-50/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  
                  <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(index)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        platform.isActive ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${platform.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="font-bold text-lg capitalize">{platform.platform}</span>
                  </div>
                  
                  <button
                    onClick={() => handleSave(platform)}
                    disabled={isUpdating}
                    className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {lang === 'ar' ? 'حفظ' : 'Save'}
                  </button>

                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'رابط المنصة (URL)' : 'Platform URL'}</label>
                  <input
                    type="url"
                    dir="ltr"
                    value={platform.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder={`https://${platform.platform}.com/...`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:outline-none text-start text-sm bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSocialMediaPage;
