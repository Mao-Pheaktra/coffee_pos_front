import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  Check,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Calculator from "./Calculator";

import {
  getCashierPaymentMethods,
  createCashierPayment,
} from "../../services/paymentMethodService";

import {
  createCashierOrder,
  getTableSessions,
} from "../../services/cashierService";

// =========================================================
// HELPERS
// =========================================================

const normalizeStatus = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
};

// =========================================================
// PAYMENT ICON
// =========================================================

const getPaymentIcon = (name) => {
  const methodName = String(name || "").toUpperCase();

  if (methodName.includes("CASH")) return Banknote;
  if (methodName.includes("ABA")) return CreditCard;
  if (methodName.includes("ACLEDA")) return Building2;
  if (/KHQR|BAKONG|QR/.test(methodName)) return QrCode;

  return CreditCard;
};

// =========================================================
// CALCULATOR
// =========================================================

const evaluateMath = (str) => {
  try {
    const cleaned = String(str)
      .replace(/×/g, "*")
      .replace(/÷/g, "/");

    if (/^[0-9+\-*/.\s]+$/.test(cleaned)) {
      // eslint-disable-next-line no-new-func
      const result = Function(
        `'use strict'; return (${cleaned})`
      )();

      if (!isNaN(result) && isFinite(result)) {
        return Number(result.toFixed(2));
      }
    }
  } catch {
    return 0;
  }

  return parseFloat(str) || 0;
};

// =========================================================
// PRODUCT ID
// =========================================================

const getProductId = (item) => {
  return (
    item?.product_id ||
    item?.productId ||
    item?.product?.id ||
    null
  );
};

// =========================================================
// PAYMENT METHOD ID
// =========================================================

const getMethodId = (method) => {
  return (
    method?.id ||
    method?.payment_method_id ||
    null
  );
};

// =========================================================
// EXTRACT SESSION LIST
// =========================================================

const extractSessions = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.sessions)) {
    return response.sessions;
  }

  if (Array.isArray(response?.data?.sessions)) {
    return response.data.sessions;
  }

  return [];
};

// =========================================================
// GET TABLE ID FROM SESSION
// =========================================================

const getSessionTableId = (session) => {
  return (
    session?.table_id ??
    session?.cafe_table_id ??
    session?.table?.id ??
    session?.cafe_table?.id ??
    session?.cafeTable?.id ??
    null
  );
};

// =========================================================
// GET SESSION ID
// =========================================================

const getSessionId = (session) => {
  if (!session) {
    return null;
  }

  return (
    session?.id ??
    session?.session_id ??
    session?.table_session_id ??
    null
  );
};

// =========================================================
// CHECK ACTIVE SESSION
// =========================================================

const isSessionActive = (session) => {
  if (!session) {
    return false;
  }

  const status = normalizeStatus(
    session?.status
  );

  /*
   * Backend normally returns ACTIVE.
   *
   * OPEN is also supported in case your
   * backend uses OPEN.
   */

  return (
    status === "ACTIVE" ||
    status === "OPEN"
  );
};

// =========================================================
// FIND ACTIVE SESSION FOR TABLE
// =========================================================

