import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clock, MapPin, ShoppingBag, ArrowRight } from 'lucide-react'

export default function OrderSuccess() {
  const navigate = useNavigate()

  // Mock order details
  const orderData = {
    orderId: 'MC-84920',
    estimatedTime: '15 - 20 mins',
    fulfillmentType: 'Delivery',
    address: '123 Riverside Path, Sangkat Chaktomuk, Daun Penh, Phnom Penh',
    paymentMethod: 'KHQR (Paid)',
    items: [
      { name: 'Iced Caramel Macchiato', quantity: 1, price: 4.50 },
      { name: 'Butter Croissant', quantity: 1, price: 2.80 }
    ],
    total: 8.30
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-[family-name:var(--font-body)] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-[600px] w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 md:p-10 shadow-[var(--shadow-lg)] text-center">
        
        {/* Success Icon Badge */}
        <div className="w-16 h-16 bg-[var(--color-tertiary-light)] text-[var(--color-text-light)] rounded-[var(--radius-pill)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-md)]">
          <Check size={32} strokeWidth={3} />
        </div>

        {/* Heading */}
        <span className="inline-block px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-[var(--radius-pill)] text-xs font-semibold tracking-wider uppercase mb-2">
          Order Confirmed
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold text-[var(--color-primary-dark)] mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          We have received your order and our baristas are getting it ready.
        </p>

        {/* Order Meta Box */}
        <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 mb-6 text-left space-y-4">
          
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Order Reference</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{orderData.orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Estimated Time</p>
              <p className="text-sm font-bold text-[var(--color-tertiary-dark)] flex items-center gap-1 justify-end">
                <Clock size={14} /> {orderData.estimatedTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--color-primary)]">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Fulfillment ({orderData.fulfillmentType})</p>
              <p className="text-xs text-[var(--color-text)] mt-0.5">{orderData.address}</p>
            </div>
          </div>

        </div>

        {/* Ordered Items Summary */}
        <div className="text-left mb-8">
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Items Ordered
          </h4>
          <div className="space-y-2 border-t border-b border-[var(--color-border)] py-3">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-text)] font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 font-bold text-base text-[var(--color-primary)]">
            <span>Total Paid ({orderData.paymentMethod})</span>
            <span>${orderData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="flex-1 py-3.5 px-6 bg-[var(--color-primary)] text-[var(--color-text-light)] rounded-[var(--radius-pill)] font-semibold text-center hover:bg-[var(--color-primary-dark)] transition-all shadow-[var(--shadow-sm)] flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Order More Items
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="py-3.5 px-6 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-pill)] font-semibold text-center hover:bg-[var(--color-secondary-light)] transition-all flex items-center justify-center gap-2"
          >
            Back to Home <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  )
}