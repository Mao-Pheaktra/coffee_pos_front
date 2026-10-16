import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  ShoppingCart,
  PackageOpen,
  Coffee,
  RefreshCw,
  LayoutGrid,
  Users,
  ArrowLeft,
  MapPin,
  Plus,
  X,
} from "lucide-react";

import {
  getCashierProducts,
  getCustomerCategories,
} from "../../services/cashierService";

// =========================================================
// HELPERS
// =========================================================

const getProductId = (product) => {
  return (
    product?.product_id ??
    product?.productId ??
    product?.id ??
    product?.product?.id ??
    null
  );
};

const getCategoryId = (product) => {
  return (
    product?.category_id ??
    product?.categoryId ??
    product?.category?.id ??
    product?.category?.category_id ??
    null
  );
};

const getCategoryName = (product) => {
  if (!product) return "";

  if (typeof product.category === "object") {
    return (
      product.category?.name ||
      product.category?.title ||
      product.category?.category_name ||
      ""
    );
  }

  return (
    product.category_name ||
    product.categoryName ||
    product.category ||
    ""
  );
};

const getProductImage = (product) => {
  return (
    product?.image ||
    product?.image_url ||
    product?.imageUrl ||
    product?.photo ||
    null
  );
};

const isProductAvailable = (product) => {
  if (!product) return false;

  const availability =
    product.available ??
    product.is_available ??
    product.isAvailable ??
    product.active ??
    product.is_active;

  if (typeof availability === "boolean") {
    return availability;
  }

  if (typeof availability === "number") {
    return availability === 1;
  }

  if (typeof availability === "string") {
    const value = availability.trim().toLowerCase();

    if (
      [
        "1",
        "true",
        "yes",
        "active",
        "available",
        "in_stock",
        "in stock",
      ].includes(value)
    ) {
      return true;
    }

    if (
      [
        "0",
        "false",
        "no",
        "inactive",
        "unavailable",
        "sold_out",
        "sold out",
        "out_of_stock",
        "out of stock",
      ].includes(value)
    ) {
      return false;
    }
  }

  // If API does not provide availability,
  // assume returned products are available.
  return true;
};

// =========================================================
// CATALOG HEADER
// =========================================================

