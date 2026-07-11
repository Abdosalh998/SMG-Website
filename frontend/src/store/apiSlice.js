import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1', // Using localhost for dev
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Product', 'Category', 'Brand', 'Order', 'Settings', 'Shipping', 'FAQ', 'Legal', 'SocialMedia'],
  endpoints: (builder) => ({
    // PRODUCTS
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (data) => ({ url: '/products', method: 'POST', body: data }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    // CATEGORIES
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({ url: '/categories', method: 'POST', body: data }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({ url: `/categories/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),

    // BRANDS
    getBrands: builder.query({
      query: () => '/brands',
      providesTags: ['Brand'],
    }),
    createBrand: builder.mutation({
      query: (data) => ({ url: '/brands', method: 'POST', body: data }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: builder.mutation({
      query: ({ id, data }) => ({ url: `/brands/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({ url: `/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Brand'],
    }),

    // ORDERS
    getOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    getDashboardStats: builder.query({
      query: () => '/orders/stats',
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order', 'Product'],
    }),

    // SETTINGS
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({ url: '/settings', method: 'PUT', body: data }),
      invalidatesTags: ['Settings'],
    }),

    // SHIPPING
    getShippings: builder.query({
      query: (params) => ({ url: '/shipping', params }),
      providesTags: ['Shipping'],
    }),
    createShipping: builder.mutation({
      query: (data) => ({ url: '/shipping', method: 'POST', body: data }),
      invalidatesTags: ['Shipping'],
    }),
    updateShipping: builder.mutation({
      query: ({ id, data }) => ({ url: `/shipping/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Shipping'],
    }),
    deleteShipping: builder.mutation({
      query: (id) => ({ url: `/shipping/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Shipping'],
    }),

    // FAQ
    getFAQs: builder.query({
      query: (params) => ({ url: '/faq', params }),
      providesTags: ['FAQ'],
    }),
    createFAQ: builder.mutation({
      query: (data) => ({ url: '/faq', method: 'POST', body: data }),
      invalidatesTags: ['FAQ'],
    }),
    updateFAQ: builder.mutation({
      query: ({ id, data }) => ({ url: `/faq/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['FAQ'],
    }),
    deleteFAQ: builder.mutation({
      query: (id) => ({ url: `/faq/${id}`, method: 'DELETE' }),
      invalidatesTags: ['FAQ'],
    }),
    reorderFAQs: builder.mutation({
      query: (data) => ({ url: '/faq/reorder', method: 'PUT', body: data }),
      invalidatesTags: ['FAQ'],
    }),

    // LEGAL PAGES
    getLegalPage: builder.query({
      query: (slug) => `/legal/${slug}`,
      providesTags: ['Legal'],
    }),
    getLegalPages: builder.query({
      query: () => '/legal',
      providesTags: ['Legal'],
    }),
    updateLegalPage: builder.mutation({
      query: ({ slug, data }) => ({ url: `/legal/${slug}`, method: 'PUT', body: data }),
      invalidatesTags: ['Legal'],
    }),

    // SOCIAL MEDIA
    getSocialMedia: builder.query({
      query: () => '/social-media',
      providesTags: ['SocialMedia'],
    }),
    getActiveSocialMedia: builder.query({
      query: () => '/social-media/active',
      providesTags: ['SocialMedia'],
    }),
    updateSocialMedia: builder.mutation({
      query: ({ platform, data }) => ({ url: `/social-media/${platform}`, method: 'PUT', body: data }),
      invalidatesTags: ['SocialMedia'],
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,

  useGetOrdersQuery,
  useGetDashboardStatsQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,

  useGetSettingsQuery,
  useUpdateSettingsMutation,

  useGetShippingsQuery,
  useCreateShippingMutation,
  useUpdateShippingMutation,
  useDeleteShippingMutation,

  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useReorderFAQsMutation,

  useGetLegalPageQuery,
  useGetLegalPagesQuery,
  useUpdateLegalPageMutation,

  useGetSocialMediaQuery,
  useGetActiveSocialMediaQuery,
  useUpdateSocialMediaMutation
} = apiSlice;
