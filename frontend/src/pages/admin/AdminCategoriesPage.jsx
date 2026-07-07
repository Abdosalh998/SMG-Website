import React, { useState } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../store/apiSlice';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminCategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: categoriesResponse, isLoading, isError, refetch } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNameEn(category.name.en);
      setNameAr(category.name.ar);
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setNameEn('');
      setNameAr('');
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
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
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, data: formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      closeModal();
      refetch();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(lang === 'ar' ? 'خطأ في حفظ التصنيف' : 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert(lang === 'ar' ? err?.data?.error || 'حدث خطأ' : err?.data?.error || 'An error occurred');
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'no-photo.jpg') return null;
    return `${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="text-start">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dark">{lang === 'ar' ? 'إدارة التصنيفات' : 'Categories Management'}</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading categories...'}</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">{lang === 'ar' ? 'خطأ في تحميل التصنيفات.' : 'Error loading categories.'}</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'لا توجد تصنيفات.' : 'No categories found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'صورة' : 'Image'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => {
                  const imgSrc = getImageUrl(category.image);
                  return (
                    <tr key={category._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {imgSrc ? (
                          <img src={imgSrc} alt={category.name.en} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-dark font-medium">{category.name.en}</td>
                      <td className="px-6 py-4 text-dark font-medium font-arabic text-right">{category.name.ar}</td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openModal(category)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title={lang === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="text-gray-400 hover:text-primary transition"
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-dark">
                {editingCategory ? (lang === 'ar' ? 'تعديل التصنيف' : 'Edit Category') : (lang === 'ar' ? 'إضافة تصنيف' : 'Add New Category')}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1">
              <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input type="text" required dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none text-start" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input type="text" required dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'صورة التصنيف' : 'Category Image'}</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className={`block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${lang === 'ar' ? 'file:ml-4' : 'file:mr-4'}`} />
                  {imagePreview && (
                    <div className="mt-4">
                      <img src={imagePreview.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" form="categoryForm" disabled={isCreating || isUpdating} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50">
                {isCreating || isUpdating ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التصنيف' : 'Save Category')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
