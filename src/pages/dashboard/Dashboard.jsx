import React, { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Armchair,
  DollarSign,
} from "lucide-react";

import {
  getDashboardRevenue,
  getDashboardOrders,
  getDashboardTables,
  getDashboardRevenueChart,
  getDashboardPopularProducts,
  getDashboardRecentOrders,
} from "../../services/adminService";

export default function Dashboard() {
  // ==========================================
  // DASHBOARD STATE
  // ==========================================
  const [revenue, setRevenue] = useState({ total_revenue: 0, today_revenue: 0 });
  const [orderMetrics, setOrderMetrics] = useState({ total_orders: 0, today_orders: 0 });
  const [tableMetrics, setTableMetrics] = useState({
    total_tables: 0,
    occupied_tables: 0,
    available_tables: 0,
    occupancy_percentage: 0,
  });

  const [popularProducts, setPopularProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("weekly");

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // RECENT ORDERS PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
    from: 0,
    to: 0,
  });

  // ==========================================
  // FETCH MAIN DASHBOARD
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [revenueResponse, ordersResponse, tablesResponse, productsResponse] =
          await Promise.all([
            getDashboardRevenue(),
            getDashboardOrders(),
            getDashboardTables(),
            getDashboardPopularProducts(),
          ]);

        setRevenue(revenueResponse?.data || { total_revenue: 0, today_revenue: 0 });
        setOrderMetrics(ordersResponse?.data || { total_orders: 0, today_orders: 0 });
        setTableMetrics(
          tablesResponse?.data || {
            total_tables: 0,
            occupied_tables: 0,
            available_tables: 0,
            occupancy_percentage: 0,
          }
        );
        setPopularProducts(productsResponse?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================
  // FETCH REVENUE CHART
  // ==========================================
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setChartLoading(true);
        const response = await getDashboardRevenueChart(chartPeriod);
        setChartData(response?.data?.chart || []);
      } catch (err) {
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChart();
  }, [chartPeriod]);

  // ==========================================
  // FETCH RECENT ORDERS
  // ==========================================
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setRecentOrdersLoading(true);
        const response = await getDashboardRecentOrders(currentPage, itemsPerPage);

        setRecentOrders(response?.data || []);
        setPagination(
          response?.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: itemsPerPage,
            total: 0,
            from: 0,
            to: 0,
          }
        );
      } catch (err) {
        setRecentOrders([]);
      } finally {
        setRecentOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [currentPage]);

  // ==========================================
  // FORMATTERS
  // ==========================================
  const formatCurrency = (value) => {
    return `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatus = (status) => {
    if (!status) return "PENDING";
    return status.toString().replaceAll("_", " ").toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 border-amber-200/50";
      case "CONFIRMED":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200/50";
      case "PREPARING":
        return "bg-sky-500/10 text-sky-600 border-sky-200/50";
      case "READY":
        return "bg-purple-500/10 text-purple-600 border-purple-200/50";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 border-rose-200/50";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/50";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChartLabel = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return chartPeriod === "weekly"
      ? parsedDate.toLocaleDateString(undefined, { weekday: "short" })
      : parsedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const chartMax = Math.max(...chartData.map((item) => Number(item.revenue || 0)), 1);

  // ==========================================
  // STATES: LOADING / ERROR
  // ==========================================
  if (loading) {
    return (
      <main className="flex-1 min-h-screen flex items-center justify-center ">
        <div className="flex items-center gap-3 px-6 py-4 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 text-slate-700 text-sm font-medium">
          <Loader2 size={20} className="animate-spin text-slate-900" />
          Loading dashboard metrics...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-sm">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 border border-rose-100">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Error Loading Dashboard</h3>
          <p className="text-xs text-slate-500 font-medium mb-4">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8  min-h-screen text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Revenue Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Real-time insights and business metrics performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-all shadow-xs active:scale-95"
          >
            <Calendar size={15} className="text-slate-400" />
            Today
          </button>

          <button
            type="button"
            className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 active:scale-95"
          >
            <FileText size={15} />
            Generate Report
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL REVENUE */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(revenue.total_revenue)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600">
              <span className="flex items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                <ArrowUpRight size={14} className="mr-0.5" /> All-time
              </span>
              <span className="text-slate-400">gross income</span>
            </div>
          </div>
        </div>

        {/* TODAY REVENUE */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(revenue.today_revenue)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] font-medium text-indigo-600">
              <span className="flex items-center bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                <ArrowUpRight size={14} className="mr-0.5" /> Live
              </span>
              <span className="text-slate-400">tracked today</span>
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {Number(orderMetrics.total_orders || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] font-medium text-amber-600">
              <span className="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50 font-semibold">
                +{Number(orderMetrics.today_orders || 0).toLocaleString()}
              </span>
              <span className="text-slate-400">placed today</span>
            </div>
          </div>
        </div>

        {/* OCCUPIED TABLES */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
              <Armchair size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {tableMetrics.occupied_tables}
                <span className="text-slate-400 text-lg font-medium">/{tableMetrics.total_tables}</span>
              </div>
              <span className="text-xs font-bold text-slate-700">
                {tableMetrics.occupancy_percentage || 0}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Number(tableMetrics.occupancy_percentage || 0), 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* REVENUE CHART */}
        <div className="lg:col-span-8 border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 space-y-6 shadow-xs h-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Revenue Statistics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Visual income analytics timeline</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartPeriod("weekly")}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  chartPeriod === "weekly"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Weekly
              </button>

              <button
                type="button"
                onClick={() => setChartPeriod("monthly")}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  chartPeriod === "monthly"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No revenue data available for this timeline.
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2 md:gap-4 px-2 pt-10 pb-2">
              {chartData.map((item, index) => {
                const revenueValue = Number(item.revenue || 0);
                const heightPercentage = (revenueValue / chartMax) * 100;

                return (
                  <div
                    key={`${item.date}-${index}`}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2 group relative"
                  >
                    {/* TOOLTIP */}
                    <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {formatCurrency(revenueValue)}
                    </div>

                    {/* BAR */}
                    <div className="w-full max-w-9 bg-slate-100 rounded-2xl flex flex-col justify-end overflow-hidden h-full p-1">
                      <div
                        className="w-full bg-linear-to-t from-slate-900 to-slate-700 rounded-xl transition-all duration-500 group-hover:brightness-125"
                        style={{
                          height: `${Math.max(heightPercentage, revenueValue > 0 ? 8 : 2)}%`,
                        }}
                      />
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-full">
                      {getChartLabel(item.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* POPULAR PRODUCTS */}
        <div className="lg:col-span-4 border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Popular Products</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top performing menu items</p>
          </div>

          <div className="space-y-3">
            {popularProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No popular products logged yet.</p>
            ) : (
              popularProducts.map((product, index) => (
                <div
                  key={product.product_id || index}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-base shrink-0">
                        ☕
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {Number(product.total_orders || 0).toLocaleString()} orders
                      </p>
                    </div>
                  </div>

                  <span className="font-extrabold text-xs text-slate-900 whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl transition-all"
          >
            View Full Menu Analytics →
          </button>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Recent Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live transaction activity log</p>
          </div>

          <button type="button" className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentOrdersLoading ? (
            <div className="py-16 flex items-center justify-center text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              Loading transactions...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No recent orders registered.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Items</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-slate-900">
                      {order.order_number || `#ORD-${order.order_id}`}
                    </td>

                    <td className="py-3.5 px-2 text-slate-700 font-semibold">
                      {order.customer_name || "Walk-in Customer"}
                    </td>

                    <td className="py-3.5 px-2 text-slate-500 font-medium">
                      {Number(order.total_items || 0)} item{Number(order.total_items || 0) !== 1 ? "s" : ""}
                    </td>

                    <td className="py-3.5 px-2 font-extrabold text-slate-900">
                      {formatCurrency(order.amount)}
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`px-2.5 py-1 border rounded-lg font-bold text-[10px] inline-block ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{pagination.from || 0}</span> to{" "}
              <span className="font-bold text-slate-900">{pagination.to || 0}</span> of{" "}
              <span className="font-bold text-slate-900">{pagination.total}</span> orders
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1 || recentOrdersLoading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 text-slate-600 border border-slate-200/80 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.last_page || 1 }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  disabled={recentOrdersLoading}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs font-bold rounded-xl transition-all ${
                    currentPage === page
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === pagination.last_page || recentOrdersLoading}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, pagination.last_page))
                }
                className="p-2 text-slate-600 border border-slate-200/80 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}