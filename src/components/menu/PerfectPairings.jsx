import React from 'react'
import { Plus } from 'lucide-react'

const pairings = [
  {
    id: 1,
    name: 'Butter Croissant',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Pain au Chocolat',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&q=80&w=400',
  },
]

export default function PerfectPairings({ onAddPairing }) {
  return (
    <div className="mt-12">
      {/* Section Header */}
      <h3 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-bold text-[var(--color-text)] mb-6">
        Perfect Pairings
      </h3>

      {/* Grid of Pairings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {pairings.map((item) => (
          <div key={item.id} className="group flex flex-col">
            {/* Image Container with Floating Action Button */}
            <div className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Floating Add Button */}
              <button 
                type="button"
                onClick={() => onAddPairing && onAddPairing(item)}
                aria-label={`Add ${item.name}`}
                className="absolute bottom-3 right-3 w-9 h-9 bg-[var(--color-neutral)] text-[var(--color-text)] rounded-[var(--radius-pill)] flex items-center justify-center shadow-[var(--shadow-md)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-light)] transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Item Details */}
            <div className="mt-3">
              <h4 className="font-[family-name:var(--font-heading)] text-sm md:text-base font-semibold text-[var(--color-text)] leading-snug">
                {item.name}
              </h4>
              <p className="text-xs md:text-sm font-medium text-[var(--color-text-secondary)] mt-0.5">
                +${item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}