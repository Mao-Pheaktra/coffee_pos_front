import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import {
  getAdminProductSummary,
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../../services/adminProductService'

import { getAdminCategories } from '../../services/adminCategoryService'
import UpdateProduct from '../../components/admin/UpdateProduct'
import ProductDetail from '../../components/admin/ProductDetail'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState({
    total_products: 0,
    available_products: 0,
    unavailable_products: 0,
  })

  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  })

  // View state: 'list' | 'detail' | 'form'
  const [viewMode, setViewMode] = useState('list')
  const [formMode, setFormMode] = useState('create')

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const [detailLoadingId, setDetailLoadingId] = useState(null)

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    status: 'AVAILABLE',
    image: null,
  })

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true)
      const response = await getAdminCategories()
      const categoryData = response?.data?.data || response?.data || []
      setCategories(Array.isArray(categoryData) ? categoryData : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories.')
    } finally {
      setCategoryLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const response = await getAdminProductSummary()
      setSummary(
        response?.data || {
          total_products: 0,
          available_products: 0,
          unavailable_products: 0,
        }
      )
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const categoryId = selectedCategory === 'All Products' ? '' : selectedCategory

      const response = await getAdminProducts({
        page: currentPage,
        perPage,
        search,
        categoryId,
      })

      const paginatedData = response?.data

      if (Array.isArray(paginatedData)) {
        setProducts(paginatedData)
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: paginatedData.length,
          total: paginatedData.length,
          from: paginatedData.length > 0 ? 1 : 0,
          to: paginatedData.length,
        })
      } else {
        setProducts(paginatedData?.data || [])
        setPagination({
          current_page: paginatedData?.current_page || 1,
          last_page: paginatedData?.last_page || 1,
          per_page: paginatedData?.per_page || perPage,
          total: paginatedData?.total || 0,
          from: paginatedData?.from || 0,
          to: paginatedData?.to || 0,
        })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchSummary()
  }, [])

  useEffect(() => {
    if (viewMode === 'list') {
      fetchProducts()
    }
  }, [currentPage, selectedCategory, search, viewMode])

  const resetForm = () => {
    setForm({
      category_id: '',
      name: '',
      description: '',
      price: '',
      status: 'AVAILABLE',
      image: null,
    })
    setSelectedProduct(null)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setViewProduct(null)
    resetForm()
  }

  const openCreatePage = () => {
    resetForm()
    setFormMode('create')
    setViewMode('form')
  }

  const openViewPage = async (product) => {
    try {
      setDetailLoadingId(product.id)
      const response = await getAdminProduct(product.id)
      setViewProduct(response?.data || product)
      setViewMode('detail')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to fetch product details.')
    } finally {
      setDetailLoadingId(null)
    }
  }

  const openEditPage = async (product) => {
    try {
      setDetailLoadingId(product.id)
      setSelectedProduct(product)
      const response = await getAdminProduct(product.id)
      const data = response?.data

      setForm({
        category_id: data?.category_id || data?.category?.id || '',
        name: data?.name || '',
        description: data?.description || '',
        price: data?.price || '',
        status: data?.status || 'AVAILABLE',
        image: data?.image || null,
      })
      setFormMode('edit')
      setViewMode('form')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to load product.')
    } finally {
      setDetailLoadingId(null)
    }
  }

 const handleInputChange = (e) => {
  const { name, value, files } = e.target

  if (name === 'image') {
    setForm((prev) => ({
      ...prev,
      image: files?.[0] || null,
    }))

    return
  }

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }))
}

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!form.category_id || !form.name.trim() || form.price === '') {
    alert('Please fill out all required fields.')
    return
  }

  console.log('FORM BEFORE SUBMIT:', form)
  console.log('IMAGE:', form.image)
  console.log('IS FILE:', form.image instanceof File)

  try {
    setSaving(true)

    if (formMode === 'create') {
      await createAdminProduct(form)
    } else {
      await updateAdminProduct(selectedProduct.id, form)
    }

    alert(
      formMode === 'create'
        ? 'Product created successfully.'
        : 'Product updated successfully.'
    )

    resetForm()
    setViewMode('list')

    await Promise.all([
      fetchProducts(),
      fetchSummary(),
    ])
  } catch (err) {
    console.error('Save product error:', err)
    console.error('Response:', err?.response?.data)

    const validationErrors = err?.response?.data?.errors

    if (validationErrors) {
      console.error('Validation errors:', validationErrors)

      const messages = Object.values(validationErrors)
        .flat()
        .join('\n')

      alert(messages)
    } else {
      alert(
        err?.response?.data?.message ||
        'Failed to save product.'
      )
    }
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return
    try {
      setDeletingId(product.id)
      await deleteAdminProduct(product.id)
      await Promise.all([fetchProducts(), fetchSummary()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

const handleToggleStatus = async (product) => {
  const newStatus =
    product.status === 'AVAILABLE'
      ? 'UNAVAILABLE'
      : 'AVAILABLE'

  try {
    setUpdatingStatusId(product.id)

    await updateAdminProduct(product.id, {
      status: newStatus,
    })

    await Promise.all([
      fetchProducts(),
      fetchSummary(),
    ])
  } catch (err) {
    alert(
      err?.response?.data?.message ||
      'Failed to update status.'
    )
  } finally {
    setUpdatingStatusId(null)
  }
}
  const categoryButtons = useMemo(
    () => [{ id: 'All Products', name: 'All Products' }, ...categories],
    [categories]
  )

  // Render Full Detail Page
  if (viewMode === 'detail') {
    return (
      <main className="flex-1 overflow-y-auto">
        <ProductDetail product={viewProduct} onBack={handleBackToList} />
      </main>
    )
  }

  // Render Full Form Page (Create or Edit)
  if (viewMode === 'form') {
    return (
      <main className="flex-1 overflow-y-auto">
        <UpdateProduct
          mode={formMode}
          form={form}
          categories={categories}
          saving={saving}
          onChange={handleInputChange}
          onBack={handleBackToList}
          onSubmit={handleSubmit}
        />
      </main>
    )
  }

  // Render Default Table View Page
  return (
    <main className="flex-1 p-8 space-y-6 overflow-y-auto  text-neutral-900">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products Inventory</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Manage your offerings, pricing, and status switch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-3 text-neutral-600" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-xs font-medium focus:outline-none focus:border-neutral-400 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={openCreatePage}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Products"
          value={summary.total_products}
          subtext="Active in catalog"
          icon={<Package size={16} />}
          loading={summaryLoading}
        />
        <MetricCard
          title="Total Available"
          value={summary.available_products}
          subtext="Ready for sale"
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          loading={summaryLoading}
        />
        <MetricCard
          title="Total Unavailable"
          value={summary.unavailable_products}
          subtext="Out of stock or hidden"
          icon={<XCircle size={16} className="text-neutral-400" />}
          loading={summaryLoading}
        />
      </div>

      <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryLoading ? (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 size={14} className="animate-spin" /> Loading categories...
            </div>
          ) : (
            categoryButtons.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setCurrentPage(1)
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-500">
                    <Loader2 size={16} className="animate-spin inline mr-2" /> Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 text-neutral-400">
                            <Package size={16} />
                          </div>
                        )}
                        <span className="font-bold text-neutral-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-md font-semibold text-[10px]">
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-neutral-900">
                      ${Number(p.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 ">
                      <StatusToggle
                        isAvailable={p.status === 'AVAILABLE'}
                        isUpdating={updatingStatusId === p.id}
                        onToggle={() => handleToggleStatus(p)}
                      />
                    </td>
                    <td className="py-3.5 text-left">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={detailLoadingId === p.id}
                          onClick={() => openViewPage(p)}
                          className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors disabled:opacity-50"
                          title="View Details"
                        >
                          {detailLoadingId === p.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={detailLoadingId === p.id}
                          onClick={() => openEditPage(p)}
                          className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors disabled:opacity-50"
                          title="Edit Product"
                        >
                          {detailLoadingId === p.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Edit size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p)}
                          className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deletingId === p.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            Showing <span className="font-semibold text-neutral-900">{pagination.from}</span> to{' '}
            <span className="font-semibold text-neutral-900">{pagination.to}</span> of{' '}
            <span className="font-semibold text-neutral-900">{pagination.total}</span> products
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.current_page <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50"
            >
              <ChevronLeft size={14} className="inline mr-1" /> Prev
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold">
              {pagination.current_page}
            </span>
            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page || loading}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.last_page))}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50"
            >
              Next <ChevronRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatusToggle({ isAvailable, isUpdating, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAvailable}
      disabled={isUpdating}
      onClick={onToggle}
      className={`inline-flex items-center gap-2.5 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none ${
        isAvailable ? 'text-emerald-700' : 'text-neutral-500'
      }`}
    >
      <div
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
          isAvailable ? 'bg-emerald-500' : 'bg-neutral-300'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
            isAvailable ? 'translate-x-4' : 'translate-x-0'
          }`}
        >
          {isUpdating && <Loader2 size={10} className="animate-spin text-neutral-500" />}
        </div>
      </div>
      <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
    </button>
  )
}

function MetricCard({ title, value, subtext, icon, loading }) {
  return (
    <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[20px] p-5 space-y-3 shadow-sm">
      <div className="flex justify-between items-center text-neutral-500 text-xs font-medium">
        <span>{title}</span>
        <span className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-lg">{icon}</span>
      </div>
      <div className="font-extrabold text-xl text-neutral-900">
        {loading ? <Loader2 size={20} className="animate-spin" /> : value}
      </div>
      <div className="text-[11px] font-medium text-neutral-500">{subtext}</div>
    </div>
  )
}