import { useState } from 'react';
import {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useReorderFAQsMutation
} from '../../store/apiSlice';
import { Plus, Pencil, Trash2, X, Loader2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY_FORM = {
  questionEn: '',
  questionAr: '',
  answerEn: '',
  answerAr: '',
  isActive: true
};

const AdminFAQPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data: faqData, isLoading, refetch } = useGetFAQsQuery();
  const [createFAQ, { isLoading: isCreating }] = useCreateFAQMutation();
  const [updateFAQ, { isLoading: isUpdating }] = useUpdateFAQMutation();
  const [deleteFAQ] = useDeleteFAQMutation();
  const [reorderFAQs] = useReorderFAQsMutation();

  const faqs = (faqData?.data || []).slice().sort((a, b) => a.order - b.order);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openModal = (faq = null) => {
    if (faq) {
      setEditingId(faq._id);
      setForm({
        questionEn: faq.questionEn,
        questionAr: faq.questionAr,
        answerEn: faq.answerEn,
        answerAr: faq.answerAr,
        isActive: faq.isActive
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFAQ({ id: editingId, data: form }).unwrap();
      } else {
        await createFAQ(form).unwrap();
      }
      closeModal();
      refetch();
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Delete this FAQ?')) return;
    try {
      await deleteFAQ(id).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await updateFAQ({ id: faq._id, data: { isActive: !faq.isActive } }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const moveItem = async (idx, direction) => {
    const newList = [...faqs];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newList.length) return;

    // Swap
    [newList[idx], newList[targetIdx]] = [newList[targetIdx], newList[idx]];

    // Build reorder payload
    const items = newList.map((faq, i) => ({ id: faq._id, order: i + 1 }));
    try {
      await reorderFAQs({ items }).unwrap();
      refetch();
    } catch (err) {
      alert(lang === 'ar' ? 'خطأ في إعادة الترتيب' : 'Error reordering');
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">
          {lang === 'ar' ? 'إدارة الأسئلة الشائعة' : 'FAQ Management'}
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? 'إضافة سؤال' : 'Add Question'}
        </button>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {lang === 'ar' ? 'لا توجد أسئلة بعد. أضف أول سؤال!' : 'No FAQs yet. Add your first question!'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, idx) => (
              <div key={faq._id} className={`p-5 transition-colors ${!faq.isActive ? 'bg-gray-50/80 opacity-60' : 'hover:bg-gray-50/30'}`}>
                <div className="flex items-start gap-4">
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1 shrink-0 pt-1">
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === faqs.length - 1}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Q</span>
                      <p className="font-semibold text-dark text-sm truncate">
                        {lang === 'ar' ? faq.questionAr : faq.questionEn}
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 ps-6">
                      {lang === 'ar' ? faq.answerAr : faq.answerEn}
                    </p>
                    {/* Both languages preview */}
                    {lang === 'ar' && faq.questionEn && (
                      <p className="text-xs text-gray-400 mt-1 ps-6 truncate">EN: {faq.questionEn}</p>
                    )}
                    {lang !== 'ar' && faq.questionAr && (
                      <p className="text-xs text-gray-400 mt-1 ps-6 truncate">AR: {faq.questionAr}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={faq.isActive ? (lang === 'ar' ? 'إلغاء التفعيل' : 'Deactivate') : (lang === 'ar' ? 'تفعيل' : 'Activate')}
                    >
                      {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openModal(faq)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto text-start">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-dark">
                {editingId
                  ? (lang === 'ar' ? 'تعديل السؤال' : 'Edit Question')
                  : (lang === 'ar' ? 'إضافة سؤال جديد' : 'Add New Question')}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Question EN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'ar' ? 'السؤال (إنجليزي)' : 'Question (English)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required dir="ltr"
                  value={form.questionEn}
                  onChange={e => setForm({ ...form, questionEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Question AR */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'ar' ? 'السؤال (عربي)' : 'Question (Arabic)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required dir="rtl"
                  value={form.questionAr}
                  onChange={e => setForm({ ...form, questionAr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Answer EN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'ar' ? 'الجواب (إنجليزي)' : 'Answer (English)'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required rows="3" dir="ltr"
                  value={form.answerEn}
                  onChange={e => setForm({ ...form, answerEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Answer AR */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'ar' ? 'الجواب (عربي)' : 'Answer (Arabic)'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required rows="3" dir="rtl"
                  value={form.answerAr}
                  onChange={e => setForm({ ...form, answerAr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox" id="faq-active"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="faq-active" className="text-sm font-medium text-gray-700">
                  {lang === 'ar' ? 'عرض هذا السؤال في الموقع' : 'Show this question on the website'}
                </label>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button" onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-red-700 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
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

export default AdminFAQPage;
