import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Package, Check, Loader2 } from 'lucide-react'

export default function UpdateProduct({
  mode = 'create',
  form = {},
  categories = [],
  saving = false,
  onChange,
  onBack,
  onSubmit,
}) {
  const [imagePreview, setImagePreview] = useState(null)

  // Sync existing image string or file object to imagePreview
  useEffect(() => {
    if (form.image) {
      if (typeof form.image === 'string') {
        setImagePreview(form.image)
      } else if (form.image instanceof File) {
        const objectUrl = URL.createObjectURL(form.image)
        setImagePreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
      }
    } else {
      setImagePreview(null)
    }
  }, [form.image])

  

  return (
    <div className="w-full min-h-screen bg-neutral-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {mode === 'create'
                ? 'Fill in the information to create a new catalog item'
                : 'Update the attributes and details for this existing product'}
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-neutral-200 bg-white rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <form id="product-form" onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Media / Image Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] block">
                Product Image
              </span>

              <div className="relative flex flex-col items-center justify-center w-full aspect-square bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-neutral-300 transition-colors overflow-hidden group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-neutral-400">
                    <Package size={40} className="stroke-1" />
                    <span className="text-xs font-medium text-neutral-600">
                      Upload media
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      PNG, JPG, or WEBP up to 5MB
                    </span>
                  </div>
                )}

                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium gap-1.5 backdrop-blur-[2px]">
                  <Upload size={18} />
                  <span>{imagePreview ? 'Change Image' : 'Select File'}</span>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={onChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <p className="text-[11px] text-neutral-400 text-center">
                Click or drag an image file onto the box above to change the preview.
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                General Information
              </h2>

              {/* Title Input */}
              <div>
                <label className="block text-neutral-700 font-semibold text-xs mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ''}
                  onChange={onChange}
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  className="w-full p-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
                  required
                />
              </div>

              {/* Category & Price Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-neutral-700 font-semibold text-xs mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id || ''}
                    onChange={onChange}
                    className="w-full p-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold text-xs mb-1.5">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price || ''}
                    onChange={onChange}
                    placeholder="0.00"
                    className="w-full p-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-neutral-700 font-semibold text-xs mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status || 'AVAILABLE'}
                  onChange={onChange}
                  className="w-full sm:w-1/2 p-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-neutral-700 font-semibold text-xs mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={form.description || ''}
                  onChange={onChange}
                  placeholder="Provide a detailed description of the product features..."
                  className="w-full p-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}