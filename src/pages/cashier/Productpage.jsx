import React, { useState } from 'react'
import PosCurrentOrderPage from '../../components/cashier/PosCurrentOrderPage'
import PosCatalogPage from '../../components/cashier/PosCatalogPage'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Productpage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Extract table and session data passed from NewSessionPage
  const sessionData = location.state || {
    tableId: 'Table 2',
    guests: 2,
  }

  const [selectedCategory, setSelectedCategory] = useState('Coffee')

  // Mobile view: catalog or cart
  const [mobileView, setMobileView] = useState('catalog')

  // Cart state
  const [cartItems, setCartItems] = useState([])

  /**
   * Add product to cart
   */
  const handleAddToCart = (product) => {
    // Do not add sold-out products
    if (product.status === 'Sold Out' || product.status === 'inactive') {
      return
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product_id === product.id
      )

      // Product already exists in cart
      if (existingIndex > -1) {
        const updated = [...prevItems]

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }

        return updated
      }

      // New product
      return [
        ...prevItems,
        {
          product_id: product.id,
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          modifiers: [],
        },
      ]
    })
  }

  /**
   * Change product quantity
   */
  const handleQuantityChange = (id, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta

            if (newQuantity <= 0) {
              return null
            }

            return {
              ...item,
              quantity: newQuantity,
            }
          }

          return item
        })
        .filter(Boolean)
    })
  }

  /**
   * Go to payment
   */
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Please add at least one product.')
      return
    }

    navigate('/payment', {
      state: {
        tableId: sessionData.tableId,
        guests: sessionData.guests,
        tableSessionId: sessionData.tableSessionId,
        cartItems: cartItems,
      },
    })
  }

  /**
   * Total number of products in cart
   */
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  return (
    <div
      className="
        flex
        h-screen
        bg-[#EFEEE3]
        text-[#3E2723]
        overflow-hidden
      "
    >

      {/* =========================
          Catalog Section
      ========================== */}
      <div
        className={`
          flex-1
          flex
          flex-col
          min-w-0
          ${
            mobileView === 'cart'
              ? 'hidden lg:flex'
              : 'flex'
          }
        `}
      >
        <PosCatalogPage
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          cartItemsCount={totalCartCount}
          onViewCart={() => setMobileView('cart')}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* =========================
          Current Order Sidebar
      ========================== */}
      <div
        className={`
          w-full
          lg:w-105
          shrink-0
          border-l
          border-[#D8CEC5]
          bg-[#FDFCF0]
          ${
            mobileView === 'catalog'
              ? 'hidden lg:flex'
              : 'flex'
          }
        `}
      >
        <PosCurrentOrderPage
          cartItems={cartItems}
          handleQuantityChange={handleQuantityChange}
          onBackToCatalog={() => setMobileView('catalog')}
          onSubmitOrder={handlePlaceOrder}
        />
      </div>

    </div>
  )
}