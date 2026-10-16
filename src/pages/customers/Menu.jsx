import React, { useEffect, useState } from "react";
import {
  Search,
  Coffee,
  Croissant,
  EggFried,
  GlassWater,
  Utensils,
  X,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Card from "../../components/menu/Card";
import { getCustomerCategories } from "../../services/categoryService";
import { getCustomerProducts } from "../../services/productService";

// ========================================
// Category Icons
// ========================================
const iconMap = {
  coffee: Coffee,
  croissant: Croissant,
  egg: EggFried,
  water: GlassWater,
  default: Utensils,
};

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase();

  if (name === "coffee") return Coffee;
  if (name === "bakery") return Croissant;
  if (name === "desserts") return EggFried;

  if (
    name === "non-coffee" ||
    name === "tea" ||
    name === "smoothies" ||
    name === "frappe" ||
    name === "juice"
  ) {
    return GlassWater;
  }

  return iconMap.default;
};

// ========================================
// Menu Component
// ========================================
const Menu = () => {

   const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // Fetch Categories + Products
  // ========================================
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoryResponse, productResponse] = await Promise.all([
          getCustomerCategories(),
          getCustomerProducts(),
        ]);

        const categoryData = categoryResponse.data || [];
        const productData = productResponse.data || [];

        setCategories(categoryData);
        setProducts(productData);

       if (categoryData.length > 0) {
  const categoryFromUrl = searchParams.get("category");

  const matchedCategory = categoryData.find(
    (category) =>
      category.name?.toLowerCase() ===
      categoryFromUrl?.toLowerCase()
  );

  if (matchedCategory) {
    setActiveId(matchedCategory.id);
  } else {
    setActiveId(categoryData[0].id);
  }
}
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // ========================================
  // Active Category & Filtered Items
  // ========================================
  const activeCategory =
    categories.find((category) => category.id === activeId) || categories[0];

  const filteredItems = products.filter((product) => {
    const matchesCategory = product.category_id === activeId;
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(query.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // ========================================
  // Loading State
  // ========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 text-stone-500 font-medium">
          <Loader2 className="animate-spin text-amber-700" size={20} />
          <span>Loading menu...</span>
        </div>
      </div>
    );
  }

  // ========================================
  // Error State
  // ========================================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl text-center max-w-md">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ========================================
  // Empty State (No Categories)
  // ========================================
  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500 font-medium">
        No menu categories available.
      </div>
    );
  }

  return (
    <section className="bg-stone-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
        
        {/* ========================================
            Sidebar Navigation
        ======================================== */}
        <aside className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs lg:sticky lg:top-8">
          
          {/* Search Input */}
          <div className="relative mb-5">
           
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-9 py-2.5 px-10 bg-stone-100/70 border border-transparent rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-600/40 focus:ring-2 focus:ring-amber-600/10 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-md"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category List */}
          <h4 className="text-[11px] uppercase tracking-wider font-bold text-stone-400 mb-2.5 px-2">
            Categories
          </h4>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((category) => {
              const isActive = category.id === activeId;
              const IconComponent = getCategoryIcon(category.name);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveId(category.id);
                    setQuery("");
                  }}
                  className={`shrink-0 lg:w-full inline-flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-amber-800 text-white shadow-xs"
                      : "bg-transparent text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                  }`}
                >
                  <IconComponent size={17} className={isActive ? "text-amber-200" : "text-stone-400"} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ========================================
            Main Content
        ======================================== */}
        <main>
          {/* Category Header */}
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-amber-700 mb-1">
                Menu
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {activeCategory?.name || "Products"}
              </h1>
            </div>

            <span className="text-xs font-semibold text-stone-500 bg-stone-200/60 px-2.5 py-1 rounded-full">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Products Grid / Empty State */}
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center shadow-xs">
              <p className="text-stone-500 text-sm">
                No items match <span className="font-semibold text-stone-800">"{query}"</span> in{" "}
                <span className="font-semibold text-stone-800">{activeCategory?.name || "this category"}</span>.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 inline-flex items-center text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-4 cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredItems.map((product) => (
                <Card
                  key={product.id}
                  product={product}
                  category={activeCategory}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default Menu;