import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Coffee,
  CupSoda,
  Cake,
  Utensils,
  Sparkles,
  ShoppingBag,
  Flame,
  Apple,
  Croissant,
  Pizza,
  IceCream,
  Wine,
  Package,
  Save,
} from 'lucide-react'

import {
  getAdminCategories,
  getAdminCategorySummary,
  getAdminCategory,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../../services/adminCategoryService'

// ======================================================
// CATEGORY ICON HELPER
// ======================================================

const getCategoryIcon = (category) => {
  const identifier = String(
    category?.icon ||
      category?.slug ||
      category?.name ||
      ''
  ).toLowerCase()

  if (
    identifier.includes('coffee') ||
    identifier.includes('espresso') ||
    identifier.includes('brew')
  ) {
    return <Coffee className="w-4 h-4 text-amber-700" />
  }

  if (
    identifier.includes('drink') ||
    identifier.includes('beverage') ||
    identifier.includes('tea') ||
    identifier.includes('boba')
  ) {
    return <CupSoda className="w-4 h-4 text-sky-600" />
  }

  if (
    identifier.includes('dessert') ||
    identifier.includes('cake') ||
    identifier.includes('sweet')
  ) {
    return <Cake className="w-4 h-4 text-pink-600" />
  }

  if (
    identifier.includes('bakery') ||
    identifier.includes('pastry') ||
    identifier.includes('bread')
  ) {
    return <Croissant className="w-4 h-4 text-amber-600" />
  }

  if (
    identifier.includes('food') ||
    identifier.includes('meal') ||
    identifier.includes('dish')
  ) {
    return <Utensils className="w-4 h-4 text-stone-600" />
  }

  if (
    identifier.includes('pizza') ||
    identifier.includes('fast')
  ) {
    return <Pizza className="w-4 h-4 text-orange-600" />
  }

  if (
    identifier.includes('ice') ||
    identifier.includes('cream')
  ) {
    return <IceCream className="w-4 h-4 text-indigo-500" />
  }

  if (
    identifier.includes('fruit') ||
    identifier.includes('healthy')
  ) {
    return <Apple className="w-4 h-4 text-emerald-600" />
  }

  if (
    identifier.includes('wine') ||
    identifier.includes('alcohol') ||
    identifier.includes('bar')
  ) {
    return <Wine className="w-4 h-4 text-purple-600" />
  }

  if (
    identifier.includes('hot') ||
    identifier.includes('special') ||
    identifier.includes('combo')
  ) {
    return <Flame className="w-4 h-4 text-rose-500" />
  }

  if (
    identifier.includes('new') ||
    identifier.includes('featured')
  ) {
    return <Sparkles className="w-4 h-4 text-amber-500" />
  }

  if (
    identifier.includes('merch') ||
    identifier.includes('goods')
  ) {
    return <ShoppingBag className="w-4 h-4 text-teal-600" />
  }

  return <Package className="w-4 h-4 text-stone-500" />
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Categories() {
  // Data
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState({
    total_categories: 0,
    active_categories: 0,
    inactive_categories: 0,
  })

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  // Loading States
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)

  // Errors & Selections
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [viewingCategory, setViewingCategory] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
  })

  // Fetch Summary Data
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const response = await getAdminCategorySummary()
      const data = response?.data || response

      setSummary({
        total_categories: Number(data?.total_categories || 0),
        active_categories: Number(data?.active_categories || 0),
        inactive_categories: Number(data?.inactive_categories || 0),
      })
    } catch (err) {
      console.error('Failed to fetch category summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  // Fetch Categories List
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getAdminCategories({
        page,
        perPage,
        search,
        status: selectedStatus,
      })

      const paginationData = response?.data || response

      if (Array.isArray(paginationData)) {
        setCategories(paginationData)
      } else {
        setCategories(
          Array.isArray(paginationData?.data) ? paginationData.data : []
        )
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setError(
        err?.response?.data?.message || 'Failed to load categories.'
      )
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories()
    }, 300)

    return () => clearTimeout(timer)
  }, [page, search, selectedStatus])

  // Handlers
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'active',
    })
    setError('')
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      setError('')

      await createAdminCategory({
        name: formData.name,
        slug: formData.slug || null,
        description: formData.description || null,
        status: formData.status,
      })

      setIsCreateOpen(false)
      await Promise.all([fetchCategories(), fetchSummary()])
    } catch (err) {
      console.error('Failed to create category:', err)
      const validationErrors = err?.response?.data?.errors
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]
        alert(Array.isArray(firstError) ? firstError[0] : 'Validation failed.')
      } else {
        alert(err?.response?.data?.message || 'Failed to create category.')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleOpenEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      status:
        String(category?.status || 'active').toLowerCase() === 'inactive'
          ? 'inactive'
          : 'active',
    })
    setError('')
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editingCategory?.id) return

    try {
      setSubmitLoading(true)
      setError('')

      await updateAdminCategory(editingCategory.id, {
        name: formData.name,
        slug: formData.slug || null,
        description: formData.description || null,
        status: formData.status,
      })

      setEditingCategory(null)
      await Promise.all([fetchCategories(), fetchSummary()])
    } catch (err) {
      console.error('Failed to update category:', err)
      const validationErrors = err?.response?.data?.errors
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]
        alert(Array.isArray(firstError) ? firstError[0] : 'Validation failed.')
      } else {
        alert(err?.response?.data?.message || 'Failed to update category.')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    )
    if (!confirmed) return

    try {
      setDeleteLoading(true)
      setDeleteId(category.id)
      setError('')

      await deleteAdminCategory(category.id)
      await Promise.all([fetchCategories(), fetchSummary()])
    } catch (err) {
      console.error('Failed to delete category:', err)
      alert(err?.response?.data?.message || 'Failed to delete category.')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  const handleOpenView = async (category) => {
    try {
      setViewLoading(true)
      setViewingCategory(category)

      const response = await getAdminCategory(category.id)
      setViewingCategory(response?.data || response || category)
    } catch (err) {
      console.error('Failed to fetch category details:', err)
    } finally {
      setViewLoading(false)
    }
  }

  const handleNameChange = (value) => {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generatedSlug,
    }))
  }

  const getCategoryStatus = (category) => {
    const status = String(category?.status || 'active').toLowerCase()
    return status === 'inactive' ? 'INACTIVE' : 'ACTIVE'
  }

  const getProductCount = (category) => {
    if (category?.products_count !== undefined && category?.products_count !== null) {
      return category.products_count
    }
    if (category?.productsCount !== undefined && category?.productsCount !== null) {
      return category.productsCount
    }
    if (Array.isArray(category?.products)) {
      return category.products.length
    }
    if (category?.product_count !== undefined && category?.product_count !== null) {
      return category.product_count
    }
    return 0
  }

  return (
    <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto  text-stone-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Categories
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Organize and manage your product menu classifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <X size={16} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-xs font-medium">
            <span>Total Categories</span>
            <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-stone-900">
            {summaryLoading ? (
              <Loader2 size={20} className="animate-spin text-stone-400" />
            ) : (
              summary.total_categories
            )}
          </div>
          <p className="text-xs text-stone-400">All product classifications</p>
        </div>

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-xs font-medium">
            <span>Active Categories</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-stone-900">
            {summaryLoading ? (
              <Loader2 size={20} className="animate-spin text-stone-400" />
            ) : (
              summary.active_categories
            )}
          </div>
          <p className="text-xs text-emerald-600 font-medium">Visible on store menu</p>
        </div>

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-xs font-medium">
            <span>Inactive Categories</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-stone-900">
            {summaryLoading ? (
              <Loader2 size={20} className="animate-spin text-stone-400" />
            ) : (
              summary.inactive_categories
            )}
          </div>
          <p className="text-xs text-rose-600 font-medium">Hidden from store menu</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
           
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-lg">
            {[
              { label: 'All', value: '' },
              { label: 'ACTIVE', value: 'active' },
              { label: 'INACTIVE', value: 'inactive' },
            ].map((status) => (
              <button
                key={status.value || 'all'}
                type="button"
                onClick={() => {
                  setSelectedStatus(status.value)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedStatus === status.value
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE DATA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 text-stone-400 text-[11px] font-semibold tracking-wider uppercase">
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Products</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="flex justify-center items-center gap-2 text-stone-400">
                      <Loader2 size={18} className="animate-spin text-stone-500" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-stone-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const status = getCategoryStatus(category)
                  const isActive =
                    String(category?.status || '').toLowerCase() === 'active'

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-stone-50/60 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-stone-100/80 border border-stone-200/60 flex items-center justify-center shrink-0">
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-900 text-sm block">
                              {category.name}
                            </span>
                            {category.slug && (
                              <span className="text-[11px] text-stone-400 font-mono">
                                /{category.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-stone-600 font-semibold">
                        {getProductCount(category)} items
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-left">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenView(category)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            type="button"
                            disabled={deleteLoading && deleteId === category.id}
                            onClick={() => handleDelete(category)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading && deleteId === category.id ? (
                              <Loader2 size={15} className="animate-spin text-rose-600" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 bg-stone-50/30">
          <div>
            Showing{' '}
            <span className="font-semibold text-stone-800">
              {categories.length > 0 ? (page - 1) * perPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-stone-800">
              {(page - 1) * perPage + categories.length}
            </span>{' '}
            entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className={`p-1.5 rounded-lg border border-stone-200 transition-colors ${
                page === 1
                  ? 'text-stone-300 border-stone-100 cursor-not-allowed'
                  : 'text-stone-600 hover:bg-white hover:border-stone-300 cursor-pointer'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg">
              Page {page}
            </span>

            <button
              type="button"
              disabled={categories.length < perPage}
              onClick={() => setPage((current) => current + 1)}
              className={`p-1.5 rounded-lg border border-stone-200 transition-colors ${
                categories.length < perPage
                  ? 'text-stone-300 border-stone-100 cursor-not-allowed'
                  : 'text-stone-600 hover:bg-white hover:border-stone-300 cursor-pointer'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  {getCategoryIcon(viewingCategory)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {viewingCategory.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    /{viewingCategory.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>

            {viewLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-stone-400 uppercase text-[10px] font-bold block mb-1">
                    Description
                  </span>
                  <p className="text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100">
                    {viewingCategory.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block mb-1">
                      Status
                    </span>
                    <span className="font-semibold text-stone-800">
                      {getCategoryStatus(viewingCategory)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block mb-1">
                      Total Products
                    </span>
                    <span className="font-semibold text-stone-800">
                      {getProductCount(viewingCategory)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingCategory(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="text-base font-semibold text-stone-900">
                Add New Category
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cold Brews"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="cold-brews"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Category details..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-white"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="text-base font-semibold text-stone-900">
                Edit Category
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-stone-400 hover:text-stone-600"
              > 
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-white"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Update Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}