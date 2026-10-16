import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Camera,
  Save,
  CheckCircle2,
  Lock,
  Clock,
  Loader2,
  AlertCircle,
  Hash,
  XCircle,
  Activity,
} from "lucide-react";

import { getAdminProfile } from "../../services/adminService";

// Helper Functions
const getInitials = (name) => {
  if (!name) return "AD";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const formatRole = (role) => {
  if (!role) return "Administrator";
  const rolesMap = {
    admin: "Administrator",
    cashier: "Cashier",
    client: "Customer",
  };
  return rolesMap[role.toLowerCase()] || role;
};

const SYSTEM_PERMISSIONS = [
  "POS Access",
  "Financial Reports",
  "Inventory Edit",
  "Staff Management",
];

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    profileImage: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProfile();
      const user = response?.data;

      if (!user) {
        throw new Error("Admin profile data not found.");
      }

      setProfile({
        id: user.id ?? null,
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "",
        status: user.status ?? "",
        profileImage: user.profileImage ?? null,
      });
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load admin profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCancel = () => {
    fetchAdminProfile();
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 size={26} className="animate-spin text-slate-700" />
        <p className="text-xs font-medium tracking-wide">Loading admin profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3.5">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-rose-900">Failed to load profile</h3>
            <p className="text-xs text-rose-600/90">{error}</p>
            <button
              type="button"
              onClick={fetchAdminProfile}
              className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Admin Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal credentials, system privileges, and account security.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-xl text-xs font-medium shadow-xs">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sidebar Cards */}
        <div className="space-y-5">
          {/* Main User Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-center flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-22 h-22 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl border-4 border-slate-50 shadow-inner overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(profile.name)}</span>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md border-2 border-white transition-transform active:scale-95 cursor-pointer"
                title="Upload Photo"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Name & Identity */}
            <h2 className="text-sm font-bold text-slate-900 mt-3.5">
              {profile.name || "Administrator"}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              {profile.email || "No email assigned"}
            </p>

            <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full text-[11px] font-semibold">
                <Shield size={11} className="text-amber-600" />
                {formatRole(profile.role)}
              </span>

              {profile.status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-[10px] font-semibold capitalize">
                  <Activity size={10} className="text-emerald-500" />
                  {profile.status}
                </span>
              )}
            </div>

            <hr className="w-full my-4 border-slate-100" />

            {/* System Privileges */}
            <div className="w-full text-left space-y-2.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                System Access Privileges
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SYSTEM_PERMISSIONS.map((perm, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[11px] font-medium"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Session Overview Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Session Overview
            </span>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Clock size={14} className="text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Session Role</p>
                <p className="text-[11px] text-slate-400">Authorized System Administrator</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Lock size={14} className="text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Account Status</p>
                <p className="text-[11px] text-emerald-600 font-medium capitalize">
                  {profile.status || "Active Session"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Personal Info */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User size={16} className="text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                      required
                    />
                  
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                      required
                    />
                  
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                  
                  </div>
                </div>

                {/* Role (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatRole(profile.role)}
                      readOnly
                      className="w-full pl-8 pr-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                 
                  </div>
                </div>
              </div>

              {/* Account ID Display */}
              {profile.id && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System User ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.id}
                      readOnly
                      className="w-full pl-8 pr-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                   
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Security & Password */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Key size={16} className="text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Security Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                <XCircle size={13} />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Save size={13} />
                <span>Save Updates</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}