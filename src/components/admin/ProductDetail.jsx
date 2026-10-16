import React from 'react'
import { ArrowLeft, Package, CheckCircle2, XCircle, Tag, DollarSign, FileText } from 'lucide-react'

export default function ProductDetail({ product, onBack }) {
  if (!product) return null

  const isAvailable = product.status === 'AVAILABLE'

  return (
    <div className="w-full min-h-screen bg-neutral-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              Product Details
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              View complete information and status for this product
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <CheckCircle2 size={14} /> Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <XCircle size={14} /> Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Media Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-xs aspect-square object-cover rounded-2xl border border-neutral-100 shadow-sm"
              />
            ) : (
              <div className="w-full max-w-xs aspect-square rounded-2xl bg-neutral-50 flex flex-col items-center justify-center border border-dashed border-neutral-200 text-neutral-400 gap-2">
                <Package size={48} className="stroke-1" />
                <span className="text-xs font-medium">No Image Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div>
              <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Product Name
              </span>
              <h2 className="text-2xl font-bold text-neutral-900">
                {product.name}
              </h2>
            </div>

            <hr className="border-neutral-100" />

            {/* Grid Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-neutral-100 text-neutral-600 rounded-xl mt-0.5">
                  <Tag size={16} />
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                    Category
                  </span>
                  <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-neutral-100 text-neutral-600 rounded-xl mt-0.5">
                  <DollarSign size={16} />
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                    Price
                  </span>
                  <p className="text-xl font-extrabold text-neutral-900">
                    ${Number(product.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <FileText size={12} />
                <span>Description</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80">
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}