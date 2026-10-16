import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  LogOut,
  Edit2,
  Save,
  Shield,
  Coffee,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
  Heart,
} from "lucide-react";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });

  const [initialData, setInitialData] = useState({});

  const [stats] = useState({
    totalOrders: 12,
    rewardPoints: 340,
    favoriteItem: "Espresso",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/customer/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const user = response.data?.data || response.data;
        const profileData = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "client",
        };

        setFormData(profileData);
        setInitialData(profileData);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        setError(
          err.response?.data?.message || "Failed to load profile details."
        );
      } finally{
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:8000/api/customer/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = response.data?.data || response.data || formData;

      setFormData({
        name: updatedUser.name || formData.name,
        email: updatedUser.email || formData.email,
        phone: updatedUser.phone || formData.phone,
        address: updatedUser.address || formData.address,
        role: updatedUser.role || formData.role,
      });

      setInitialData(formData);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully!");

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-white px-6 py-4 rounded-2xl shadow-sm border border-zinc-200">
          <Loader2 className="animate-spin text-zinc-900" size={20} />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 text-emerald-900 px-4 py-3 rounded-xl text-sm font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200/80 text-rose-900 px-4 py-3 rounded-xl text-sm font-medium">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-rose-700 hover:text-rose-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Profile Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-900 flex items-center justify-center font-bold text-xl border border-amber-200/60 shrink-0">
              {formData.name ? (
                formData.name.charAt(0).toUpperCase()
              ) : (
                <Coffee size={24} />
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                {formData.name || "Guest User"}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full capitalize">
                  <Shield size={12} className="text-zinc-500" />
                  {formData.role} Member
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-3.5 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

       
        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Details Form */}
          <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 mb-5 flex items-center gap-2">
              <User size={16} className="text-zinc-500" />
              Personal Details
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing || saving}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 disabled:opacity-60 transition-all"
                      placeholder="Your name"
                    />
                   
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      disabled={!isEditing || saving}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 disabled:opacity-60 transition-all"
                      placeholder="name@example.com"
                    />
                    
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="phone"
                      disabled={!isEditing || saving}
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 disabled:opacity-60 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                   
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      disabled={!isEditing || saving}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 disabled:opacity-60 transition-all"
                      placeholder="Street address"
                    />
                   
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Quick Actions
              </h2>

              <div className="space-y-2">
                <Link
                  to="/order_tracking"
                  className="flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-800">
                      Track Orders
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-zinc-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>

                <Link
                  to="/menu"
                  className="flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Coffee size={16} className="text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-800">
                      Browse Menu
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-zinc-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <p className="text-xs font-medium text-zinc-900">Need help?</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">
                Reach out to support or ask your barista for order changes.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}