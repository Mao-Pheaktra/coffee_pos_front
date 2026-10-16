import React, { useMemo } from "react";
import {
  Check,
  Printer,
  Mail,
  Wifi,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReceiptPage({ onNewOrder }) {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // RECEIPT DATA FROM PAYMENT PAGE
  // =========================================================

  const receiptData = location.state || {};

  console.log("RECEIPT DATA:", receiptData);

  // =========================================================
  // ORDER
  // =========================================================

  const order = receiptData.order || null;

  const orderId =
    receiptData.orderId ||
    order?.id ||
    order?.order_id ||
    order?.orderId ||
    null;

  // =========================================================
  // ITEMS
  // =========================================================

  const items = Array.isArray(receiptData.items)
    ? receiptData.items
    : Array.isArray(order?.items)
    ? order.items
    : [];

  // =========================================================
  // ORDER TYPE
  // =========================================================

  const orderType =
    receiptData.orderType ||
    order?.order_type ||
    order?.orderType ||
    "DINE_IN";

  const displayOrderType =
    orderType === "DINE_IN"
      ? "Dine In"
      : orderType === "TAKEAWAY"
      ? "Takeaway"
      : orderType === "DELIVERY"
      ? "Delivery"
      : orderType || "Not Selected";

  // =========================================================
  // TABLE
  // =========================================================

  const tableId =
    receiptData.tableId ||
    receiptData.table?.id ||
    receiptData.table?.table_id ||
    order?.table_id ||
    null;

  const tableName =
    receiptData.tableName ||
    receiptData.table?.name ||
    receiptData.table?.table_number ||
    receiptData.table?.tableNumber ||
    order?.table?.name ||
    tableId ||
    "Unassigned";

  // =========================================================
  // GUESTS
  // =========================================================

  const guests = Number(
    receiptData.guests ||
      receiptData.numberOfGuests ||
      receiptData.guestCount ||
      order?.guests ||
      order?.guest_count ||
      1
  );

  // =========================================================
  // SESSION
  // =========================================================

  const sessionId =
    receiptData.sessionId ||
    receiptData.tableSessionId ||
    order?.table_session_id ||
    order?.session_id ||
    null;

  // =========================================================
  // PAYMENT
  // =========================================================

  const paymentMethod =
    receiptData.paymentMethod?.name ||
    receiptData.payment_method?.name ||
    order?.payment?.payment_method?.name ||
    order?.payment_method?.name ||
    "Unknown";

  const amountReceived = Number(receiptData.amountReceived || 0);

  // =========================================================
  // TOTAL
  // =========================================================

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = Number(
        item?.price || item?.product?.price || 0
      );

      const quantity = Number(item?.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [items]);

  const discount = Number(receiptData.discount || order?.discount || 0);

  const deliveryFee = Number(
    receiptData.deliveryFee || order?.delivery_fee || 0
  );

  const totalDue = useMemo(() => {
    if (
      receiptData.totalDue !== undefined &&
      receiptData.totalDue !== null
    ) {
      return Number(receiptData.totalDue);
    }

    if (order?.total !== undefined && order?.total !== null) {
      return Number(order.total);
    }

    if (
      order?.total_amount !== undefined &&
      order?.total_amount !== null
    ) {
      return Number(order.total_amount);
    }

    return Math.max(0, subtotal - discount + deliveryFee);
  }, [receiptData.totalDue, order, subtotal, discount, deliveryFee]);

  const changeToReturn = Math.max(0, amountReceived - totalDue);

  // =========================================================
  // DATE / TIME
  // =========================================================

  const orderDate =
    order?.created_at || order?.createdAt || receiptData.createdAt || new Date();

  const formattedDate = new Date(orderDate).toLocaleDateString();

  const formattedTime = new Date(orderDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // =========================================================
  // CASHIER
  // =========================================================

  const cashierName =
    receiptData.cashier?.name ||
    receiptData.cashierName ||
    order?.cashier?.name ||
    order?.user?.name ||
    "Cashier";

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleDoneAndNewOrder = () => {
    if (typeof onNewOrder === "function") {
      onNewOrder();
    }
    navigate("/order");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEReceipt = () => {
    alert("E-receipt feature will be connected to email/SMS later.");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-stone-900 select-none print:p-0 print:bg-white print:min-h-0">
      {/* =====================================================
          RECEIPT CARD
      ====================================================== */}
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl shadow-lg overflow-hidden p-8 space-y-6 relative print:border-none print:shadow-none print:max-w-full print:w-full print:p-0 print:rounded-none">
        {/* TOP DECORATIVE LINE */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-100 print:hidden" />

        {/* HEADER */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 mx-auto flex items-center justify-center font-bold text-xs print:border-stone-300">
            ☕
          </div>

          <div>
            <h1 className="font-bold text-base text-stone-900">
              Plouk Café
            </h1>
            <p className="text-[11px] text-stone-500 font-medium uppercase tracking-wider">
              CASHIER RECEIPT
            </p>
          </div>

          <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
            <p>124 Espresso Lane, District 1</p>
            <p>hello@artisancafe.com</p>
          </div>
        </div>

        {/* ORDER META */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-stone-200 text-xs print:border-stone-300">
          <div>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              Order #
            </span>
            <div className="font-bold text-stone-900 mt-0.5">
              {orderId ? `#${orderId}` : "N/A"}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              Date / Time
            </span>
            <div className="font-semibold text-stone-900 mt-0.5">
              {formattedDate}
              <br />
              {formattedTime}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              Order Type
            </span>
            <div className="font-semibold text-stone-900 mt-0.5">
              {displayOrderType}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              Table
            </span>
            <div className="font-semibold text-stone-900 mt-0.5">
              {orderType === "DINE_IN" ? tableName : "N/A"}
            </div>
          </div>

          {orderType === "DINE_IN" && (
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                Guests
              </span>
              <div className="font-semibold text-stone-900 mt-0.5">
                {guests}
              </div>
            </div>
          )}

          {sessionId && (
            <div className="text-right">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                Session
              </span>
              <div className="font-semibold text-stone-900 mt-0.5">
                #{sessionId}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              Cashier
            </span>
            <div className="font-semibold text-stone-900 mt-0.5">
              {cashierName}
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="space-y-3 text-xs">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
              <p>No products in this order.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const price = Number(
                item?.price || item?.product?.price || 0
              );
              const quantity = Number(item?.quantity || 0);
              const itemTotal = price * quantity;
              const productName =
                item?.name || item?.product?.name || "Product";
              const productId =
                item?.product_id ||
                item?.productId ||
                item?.product?.id ||
                index;

              return (
                <div
                  key={productId}
                  className="flex justify-between items-start gap-4"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-stone-900">
                      {quantity}x {productName}
                    </span>
                    <div className="text-[11px] text-stone-500">
                      <div>${price.toFixed(2)} each</div>
                      {item?.note && <div>Note: {item.note}</div>}
                    </div>
                  </div>

                  <span className="font-bold text-stone-900 shrink-0">
                    ${itemTotal.toFixed(2)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* CALCULATIONS */}
        <div className="pt-4 border-t border-dashed border-stone-200 space-y-2 text-xs print:border-stone-300">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span>
            <span className="font-bold text-stone-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-stone-500">
            <span>Discount</span>
            <span className="font-bold text-stone-900">
              -${discount.toFixed(2)}
            </span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-stone-500">
              <span>Delivery Fee</span>
              <span className="font-bold text-stone-900">
                ${deliveryFee.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-stone-200 print:border-stone-300">
            <span className="font-bold text-sm text-stone-900">
              Total
            </span>
            <span className="font-black text-2xl text-stone-900">
              ${totalDue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PAYMENT VERIFICATION */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 space-y-2 text-xs print:border-stone-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              <span>💳</span>
              <span>Paid via {paymentMethod}</span>
            </div>
            <Check size={16} className="text-emerald-600 print:hidden" />
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-stone-500">
              Payment Status
            </span>
            <span className="font-bold text-emerald-700">PAID</span>
          </div>
        </div>

        {/* RECEIVED / CHANGE */}
        {amountReceived > 0 && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs print:border-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">
                Amount Received
              </span>
              <span className="font-bold text-stone-900">
                ${amountReceived.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-500">Change</span>
              <span className="font-bold text-emerald-700">
                ${changeToReturn.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs font-bold text-stone-900">
            Thank you for your visit!
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[11px] text-stone-500 font-medium print:border-stone-300">
            <Wifi size={12} />
            Guest Wifi: ArtisanGuest
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTION BUTTONS (Hidden during print / save as PDF)
      ====================================================== */}
      <div className="w-full max-w-md mt-6 space-y-3 print:hidden">
        {/* DONE & NEW ORDER */}
        <button
          type="button"
          onClick={handleDoneAndNewOrder}
          className="w-full py-4 bg-[#1f1611] hover:bg-[#362922] text-white rounded-full text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check size={16} />
          Done & New Order
        </button>

        {/* SECONDARY ACTIONS */}
        <div className="grid grid-cols-3 gap-3">
          {/* BACK */}
          <button
            type="button"
            onClick={handleBack}
            className="py-3 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {/* PRINT / SAVE AS PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            Print
          </button>

          {/* E-RECEIPT */}
          <button
            type="button"
            onClick={handleEReceipt}
            className="py-3 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Mail size={15} />
            e-Receipt
          </button>
        </div>
      </div>
    </div>
  );
}