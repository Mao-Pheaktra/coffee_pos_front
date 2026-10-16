import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, FileText } from 'lucide-react'

export default function ShoppingBags() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [note, setNote] = useState('')

  // Load actual cart items and saved note from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cafe_cart')) || []
    const savedNote = localStorage.getItem('cafe_cart_note') || ''
    setCartItems(savedCart)
    setNote(savedNote)
  }, [])

  // Helper to update state and sync back to localStorage
  const updateLocalStorageAndState = (updatedItems) => {
    setCartItems(updatedItems)
    localStorage.setItem('cafe_cart', JSON.stringify(updatedItems))
  }

  // Handle order note changes
  const handleNoteChange = (e) => {
    const newNote = e.target.value
    setNote(newNote)
    localStorage.setItem('cafe_cart_note', newNote)
  }

  // Handle quantity adjustments
  const updateQuantity = (id, delta) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : null
      }
      return item
    }).filter(Boolean)

    updateLocalStorageAndState(updatedItems)
  }

  // Remove item from cart
  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id)
    updateLocalStorageAndState(updatedItems)
  }

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = cartItems.length > 0 ? 1.50 : 0.00
  const total = subtotal + (cartItems.length > 0 ? deliveryFee : 0)

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-[family-name:var(--font-body)] p-4 md:p-8">
      <div className="max-w-[800px] mx-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            type="button"
            onClick={() => navigate('/menu')}
            className="w-10 h-10 rounded-[var(--radius-pill)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-secondary-light)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-primary-dark)]">
            Your Cart
          </h1>

          <div className="w-10" /> {/* Spacer */}
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 text-center shadow-[var(--shadow-sm)] mt-10">
            <div className="w-16 h-16 bg-[var(--color-secondary-light)] text-[var(--color-primary)] rounded-[var(--radius-pill)] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Looks like you haven't added any delicious items to your cart yet.</p>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="px-8 py-3 bg-[var(--color-primary)] text-[var(--color-text-light)] rounded-[var(--radius-pill)] font-semibold hover:bg-[var(--color-primary-dark)] transition-all shadow-[var(--shadow-sm)] cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 gap-6">
            
            {/* Items List */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] space-y-6">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-4">
                Order Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-b-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-[var(--radius-lg)] object-cover border border-[var(--color-border)]"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[var(--color-text)]">{item.name}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.details}</p>
                      <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Modifier Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-secondary-light)] transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[var(--color-text)]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-secondary-light)] transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions / Note Field */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] space-y-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-primary)]" />
                <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-text)]">
                  Order Note / Special Instructions
                </h3>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={handleNoteChange}
                placeholder="E.g. Extra ice, no sugar, allergy warnings, or delivery directions..."
                className="w-full p-3.5 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-neutral)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
              />
            </div>

            {/* Bill Summary & Proceed Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] space-y-4">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-text)]">
                Payment Summary
              </h3>

              <div className="space-y-2 text-sm text-[var(--color-text-secondary)] border-b border-[var(--color-border)] pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-text)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-semibold text-[var(--color-text)]">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-base text-[var(--color-text)]">Total Amount</span>
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 py-4 bg-[var(--color-primary-dark)] text-[var(--color-text-light)] rounded-[var(--radius-pill)] font-semibold text-center hover:bg-[var(--color-primary)] transition-all shadow-[var(--shadow-md)] flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}