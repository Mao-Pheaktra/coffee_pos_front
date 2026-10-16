import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Flame,
} from "lucide-react";

import PerfectPairings from "./PerfectPairings";
import { getCustomerProduct } from "../../services/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // Fetch Product
  // ========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCustomerProduct(id);

        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);

        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ========================================
  // Quantity
  // ========================================
  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  // ========================================
  // Loading
  // ========================================
  if (loading) {
    return (
      <section className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 font-medium">
          Loading product...
        </p>
      </section>
    );
  }

  // ========================================
  // Error
  // ========================================
  if (error) {
    return (
      <section className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">
            Something went wrong
          </h1>

          <p className="text-stone-500 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-2 bg-amber-700 text-white rounded-full px-6 py-3 font-semibold hover:bg-amber-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </div>
      </section>
    );
  }

  // ========================================
  // Product Not Found
  // ========================================
  if (!product) {
    return (
      <section className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">
            Product not found
          </h1>

          <p className="text-stone-500 mb-6">
            We couldn't find this product.
          </p>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-2 bg-amber-700 text-white rounded-full px-6 py-3 font-semibold hover:bg-amber-800"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </div>
      </section>
    );
  }

  // ========================================
  // Total
  // ========================================
  const total = Number(product.price) * quantity;

  // ========================================
  // Order Now
  // ========================================
  const handleOrderNow = () => {
    const orderItem = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      quantity: quantity,
      image: product.image,
      category: product.category,

      // Save customer note
      note: note.trim() || null,
    };

    // CheckoutPage reads from cafe_cart
    localStorage.setItem(
      "cafe_cart",
      JSON.stringify([orderItem])
    );

    // Make sure checkout uses the desired order type
    localStorage.setItem("order_type", "DELIVERY");

    navigate("/checkout");
  };

  return (
    <section className="min-h-screen bg-stone-50">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-12 lg:py-10">

        {/* ========================================
            Back
        ======================================== */}
        <button
          type="button"
          onClick={() => navigate("/menu")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-amber-700 mb-8 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to Menu
        </button>

        {/* ========================================
            Product
        ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mt-5">

          {/* ========================================
              Image
          ======================================== */}
          <div className="relative h-[380px] md:h-[480px] rounded-3xl overflow-hidden bg-stone-200 shadow-sm">

            {product.badge && (
              <span className="absolute z-10 top-5 left-5 inline-flex items-center gap-2 bg-white/90 text-stone-800 text-xs font-semibold rounded-full px-3 py-2 shadow-sm">
                <Flame size={14} />
                {product.badge}
              </span>
            )}

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "/images/product-placeholder.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                No image available
              </div>
            )}
          </div>

          {/* ========================================
              Product Information
          ======================================== */}
          <div className="pt-2">

            {/* Category */}
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700 mb-4">
              {product.category?.name || "Menu"}
            </p>

            {/* Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-2xl font-bold text-amber-700 mb-6">
              ${Number(product.price).toFixed(2)}
            </div>

            {/* Description */}
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="border-t border-stone-200 mb-7" />

            {/* ========================================
                Quantity
            ======================================== */}
            <div className="mb-7">
              <p className="text-sm font-semibold text-stone-900 mb-3">
                Quantity
              </p>

              <div className="inline-flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Minus size={16} />
                </button>

                <span className="w-12 text-center font-semibold text-stone-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Plus size={16} />
                </button>

              </div>
            </div>

            {/* ========================================
                Note
            ======================================== */}
            <div className="mb-7">
              <label
                htmlFor="product-note"
                className="block text-sm font-semibold text-stone-900 mb-3"
              >
                Note
              </label>

              <textarea
                id="product-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Example: 30% sugar, less ice, no whipped cream..."
                rows={3}
                maxLength={300}
                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition"
              />

              <div className="text-right text-xs text-stone-400 mt-1">
                {note.length}/300
              </div>
            </div>

            {/* ========================================
                Total
            ======================================== */}
            <div className="flex items-center justify-between mb-5 border-t border-stone-200 pt-5">
              <span className="text-sm text-stone-500">
                Total
              </span>

              <span className="text-2xl font-bold text-stone-900">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* ========================================
                Order Now
            ======================================== */}
            <button
              type="button"
              onClick={handleOrderNow}
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 text-white rounded-full px-7 py-4 font-semibold shadow-md hover:bg-amber-800 transition-colors"
            >
              <ShoppingBag size={18} />
              Order Now — ${total.toFixed(2)}
            </button>

            <p className="text-center text-xs text-stone-400 mt-4">
              Freshly prepared after you place your order.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================
          Perfect Pairings
      ======================================== */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pb-20">
        <PerfectPairings />
      </div>
    </section>
  );
};

export default ProductDetail;