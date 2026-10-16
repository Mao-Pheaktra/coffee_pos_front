import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, RefreshCw, MapPin, Navigation, ExternalLink } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import OrderHeader from "../../components/order/OrderHeader";
import OrderStatus from "../../components/order/OrderStatus";
import OrderSummary from "../../components/order/OrderSummary";

import { getCustomerOrder } from "../../services/orderService";

// Fix default Leaflet icon assets in React bundled builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Icons
const storeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-amber.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DeliveryMap = ({ storeLocation, deliveryLocation, addressName }) => {
  const centerLat = (storeLocation.lat + deliveryLocation.lat) / 2;
  const centerLng = (storeLocation.lng + deliveryLocation.lng) / 2;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeLocation.lat},${storeLocation.lng}&destination=${deliveryLocation.lat},${deliveryLocation.lng}&travelmode=driving`;

  return (
    <div className="bg-white border border-stone-200/80 shadow-xs rounded-2xl p-5 overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Delivery Location</h3>
            <p className="text-xs text-stone-500 line-clamp-1">{addressName || "Destination Address"}</p>
          </div>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 transition-colors"
        >
          <Navigation size={13} />
          <span>Directions</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="h-64 w-full rounded-xl overflow-hidden border border-stone-200/80 relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Store Location Marker */}
          <Marker position={[storeLocation.lat, storeLocation.lng]} icon={storeIcon}>
            <Popup>
              <div className="text-xs font-semibold text-stone-900">
                Cafe / Store Branch
              </div>
            </Popup>
          </Marker>

          {/* Delivery Destination Marker */}
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={customerIcon}>
            <Popup>
              <div className="text-xs font-semibold text-stone-900">
                Delivery Address
              </div>
            </Popup>
          </Marker>

          {/* Route Connection Line */}
          <Polyline
            positions={[
              [storeLocation.lat, storeLocation.lng],
              [deliveryLocation.lat, deliveryLocation.lng],
            ]}
            color="#b45309"
            weight={4}
            dashArray="6, 8"
            opacity={0.8}
          />
        </MapContainer>
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      setError("");

      const response = await getCustomerOrder(orderId);
      setOrder(response?.data?.data || response?.data || null);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      if (!isSilent) {
        setError(
          err.response?.data?.message || "Failed to load order status."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
          <Loader2 className="animate-spin text-stone-800" size={18} />
          <span>Loading your order status...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="text-center max-w-sm bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-red-600 font-semibold mb-4 text-sm">
            {error || "Order not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const status = order.status || "PENDING";

  const steps = [
    {
      title: "Order Placed",
      meta: "Your order has been placed",
      state: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
      ].includes(status)
        ? "done"
        : "pending",
    },
    {
      title: "Confirmed",
      meta: "Your order has been accepted",
      state: [
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
      ].includes(status)
        ? "done"
        : status === "PENDING"
        ? "current"
        : "pending",
    },
    {
      title: "Preparing",
      meta: "Kitchen is preparing your order",
      state: [
        "PREPARING",
        "READY",
        "COMPLETED",
      ].includes(status)
        ? "done"
        : status === "CONFIRMED"
        ? "current"
        : "pending",
    },
    {
      title: "Ready",
      meta: order.order_type === "DELIVERY" ? "Out for delivery" : "Ready for pickup/table",
      state: [
        "READY",
        "COMPLETED",
      ].includes(status)
        ? "done"
        : status === "PREPARING"
        ? "current"
        : "pending",
    },
    {
      title: "Completed",
      meta: status === "COMPLETED" ? "Order completed" : "Pending completion",
      state: status === "COMPLETED" ? "done" : "pending",
    },
  ];

  const cartItems = (order.order_items || order.orderItems || []).map(
    (item) => ({
      id: item.id,
      name: item.product?.name || "Product",
      quantity: item.quantity,
      price: Number(item.unit_price ?? item.price ?? 0),
      note: item.note,
      image: item.product?.image,
    })
  );

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const total = Number(order.total || 0);

  const payment = order.payments?.[0];

  // Coordinates (Uses values from backend response or falls back to standard Phnom Penh coordinates)
  const storeLocation = {
    lat: Number(order.store_lat || 11.5564),
    lng: Number(order.store_lng || 104.9282),
  };

  const deliveryLocation = {
    lat: Number(order.delivery_lat || 11.5621),
    lng: Number(order.delivery_lng || 104.9160),
  };

  return (
    <div className="min-h-screen w-full bg-stone-50">
      <div className="max-w-270 mx-auto px-6 py-10 pb-12 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400 font-medium">
            Auto-updating every 10s
          </span>
          <button
            type="button"
            onClick={() => fetchOrder(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Order Header */}
     

        {/* Interactive Map (Rendered when order type is DELIVERY) */}
        {order.order_type === "DELIVERY" && (
          <DeliveryMap
            storeLocation={storeLocation}
            deliveryLocation={deliveryLocation}
            addressName={order.delivery_address}
          />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-6 items-start">
          <OrderStatus steps={steps} />

          <OrderSummary
            items={cartItems}
            totals={{
              lines: [
                { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
                ...(discount > 0 ? [{ label: "Discount", value: `-$${discount.toFixed(2)}` }] : []),
                ...(deliveryFee > 0 ? [{ label: "Delivery Fee", value: `$${deliveryFee.toFixed(2)}` }] : []),
              ],
              grandTotal: `$${total.toFixed(2)}`,
            }}
            onGetHelp={() => console.log("Get help clicked")}
          />
        </div>

        {/* Payment Details */}
        {payment && (
          <div className="bg-white border border-stone-200/80 shadow-xs rounded-2xl p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-3">
              Payment Details
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-semibold text-stone-800">
                  {payment.payment_method?.name || "Online Payment"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span
                  className={`font-semibold ${
                    payment.status === "PAID"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {payment.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Amount Paid</span>
                <span className="font-semibold text-stone-900">
                  ${Number(payment.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;