const findActiveSessionForTable = (
  sessions,
  tableId
) => {
  if (
    !Array.isArray(sessions) ||
    !tableId
  ) {
    return null;
  }

  const numericTableId = Number(tableId);

  const session = sessions.find(
    (item) => {
      const sessionTableId =
        getSessionTableId(item);

      return (
        Number(sessionTableId) ===
          numericTableId &&
        isSessionActive(item)
      );
    }
  );

  return session || null;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationState =
    location.state || {};

  // =======================================================
  // INITIAL ORDER
  // =======================================================

  const initialOrderId =
    navigationState.orderId ||
    navigationState.order?.id ||
    navigationState.order?.order_id ||
    navigationState.order?.orderId ||
    null;

  const order =
    navigationState.order || null;

  // =======================================================
  // TABLE ID
  // =======================================================

  const tableId =
    navigationState.tableId ||
    navigationState.table?.id ||
    navigationState.table?.table_id ||
    order?.table_id ||
    null;

  // =======================================================
  // TABLE NAME
  // =======================================================

  const tableName =
    navigationState.tableName ||
    navigationState.table?.name ||
    navigationState.table?.table_number ||
    navigationState.table?.tableNumber ||
    order?.table?.name ||
    tableId ||
    "Unassigned";

  // =======================================================
  // INITIAL SESSION
  // =======================================================

  const initialSessionId =
    navigationState.sessionId ||
    navigationState.tableSessionId ||
    navigationState.activeSession?.id ||
    navigationState.activeSession?.session_id ||
    navigationState.activeSession?.table_session_id ||
    order?.table_session_id ||
    order?.session_id ||
    null;

  // =======================================================
  // SESSION STATE
  // =======================================================

  const [
    activeSessionId,
    setActiveSessionId,
  ] = useState(
    initialSessionId
      ? Number(initialSessionId)
      : null
  );

  const [
    activeSession,
    setActiveSession,
  ] = useState(
    navigationState.activeSession ||
      null
  );

  const [
    isLoadingSession,
    setIsLoadingSession,
  ] = useState(false);

  // =======================================================
  // GUESTS
  // =======================================================

  const guests = Number(
    navigationState.guests ||
      navigationState.numberOfGuests ||
      navigationState.guestCount ||
      order?.guests ||
      order?.guest_count ||
      2
  );

  // =======================================================
  // ORDER TYPE
  // =======================================================

  const orderType =
    navigationState.orderType ||
    navigationState.type ||
    order?.order_type ||
    order?.orderType ||
    "DINE_IN";

  // =======================================================
  // CART
  // =======================================================

  const cartItems = Array.isArray(
    navigationState.cartItems
  )
    ? navigationState.cartItems
    : Array.isArray(
        navigationState.items
      )
    ? navigationState.items
    : Array.isArray(order?.items)
    ? order.items
    : [];

  const items = cartItems;

  // =======================================================
  // PAYMENT / ORDER STATE
  // =======================================================

  const [
    createdOrderId,
    setCreatedOrderId,
  ] = useState(initialOrderId);

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState([]);

  const [
    selectedMethod,
    setSelectedMethod,
  ] = useState(null);

  const [
    amountReceived,
    setAmountReceived,
  ] = useState("0");

  const [
    isPaymentConfirmed,
    setIsPaymentConfirmed,
  ] = useState(false);

  const [
    isLoadingMethods,
    setIsLoadingMethods,
  ] = useState(true);

  const [
    isProcessingPayment,
    setIsProcessingPayment,
  ] = useState(false);

  const [
    isCreatingOrder,
    setIsCreatingOrder,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // =========================================================
  // TOTAL
  // =========================================================

  const totalDue = useMemo(() => {
    if (order?.total_amount) {
      return Number(
        order.total_amount
      );
    }

    return items.reduce(
      (acc, item) => {
        const price = Number(
          item?.price ||
            item?.product?.price ||
            0
        );

        const quantity = Number(
          item?.quantity || 0
        );

        return (
          acc + price * quantity
        );
      },
      0
    );
  }, [items, order]);

  // =========================================================
  // SET DEFAULT RECEIVED AMOUNT
  // =========================================================

  useEffect(() => {
    if (totalDue > 0) {
      setAmountReceived(
        totalDue.toFixed(2)
      );
    }
  }, [totalDue]);

  // =========================================================
  // CALCULATOR VALUES
  // =========================================================

  const numericReceived =
    evaluateMath(amountReceived);

  const changeToReturn = Math.max(
    0,
    numericReceived - totalDue
  );

  // =========================================================
  // ORDER INFO
  // =========================================================

  const orderInfo = createdOrderId
    ? `Order #${createdOrderId} • Table ${tableName}`
    : `New Order • Table ${tableName}`;

  // =========================================================
  // LOAD ACTIVE TABLE SESSION
  // =========================================================

  useEffect(() => {
    const loadActiveSession =
      async () => {
        /*
         * Only DINE_IN needs a table session.
         */

        if (
          orderType !== "DINE_IN"
        ) {
          return;
        }

        /*
         * If we already have a session ID,
         * don't need to search again.
         */

        if (activeSessionId) {
          console.log(
            "========== EXISTING SESSION =========="
          );

          console.log(
            "TABLE ID:",
            tableId
          );

          console.log(
            "SESSION ID:",
            activeSessionId
          );

          console.log(
            "======================================="
          );

          return;
        }

        if (!tableId) {
          console.error(
            "DINE_IN order has no table ID."
          );

          setError(
            "This order does not have a table assigned."
          );

          return;
        }

        try {
          setIsLoadingSession(true);
          setError("");

          console.log(
            "========== LOAD ACTIVE SESSION =========="
          );

          console.log(
            "TABLE ID:",
            tableId
          );

          const response =
            await getTableSessions();

          console.log(
            "TABLE SESSIONS RESPONSE:",
            response
          );

          const sessions =
            extractSessions(
              response
            );

          console.log(
            "ALL TABLE SESSIONS:",
            sessions
          );

          const foundSession =
            findActiveSessionForTable(
              sessions,
              tableId
            );

          console.log(
            "FOUND ACTIVE SESSION:",
            foundSession
          );

          if (!foundSession) {
            console.error(
              "NO ACTIVE SESSION FOUND FOR TABLE:",
              tableId
            );

            setActiveSessionId(
              null
            );

            setActiveSession(null);

            setError(
              `Table ${tableName} does not have an active session. Please go back and select the table again.`
            );

            return;
          }

          const foundSessionId =
            getSessionId(
              foundSession
            );

          if (!foundSessionId) {
            throw new Error(
              "Active table session was found, but its ID is missing."
            );
          }

          console.log(
            "RESOLVED ACTIVE SESSION ID:",
            foundSessionId
          );

          setActiveSession(
            foundSession
          );

          setActiveSessionId(
            Number(foundSessionId)
          );

          console.log(
            "=========================================="
          );
        } catch (err) {
          console.error(
            "FAILED TO LOAD ACTIVE TABLE SESSION:",
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Failed to load active table session."
          );
        } finally {
          setIsLoadingSession(false);
        }
      };

    loadActiveSession();
  }, [
    tableId,
    orderType,
    activeSessionId,
    tableName,
  ]);

  // =========================================================
  // LOAD PAYMENT METHODS
  // =========================================================

  useEffect(() => {
    const fetchPaymentMethods =
      async () => {
        try {
          setIsLoadingMethods(
            true
          );
          setError("");

          const response =
            await getCashierPaymentMethods();

          let methods = [];

          if (Array.isArray(response)) {
            methods = response;
          } else if (
            Array.isArray(
              response?.data
            )
          ) {
            methods =
              response.data;
          } else if (
            Array.isArray(
              response?.data?.data
            )
          ) {
            methods =
              response.data.data;
          }

          console.log(
            "PAYMENT METHODS:",
            methods
          );

          setPaymentMethods(
            methods
          );

          if (
            methods.length > 0
          ) {
            setSelectedMethod(
              methods[0]
            );
          }
        } catch (err) {
          console.error(
            "Failed to load payment methods:",
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              "Failed to load payment methods."
          );
        } finally {
          setIsLoadingMethods(
            false
          );
        }
      };

    fetchPaymentMethods();
  }, []);

  // =========================================================
  // BUILD ORDER PAYLOAD
  // =========================================================

  const buildOrderPayload =
    () => {
      if (items.length === 0) {
        throw new Error(
          "There are no products in this order."
        );
      }

      /*
       * DINE_IN MUST have an active session.
       *
       * IMPORTANT:
       * Use activeSessionId here, NOT sessionId.
       */

      if (
        orderType === "DINE_IN" &&
        !activeSessionId
      ) {
        throw new Error(
          `Table ${tableName} does not have an active session. Please go back and select the table again.`
        );
      }

      const orderItems =
        items.map(
          (item, index) => {
            const productId =
              getProductId(item);

            const quantity =
              Number(
                item?.quantity || 0
              );

            if (!productId) {
              throw new Error(
                `Product ID is missing for ${
                  item?.name ||
                  item?.product?.name ||
                  `item #${index + 1}`
                }.`
              );
            }

            if (
              quantity <= 0
            ) {
              throw new Error(
                `Invalid quantity for ${
                  item?.name ||
                  item?.product?.name ||
                  `item #${index + 1}`
                }.`
              );
            }

            return {
              product_id:
                Number(
                  productId
                ),

              quantity:
                quantity,

              note:
                item?.note ||
                null,
            };
          }
        );

      const payload = {
        user_id: null,

        /*
         * THIS IS THE IMPORTANT FIX
         */
        table_session_id:
          orderType === "DINE_IN"
            ? Number(
                activeSessionId
              )
            : null,

        order_source:
          "WALK_IN",

        order_type:
          orderType,

        discount: 0,

        delivery_fee: 0,

        note: null,

        items: orderItems,
      };

      console.log(
        "========== ORDER PAYLOAD =========="
      );

      console.log(
        "TABLE ID:",
        tableId
      );

      console.log(
        "TABLE NAME:",
        tableName
      );

      console.log(
        "ACTIVE SESSION ID:",
        activeSessionId
      );

      console.log(
        "ACTIVE SESSION:",
        activeSession
      );

      console.log(
        "ORDER TYPE:",
        orderType
      );

      console.log(
        "ORDER PAYLOAD:",
        payload
      );

      console.log(
        "==================================="
      );

      return payload;
    };

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const handleCreateOrder =
    async () => {
      /*
       * If order already exists,
       * don't create another one.
       */

      if (createdOrderId) {
        return createdOrderId;
      }

      if (items.length === 0) {
        throw new Error(
          "There are no products in this order."
        );
      }

      if (!orderType) {
        throw new Error(
          "Order type is missing."
        );
      }

      /*
       * Extra safety check before
       * creating DINE_IN order.
       */

      if (
        orderType === "DINE_IN" &&
        !activeSessionId
      ) {
        throw new Error(
          `Table ${tableName} does not have an active session.`
        );
      }

      const orderData =
        buildOrderPayload();

      console.log(
        "CREATING CASHIER ORDER..."
      );

      const response =
        await createCashierOrder(
          orderData
        );

      console.log(
        "CREATE ORDER RESPONSE:",
        response
      );

      const newOrder =
        response?.data?.data ||
        response?.data ||
        response;

      console.log(
        "NEW ORDER:",
        newOrder
      );

      const newOrderId =
        newOrder?.id ||
        newOrder?.order_id ||
        newOrder?.orderId;

      if (!newOrderId) {
        throw new Error(
          "Order was created but the order ID was not returned."
        );
      }

      console.log(
        "NEW ORDER ID:",
        newOrderId
      );

      setCreatedOrderId(
        newOrderId
      );

      return newOrderId;
    };

  // =========================================================
  // CONFIRM PAYMENT
  // =========================================================

  const handleConfirmPayment =
    async () => {
      setError("");

      // -----------------------------------------------------
      // PAYMENT METHOD
      // -----------------------------------------------------

      if (!selectedMethod) {
        setError(
          "Please select a payment method."
        );
        return;
      }

      // -----------------------------------------------------
      // TOTAL
      // -----------------------------------------------------

      if (totalDue <= 0) {
        setError(
          "Order total must be greater than $0.00."
        );
        return;
      }

      // -----------------------------------------------------
      // ITEMS
      // -----------------------------------------------------

      if (
        !createdOrderId &&
        items.length === 0
      ) {
        setError(
          "There are no products in this order."
        );
        return;
      }

      // -----------------------------------------------------
      // PAYMENT AMOUNT
      // -----------------------------------------------------

      if (
        numericReceived < totalDue
      ) {
        setError(
          `Insufficient payment. Customer must pay at least $${totalDue.toFixed(
            2
          )}.`
        );
        return;
      }

      // -----------------------------------------------------
      // DINE IN SESSION
      // -----------------------------------------------------

      if (
        orderType === "DINE_IN" &&
        !activeSessionId
      ) {
        setError(
          `Table ${tableName} does not have an active session. Please go back and select the table again.`
        );

        return;
      }

      try {
        setIsProcessingPayment(
          true
        );

        setIsCreatingOrder(true);

        console.log(
          "========== CONFIRM PAYMENT =========="
        );

        console.log(
          "TABLE ID:",
          tableId
        );

        console.log(
          "TABLE:",
          tableName
        );

        console.log(
          "ACTIVE SESSION ID:",
          activeSessionId
        );

        console.log(
          "ACTIVE SESSION:",
          activeSession
        );

        console.log(
          "ORDER TYPE:",
          orderType
        );

        console.log(
          "====================================="
        );

        // ---------------------------------------------------
        // CREATE ORDER
        // ---------------------------------------------------

        const finalOrderId =
          await handleCreateOrder();

        setIsCreatingOrder(
          false
        );

        // ---------------------------------------------------
        // PAYMENT METHOD ID
        // ---------------------------------------------------

        const methodId =
          getMethodId(
            selectedMethod
          );

        if (!methodId) {
          throw new Error(
            "Invalid payment method selected."
          );
        }

        // ---------------------------------------------------
        // PAYMENT DATA
        // ---------------------------------------------------

        const paymentData = {
          order_id:
            Number(
              finalOrderId
            ),

          payment_method_id:
            Number(
              methodId
            ),

          amount:
            Number(
              totalDue.toFixed(2)
            ),

          transaction_id:
            null,
        };

        console.log(
          "PAYMENT DATA:",
          paymentData
        );

        // ---------------------------------------------------
        // CREATE PAYMENT
        // ---------------------------------------------------

        const paymentResponse =
          await createCashierPayment(
            paymentData
          );

        console.log(
          "PAYMENT RESPONSE:",
          paymentResponse
        );

        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        setIsPaymentConfirmed(
          true
        );

        setError("");

        console.log(
          "========== PAYMENT SUCCESS =========="
        );

        console.log(
          "ORDER ID:",
          finalOrderId
        );

        console.log(
          "SESSION ID:",
          activeSessionId
        );

        console.log(
          "====================================="
        );
      } catch (err) {
        console.error(
          "FAILED TO CREATE ORDER/PAYMENT:",
          err
        );

        console.error(
          "ERROR RESPONSE:",
          err?.response?.data
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Failed to create order and payment."
        );
      } finally {
        setIsProcessingPayment(
          false
        );

        setIsCreatingOrder(
          false
        );
      }
    };

  // =========================================================
  // PRINT RECEIPT
  // =========================================================

  const handlePrintReceipt =
    () => {
      navigate(
        "/receipt",
        {
          state: {
            orderId:
              createdOrderId,

            tableName:
              tableName,

            tableId:
              tableId,

            /*
             * IMPORTANT:
             * Use resolved active session.
             */
            sessionId:
              activeSessionId,

            tableSessionId:
              activeSessionId,

            guests:
              guests,

            orderType:
              orderType,

            items:
              items,

            totalDue:
              totalDue,

            amountReceived:
              numericReceived,

            changeToReturn:
              changeToReturn,

            paymentMethod:
              selectedMethod?.name ||
              "Cash",

            createdAt:
              new Date().toISOString(),
          },
        }
      );
    };

  // =========================================================
  // LOADING SESSION
  // =========================================================

  if (
    isLoadingSession &&
    orderType === "DINE_IN"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F6F0]">
        <div className="flex flex-col items-center">
          <Loader2
            size={32}
            className="mb-3 animate-spin text-stone-700"
          />

          <p className="text-xs font-semibold text-stone-500">
            Checking table session...
          </p>

          <p className="mt-1 text-[10px] text-stone-400">
            {tableName}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F6F0] font-sans text-stone-900 select-none">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex h-16 shrink-0 items-center justify-between bg-[#1f1611] px-6 text-white shadow-md sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            disabled={
              isProcessingPayment
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#362922] text-white transition-colors hover:bg-[#4a3930] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft
              size={18}
            />
          </button>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Payment Checkout
            </h1>

            <p className="mt-0.5 text-[10px] text-stone-400">
              Complete payment for
              this order
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-stone-300">
            {orderInfo}
          </div>

          <div className="mt-1 text-[10px] font-medium text-stone-500">
            {orderType}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* ===================================================
            CUSTOMER ORDER
        =================================================== */}

        <section className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Customer Order
            </h2>

            <span className="rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-bold text-stone-700">
              {items.length}{" "}
              {items.length === 1
                ? "Item"
                : "Items"}
            </span>
          </div>

          <div className="max-h-[500px] space-y-2.5 overflow-y-auto rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm">
            {items.length ===
            0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                <ShoppingBag
                  size={24}
                  className="mx-auto mb-2 opacity-50"
                />

                <p>
                  No products in
                  this order.
                </p>
              </div>
            ) : (
              items.map(
                (
                  item,
                  index
                ) => {
                  const price =
                    Number(
                      item?.price ||
                        item
                          ?.product
                          ?.price ||
                        0
                    );

                  const quantity =
                    Number(
                      item?.quantity ||
                        0
                    );

                  const itemTotal =
                    price *
                    quantity;

                  const productId =
                    getProductId(
                      item
                    );

                  return (
                    <div
                      key={
                        productId ||
                        index
                      }
                      className="flex items-center justify-between border-b border-stone-100 pb-2.5 pt-1 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate text-xs font-bold text-stone-800">
                          {item?.name ||
                            item
                              ?.product
                              ?.name ||
                            "Product"}
                        </p>

                        <p className="text-[11px] font-medium text-stone-400">
                          $
                          {price.toFixed(
                            2
                          )}{" "}
                          ×{" "}
                          {quantity}
                        </p>
                      </div>

                      <span className="text-xs font-extrabold text-stone-900">
                        $
                        {itemTotal.toFixed(
                          2
                        )}
                      </span>
                    </div>
                  );
                }
              )
            )}

            <div className="mt-3 border-t border-stone-200/80 pt-3">
              <div className="flex justify-between text-xs font-extrabold text-stone-900">
                <span>
                  Total Amount
                </span>

                <span>
                  $
                  {totalDue.toFixed(
                    2
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            PAYMENT METHOD
        =================================================== */}

        <section className="space-y-6 lg:col-span-5">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
              Payment Method
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* SESSION INFO */}

            {orderType ===
              "DINE_IN" &&
              activeSessionId && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-semibold text-emerald-800">
                      Active table
                      session
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-700">
                    #{activeSessionId}
                  </span>
                </div>
              )}

            {isLoadingMethods ? (
              <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-white p-8">
                <Loader2
                  size={22}
                  className="animate-spin text-stone-500"
                />

                <span className="ml-2 text-xs font-semibold text-stone-500">
                  Loading payment
                  methods...
                </span>
              </div>
            ) : paymentMethods.length ===
              0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <AlertCircle
                  size={24}
                  className="mx-auto mb-2 text-stone-400"
                />

                <p className="text-xs font-semibold text-stone-500">
                  No payment
                  methods
                  available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {paymentMethods.map(
                  (method) => {
                    const Icon =
                      getPaymentIcon(
                        method?.name
                      );

                    const currentMethodId =
                      getMethodId(
                        method
                      );

                    const selectedMethodId =
                      getMethodId(
                        selectedMethod
                      );

                    const isSelected =
                      selectedMethodId ===
                      currentMethodId;

                    return (
                      <button
                        key={
                          currentMethodId ||
                          method.name
                        }
                        type="button"
                        disabled={
                          isPaymentConfirmed ||
                          isProcessingPayment
                        }
                        onClick={() => {
                          setSelectedMethod(
                            method
                          );

                          setError(
                            ""
                          );
                        }}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-[#1f1611] bg-white shadow-md ring-1 ring-[#1f1611]"
                            : "border-stone-200/80 bg-stone-100/60 text-stone-500 hover:bg-white hover:text-stone-800"
                        } ${
                          isPaymentConfirmed ||
                          isProcessingPayment
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            isSelected
                              ? "text-[#1f1611]"
                              : "text-stone-400"
                          }
                        />

                        <span className="text-xs font-bold">
                          {
                            method.name
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <Calculator
            value={
              amountReceived
            }
            onChange={
              setAmountReceived
            }
            totalDue={
              totalDue
            }
          />
        </section>

        {/* ===================================================
            PAYMENT SUMMARY
        =================================================== */}

        <section className="space-y-4 lg:col-span-4">
          <div className="rounded-[28px] border border-stone-200/80 bg-stone-100/70 p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
              Payment Summary
            </h2>

            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              {/* ORDER ID */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Order ID
                </span>

                <span className="font-bold text-stone-900">
                  {createdOrderId
                    ? `#${createdOrderId}`
                    : "Will be created"}
                </span>
              </div>

              {/* ORDER TYPE */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Order Type
                </span>

                <span className="font-bold text-emerald-700">
                  {orderType}
                </span>
              </div>

              {/* TABLE */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Table
                </span>

                <span className="font-bold text-stone-900">
                  {tableName}
                </span>
              </div>

              {/* GUESTS */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Guests
                </span>

                <span className="font-bold text-stone-900">
                  {guests}
                </span>
              </div>

              {/* SESSION */}

              {activeSessionId && (
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-500">
                    Session
                  </span>

                  <span className="font-bold text-emerald-700">
                    #
                    {
                      activeSessionId
                    }
                  </span>
                </div>
              )}

              {/* TOTAL */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Total Due
                </span>

                <span className="font-bold text-stone-900">
                  $
                  {totalDue.toFixed(
                    2
                  )}
                </span>
              </div>

              {/* RECEIVED */}

              <div className="flex justify-between border-b border-stone-100 pb-3 text-xs">
                <span className="font-semibold text-stone-500">
                  Received
                </span>

                <span className="font-bold text-stone-900">
                  $
                  {numericReceived.toFixed(
                    2
                  )}
                </span>
              </div>

              {/* PAYMENT METHOD */}

              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-500">
                  Payment Method
                </span>

                <span className="font-bold text-emerald-700">
                  {selectedMethod?.name ||
                    "Not selected"}
                </span>
              </div>
            </div>

            {/* CHANGE */}

            <div className="mt-4 rounded-2xl bg-[#1f1611] p-5 text-white shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Change to
                Return
              </span>

              <div className="mt-1 text-2xl font-black text-amber-300">
                $
                {changeToReturn.toFixed(
                  2
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="space-y-3">
            <button
              type="button"
              onClick={
                handleConfirmPayment
              }
              disabled={
                isPaymentConfirmed ||
                isProcessingPayment ||
                isLoadingMethods ||
                isLoadingSession ||
                (!createdOrderId &&
                  items.length ===
                    0) ||
                (orderType ===
                  "DINE_IN" &&
                  !activeSessionId)
              }
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-bold shadow-md transition-all ${
                isPaymentConfirmed
                  ? "cursor-default bg-emerald-700 text-white"
                  : isProcessingPayment
                  ? "cursor-wait bg-stone-500 text-white"
                  : isLoadingSession ||
                    (orderType ===
                      "DINE_IN" &&
                      !activeSessionId) ||
                    (!createdOrderId &&
                      items.length ===
                        0) ||
                    isLoadingMethods
                  ? "cursor-not-allowed bg-stone-400 text-white opacity-60"
                  : "cursor-pointer bg-[#1f1611] text-white hover:bg-[#362922] active:scale-[0.99]"
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  <span>
                    {isCreatingOrder
                      ? "Creating Order..."
                      : "Processing Payment..."}
                  </span>
                </>
              ) : isPaymentConfirmed ? (
                <>
                  <Check
                    size={16}
                  />

                  <span>
                    Payment
                    Completed
                  </span>
                </>
              ) : isLoadingSession ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  <span>
                    Checking
                    Session...
                  </span>
                </>
              ) : (
                <span>
                  Confirm Payment
                </span>
              )}
            </button>

            {/* RECEIPT */}

            {isPaymentConfirmed && (
              <button
                type="button"
                onClick={
                  handlePrintReceipt
                }
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-700 active:scale-[0.99]"
              >
                <Printer
                  size={16}
                />

                <span>
                  Print Receipt & Go
                  to Receipt Page
                </span>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}