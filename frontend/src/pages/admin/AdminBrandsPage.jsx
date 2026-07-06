import React, { useState } from 'react';
import { 
  useGetBrandsQuery, 
  useCreateBrandMutation, 
  useUpdateBrandMutation, 
  useDeleteBrandMutation 
} from '../../store/apiSlice';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminBrandsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data: brandsResponse, isLoading, isError, refetch } = useGetBrandsQuery();
  const brands = brandsResponse?.data || [];

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const openModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setNameEn(brand.name.en);
      setNameAr(brand.name.ar);
      setSlug(brand.slug || '');
      setImagePreview(brand.image || '');
    } else {
      setEditingBrand(null);
      setNameEn('');
      setNameAr('');
      setSlug('');
      setImagePreview('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name[en]', nameEn);
    formData.append('name[ar]', nameAr);
    if (slug) formData.append('slug', slug);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingBrand) {
        await updateBrand({ id: editingBrand._id, data: formData }).unwrap();
      } else {
        await createBrand(formData).unwrap();
      }
      closeModal();
      refetch();
    } catch (err) {
      console.error('Failed to save brand:', err);
      alert(lang === 'ar' ? 'خطأ في حفظ العلامة التجارية: ' + (err.data?.error || '') : 'Error saving brand: ' + (err.data?.error || err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه العلامة التجارية؟' : 'Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete brand:', err);
        alert(lang === 'ar' ? 'خطأ في حذف العلامة التجارية' : 'Error deleting brand');
      }
    }
  };

  return (
    <div className="text-start">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dark">{lang === 'ar' ? 'إدارة العلامات التجارية' : 'Brands Management'}</h1>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? 'إضافة علامة تجارية' : 'Add Brand'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading brands...'}</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">{lang === 'ar' ? 'خطأ في تحميل العلامات التجارية.' : 'Error loading brands.'}</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'لا توجد علامات تجارية.' : 'No brands found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'صورة' : 'Image'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Slug</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {brand.image && brand.image !== 'no-photo.jpg' ? (
                        <img src={`http://localhost:5000${brand.image.startsWith('/') ? '' : '/'}${brand.image}`} alt={brand.name.en} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark font-medium">{brand.name.en}</td>
                    <td className="px-6 py-4 text-gray-600 font-arabic text-right">{brand.name.ar}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm" dir="ltr">{brand.slug}</td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openModal(brand)}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title={lang === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand._id)}
                          className="text-gray-400 hover:text-primary transition"
                          title={lang === 'ar' ? 'حذف' : 'Delete'}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-dark">
                {editingBrand 
                  ? (lang === 'ar' ? 'تعديل العلامة التجارية' : 'Edit Brand') 
                  : (lang === 'ar' ? 'إضافة علامة تجارية' : 'Add New Brand')}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input 
                    type="text" required dir="ltr"
                    value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-start"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input 
                    type="text" required dir="rtl"
                    value={nameAr} onChange={(e) => setNameAr(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <input 
                  type="text" dir="ltr"
                  value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-start"
                  placeholder={lang === 'ar' ? 'اتركه فارغاً للتوليد التلقائي' : 'Leave empty to auto-generate'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'صورة العلامة التجارية' : 'Brand Image'}</label>
                <div className="flex items-center gap-4">
                  {imagePreview && imagePreview !== 'no-photo.jpg' ? (
                    <img 
                      src={imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:5000${imagePreview.startsWith('/') ? '' : '/'}${imagePreview}`} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <input 
                    type="file" accept="image/*" onChange={handleImageChange}
                    className={`flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm ${lang === 'ar' ? 'file:ml-4' : 'file:mr-4'} file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ العلامة التجارية' : 'Save Brand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrandsPage;
