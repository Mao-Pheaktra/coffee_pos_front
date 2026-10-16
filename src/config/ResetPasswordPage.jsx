import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const [email, setEmail] = useState(emailFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword({
        token: token,
        email: email,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (data.status) {
        setSuccess("Password reset successfully. Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      setError(data.message || "Failed to reset password.");
    } catch (err) {
      const responseData = err.response?.data;
      const message =
        typeof responseData?.message === "string"
          ? responseData.message
          : "Invalid or expired password reset link.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-[1100px] min-h-screen md:min-h-[700px] md:rounded-[32px] bg-[#FDFCF0] md:border border-[#DBDBCF] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* HERO SECTION */}
        <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1000"
            alt="Coffee"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-3 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Fresh coffee.
              <br />
              Simple ordering.
            </h1>
            <p className="text-sm text-neutral-200 leading-relaxed">
              Enjoy a seamless experience from ordering to payment.
              <br />
              Built for speed, designed for warmth.
            </p>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-[#FDFCF0]">
          <div className="w-full max-w-[380px] bg-[#F1F0E4] md:border border-[#DBDBCF] md:rounded-[24px] md:shadow-lg p-6 md:p-8 space-y-6">
            
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6864] hover:text-[#3E2723]"
            >
              <ArrowLeft size={15} />
              Back to login
            </button>

            <div className="text-center space-y-2 pt-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F0E4D7] text-[#3E2723] flex items-center justify-center">
                <KeyRound size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#2B2422]">
                Create new password
              </h2>
              <p className="text-xs text-[#6F6864]">
                Create a new password for
              </p>
              <p className="text-xs font-semibold text-[#2B2422] break-all">
                {email || "your account"}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              
              {/* NEW PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#2B2422]">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-xs text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8782]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#2B2422]">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-xs text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8782]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723] disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
                {!loading && <CheckCircle size={14} />}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}