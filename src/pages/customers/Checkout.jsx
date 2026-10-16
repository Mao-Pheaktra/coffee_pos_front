import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Loader2, 
  X, 
  Phone, 
  ShoppingBag,
  Banknote
} from "lucide-react";

import { getCustomerPaymentMethods } from "../../services/paymentMethodService";
import { createCustomerOrder, createCustomerPayment } from "../../services/orderService";

const BRAND_CONFIG = {
  aba: {
    bgImage: "url('https://media.licdn.com/dms/image/v2/C511BAQE43uwzlw9sdA/company-background_10000/company-background_10000/0/1583937648820/aba_bank_cover?e=2147483647&v=beta&t=rnMxccM_NLzUWqC6GtJfCihfIgbqGZIhbr7XUn2l49w')",
    activeBorder: "border-[#005c8a]",
    badgeBg: "bg-[#005c8a] text-white",
  },
  acleda: {
    bgImage: "url('https://media.licdn.com/dms/image/v2/C561BAQEgSXkOQuNT7Q/company-background_10000/company-background_10000/0/1609729771255/acledabankplc_cover?e=2147483647&v=beta&t=TzzbcSIi7zC9Ndo2tbjtDzVDZacO8lsLFuVbUZWZ4qs')",
    activeBorder: "border-[#1b365d]",
    badgeBg: "bg-[#1b365d] text-white",
  },
  bakong: {
    bgImage: "url('https://upload.wikimedia.org/wikipedia/commons/b/bb/KHQR_Logo.png')",
    activeBorder: "border-[#8cc63f]",
    badgeBg: "bg-[#8cc63f] text-black",
  },
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  // State
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [discount] = useState(0);
  const [orderNote] = useState("");

  const [createdOrder, setCreatedOrder] = useState(null);
  const [createdPayment, setCreatedPayment] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [orderType, setOrderType] = useState("DINE_IN");

  const deliveryFee = 1;

  // Load Cart & Session Data
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cafe_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? parsed : parsed?.items || []);
      }
      setOrderType(localStorage.getItem("order_type") || "DINE_IN");
    } catch (err) {
      console.error("Failed to load checkout data:", err);
    }
  }, []);

  // Load Payment Methods
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getCustomerPaymentMethods();
        setPaymentMethods(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
        setError(err.response?.data?.message || "Failed to load payment methods.");
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []);

  // Price Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - Number(discount) + deliveryFee);
  }, [subtotal, discount, deliveryFee]);

  // Handle clicking a payment method
  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setError("");

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number first before selecting payment.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      // Create Customer Order
      const orderResponse = await createCustomerOrder({
        table_session_id: null,
        order_source: "E_ORDER",
        order_type: "DELIVERY",
        customer_phone: phoneNumber,
        discount: Number(discount),
        delivery_fee: Number(deliveryFee),
        note: orderNote || null,
        items: cartItems.map((item) => ({
          product_id: item.id || item.product_id,
          quantity: Number(item.quantity),
          note: item.note || null,
        })),
      });

      const order = orderResponse?.data;
      if (!order) throw new Error("Order creation failed.");

      setCreatedOrder(order);
      localStorage.setItem("last_order_id", String(order.id));

      const isCod = method.name.toLowerCase().includes("cash");

      if (isCod) {
        // Cash on Delivery flow: Skip QR, clear cart, and finish placement
        localStorage.removeItem("cafe_cart");
        setIsPaid(true);
      } else {
        // Online Payment flow: Create payment and launch QR Modal
        const paymentResponse = await createCustomerPayment({
          order_id: order.id,
          payment_method_id: method.id,
          amount: order.total,
        });

        const payment = paymentResponse?.data;
        if (!payment) throw new Error("Payment initialization failed.");
        
        setCreatedPayment(payment);
        setShowQrModal(true);
      }
    } catch (err) {
      console.error("Payment setup failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to create order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSimulateSuccess = () => {
    setIsPaid(true);
    setShowQrModal(false);
    localStorage.removeItem("cafe_cart");
  };

  const handleViewOrder = () => {
    if (!createdOrder?.id) return;
    navigate(`/order_tracking/${createdOrder.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-xs text-stone-600">
          <Loader2 size={18} className="animate-spin text-amber-700" />
          <span className="text-sm font-medium">Preparing checkout...</span>
        </div>
      </div>
    );
  }

  const qrImageUrl = createdPayment?.qr_code_url || selectedMethod?.qr_image_url || null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/shoppingbags")}
            className="w-9 h-9 rounded-full border border-stone-200/80 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold tracking-tight text-stone-900">Checkout</h1>
            <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
              {orderType.replace("_", " ")}
            </p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-8 shadow-sm space-y-8">
          
          {/* Order Summary */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-amber-700" />
                <h2 className="font-semibold text-base tracking-tight text-stone-900">Order Summary</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 font-medium text-stone-600">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-stone-500">Your shopping bag is empty.</p>
                <button
                  type="button"
                  onClick={() => navigate("/menu")}
                  className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-4"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between py-3 text-sm">
                      <div className="pr-4">
                        <p className="font-medium text-stone-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-stone-900">
                        ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-stone-800 font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-medium">-${Number(discount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-stone-800 font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-stone-100 text-sm font-semibold text-stone-900">
                    <span>Total</span>
                    <span className="text-lg text-amber-700 font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <hr className="border-stone-100" />

          {/* Phone Input */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-stone-900">Phone Number</h2>
                  <p className="text-[11px] text-stone-400">Required for order verification</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                Required
              </span>
            </div>

            <div className="relative pt-1">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 012 345 678"
                disabled={isPaid}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:bg-white transition-colors disabled:opacity-60"
              />
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Payment Methods */}
          <section className="space-y-3">
            <h2 className="font-semibold text-sm tracking-tight text-stone-900">
              Select Payment Method
            </h2>

            {paymentMethods.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No payment methods available.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod?.id === method.id;
                  const nameLower = method.name.toLowerCase();
                  const isCod = nameLower.includes("cash");

                  const brandKey = Object.keys(BRAND_CONFIG).find((key) =>
                    nameLower.includes(key)
                  );
                  const brand = BRAND_CONFIG[brandKey];

                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={placingOrder || isPaid}
                      onClick={() => handleSelectMethod(method)}
                      style={{
                        backgroundImage: brand?.bgImage || "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className={`relative overflow-hidden p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? brand?.activeBorder || "border-amber-700 bg-amber-50/40 ring-2 ring-amber-700/20"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      } disabled:opacity-50`}
                    >
                      {brand?.bgImage && (
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />
                      )}

                      <div className="relative z-10">
                        <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                          {isCod ? "Cash on Delivery" : method.name}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {isCod
                            ? `Pay cash on arrival • Total: $${total.toFixed(2)}`
                            : `Tap to open KHQR & pay $${total.toFixed(2)}`}
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-2">
                        {placingOrder && isSelected ? (
                          <Loader2 size={18} className="animate-spin text-amber-700" />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? brand?.badgeBg || "border-amber-700 bg-amber-700 text-white"
                                : "border-stone-300 bg-white/90 text-stone-700"
                            }`}
                          >
                            {isCod ? <Banknote size={15} /> : <QrCode size={15} />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Confirmed Order Status Box */}
          {isPaid && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 text-sm">Order Confirmed</p>
                  <p className="text-xs text-emerald-700">
                    {selectedMethod?.name.toLowerCase().includes("cash")
                      ? "Payment Method: Cash on Delivery"
                      : `Paid via ${selectedMethod?.name}`}
                  </p>
                </div>
              </div>

              <div className="border-t border-emerald-200/60 pt-3 space-y-1.5 text-xs text-emerald-800">
                <div className="flex justify-between">
                  <span>Order Reference</span>
                  <span className="font-mono font-medium">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-semibold">${Number(createdOrder?.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleViewOrder}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-xs"
              >
                Track Order
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 pt-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encrypted & secure order processing</span>
          </div>

        </div>
      </main>

      {/* QR Code Payment Modal (Online Payments Only) */}
      {showQrModal && createdOrder && createdPayment && selectedMethod && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative">
            
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                {selectedMethod.name} KHQR
              </span>
              <h3 className="font-bold text-lg text-stone-900 mt-2">Scan to Pay</h3>
              <p className="text-xs text-stone-400">Order #{createdOrder.order_number}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-xs w-48 h-48 flex items-center justify-center overflow-hidden">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={140} className="text-stone-900" />
                )}
              </div>
              <span className="text-[10px] text-stone-400 mt-2 font-mono tracking-wide">
                KHQR-{createdPayment.id}
              </span>
            </div>

            <div className="text-center">
              <p className="text-xs text-stone-400">Total Amount</p>
              <p className="text-2xl font-bold text-stone-900">${Number(createdOrder.total).toFixed(2)}</p>
            </div>

            <button
              type="button"
              onClick={handleSimulateSuccess}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Simulate Successful Payment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}