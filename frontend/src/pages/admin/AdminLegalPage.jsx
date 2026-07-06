import { useState, useEffect } from 'react';
import { useGetLegalPageQuery, useUpdateLegalPageMutation } from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save,
  Loader2, FileText, X, Pencil, ExternalLink, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EMPTY_SECTION = { titleEn: '', titleAr: '', contentEn: '', contentAr: '' };

const AdminLegalPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [activeTab, setActiveTab] = useState('terms');

  const { data, isLoading, refetch } = useGetLegalPageQuery(activeTab);
  const [updateLegalPage, { isLoading: isSaving }] = useUpdateLegalPageMutation();

  const [pageForm, setPageForm] = useState({
    titleEn: '', titleAr: '', introEn: '', introAr: '', isActive: true, sections: []
  });
  const [editingIdx, setEditingIdx] = useState(null);
  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      setPageForm({
        titleEn: p.titleEn || '',
        titleAr: p.titleAr || '',
        introEn: p.introEn || '',
        introAr: p.introAr || '',
        isActive: p.isActive ?? true,
        sections: (p.sections || []).slice().sort((a, b) => a.order - b.order)
      });
    } else {
        setPageForm({
            titleEn: '', titleAr: '', introEn: '', introAr: '', isActive: true, sections: []
        });
    }
  }, [data, activeTab]);

  const openAddSection = () => {
    setEditingIdx(null);
    setSectionForm(EMPTY_SECTION);
    setIsModalOpen(true);
  };

  const openEditSection = (idx) => {
    setEditingIdx(idx);
    setSectionForm({ ...pageForm.sections[idx] });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingIdx(null); };

  const saveSection = () => {
    if (!sectionForm.titleEn.trim() || !sectionForm.titleAr.trim()) {
      alert(lang === 'ar' ? 'العنوان مطلوب باللغتين' : 'Title is required in both languages');
      return;
    }
    const sections = [...pageForm.sections];
    if (editingIdx !== null) {
      sections[editingIdx] = { ...sections[editingIdx], ...sectionForm };
    } else {
      sections.push({ ...sectionForm, order: sections.length + 1 });
    }
    setPageForm(f => ({ ...f, sections }));
    closeModal();
  };

  const deleteSection = (idx) => {
    if (!window.confirm(lang === 'ar' ? 'حذف هذا القسم؟' : 'Delete this section?')) return;
    setPageForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }));
  };

  const moveSection = (idx, dir) => {
    const sections = [...pageForm.sections];
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    setPageForm(f => ({ ...f, sections }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...pageForm,
        sections: pageForm.sections.map((s, i) => ({ ...s, order: i + 1 }))
      };
      await updateLegalPage({ slug: activeTab, data: payload }).unwrap();
      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err?.data?.error || (lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving'));
    }
  };

  return (
    <div className="space-y-6 text-start">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {lang === 'ar' ? 'إدارة الصفحات القانونية' : 'Legal Pages Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'ar'
              ? 'يتم تحديث تاريخ "آخر تعديل" تلقائياً عند الحفظ.'
              : 'The "Last Updated" date is automatically updated on save.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/${activeTab}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 hover:border-primary hover:text-primary rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {lang === 'ar' ? 'معاينة' : 'Preview'}
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-bold disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'terms' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark hover:border-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'privacy' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark hover:border-gray-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </button>
      </div>

      {/* Save confirmation */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {lang === 'ar' ? 'تم الحفظ بنجاح! تاريخ "آخر تعديل" تم تحديثه.' : 'Saved successfully! "Last Updated" date has been refreshed.'}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Page Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-dark">{lang === 'ar' ? 'إعدادات الصفحة' : 'Page Settings'}</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  {pageForm.isActive ? (lang === 'ar' ? 'مفعّلة' : 'Active') : (lang === 'ar' ? 'معطّلة' : 'Inactive')}
                </span>
                <button
                  type="button"
                  onClick={() => setPageForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pageForm.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pageForm.isActive ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`} />
                </button>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'ar' ? 'عنوان الصفحة (إنجليزي)' : 'Page Title (English)'}</label>
                <input type="text" dir="ltr"
                  value={pageForm.titleEn}
                  onChange={e => setPageForm(f => ({ ...f, titleEn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'ar' ? 'عنوان الصفحة (عربي)' : 'Page Title (Arabic)'}</label>
                <input type="text" dir="rtl"
                  value={pageForm.titleAr}
                  onChange={e => setPageForm(f => ({ ...f, titleAr: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'ar' ? 'مقدمة الصفحة (إنجليزي)' : 'Page Introduction (English)'}</label>
                <textarea dir="ltr" rows="3"
                  value={pageForm.introEn}
                  onChange={e => setPageForm(f => ({ ...f, introEn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'ar' ? 'مقدمة الصفحة (عربي)' : 'Page Introduction (Arabic)'}</label>
                <textarea dir="rtl" rows="3"
                  value={pageForm.introAr}
                  onChange={e => setPageForm(f => ({ ...f, introAr: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-dark">{lang === 'ar' ? 'الأقسام' : 'Sections'} <span className="text-sm text-gray-400 font-normal ms-1">({pageForm.sections.length})</span></h2>
              <button
                onClick={openAddSection}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {lang === 'ar' ? 'إضافة قسم' : 'Add Section'}
              </button>
            </div>

            {pageForm.sections.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                {lang === 'ar' ? 'لا توجد أقسام. اضغط "إضافة قسم" للبدء.' : 'No sections yet. Click "Add Section" to get started.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pageForm.sections.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                    {/* Reorder */}
                    <div className="flex flex-col gap-1 pt-1 shrink-0">
                      <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveSection(idx, 1)} disabled={idx === pageForm.sections.length - 1}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Order Badge */}
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-black flex items-center justify-center shrink-0 mt-1">
                      {idx + 1}
                    </span>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark text-sm truncate">
                        {lang === 'ar' ? s.titleAr : s.titleEn}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                        {lang === 'ar' ? s.contentAr : s.contentEn}
                      </p>
                      {lang === 'ar' && s.titleEn && (
                        <p className="text-gray-400 text-xs mt-1 truncate">EN: {s.titleEn}</p>
                      )}
                      {lang !== 'ar' && s.titleAr && (
                        <p className="text-gray-400 text-xs mt-1 truncate">AR: {s.titleAr}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditSection(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSection(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Section Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-dark">
                {editingIdx !== null
                  ? (lang === 'ar' ? 'تعديل القسم' : 'Edit Section')
                  : (lang === 'ar' ? 'إضافة قسم جديد' : 'Add New Section')}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'ar' ? 'عنوان القسم (إنجليزي)' : 'Section Title (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" dir="ltr"
                    value={sectionForm.titleEn}
                    onChange={e => setSectionForm(f => ({ ...f, titleEn: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g. 1. Information We Collect"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'ar' ? 'عنوان القسم (عربي)' : 'Section Title (Arabic)'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" dir="rtl"
                    value={sectionForm.titleAr}
                    onChange={e => setSectionForm(f => ({ ...f, titleAr: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="مثال: 1. المعلومات التي نقوم بجمعها"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {lang === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                </label>
                <textarea dir="ltr" rows="6"
                  value={sectionForm.contentEn}
                  onChange={e => setSectionForm(f => ({ ...f, contentEn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
                  placeholder="Use • at the start of a line to create a bullet point."
                />
                <p className="text-xs text-gray-400 mt-1">{lang === 'ar' ? 'ابدأ السطر بـ • لإنشاء نقطة.' : 'Start a line with • to create a bullet point.'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {lang === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                </label>
                <textarea dir="rtl" rows="6"
                  value={sectionForm.contentAr}
                  onChange={e => setSectionForm(f => ({ ...f, contentAr: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
                  placeholder="ابدأ السطر بـ • لإنشاء قائمة نقطية."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={saveSection}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-red-700 font-bold transition-colors">
                  {lang === 'ar' ? 'حفظ القسم' : 'Save Section'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLegalPage;
