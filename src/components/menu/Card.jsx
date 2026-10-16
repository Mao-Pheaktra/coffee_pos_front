import React, { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Eye, Plus } from "lucide-react";
import {
  addFavorite,
  removeFavorite,
    getFavorites,
} from "../../services/favoriteService";

const CART_KEY = "cafe_cart";

const Card = ({ product, category }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // ========================================
// Toggle Favorite
// ========================================
const handleToggleFavorite = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  if (favoriteLoading) return;

  try {
    setFavoriteLoading(true);

    if (isLiked) {
      await removeFavorite(product.id);
      setIsLiked(false);
    } else {
      await addFavorite(product.id);
      setIsLiked(true);
    }

    // Notify other components if needed
    window.dispatchEvent(new Event("favoritesUpdated"));
  } catch (error) {
    console.error("Failed to update favorite:", error);

    if (error.response?.status === 401) {
      navigate("/login");
    }
  } finally {
    setFavoriteLoading(false);
  }
};
  // ========================================
  // Add product to cart
  // ========================================
  const handleAddToCart = (e) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    const existingCart =
      JSON.parse(localStorage.getItem(CART_KEY)) || [];

    const existingItem = existingCart.find(
      (item) => Number(item.id) === Number(product.id)
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        Number(item.id) === Number(product.id)
          ? {
              ...item,
              quantity: Number(item.quantity || 1) + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          description: product.description,
          details: product.description,
          quantity: 1,
          note: null,
        },
      ];
    }

    // Save to the same cart used by Shopping Bag
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(updatedCart)
    );

    // Notify Navbar
    window.dispatchEvent(
      new Event("shoppingBagUpdated")
    );

  } catch (error) {
    console.error("Failed to add product to cart:", error);
  }
};

  // ========================================
  // View product
  // ========================================
  const handleViewProduct = () => {
    navigate(`/menu/${product.id}`, {
      state: {
        product,
        category,
      },
    });
  };

  const isAvailable = product?.status === "AVAILABLE" || !product?.status;


  useEffect(() => {
  const loadFavoriteStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await getFavorites();

      const favorites = response?.data || [];

      const exists = favorites.some(
        (favorite) =>
          Number(favorite.product_id) === Number(product.id)
      );

      setIsLiked(exists);
    } catch (error) {
      console.error(
        "Failed to load favorite status:",
        error
      );
    }
  };

  loadFavoriteStatus();
}, [product.id]);
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/70 bg-[#faf8f5] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/50">
      
      {/* ========================================
          Product Image & Badges
      ======================================== */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
        <img
          src={product?.image}
          alt={product?.name || "Product"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/product-placeholder.jpg";
          }}
        />

        {/* Top-Left Heart Icon (Replaces Number Badge) */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#241a15]/70 text-white backdrop-blur-md transition-all hover:bg-[#241a15] hover:scale-110 cursor-pointer shadow-sm"
          aria-label="Toggle favorite"
        >
          <Heart
            size={15}
            className={`transition-colors ${
              isLiked ? "fill-rose-500 text-rose-500" : "text-white"
            }`}
          />
        </button>

        {/* Availability Badge */}
        {!isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
            Unavailable
          </span>
        )}
      </div>

      {/* ========================================
          Product Information
      ======================================== */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <button
            type="button"
            onClick={handleViewProduct}
            className="text-left font-bold text-stone-900 text-xl tracking-tight hover:text-amber-800 transition-colors cursor-pointer"
          >
            {product?.name}
          </button>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500 min-h-9">
            {product?.description || "No description available."}
          </p>

          {/* Color Indicator Dots */}
          <div className="my-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#eee7de]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6c4b0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4a3429]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#cfc5bb]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#b8ad9e]" />
          </div>
        </div>

        {/* ========================================
            Price, Rating & Actions
        ======================================== */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
          
          {/* Price & Star Rating */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-stone-900">
              ${Number(product?.price || 0).toFixed(2)}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-stone-400">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{product?.rating || "4.8"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View Button */}
            <button
              type="button"
              onClick={handleViewProduct}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-200/70 px-3 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-300/80 cursor-pointer"
            >
              <Eye size={14} />
              <span>View</span>
            </button>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isAvailable
                  ? "bg-[#36241c] text-white hover:bg-[#241712] cursor-pointer"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
              aria-label="Add to cart"
            >
              <Plus size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Card;