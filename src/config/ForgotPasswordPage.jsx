import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendResetLink = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await forgotPassword({
        email: email.trim(),
      });

      if (data.status) {
        setSuccess(
          "If this email exists, a password reset link has been sent. Please check your email."
        );
      } else {
        setError(data.message || "Failed to send password reset link.");
      }
    } catch (err) {
      const responseData = err.response?.data;
      const message =
        typeof responseData?.message === "string"
          ? responseData.message
          : "Failed to send password reset link.";

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
                Forgot password?
              </h2>
              <p className="text-xs text-[#6F6864] leading-relaxed">
                Enter your email address and we'll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#2B2422]">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8782]"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-xs text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
                  />
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
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}