function CatalogHeader({
  tableId,
  guests,
  orderType,
  searchQuery,
  setSearchQuery,
  cartItemsCount,
  onViewCart,
  onBack,
  onClearSession,
}) {
  return (
    <div className="rounded-2xl border border-[#EDE6DA] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#EDE6DA] bg-[#FBF8F3] text-[#5A4E44] transition hover:bg-[#F0E9DD]"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-serif text-xl font-bold text-[#2A1B16]">
                New Order
              </h1>

              {orderType && (
                <span className="rounded-full bg-[#F0E9DD] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#5A4E44]">
                  {orderType.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#8C7F72]">
              {tableId && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {tableId}
                </span>
              )}

              {guests > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <div className="relative min-w-0 flex-1 sm:w-72">
           

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl border border-[#EDE6DA] bg-[#FBF8F3] pl-9 pr-9 text-xs font-medium text-[#2A1B16] outline-none transition placeholder:text-[#A69A8B] focus:border-[#B8823D] focus:ring-2 focus:ring-[#B8823D]/10"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#A69A8B] hover:text-[#2A1B16]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* CART */}
          <button
            type="button"
            onClick={onViewCart}
            className="relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2A1B16] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#1A100B]"
          >
            <ShoppingCart size={16} />

            <span>Ticket</span>

            {Number(cartItemsCount) > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B8823D] px-1.5 text-[10px] font-extrabold text-white">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* CLEAR */}
          {typeof onClearSession === "function" && (
            <button
              type="button"
              onClick={onClearSession}
              className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#EDE6DA] bg-white px-3 text-xs font-bold text-[#8C7F72] transition hover:border-[#E3C4BA] hover:bg-[#FBF0EE] hover:text-[#8A3524]"
              title="Clear session"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// CATEGORY BAR
// =========================================================

function CategoryBar({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  loading,
}) {
  const getCategoryCount = (categoryId) => {
    return products.filter((product) => {
      const productCategoryId = getCategoryId(product);

      return (
        String(productCategoryId) ===
        String(categoryId)
      );
    }).length;
  };

  return (
    <div className="rounded-2xl border border-[#EDE6DA] bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[#8C7F72]">
          <LayoutGrid size={14} />

          <span className="text-xs font-bold uppercase tracking-wider text-[#2A1B16]">
            Categories
          </span>
        </div>

        {loading && (
          <Loader2
            size={14}
            className="animate-spin text-[#A69A8B]"
          />
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* ALL ITEMS */}
        <button
          type="button"
          onClick={() => onSelectCategory("")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            !selectedCategory
              ? "bg-[#2A1B16] text-white shadow-sm"
              : "bg-[#FBF8F3] text-[#8C7F72] hover:bg-[#F0E9DD] hover:text-[#2A1B16]"
          }`}
        >
          <span>All Items</span>

          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
              !selectedCategory
                ? "bg-white/20 text-white"
                : "bg-[#EAE0D0] text-[#5A4E44]"
            }`}
          >
            {products.length}
          </span>
        </button>

        {/* CATEGORIES */}
        {categories.map((category) => {
          const categoryId =
            category?.id ??
            category?.category_id ??
            category?.categoryId;

          const categoryName =
            category?.name ||
            category?.title ||
            category?.category_name ||
            "Unnamed";

          if (categoryId === null || categoryId === undefined) {
            return null;
          }

          const isSelected =
            String(selectedCategory) ===
            String(categoryId);

          const count = getCategoryCount(categoryId);

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() =>
                onSelectCategory(categoryId)
              }
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-[#2A1B16] text-white shadow-sm"
                  : "bg-[#FBF8F3] text-[#8C7F72] hover:bg-[#F0E9DD] hover:text-[#2A1B16]"
              }`}
            >
              <span>{categoryName}</span>

              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#EAE0D0] text-[#5A4E44]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================
// PRODUCT CARD
// =========================================================

function ProductCard({
  product,
  quantity = 0,
  onAddToCart,
}) {
  const available = isProductAvailable(product);
  const price = Number(product?.price || 0);
  const image = getProductImage(product);
  const categoryName = getCategoryName(product);
  const productId = getProductId(product);

  const handleAdd = (e) => {
    e.stopPropagation();

    if (!available) {
      return;
    }

    if (!productId) {
      console.error(
        "Cannot add product because product ID is missing:",
        product
      );
      return;
    }

    const cartProduct = {
      ...product,
      id: productId,
      product_id: productId,
      price,
      quantity: 1,
    };

    console.log(
      "ADDING PRODUCT TO CART:",
      cartProduct
    );

    onAddToCart?.(cartProduct);
  };

  return (
    <div
      onClick={handleAdd}
      role="button"
      tabIndex={available ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleAdd(e);
        }
      }}
      aria-disabled={!available}
      className={`group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#F0E9DD] bg-[#FFFEFB] shadow-sm transition-all duration-300 ${
        available
          ? "cursor-pointer hover:-translate-y-1 hover:border-[#DFD4C2] hover:shadow-md"
          : "cursor-not-allowed opacity-60"
      }`}
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2A1B16]">
        {image ? (
          <img
            src={image}
            alt={product?.name || "Product"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8C7F72]">
            <Coffee size={36} strokeWidth={1.5} />
          </div>
        )}

        {categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {categoryName}
          </span>
        )}

        {quantity > 0 && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#B8823D] text-xs font-bold text-white shadow-sm tabular-nums">
            {quantity}
          </span>
        )}

        {!available && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* NAME */}
      <div className="px-4 pt-3">
        <h3 className="font-serif text-lg font-bold leading-snug tracking-tight text-[#2A1B16]">
          {product?.name || "Untitled Item"}
        </h3>
      </div>

      {/* SEPARATOR */}
      <div className="relative mx-4 mt-3 h-0 border-t border-dashed border-[#E4DBCB]">
        <span className="absolute -left-5.5 -top-2 h-4 w-4 rounded-full bg-[#F9F6F0]" />
        <span className="absolute -right-5.5 -top-2 h-4 w-4 rounded-full bg-[#F9F6F0]" />
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 pb-4 pt-3">
        <span className="font-serif text-lg font-bold tracking-tight text-[#B8823D] tabular-nums">
          ${price.toFixed(2)}
        </span>

        {available && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${
              product?.name || "item"
            } to ticket`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#2A1B16] text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#1A100B] active:scale-95"
          >
            <Plus
              size={18}
              strokeWidth={2.5}
            />
          </button>
        )}
      </div>
    </div>
  );
}

// =========================================================
// MAIN CATALOG PAGE
// =========================================================

export default function PosCatalogPage({
  selectedCategory,
  setSelectedCategory,
  cartItemsCount,
  cartQuantities = {},
  onViewCart,
  onAddToCart,
  onClearCart,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSession = location.state || {};

  // =========================================================
  // SESSION
  // =========================================================

  const [session, setSession] = useState({
    orderType:
      initialSession.orderType ||
      initialSession.type ||
      "DINE_IN",

    tableId:
      initialSession.tableId ||
      initialSession.table?.id ||
      initialSession.table?.table_id ||
      "",

    tableName:
      initialSession.table?.name ||
      initialSession.table?.table_number ||
      initialSession.table?.tableNumber ||
      initialSession.table?.number ||
      initialSession.tableId ||
      "",

    guests: Number(
      initialSession.guests ||
        initialSession.numberOfGuests ||
        initialSession.guestCount ||
        1
    ),
  });

  // =========================================================
  // STATE
  // =========================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [products, setProducts] = useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [productError, setProductError] =
    useState("");

  const [categoryError, setCategoryError] =
    useState("");

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response =
        await getCashierProducts();

      console.log(
        "========== CASHIER PRODUCT API =========="
      );

      console.log(
        "FULL RESPONSE:",
        response
      );

      console.log(
        "RESPONSE DATA:",
        response?.data
      );

      console.log(
        "IS ARRAY:",
        Array.isArray(response?.data)
      );

      let productList = [];

      /*
       * Axios:
       * response.data = {
       *   message: "...",
       *   data: [...]
       * }
       */

      if (
        Array.isArray(
          response?.data?.data
        )
      ) {
        productList =
          response.data.data;
      }

      /*
       * Sometimes service returns:
       * response.data = [...]
       */

      else if (
        Array.isArray(response?.data)
      ) {
        productList =
          response.data;
      }

      /*
       * Direct array
       */

      else if (
        Array.isArray(response)
      ) {
        productList =
          response;
      }

      /*
       * Other possible wrappers
       */

      else if (
        Array.isArray(
          response?.data?.products
        )
      ) {
        productList =
          response.data.products;
      }

      else if (
        Array.isArray(response?.products)
      ) {
        productList =
          response.products;
      }

      console.log(
        "PRODUCT COUNT:",
        productList.length
      );

      console.log(
        "PRODUCT LIST:",
        productList
      );

      /*
       * VERY IMPORTANT DEBUG
       * See category structure for every product.
       */
      productList.forEach(
        (product, index) => {
          console.log(
            `PRODUCT ${index}:`,
            {
              id: getProductId(product),
              name: product?.name,
              category_id:
                product?.category_id,
              categoryId:
                product?.categoryId,
              category:
                product?.category,
              categoryObject:
                typeof product?.category ===
                "object",
              resolvedCategoryId:
                getCategoryId(product),
              resolvedCategoryName:
                getCategoryName(product),
            }
          );
        }
      );

      console.log(
        "========================================="
      );

      setProducts(productList);
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setProductError(
        error?.response?.data?.message ||
          "Couldn't load the menu"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategoryError("");

      const response =
        await getCustomerCategories();

      console.log(
        "========== CATEGORY API =========="
      );

      console.log(
        "CATEGORY RESPONSE:",
        response
      );

      console.log(
        "CATEGORY RESPONSE DATA:",
        response?.data
      );

      let categoryList = [];

      /*
       * Axios response:
       *
       * response.data = {
       *   message: "...",
       *   data: [...]
       * }
       */

      if (
        Array.isArray(
          response?.data?.data
        )
      ) {
        categoryList =
          response.data.data;
      }

      /*
       * Axios response where
       * response.data itself is array
       */

      else if (
        Array.isArray(response?.data)
      ) {
        categoryList =
          response.data;
      }

      /*
       * Direct array
       */

      else if (
        Array.isArray(response)
      ) {
        categoryList =
          response;
      }

      console.log(
        "CATEGORY COUNT:",
        categoryList.length
      );

      console.log(
        "CATEGORY LIST:",
        categoryList
      );

      categoryList.forEach(
        (category, index) => {
          console.log(
            `CATEGORY ${index}:`,
            {
              id: category?.id,
              name: category?.name,
              title: category?.title,
              category_id:
                category?.category_id,
            }
          );
        }
      );

      console.log(
        "=================================="
      );

      setCategories(categoryList);
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      setCategoryError(
        error?.response?.data?.message ||
          "Couldn't load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    console.log(
      "========== PRODUCT FILTER =========="
    );

    console.log(
      "SELECTED CATEGORY:",
      selectedCategory
    );

    console.log(
      "SEARCH:",
      normalizedSearch
    );

    const result = products.filter(
      (product) => {
        const productCategoryId =
          getCategoryId(product);

        const productName =
          product?.name
            ?.toString()
            .toLowerCase() || "";

        const categoryName =
          getCategoryName(product)
            .toString()
            .toLowerCase();

        /*
         * No category selected
         * => show EVERY product
         */
        const matchesCategory =
          !selectedCategory ||
          String(productCategoryId) ===
            String(selectedCategory);

        /*
         * Search by product name OR category
         */
        const matchesSearch =
          !normalizedSearch ||
          productName.includes(
            normalizedSearch
          ) ||
          categoryName.includes(
            normalizedSearch
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );

    console.log(
      "FILTERED PRODUCT COUNT:",
      result.length
    );

    console.log(
      "FILTERED PRODUCTS:",
      result
    );

    console.log(
      "===================================="
    );

    return result;
  }, [
    products,
    selectedCategory,
    searchQuery,
  ]);

  // =========================================================
  // SELECTED CATEGORY NAME
  // =========================================================

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) {
      return "All Items";
    }

    const category =
      categories.find(
        (item) =>
          String(
            item?.id ??
              item?.category_id ??
              item?.categoryId
          ) === String(selectedCategory)
      );

    return (
      category?.name ||
      category?.title ||
      category?.category_name ||
      "Selected Category"
    );
  }, [
    categories,
    selectedCategory,
  ]);

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    if (
      session.orderType ===
      "TAKEAWAY"
    ) {
      navigate("/");
      return;
    }

    navigate("/tables");
  };

  // =========================================================
  // CLEAR SESSION
  // =========================================================

  const handleClearSession = () => {
    setSession({
      orderType: "",
      tableId: "",
      tableName: "",
      guests: 0,
    });

    if (typeof setSelectedCategory === "function") {
      setSelectedCategory("");
    }

    setSearchQuery("");

    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    if (typeof onClearCart === "function") {
      onClearCart();
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex min-w-0 flex-1 flex-col space-y-5 overflow-y-auto bg-[#F9F6F0] p-6 md:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <CatalogHeader
        tableId={
          session.tableName ||
          session.tableId
        }
        guests={session.guests}
        orderType={session.orderType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartItemsCount={cartItemsCount}
        onViewCart={onViewCart}
        onBack={handleBack}
        onClearSession={
          handleClearSession
        }
      />

      {/* =====================================================
          CATEGORY
      ===================================================== */}

      {!categoryError && (
        <CategoryBar
          categories={categories}
          products={products}
          selectedCategory={
            selectedCategory
          }
          onSelectCategory={
            setSelectedCategory
          }
          loading={
            loadingCategories
          }
        />
      )}

      {/* =====================================================
          CATEGORY ERROR
      ===================================================== */}

      {categoryError && (
        <div className="rounded-2xl border border-[#E3C4BA] bg-[#FBF0EE] p-3.5 text-xs font-semibold text-[#8A3524]">
          {categoryError}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loadingProducts && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2
            size={32}
            className="mb-3 animate-spin text-[#A69A8B]"
          />

          <p className="text-xs font-bold text-[#8C7F72]">
            Loading the menu...
          </p>
        </div>
      )}

      {/* =====================================================
          PRODUCT ERROR
      ===================================================== */}

      {!loadingProducts &&
        productError && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE6DA] bg-white py-16 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF0EE] text-[#8A3524]">
              <PackageOpen size={24} />
            </div>

            <p className="text-sm font-bold text-[#2A1B16]">
              {productError}
            </p>

            <p className="mt-1 text-xs text-[#8C7F72]">
              Check your connection and
              try again.
            </p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2A1B16] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1A100B]"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      {!loadingProducts &&
        !productError && (
          <div>
            {/* TITLE */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#2A1B16]">
                  {selectedCategoryName}
                </h2>

                <p className="mt-0.5 text-[11px] font-medium text-[#8C7F72]">
                  Tap any item to add it to
                  the ticket
                </p>
              </div>

              <span className="text-xs font-semibold text-[#8C7F72] tabular-nums">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>

            {/* EMPTY */}
            {filteredProducts.length ===
            0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE6DA] bg-white py-20 text-center shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF8F3] text-[#A69A8B]">
                  <Search size={22} />
                </div>

                <p className="text-sm font-bold text-[#2A1B16]">
                  No items found
                </p>

                <p className="mt-1 text-xs text-[#8C7F72]">
                  {searchQuery
                    ? `Nothing matches "${searchQuery}".`
                    : selectedCategory
                    ? "This category is empty right now."
                    : "No products are available right now."}
                </p>

                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory("")
                    }
                    className="mt-4 cursor-pointer rounded-xl bg-[#2A1B16] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1A100B]"
                  >
                    Show All Items
                  </button>
                )}
              </div>
            ) : (
              /* PRODUCTS */
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map(
                  (product, index) => {
                    const productId =
                      getProductId(product);

                    return (
                      <ProductCard
                        key={
                          productId ??
                          `${product?.name}-${index}`
                        }
                        product={product}
                        quantity={
                          productId
                            ? cartQuantities[
                                productId
                              ] || 0
                            : 0
                        }
                        onAddToCart={
                          onAddToCart
                        }
                      />
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}