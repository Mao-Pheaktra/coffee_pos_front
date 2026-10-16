import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CreditCard,
  Split,
  Percent,
  Loader2,
  RefreshCw,
  Clock,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  getTableSession,
   updateTableSession,
} from "../../services/cashierService";

export default function ViewSessionPage({
  tableId,
  onBack,
}) {
  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams();

  // ==========================================
  // SESSION ID
  // ==========================================

  /*
   * IMPORTANT:
   *
   * /view/:id = SESSION ID
   *
   * Example:
   *
   * /view/12
   *
   * means:
   * get table session #12
   */

  const sessionId =
    location.state?.sessionId ||
    location.state?.tableSessionId ||
    id ||
    null;

  // ==========================================
  // NAVIGATION DATA
  // ==========================================

  const navigationTable =
    location.state?.table || null;

  const navigationTableId =
    location.state?.tableId ||
    tableId ||
    navigationTable?.id ||
    null;

  const navigationTableNumber =
    location.state?.tableNumber ||
    navigationTable?.table_number ||
    navigationTable?.tableNumber ||
    navigationTable?.name ||
    null;

  // ==========================================
  // STATE
  // ==========================================

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH SESSION
  // ==========================================

  const fetchSession = async () => {
    if (!sessionId) {
      setError(
        "Table session ID is missing."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      console.log(
        "========== VIEW TABLE SESSION =========="
      );

      console.log(
        "SESSION ID:",
        sessionId
      );

      console.log(
        "TABLE ID:",
        navigationTableId
      );

      const response =
        await getTableSession(
          sessionId
        );

      console.log(
        "SESSION RESPONSE:",
        response
      );

      /*
       * Laravel response possibilities:
       *
       * 1.
       * {
       *   data: {...}
       * }
       *
       * 2.
       * {
       *   data: {
       *      data: {...}
       *   }
       * }
       *
       * 3.
       * {
       *   session: {...}
       * }
       */

      const sessionData =
        response?.data?.data ||
        response?.data ||
        response?.session ||
        response;

      console.log(
        "SESSION DATA:",
        sessionData
      );

      if (
        !sessionData ||
        typeof sessionData !==
          "object"
      ) {
        throw new Error(
          "No table session data returned."
        );
      }

      /*
       * Make sure this really looks like
       * a session object.
       */

      const actualSessionId =
        sessionData?.id ||
        sessionData?.session_id ||
        sessionData?.table_session_id;

      if (!actualSessionId) {
        console.error(
          "INVALID SESSION RESPONSE:",
          sessionData
        );

        throw new Error(
          "The server returned invalid table session data."
        );
      }

      setSession(
        sessionData
      );

      console.log(
        "SESSION LOADED SUCCESSFULLY:",
        sessionData
      );
    } catch (err) {
      console.error(
        "FAILED TO FETCH TABLE SESSION:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load table session."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    if (onBack) {
      onBack();

      return;
    }

    navigate(-1);
  };

  // ==========================================
  // TABLE NUMBER
  // ==========================================

  const tableNumber =
    session?.cafe_table
      ?.table_number ||
    session?.cafeTable
      ?.table_number ||
    session?.table
      ?.table_number ||
    session?.table?.name ||
    navigationTableNumber ||
    navigationTableId ||
    "Table";

  // ==========================================
  // SESSION STATUS
  // ==========================================

  const sessionStatus =
    session?.status ||
    "ACTIVE";

  // ==========================================
  // ORDERS
  // ==========================================

  const orders =
    Array.isArray(session?.orders)
      ? session.orders
      : [];

  // ==========================================
  // DURATION
  // ==========================================

  const getDuration = () => {
    if (!session?.started_at) {
      return "-";
    }

    const start =
      new Date(
        session.started_at
      );

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {
      return "-";
    }

    const end = session?.ended_at
      ? new Date(session.ended_at)
      : new Date();

    const difference =
      Math.max(
        0,
        end.getTime() -
          start.getTime()
      );

    const minutes =
      Math.floor(
        difference / 60000
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const remainingMinutes =
      minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes} min`;
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    const value =
      String(status);

    return (
      value.charAt(0) +
      value
        .slice(1)
        .toLowerCase()
    );
  };

  // ==========================================
  // ORDER STATUS STYLE
  // ==========================================

  const getStatusStyle = (
    status
  ) => {
    switch (
      String(status || "")
        .toUpperCase()
    ) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "READY":
        return "bg-sky-50 text-sky-700 border-sky-200";

      case "PREPARING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // ==========================================
  // ORDER ITEMS
  // ==========================================

  const getOrderItems = (
    order
  ) => {
    return (
      order?.order_items ||
      order?.orderItems ||
      []
    );
  };

  // ==========================================
  // PRODUCT NAME
  // ==========================================

  const getProductName = (
    item
  ) => {
    return (
      item?.product?.name ||
      item?.product_name ||
      "Product"
    );
  };

  // ==========================================
  // QUANTITY
  // ==========================================

  const getQuantity = (
    item
  ) => {
    return Number(
      item?.quantity || 0
    );
  };

  // ==========================================
  // ITEM TOTAL
  // ==========================================

  const getItemTotal = (
    item
  ) => {
    const quantity =
      getQuantity(item);

    const price =
      item?.unit_price ??
      item?.price ??
      item?.product?.price ??
      0;

    return (
      Number(price) *
      quantity
    );
  };

  // ==========================================
  // ALL ITEMS
  // ==========================================

  const allItems = useMemo(() => {
    return orders.flatMap(
      (order) =>
        getOrderItems(order)
    );
  }, [orders]);

  // ==========================================
  // ITEM COUNT
  // ==========================================

  const itemCount = useMemo(() => {
    return allItems.reduce(
      (total, item) =>
        total +
        getQuantity(item),
      0
    );
  }, [allItems]);

  // ==========================================
  // SUBTOTAL
  // ==========================================

  const subtotal = useMemo(() => {
    return allItems.reduce(
      (total, item) =>
        total +
        getItemTotal(item),
      0
    );
  }, [allItems]);

  // ==========================================
  // TAX
  // ==========================================

  const tax =
    subtotal * 0.08;

  // ==========================================
  // SERVICE CHARGE
  // ==========================================

  const serviceCharge =
    subtotal * 0.05;

  // ==========================================
  // GRAND TOTAL
  // ==========================================

  const grandTotal =
    subtotal +
    tax +
    serviceCharge;

  // ==========================================
  // MONEY
  // ==========================================

  const money = (
    amount
  ) => {
    return `$${Number(
      amount
    ).toFixed(2)}`;
  };

  // ==========================================
  // CLOSE SESSION
  // ==========================================

const handleCloseSession = async () => {
  const currentSessionId =
    session?.id || sessionId

  const currentTableId =
    session?.table_id ||
    navigationTableId

  if (!currentSessionId) {
    setError('Table session ID is missing.')
    return
  }

  try {
    setError('')
    setLoading(true)

    console.log(
      '========== CLOSE TABLE SESSION =========='
    )

    console.log(
      'SESSION ID:',
      currentSessionId
    )

    console.log(
      'TABLE ID:',
      currentTableId
    )

    console.log(
      'STATUS:',
      'INACTIVE'
    )

    // Change active session to inactive
    const response =
      await updateTableSession(
        currentSessionId,
        'INACTIVE'
      )

    console.log(
      'SESSION CLOSED:',
      response
    )

    // Go back to floor plan
    navigate('/table', {
      replace: true,
    })

  } catch (err) {
    console.error(
      'FAILED TO CLOSE SESSION:',
      err
    )

    setError(
      err?.response?.data?.message ||
        err?.message ||
        'Failed to close table session.'
    )
  } finally {
    setLoading(false)
  }
}

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-3 text-slate-500">

          <Loader2
            size={30}
            className="animate-spin text-slate-800"
          />

          <p className="text-sm font-semibold">
            Loading table session...
          </p>

        </div>

      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">

        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={20}
              className="mt-0.5 text-rose-600"
            />

            <div>

              <h2 className="font-bold text-slate-900">
                Failed to load session
              </h2>

              <p className="mt-1 text-sm text-rose-600">
                {error}
              </p>

              <p className="mt-2 text-[11px] text-slate-400">
                Session ID:{" "}
                {sessionId || "-"}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Table ID:{" "}
                {navigationTableId ||
                  "-"}
              </p>

            </div>

          </div>

          <div className="mt-6 flex gap-3">

            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={fetchSession}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw
                size={14}
              />

              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <main className="flex min-h-screen select-none flex-col bg-slate-50 text-slate-800">

      {/* HEADER */}

      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-8">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
          </button>

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-xl font-bold text-slate-900">
                {tableNumber}{" "}
                Session
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">

                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

                {formatStatus(
                  sessionStatus
                )}

              </span>

            </div>

            <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">

              <span className="flex items-center gap-1.5">
                <Clock size={13} />

                {getDuration()}
              </span>

              <span>
                Started{" "}
                {formatTime(
                  session?.started_at
                )}
              </span>

              <span>
                {itemCount} Items
              </span>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={fetchSession}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>

      </header>

      {/* MAIN */}

      <div className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* LEFT */}

          <section className="lg:col-span-7">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Session History
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Orders placed during this table session
                  </p>

                </div>

                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {orders.length}{" "}
                  Orders
                </span>

              </div>

              <div className="p-6">

                {orders.length ===
                0 ? (
                  <div className="py-16 text-center">

                    <ShoppingBag
                      size={38}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-800">
                      No orders yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Orders placed at this table will appear here.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-7">

                    {orders.map(
                      (
                        order,
                        index
                      ) => {
                        const orderItems =
                          getOrderItems(
                            order
                          );

                        return (
                          <div
                            key={
                              order.id ||
                              index
                            }
                            className="relative pl-6"
                          >

                            {index !==
                              orders.length -
                                1 && (
                              <div className="absolute bottom-[-28px] left-[5px] top-3 w-px bg-slate-200" />
                            )}

                            <div className="absolute -left-[1px] top-1.5 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-slate-100" />

                            <div className="mb-3 flex items-center justify-between gap-4">

                              <div>

                                <div className="flex items-center gap-2">

                                  <span className="text-xs font-bold text-slate-900">
                                    Order #
                                    {order.id}
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    {formatTime(
                                      order.created_at
                                    )}
                                  </span>

                                </div>

                              </div>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusStyle(
                                  order.status
                                )}`}
                              >
                                {formatStatus(
                                  order.status
                                )}
                              </span>

                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                              <div className="space-y-3">

                                {orderItems.map(
                                  (
                                    item,
                                    itemIndex
                                  ) => (
                                    <div
                                      key={
                                        item.id ||
                                        itemIndex
                                      }
                                      className="flex items-start justify-between gap-4"
                                    >

                                      <div>

                                        <p className="text-xs font-bold text-slate-800">
                                          {
                                            getQuantity(
                                              item
                                            )
                                          }
                                          x{" "}
                                          {
                                            getProductName(
                                              item
                                            )
                                          }
                                        </p>

                                        {item.note && (
                                          <p className="mt-1 text-[11px] text-slate-400">
                                            {
                                              item.note
                                            }
                                          </p>
                                        )}

                                      </div>

                                      <span className="whitespace-nowrap text-xs font-bold text-slate-900">
                                        {money(
                                          getItemTotal(
                                            item
                                          )
                                        )}
                                      </span>

                                    </div>
                                  )
                                )}

                              </div>

                              <div className="mt-4 flex justify-between border-t border-slate-200 pt-3">

                                <span className="text-xs font-semibold text-slate-500">
                                  Order Total
                                </span>

                                <span className="text-xs font-bold text-slate-900">
                                  {money(
                                    orderItems.reduce(
                                      (
                                        total,
                                        item
                                      ) =>
                                        total +
                                        getItemTotal(
                                          item
                                        ),
                                      0
                                    )
                                  )}
                                </span>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* RIGHT */}

          <aside className="lg:col-span-5">

            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 pb-4">

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Current Bill
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {tableNumber}
                  </p>

                </div>

                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {itemCount}{" "}
                  Items
                </span>

              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto py-5">

                {allItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.id ||
                        index
                      }
                      className="flex items-center justify-between gap-4"
                    >

                      <p className="truncate text-xs font-semibold text-slate-700">
                        {getQuantity(
                          item
                        )}
                        x{" "}
                        {getProductName(
                          item
                        )}
                      </p>

                      <span className="whitespace-nowrap text-xs font-bold text-slate-900">
                        {money(
                          getItemTotal(
                            item
                          )
                        )}
                      </span>

                    </div>
                  )
                )}

                {allItems.length ===
                  0 && (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No items in current bill
                  </p>
                )}

              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-800">
                    {money(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Tax (8%)
                  </span>

                  <span className="font-semibold text-slate-800">
                    {money(tax)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Service Charge (5%)
                  </span>

                  <span className="font-semibold text-slate-800">
                    {money(
                      serviceCharge
                    )}
                  </span>
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">

                <span className="text-sm font-bold text-slate-900">
                  Grand Total
                </span>

                <span className="text-2xl font-extrabold text-slate-900">
                  {money(
                    grandTotal
                  )}
                </span>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseSession
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                <CreditCard
                  size={16}
                />

                Close Session &
                Pay
              </button>

              <div className="mt-3 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Split Bill clicked"
                    )
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Split
                    size={14}
                  />

                  Split Bill
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Discount clicked"
                    )
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Percent
                    size={14}
                  />

                  Discount
                </button>

              </div>

              {/* SESSION INFORMATION */}

              <div className="mt-6 border-t border-slate-200 pt-5">

                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Session Information
                </p>

                <div className="space-y-2.5">

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Session ID
                    </span>

                    <span className="font-semibold text-slate-700">
                      #
                      {session?.id ||
                        sessionId ||
                        "-"}
                    </span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Session Code
                    </span>

                    <span className="font-semibold text-slate-700">
                      {session?.session_code ||
                        "-"}
                    </span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Table ID
                    </span>

                    <span className="font-semibold text-slate-700">
                      #
                      {session?.table_id ||
                        navigationTableId ||
                        "-"}
                    </span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Started
                    </span>

                    <span className="font-semibold text-slate-700">
                      {formatTime(
                        session?.started_at
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Status
                    </span>

                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">

                      <CheckCircle2
                        size={13}
                      />

                      {formatStatus(
                        sessionStatus
                      )}

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}