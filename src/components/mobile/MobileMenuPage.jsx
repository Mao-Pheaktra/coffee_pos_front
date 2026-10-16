import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Utensils,
  Bell,
  Search,
  Flame,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Check,
  ClipboardList,
} from 'lucide-react'

import { getCustomerProducts } from '../../services/productService'
import { getCustomerCategories } from '../../services/categoryService'
import { createCustomerTableOrder } from '../../services/tableService'

export default function MobileMenuPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // =========================================================
  // TABLE INFORMATION
  // =========================================================

  const [tableNumber, setTableNumber] = useState(
    searchParams.get('table') || localStorage.getItem('cafe_table') || ''
  )

  const [tableId, setTableId] = useState(
    searchParams.get('table_id') || localStorage.getItem('cafe_table_id') || ''
  )

  const [sessionId, setSessionId] = useState(
    searchParams.get('session_id') || localStorage.getItem('table_session_id') || ''
  )

  const [sessionCode, setSessionCode] = useState(
    searchParams.get('session_code') || localStorage.getItem('table_session_code') || ''
  )

  // =========================================================
  // DATA
  // =========================================================

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Products that were successfully ordered
  const [orderedItems, setOrderedItems] = useState({})

  // Product currently being ordered
  const [orderingProductId, setOrderingProductId] = useState(null)

  // =========================================================
  // READ TABLE INFORMATION
  // =========================================================

  useEffect(() => {
    const urlTable = searchParams.get('table')
    const urlTableId = searchParams.get('table_id')
    const urlSessionId = searchParams.get('session_id')
    const urlSessionCode = searchParams.get('session_code')

    if (urlTable) {
      setTableNumber(urlTable)
      localStorage.setItem('cafe_table', urlTable)
    }

    if (urlTableId) {
      setTableId(urlTableId)
      localStorage.setItem('cafe_table_id', urlTableId)
    }

    if (urlSessionId) {
      setSessionId(urlSessionId)
      localStorage.setItem('table_session_id', urlSessionId)
    }

    if (urlSessionCode) {
      setSessionCode(urlSessionCode)
      localStorage.setItem('table_session_code', urlSessionCode)
    }
  }, [searchParams])

  // =========================================================
  // FETCH MENU
  // =========================================================

  const fetchMenu = async () => {
    try {
      setLoading(true)
      setError('')

      const [categoriesResponse, productsResponse] = await Promise.all([
        getCustomerCategories(),
        getCustomerProducts(),
      ])

      const categoriesData = categoriesResponse?.data ?? categoriesResponse ?? []
      const productsData = productsResponse?.data ?? productsResponse ?? []

      const normalizedCategories = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : []

      const normalizedProducts = Array.isArray(productsData)
        ? productsData
        : Array.isArray(productsData?.data)
        ? productsData.data
        : []

      setCategories(normalizedCategories)
      setProducts(normalizedProducts)
    } catch (err) {
      console.error('Failed to load menu:', err)

      setError(
        err.response?.data?.message || err.message || 'Failed to load menu.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  // =========================================================
  // CATEGORY LIST
  // =========================================================

  const categoryList = useMemo(() => {
    const categoryNames = categories
      .map(
        (category) =>
          category.name || category.title || category.label || ''
      )
      .filter(Boolean)

    return ['All Items', ...categoryNames]
  }, [categories])

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category
    if (activeCategory && activeCategory !== 'All Items') {
      result = result.filter((product) => {
        const category =
          product.category || product.category_name || product.categoryName

        const categoryName =
          typeof category === 'object'
            ? category?.name || category?.title || category?.label || ''
            : category || ''

        return (
          String(categoryName).toLowerCase() ===
          String(activeCategory).toLowerCase()
        )
      })
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()

      result = result.filter((product) => {
        const name = product.name || ''
        const description = product.description || ''
        const category = product.category || product.category_name || ''

        const categoryName =
          typeof category === 'object'
            ? category?.name || category?.title || ''
            : category

        return (
          String(name).toLowerCase().includes(query) ||
          String(description).toLowerCase().includes(query) ||
          String(categoryName).toLowerCase().includes(query)
        )
      })
    }

    return result
  }, [products, activeCategory, searchQuery])

  // =========================================================
  // HELPERS
  // =========================================================

  const getProductCategory = (product) => {
    const category =
      product.category || product.category_name || product.categoryName

    if (typeof category === 'object') {
      return category?.name || category?.title || category?.label || ''
    }

    return category || ''
  }

  const getProductImage = (product) => {
    return (
      product.image ||
      product.image_url ||
      product.photo ||
      product.thumbnail ||
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400'
    )
  }

  const getProductPrice = (product) => {
    const price = Number(product.price) || 0
    return price.toFixed(2)
  }

  const getProductBadge = (product) => {
    if (product.badge) {
      return product.badge
    }

    if (product.is_popular || product.isPopular) {
      return 'Popular'
    }

    return null
  }

  // Helper check to verify if a product is in stock/active
  const isProductAvailable = (product) => {
    if (product.is_available === false || product.in_stock === false || product.status === 'unavailable') {
      return false
    }
    if (typeof product.stock === 'number' && product.stock <= 0) {
      return false
    }
    return true
  }

  // =========================================================
  // PRODUCT DETAILS
  // =========================================================

  const handleCardClick = (product) => {
    const categoryName = getProductCategory(product)

    navigate(`/product/${product.id}`, {
      state: {
        product,
        category: {
          label: categoryName,
        },
        tableNumber,
        tableId,
        sessionId,
        sessionCode,
      },
    })
  }

  // =========================================================
  // CREATE TABLE ORDER
  // =========================================================

  const handleOrderClick = async (event, product) => {
    event.stopPropagation()

    // Prevent duplicate click
    if (orderingProductId === product.id) {
      return
    }

    if (!sessionCode) {
      alert('Table session is missing. Please scan the table QR code again.')
      return
    }

    if (!isProductAvailable(product)) {
      alert(`Sorry, ${product.name} is currently out of stock or unavailable.`)
      return
    }

    try {
      setOrderingProductId(product.id)

      const payload = {
        session_code: sessionCode,
        order_type: 'DINE_IN',
        note: null,
        items: [
          {
            product_id: product.id,
            quantity: 1,
            note: null,
          },
        ],
      }

      console.log('CREATE TABLE ORDER PAYLOAD:', payload)

      const response = await createCustomerTableOrder(payload)

      console.log('TABLE ORDER RESPONSE:', response)

      // Mark only this product as ordered on success
      setOrderedItems((prev) => ({
        ...prev,
        [product.id]: true,
      }))
    } catch (err) {
      console.error('Failed to create table order:', err)
      console.error('SERVER RESPONSE:', err.response?.data)

      // Display the actual error message from backend server
      const serverMsg = err.response?.data?.message || 'Failed to create order.'
      alert(serverMsg)
    } finally {
      setOrderingProductId(null)
    }
  }

  // =========================================================
  // CALL STAFF
  // =========================================================

  const handleCallStaff = () => {
    alert(`Calling staff assistance for Table ${tableNumber || 'your table'}...`)
  }

  // =========================================================
  // MY ORDERS
  // =========================================================

  const handleMyOrders = () => {
    if (!sessionCode) {
      alert('Table session is missing. Please scan the QR code again.')
      return
    }

    navigate('/current', {
      state: {
        tableNumber,
        tableId,
        sessionId,
        sessionCode,
      },
    })
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Loader2 size={26} className="text-slate-800 animate-spin" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Loading Menu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Preparing available options for you...
          </p>
        </div>
      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Unable to Load Menu
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchMenu}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-md min-h-screen md:min-h-210 md:rounded-3xl bg-slate-50 md:border md:border-slate-200 shadow-xl overflow-hidden flex flex-col relative">

        {/* HEADER */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Utensils size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                Table {tableNumber || '—'}
              </h1>
              {sessionCode && (
                <p className="text-[10px] text-emerald-600 font-medium">
                  • Session active
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCallStaff}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Bell size={13} className="text-slate-600" />
            Call Staff
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">

          {/* SEARCH */}
          <div className="relative">
           
            <input
              type="text"
              placeholder="Search dishes, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-2xs"
            />
          </div>

          {/* CATEGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryList.map((category) => {
              const isActive = activeCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* HEADING */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {activeCategory}
            </h2>
            <span className="text-xs text-slate-500">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* PRODUCTS */}
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                No items found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for something else or change categories.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((product) => {
                const badge = getProductBadge(product)
                const image = getProductImage(product)
                const isAvailable = isProductAvailable(product)
                const isOrdered = !!orderedItems[product.id]
                const isOrdering = orderingProductId === product.id

                return (
                  <div
                    key={product.id}
                    onClick={() => handleCardClick(product)}
                    className={`bg-white border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group ${
                      !isAvailable ? 'opacity-60' : ''
                    }`}
                  >
                    {/* IMAGE */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {badge && isAvailable && (
                        <span className="absolute top-1 left-1 bg-slate-900/90 text-amber-400 p-0.5 rounded-full shadow-xs">
                          <Flame size={10} />
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {product.description ||
                          'Freshly prepared item from our kitchen.'}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          ${getProductPrice(product)}
                        </span>
                        {!isAvailable && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ORDER BUTTON */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        disabled={!isAvailable || isOrdered || isOrdering}
                        onClick={(e) => handleOrderClick(e, product)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                          !isAvailable
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : isOrdered
                            ? 'bg-emerald-600 text-white cursor-default'
                            : isOrdering
                            ? 'bg-slate-400 text-white cursor-wait'
                            : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white'
                        }`}
                      >
                        {!isAvailable ? (
                          <span>Unavailable</span>
                        ) : isOrdered ? (
                          <>
                            <Check size={14} className="stroke-3" />
                            <span>Ordered</span>
                          </>
                        ) : isOrdering ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Ordering...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={13} />
                            <span>Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* MY ORDERS BUTTON */}
        <button
          type="button"
          onClick={handleMyOrders}
          className="absolute bottom-4 right-4 z-20 w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
          aria-label="My Orders"
        >
          <ClipboardList size={22} />
        </button>

      </div>
    </div>
  )
}