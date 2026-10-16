import React from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Layouts
import CustomerLayout from "../layouts/CustomerLayout";
import MobileLayout from "../layouts/MobileLayout";
import AuthLayout from "../layouts/AuthLayout";
import CashierLayout from "../layouts/CashierLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Customer Pages & Components
import Home from "../pages/customers/Home";
import Menu from "../pages/customers/Menu";
import ProductDetail from "../components/menu/ProductDetail";
import Card from "../components/menu/Card";
import Checkout from "../pages/customers/Checkout";
import OrderDetail from "../pages/customers/OrderDetail";
import Profile from "../pages/customers/Profile";
import OrderTracking from "../pages/customers/OrderTracking";
import OrderSuccess from "../components/order/OrderSuccess";
import ShoppingBags from "../components/order/ShoppingBags";

// Mobile Pages
import MobileMenuPage from "../components/mobile/MobileMenuPage";
import CurrentOrdersPage from "../components/order/CurrentOrdersPage";
import TotalPage from "../components/order/TotalPage";
import HistoryPage from "../components/mobile/HistoryPage";
import TableWelcomePage from "../components/mobile/TableWelcomePage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import OtpVerifyPage from "../pages/auth/OtpVerifyPage";
import CashierLoginPage from "../pages/auth/CashierLoginPage";

// Cashier Pages & Components
import CashierDashboard from "../pages/cashier/CashierDashboard";
import Productpage from "../pages/cashier/Productpage";
import PaymentPage from "../pages/cashier/PaymentPage";
import Tables from "../pages/cashier/Tables";
import OrdersPage from "../pages/cashier/OrdersPage";
import OrderDetailModal from "../pages/cashier/OrderDetailModal";

import ReceiptPage from "../pages/cashier/ReceiptPage";
import EOrdersPage from "../pages/cashier/EOrdersPage";
import ViewSessionPage from "../components/cashier/ViewSessionPage";
import NewSessionPage from "../components/cashier/NewSessionPage";
import CheckInPage from "../components/cashier/CheckInPage";

// Admin Pages & Settings
import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/dashboard/Products";
import Payments from "../pages/dashboard/Payments";
import Categories from "../pages/dashboard/Categories";
import Report from "../pages/dashboard/Report";
import Table from "../pages/dashboard/Table";
import Users from "../pages/dashboard/Usered";
import Settings from "../pages/dashboard/Settings";
import General from "../components/admin/General";
import Notification from "../components/admin/Notification";
import Ordered from "../components/admin/Ordered";
import Payment from "../components/admin/Payment";
import Security from "../components/admin/Security";
import Event from "../pages/dashboard/Event";

// Utilities
import UnauthorizedPage from "../config/UnauthorizedPage";
import ForgotPasswordPage from "../config/ForgotPasswordPage";
import ResetPasswordPage from "../config/ResetPasswordPage";
import OrderHistory from "../pages/cashier/OrderHistory";
import CashierProfile from "../pages/cashier/CashierProfile";
import Orders from "../pages/dashboard/Order";
import TableQrPage from "../components/mobile/TableQrPage";
import AdminProfile from "../pages/dashboard/AdminProfile";
import FavoritesPage from "../pages/customers/FavoritesPage";
import GoogleCallback from "../pages/auth/GoogleCallback";
import EventSettings from "../components/admin/EventSettings";


// ------------------------------------------------------------
// PROTECTED ROUTE COMPONENT
// ------------------------------------------------------------
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === "admin" || allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

// ------------------------------------------------------------
// ROUTER DEFINITION
// ------------------------------------------------------------
const MainRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Section */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="menu/:id" element={<ProductDetail />} />
          <Route path="card" element={<Card />} />
          <Route path="shoppingbags" element={<ShoppingBags />} />
          <Route path="favorites" element={<FavoritesPage />} />

          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="order_tracking/:orderId" element={<OrderTracking />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="order_success" element={<OrderSuccess />} />
          </Route>
        </Route>

        {/* Mobile Section */}
        <Route element={<MobileLayout />}>
          <Route path="/mobile_menu" element={<MobileMenuPage />} />
          <Route path="/tableQr" element={<TableQrPage />} />
          <Route path="/current" element={<CurrentOrdersPage />} />
          <Route path="/total" element={<TotalPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/table_welcome" element={<TableWelcomePage />} />
        </Route>

        {/* Auth Section */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verifyOtp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/cashier_login" element={<CashierLoginPage />} />
          <Route path="/google-callback"  element={<GoogleCallback />}/>
        </Route>

        {/* Cashier Section */}
        <Route element={<ProtectedRoute allowedRoles={["cashier"]} />}>
          <Route element={<CashierLayout />}>
            <Route path="/cashier_dashboard" element={<CashierDashboard />} />
            <Route path="/product" element={<Productpage />} />
            <Route path="/table" element={<Tables />} />
            <Route path="/order" element={<OrdersPage />} />
            <Route path="/order_detail" element={<OrderDetailModal />} />
            <Route path="/order_history" element={<OrderHistory/>} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/eorder" element={<EOrdersPage />} />
            <Route path="/view/:id" element={<ViewSessionPage />} />
            <Route path="/new/:tableId" element={<NewSessionPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="cashier_profile" element={<CashierProfile/>}/>
          </Route>
        </Route>

        {/* Admin Section */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product_dashboard" element={<Products />} />
            <Route path="/order_dashboard" element={<Orders />} />
            <Route path="/payment_dashboard" element={<Payments />} />
            <Route path="/category_dashboard" element={<Categories />} />
            <Route path="/report_dashboard" element={<Report />} />
            <Route path="/table_dashboard" element={<Table />} />
            <Route path="/user_dashboard" element={<Users />} />
            <Route path="/events" element={<Event/>} />
            <Route path="/admin_profile" element={<AdminProfile />} />

            <Route path="/setting" element={<Settings />}>
              <Route path="general" element={<General />} />
              <Route path="notification" element={<Notification />} />
              <Route path="ordered" element={<Ordered />} />
              <Route path="payments" element={<Payment />} />
              <Route path="security" element={<Security />} />
              <Route path="events" element={<EventSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;