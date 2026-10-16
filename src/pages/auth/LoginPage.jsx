import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Eye,
  EyeOff,
  Mail,
} from 'lucide-react'

import { login, verifyOtp, loginWithGoogle, } from '../../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================
  // LOGIN
  // =========================

 const handleLogin = async (e) => {
  e.preventDefault()

  setError('')
  setLoading(true)

  try {
    const response = await login({
      email,
      password,
    })

    console.log('LOGIN RESPONSE:', response)

    // ==========================================
    // GET TOKEN
    // ==========================================

    const token =
      response?.token ||
      response?.data?.token

    // ==========================================
    // GET USER
    // ==========================================

    const user =
      response?.user ||
      response?.data?.user

    // ==========================================
    // GET ROLE
    // ==========================================

    const role =
      response?.data?.role ||
      user?.role

    console.log('TOKEN:', token)
    console.log('USER:', user)
    console.log('ROLE:', role)

    if (!token) {
      throw new Error('Login token was not returned.')
    }

    // ==========================================
    // SAVE LOGIN DATA
    // ==========================================

    localStorage.setItem('token', token)

    if (user) {
      localStorage.setItem(
        'user',
        JSON.stringify(user)
      )
    }

    if (role) {
      localStorage.setItem('role', role)
    }

    // ==========================================
    // REDIRECT BY ROLE
    // ==========================================

    if (role === 'cashier') {
      navigate('/cashier_dashboard')
      return
    }

    if (role === 'admin') {
      navigate('/admin_dashboard')
      return
    }

    if (role === 'client') {
      navigate('/')
      return
    }

    setError('Unknown user role.')

  } catch (err) {
    console.error('LOGIN FAILED:', err)

    const message =
      err?.response?.data?.message

    if (
      message &&
      typeof message === 'object'
    ) {
      const firstError =
        Object.values(message)?.[0]?.[0]

      setError(
        firstError ||
        'Login validation failed.'
      )
    } else {
      setError(
        typeof message === 'string'
          ? message
          : err?.message ||
            'Invalid email or password.'
      )
    }

  } finally {
    setLoading(false)
  }
}

  // =========================
  // OTP INPUT
  // =========================

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return

    const updatedOtp = [...otp]
    updatedOtp[index] = value.slice(-1)
    setOtp(updatedOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // =========================
  // VERIFY REGISTRATION OTP
  // =========================

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    const fullOtp = otp.join('')

    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    if (!email) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
     const data = await verifyOtp({ email, otp: fullOtp })
      const isSuccess =
        data?.status === true ||
        data?.status === 200 ||
        data?.success === true

      if (isSuccess) {
        setSuccess('Email verified successfully. You can now login.')
        setOtp(['', '', '', '', '', ''])

        setTimeout(() => {
          setShowOtp(false)
          setSuccess('')
        }, 1200)

        return
      }

      setError(data?.message || 'OTP verification failed.')
    } catch (err) {
      const responseData = err.response?.data
      const message =
        typeof responseData?.message === 'string'
          ? responseData.message
          : err.message || 'Invalid or expired OTP.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // LOGIN FORM
  // =========================

const renderLoginForm = () => (
  <>
    {/* Back Button */}
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6864] hover:text-[#3E2723] transition-colors"
    >
      <ArrowLeft size={15} />
      Back
    </button>

    <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F0E4D7] text-[#3E2723] flex items-center justify-center mb-2">
          <Coffee size={22} />
        </div>
        <h2 className="text-2xl font-bold text-[#2B2422] tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-[#6F6864]">
          Sign in to continue to your account.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#2B2422]">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full px-3.5 py-2.5 bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-xs text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#2B2422]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-xs text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8782] cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="w-3.5 h-3.5"
            />
            <span className="text-[11px] text-[#6F6864]">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-[11px] font-medium text-[#6F6864] hover:text-[#3E2723]"
          >
            Forgot password?
          </button>
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
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723] transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={14} />}
        </button>
        <div className="flex items-center gap-3 py-2">
  <div className="flex-1 h-px bg-[#DBDBCF]" />
  <span className="text-[10px] text-[#8C8782]">OR</span>
  <div className="flex-1 h-px bg-[#DBDBCF]" />
</div>

<button
  type="button"
  onClick={loginWithGoogle}
  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#DBDBCF] text-[#2B2422] rounded-full text-xs font-semibold hover:bg-[#F7F6ED] transition-colors"
>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.805 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.045-4.4 3.045-7.68Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.91.61-2.07.97-3.47.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10.22 10.22 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.25 13.72A6.15 6.15 0 0 1 5.93 12c0-.6.11-1.18.32-1.72V7.64H2.84A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.36l3.17-2.64Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.08 3.04 14.76 2 12 2a10.22 10.22 0 0 0-9.16 5.64l3.17 2.64C6.82 7.86 9.1 6.06 12 6.06Z"
      fill="#EA4335"
    />
  </svg>

  Continue with Google
</button>
      </form>

      <div className="pt-4 border-t border-[#DBDBCF] text-center">
        <p className="text-[11px] text-[#6F6864]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#2B2422] hover:text-[#3E2723]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </>
  )

  // =========================
  // OTP FORM
  // =========================

  const renderOtpForm = () => (
    <>
      <button
        type="button"
        onClick={() => {
          setShowOtp(false)
          setOtp(['', '', '', '', '', ''])
          setError('')
          setSuccess('')
        }}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6864] hover:text-[#3E2723]"
      >
        <ArrowLeft size={15} />
        Back to login
      </button>

      <div className="text-center space-y-2 pt-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#F0E4D7] text-[#3E2723] flex items-center justify-center">
          <Mail size={24} />
        </div>
        <h2 className="text-2xl font-bold text-[#2B2422]">
          Verify your email
        </h2>
        <p className="text-xs text-[#6F6864] leading-relaxed">
          Enter the 6-digit verification code sent to
        </p>
        <p className="text-xs font-semibold text-[#2B2422]">{email}</p>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-5 pt-2">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) =>
                handleOtpChange(event.target.value, index)
              }
              onKeyDown={(event) => handleOtpKeyDown(event, index)}
              className="w-11 h-12 text-center text-lg font-bold bg-[#FDFCF0] border border-[#DBDBCF] rounded-xl text-[#2B2422] focus:outline-none focus:border-[#3E2723]"
            />
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 text-center">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723] disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </>
  )

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-[1100px] min-h-screen md:min-h-[700px] md:rounded-[32px] bg-[#FDFCF0] md:border border-[#DBDBCF] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Hero */}
        <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1000"
            alt="Barista pouring coffee"
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

        {/* Form */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-[#FDFCF0]">
          <div className="w-full max-w-[380px] bg-[#F1F0E4] md:border border-[#DBDBCF] md:rounded-[24px] md:shadow-lg p-6 md:p-8 space-y-6">
            {showOtp ? renderOtpForm() : renderLoginForm()}
          </div>
        </div>
      </div>
    </div>
  )
}