import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { verifyOtp } from '../../services/authService'

export default function OtpVerifyPage() {
  const navigate = useNavigate()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputRefs = useRef([])

  const email = sessionStorage.getItem('verify_email')

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]

    newOtp[index] = value.slice(-1)

    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (event, index) => {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()

    const pastedValue = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)

    if (!pastedValue) {
      return
    }

    const newOtp = [...otp]

    pastedValue.split('').forEach((digit, index) => {
      newOtp[index] = digit
    })

    setOtp(newOtp)

    const nextIndex = Math.min(pastedValue.length, 5)

    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerify = async (event) => {
    event.preventDefault()

    setError('')

    const fullOtp = otp.join('')

    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    if (!email) {
      setError('Verification email not found. Please register again.')
      return
    }

    try {
      setLoading(true)

      const response = await verifyOtp({
        email,
        otp: fullOtp,
      })

      console.log('OTP verification response:', response)

      sessionStorage.removeItem('verify_email')

      navigate('/login')
    } catch (err) {
      console.error('OTP verification failed:', err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid or expired verification code.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    sessionStorage.removeItem('verify_email')
    navigate('/register')
  }

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex flex-col justify-between">

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">

        <div className="w-full max-w-[440px] bg-[#FDFCF0] border border-[#DBDBCF] rounded-[28px] shadow-xl p-8 sm:p-10 space-y-6 text-center">

          {/* Mail Icon */}
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F1F0E4] border border-[#DBDBCF] text-[#2B2422] flex items-center justify-center mb-2">
            <Mail size={24} />
          </div>

          {/* Heading */}
          <div className="space-y-2">

            <h1 className="text-2xl font-bold text-[#2B2422] tracking-tight">
              Verify your email
            </h1>

            <p className="text-xs text-[#6F6864] leading-relaxed max-w-[300px] mx-auto">

              We've sent a 6-digit verification code to{' '}

              <span className="font-semibold text-[#2B2422]">
                {email || 'your email'}
              </span>

              .{' '}

              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[#2B2422] font-semibold underline hover:text-[#3E2723] transition-colors cursor-pointer"
              >
                Change email
              </button>

            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify} className="space-y-6">

            <div
              className="flex items-center justify-center gap-2 sm:gap-3"
              onPaste={handlePaste}
            >

              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(event) =>
                    handleChange(event.target.value, index)
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(event, index)
                  }
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold bg-[#F1F0E4] border border-[#DBDBCF] rounded-lg text-[#2B2422] focus:outline-none focus:border-[#3E2723] transition-colors"
                />
              ))}

            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723] transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

          </form>

          {/* Resend */}
          <div>
            <p className="text-xs text-[#6F6864]">
              Didn't receive the code?{' '}

              <button
                type="button"
                className="font-semibold text-[#2B2422] hover:text-[#3E2723] cursor-pointer"
              >
                Resend OTP
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#DBDBCF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6864]">

        <div className="font-bold text-[#2B2422]">
          Plouk Cafe
        </div>

        <div>
          © 2026 Plouk Cafe. Artisanal Coffee Culture.
        </div>

        <div className="flex items-center gap-6">

          <button
            type="button"
            className="hover:text-[#2B2422] cursor-pointer"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            className="hover:text-[#2B2422] cursor-pointer"
          >
            Terms of Service
          </button>

          <button
            type="button"
            className="hover:text-[#2B2422] cursor-pointer"
          >
            Support
          </button>

        </div>

      </footer>

    </div>
  )
}