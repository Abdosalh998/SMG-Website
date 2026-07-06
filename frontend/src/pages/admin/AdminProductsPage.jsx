import React, { useState } from 'react';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery
} from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, X, Image as ImageIcon, PlusCircle, MinusCircle } from 'lucide-react';

const AdminProductsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data: productsResponse, isLoading, isError, refetch } = useGetProductsQuery();
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: brandsResponse } = useGetBrandsQuery();

  const products = productsResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');

  // Simple Product State
  const [hasVariants, setHasVariants] = useState(false);
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Variants State
  const [variants, setVariants] = useState([]);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setNameEn(product.name.en);
      setNameAr(product.name.ar);
      setDescriptionEn(product.description.en);
      setDescriptionAr(product.description.ar);
      setCategory(product.category?._id || product.category);
      setBrand(product.brand?._id || product.brand || '');

      const pHasVariants = product.variants && product.variants.length > 0;
      setHasVariants(pHasVariants);

      if (pHasVariants) {
        setVariants(product.variants.map(v => ({ ...v })));
        setPrice('');
        setDiscountPrice('');
        setQuantity('');
      } else {
        setVariants([]);
        setPrice(product.price || '');
        setDiscountPrice(product.discountPrice || '');
        setQuantity(product.quantity || '');
      }

      setImagePreviews(product.images || []);
    } else {
      setEditingProduct(null);
      setNameEn('');
      setNameAr('');
      setDescriptionEn('');
      setDescriptionAr('');
      setCategory('');
      setBrand('');

      setHasVariants(false);
      setPrice('');
      setDiscountPrice('');
      setQuantity('');
      setVariants([]);

      setImagePreviews([]);
      setImageFiles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', power: '', price: '', discountPrice: '', quantity: '' }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name[en]', nameEn);
    formData.append('name[ar]', nameAr);
    formData.append('description[en]', descriptionEn);
    formData.append('description[ar]', descriptionAr);
    formData.append('category', category);
    if (brand) formData.append('brand', brand);

    if (hasVariants) {
      if (variants.length === 0) {
        alert(lang === 'ar' ? 'يرجى إضافة مقاس واحد على الأقل.' : 'Please add at least one variant.');
        return;
      }
      formData.append('variants', JSON.stringify(variants));
    } else {
      if (!price || !quantity) {
        alert(lang === 'ar' ? 'يرجى تحديد السعر والكمية.' : 'Please set price and quantity.');
        return;
      }
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('quantity', quantity);
    }

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, data: formData }).unwrap();
      } else {
        await createProduct(formData).unwrap();
      }
      closeModal();
      refetch();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert(lang === 'ar' ? 'خطأ في حفظ المنتج' : 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(lang === 'ar' ? 'خطأ في حذف المنتج' : 'Error deleting product');
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'no-photo.jpg') return null;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="text-start">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dark">{lang === 'ar' ? 'إدارة المنتجات' : 'Products Management'}</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading products...'}</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">{lang === 'ar' ? 'خطأ في تحميل المنتجات.' : 'Error loading products.'}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{lang === 'ar' ? 'لا توجد منتجات.' : 'No products found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'صورة' : 'Image'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const pHasVariants = product.variants && product.variants.length > 0;
                  const displayPrice = pHasVariants
                    ? `${Math.min(...product.variants.map(v => v.price))} - ${Math.max(...product.variants.map(v => v.price))} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
                    : `${product.price} ${lang === 'ar' ? 'ج.م' : 'EGP'}`;
                  const displayStock = pHasVariants
                    ? product.variants.reduce((acc, v) => acc + v.quantity, 0)
                    : product.quantity;

                  const imgSrc = product.images?.length > 0 ? getImageUrl(product.images[0]) : null;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {imgSrc ? (
                          <img src={imgSrc} alt={lang === 'ar' ? product.name.ar : product.name.en} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-dark font-medium">{lang === 'ar' ? product.name.ar : product.name.en}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{displayPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${displayStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {displayStock > 0 ? `${displayStock} ${lang === 'ar' ? 'متوفر' : 'in stock'}` : (lang === 'ar' ? 'نفذت الكمية' : 'Out of stock')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{lang === 'ar' ? product.category?.name?.ar : product.category?.name?.en}</td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openModal(product)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title={lang === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
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
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-dark">
                {editingProduct 
                  ? (lang === 'ar' ? 'تعديل المنتج' : 'Edit Product') 
                  : (lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                    <input type="text" required dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                    <input type="text" required dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                    <textarea required dir="ltr" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none h-24" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                    <textarea required dir="rtl" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-primary outline-none h-24" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
                    <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white">
                      <option value="">{lang === 'ar' ? 'اختر تصنيفاً' : 'Select Category'}</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{lang === 'ar' ? c.name.ar : c.name.en}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'العلامة التجارية (اختياري)' : 'Brand (Optional)'}</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white">
                      <option value="">{lang === 'ar' ? 'اختر علامة تجارية' : 'Select Brand'}</option>
                      {brands.map(b => <option key={b._id} value={b._id}>{lang === 'ar' ? b.name.ar : b.name.en}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="hasVariants"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700 cursor-pointer">
                      {lang === 'ar' ? 'هذا المنتج يحتوي على عدة مقاسات (مثل الأحجام، القدرات)' : 'This product has multiple variants (sizes, power, etc.)'}
                    </label>
                  </div>

                  {!hasVariants ? (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                        <input type="number" step="0.01" required={!hasVariants} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'السعر بعد الخصم (اختياري)' : 'Discount Price (EGP)'}</label>
                        <input type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'الكمية في المخزون' : 'Quantity in Stock'}</label>
                        <input type="number" required={!hasVariants} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((v, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 items-end text-start">
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">{lang === 'ar' ? 'المقاس (مثال 305)' : 'Size'}</label>
                            <input type="text" value={v.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary outline-none" />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <label className="text-xs font-medium text-gray-500">{lang === 'ar' ? 'القوة (مثال 5 بوصة)' : 'Power'}</label>
                            <input type="text" value={v.power} onChange={(e) => updateVariant(index, 'power', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary outline-none" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">{lang === 'ar' ? 'السعر *' : 'Price *'}</label>
                            <input type="number" step="0.01" required value={v.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary outline-none" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">{lang === 'ar' ? 'الخصم' : 'Discount'}</label>
                            <input type="number" step="0.01" value={v.discountPrice} onChange={(e) => updateVariant(index, 'discountPrice', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary outline-none" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">{lang === 'ar' ? 'المخزون *' : 'Stock *'}</label>
                            <input type="number" required value={v.quantity} onChange={(e) => updateVariant(index, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary outline-none" />
                          </div>
                          <div className="col-span-1 flex justify-center pb-1">
                            <button type="button" onClick={() => removeVariant(index)} className="text-gray-400 hover:text-red-500 transition">
                              <MinusCircle className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-red-700 transition"
                      >
                        <PlusCircle className="w-4 h-4" /> {lang === 'ar' ? 'إضافة مقاس آخر' : 'Add Variant'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-6">
                  <label className="text-sm font-medium text-gray-700">{lang === 'ar' ? 'صور المنتج (حتى 5 صور)' : 'Product Images (up to 5)'}</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className={`block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${lang === 'ar' ? 'file:ml-4' : 'file:mr-4'}`} />
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {imagePreviews.map((src, idx) => {
                        const imgSrc = src.startsWith('blob:') ? src : getImageUrl(src);
                        if (!imgSrc) return null;
                        return (
                          <img key={idx} src={imgSrc} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200 shrink-0" />
                        );
                      })}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" form="productForm" disabled={isCreating || isUpdating} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50">
                {isCreating || isUpdating ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ المنتج' : 'Save Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
