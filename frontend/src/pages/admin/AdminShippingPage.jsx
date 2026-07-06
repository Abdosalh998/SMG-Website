import React, { useState } from 'react';
import { 
  useGetShippingsQuery, 
  useCreateShippingMutation, 
  useUpdateShippingMutation, 
  useDeleteShippingMutation 
} from '../../store/apiSlice';
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminShippingPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: shippingsData, isLoading, refetch } = useGetShippingsQuery();
  const [createShipping, { isLoading: isCreating }] = useCreateShippingMutation();
  const [updateShipping, { isLoading: isUpdating }] = useUpdateShippingMutation();
  const [deleteShipping] = useDeleteShippingMutation();

  const shippings = shippingsData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    governorateEn: '',
    governorateAr: '',
    cost: '',
    isActive: true
  });

  const openModal = (shipping = null) => {
    if (shipping) {
      setEditingId(shipping._id);
      setFormData({
        governorateEn: shipping.governorateEn,
        governorateAr: shipping.governorateAr,
        cost: shipping.cost,
        isActive: shipping.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        governorateEn: '',
        governorateAr: '',
        cost: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, cost: Number(formData.cost) };
      if (editingId) {
        await updateShipping({ id: editingId, data: payload }).unwrap();
      } else {
        await createShipping(payload).unwrap();
      }
      closeModal();
      refetch();
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه المحافظة؟' : 'Are you sure you want to delete this governorate?')) {
      try {
        await deleteShipping(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
      }
    }
  };

  const toggleStatus = async (shipping) => {
    try {
      await updateShipping({ 
        id: shipping._id, 
        data: { isActive: !shipping.isActive } 
      }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">
          {lang === 'ar' ? 'إدارة الشحن' : 'Shipping Management'}
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? 'إضافة محافظة' : 'Add Governorate'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto text-start">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-start">{lang === 'ar' ? 'المحافظة (EN)' : 'Governorate (EN)'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-start">{lang === 'ar' ? 'المحافظة (AR)' : 'Governorate (AR)'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-start">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-end">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shippings.map((shipping) => (
                  <tr key={shipping._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">{shipping.governorateEn}</td>
                    <td className="px-6 py-4 font-medium text-dark">{shipping.governorateAr}</td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {shipping.cost} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(shipping)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          shipping.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {shipping.isActive 
                          ? (lang === 'ar' ? 'نشط' : 'Active') 
                          : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(shipping)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shipping._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shippings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {lang === 'ar' ? 'لا توجد محافظات مضافة' : 'No governorates added yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-start">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-dark">
                {editingId 
                  ? (lang === 'ar' ? 'تعديل محافظة' : 'Edit Governorate')
                  : (lang === 'ar' ? 'إضافة محافظة' : 'Add Governorate')}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'ar' ? 'اسم المحافظة (انجليزي)' : 'Governorate Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.governorateEn}
                  onChange={(e) => setFormData({ ...formData, governorateEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'ar' ? 'اسم المحافظة (عربي)' : 'Governorate Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.governorateAr}
                  onChange={(e) => setFormData({ ...formData, governorateAr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'} ({lang === 'ar' ? 'ج.م' : 'EGP'})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  {lang === 'ar' ? 'تفعيل الشحن لهذه المحافظة' : 'Enable shipping for this governorate'}
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingPage;
