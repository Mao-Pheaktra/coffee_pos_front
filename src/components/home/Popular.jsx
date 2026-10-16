import React, { useEffect, useState } from "react";
import { Coffee, Star, Plus, Check } from "lucide-react";
import { getCustomerProducts } from "../../services/productService";

const roastColors = [
  "#F0E4D7",
  "#D5C0A8",
  "#5A3A34",
  "#3E2723",
  "#2B1A17",
];

const RoastDots = ({ level = 3 }) => (
  <div className="flex items-center gap-1">
    {roastColors.map((color, index) => (
      <span
        key={index}
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: color,
          opacity: index < level ? 1 : 0.25,
        }}
      />
    ))}
  </div>
);

const Popular = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track products that were recently added
  const [addedProducts, setAddedProducts] = useState([]);

  // ========================================
  // Fetch Products
  // ========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCustomerProducts();

        const data = response.data || [];

        // Show only 4 products
        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch popular products:", err);

        setError("Failed to load popular products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ========================================
  // Add Product To Shopping Bag
  // ========================================
  const handleAddToBag = (product) => {
    try {
      // Get existing bag
     const existingBag =
  JSON.parse(localStorage.getItem("cafe_cart")) || [];
      // Check if product already exists
      const existingProductIndex = existingBag.findIndex(
        (item) => Number(item.id) === Number(product.id)
      );

      let updatedBag;

      if (existingProductIndex !== -1) {
        // Increase quantity
        updatedBag = [...existingBag];

        updatedBag[existingProductIndex] = {
          ...updatedBag[existingProductIndex],
          quantity:
            Number(updatedBag[existingProductIndex].quantity || 1) + 1,
        };
      } else {
        // Add new product
        updatedBag = [
          ...existingBag,
          {
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            image: product.image,
            quantity: 1,
          },
        ];
      }

      // Save bag
          localStorage.setItem(
      "cafe_cart",
      JSON.stringify(updatedBag)
    );

      // Tell other components that the bag changed
      window.dispatchEvent(new Event("shoppingBagUpdated"));

      // Show success state
      setAddedProducts((prev) => [...prev, product.id]);

      // Return button to normal after 1 second
      setTimeout(() => {
        setAddedProducts((prev) =>
          prev.filter((id) => id !== product.id)
        );
      }, 1000);
    } catch (err) {
      console.error("Failed to add product to shopping bag:", err);
    }
  };

  // ========================================
  // Loading
  // ========================================
  if (loading) {
    return (
      <section className="bg-[#F1F0E4]">
        <div className="max-w-300 mx-auto px-6 lg:px-10 py-16">
          <p className="text-sm text-[#6F6864]">
            Loading popular products...
          </p>
        </div>
      </section>
    );
  }

  // ========================================
  // Error
  // ========================================
  if (error) {
    return (
      <section className="bg-[#F1F0E4]">
        <div className="max-w-300 mx-auto px-6 lg:px-10 py-16">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  // ========================================
  // Empty
  // ========================================
  if (products.length === 0) {
    return (
      <section className="bg-[#F1F0E4]">
        <div className="max-w-300 mx-auto px-6 lg:px-10 py-16">
          <p className="text-sm text-[#6F6864]">
            No popular products available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F1F0E4]">
      <div className="max-w-300 mx-auto px-6 lg:px-10 py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#4A5D4E] mb-2">
            Best sellers
          </p>

          <h2 className="text-[#2B2422]">
            Popular this month
          </h2>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const isAdded = addedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-[#FDFCF0] border border-[#DBDBCF] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-40 flex items-center justify-center bg-linear-to-br from-[#E6D5C3] to-[#5A3A34] overflow-hidden">

                  {/* Rank */}
                  <span className="absolute top-3 left-3 z-10 bg-[#2B1A17] text-white text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center">
                    {index + 1}
                  </span>

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Coffee
                      size={40}
                      className="text-white"
                    />
                  )}
                </div>

                {/* Product Information */}
                <div className="p-5">

                  <h4 className="text-[#2B2422] mb-1">
                    {product.name}
                  </h4>

                  <p className="text-sm text-[#6F6864] line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Roast Dots */}
                  <RoastDots level={3} />

                  {/* Price + Rating + Add */}
                  <div className="flex items-center justify-between mt-4">

                    <div className="flex items-baseline gap-2">

                      <span className="text-lg font-bold text-[#2B2422]">
                        ${Number(product.price).toFixed(2)}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-[#8C8782]">
                        <Star
                          size={12}
                          className="fill-[#D5C0A8] text-[#D5C0A8]"
                        />
                        4.8
                      </span>

                    </div>

                    {/* Add To Bag */}
                    <button
                      type="button"
                      aria-label={
                        isAdded
                          ? `${product.name} added to shopping bag`
                          : `Add ${product.name} to shopping bag`
                      }
                      onClick={() => handleAddToBag(product)}
                      className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition-all ${
                        isAdded
                          ? "bg-[#4A5D4E] scale-105"
                          : "bg-[#3E2723] hover:bg-[#2B1A17] hover:scale-105"
                      }`}
                    >
                      {isAdded ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Popular;