import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Coffee, Eye, EyeOff } from 'lucide-react'
import { register } from '../../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    setError('')

    // ==========================================
    // FRONTEND VALIDATION
    // ==========================================

    const name = fullName.trim()
    const userEmail = email.trim()

    if (!name) {
      setError('Please enter your full name.')
      return
    }

    if (name.length < 3) {
      setError('Full name must be at least 3 characters.')
      return
    }

    if (!userEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter a password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms and Conditions.')
      return
    }

    // ==========================================
    // REGISTER
    // ==========================================

    try {
      setLoading(true)

      const payload = {
        name: name,
        email: userEmail,
        password: password,
      }

      console.log('=================================')
      console.log('REGISTER REQUEST')
      console.log('=================================')
      console.log('Payload:', {
        ...payload,
        password: '********',
      })

      const response = await register(payload)

      console.log('=================================')
      console.log('REGISTER SUCCESS')
      console.log('=================================')
      console.log('Response:', response)

      // ==========================================
      // SAVE EMAIL FOR OTP PAGE
      // ==========================================

      sessionStorage.setItem(
        'verify_email',
        userEmail
      )

      // ==========================================
      // GO TO OTP PAGE
      // ==========================================

      navigate('/verifyOtp')

    } catch (err) {
      console.error('=================================')
      console.error('REGISTRATION FAILED')
      console.error('=================================')

      console.error('Axios error:', err)
      console.error(
        'Server response:',
        err.response?.data
      )

      // ==========================================
      // GET LARAVEL VALIDATION ERRORS
      // ==========================================

      const serverData = err.response?.data

      const validationMessage =
        serverData?.message

      /*
       * Laravel returns:
       *
       * message: {
       *   email: [
       *     "The email has already been taken."
       *   ]
       * }
       */

      if (
        validationMessage &&
        typeof validationMessage === 'object'
      ) {
        const firstError = Object.values(
          validationMessage
        )?.[0]?.[0]

        if (firstError) {
          setError(firstError)
          return
        }
      }

      // ==========================================
      // NORMAL STRING MESSAGE
      // ==========================================

      if (
        typeof validationMessage === 'string'
      ) {
        setError(validationMessage)
        return
      }

      // ==========================================
      // FALLBACK
      // ==========================================

      setError(
        'Registration failed. Please check your information and try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex items-center justify-center p-0 md:p-6">

      <div className="w-full max-w-[1100px] min-h-screen md:min-h-[750px] md:rounded-[32px] bg-[#FDFCF0] md:border border-[#DBDBCF] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative">

        {/* ==========================================
            LEFT SIDE
        ========================================== */}

        <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden bg-neutral-900">

          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"
            alt="Barista crafting coffee"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="relative z-10 space-y-3 max-w-md">

            <div className="inline-flex items-center gap-2 text-white mb-1">

              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">

                <Coffee size={16} />

              </div>

            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">

              Crafted to
              <br />
              perfection.

            </h1>

            <p className="text-sm text-neutral-200 leading-relaxed">

              Experience artisanal coffee culture from
              the comfort of your screen.

            </p>

          </div>

        </div>

        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div className="flex items-center justify-center p-6 md:p-10 bg-[#FDFCF0]">

          <div className="w-full max-w-[400px] bg-[#FDFCF0] md:bg-[#F1F0E4] md:border border-[#DBDBCF] md:rounded-[24px] md:shadow-lg p-6 md:p-8 space-y-5">

            {/* BRAND */}

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-full bg-[#1f1611] text-white flex items-center justify-center">

                <Coffee size={14} />

              </div>

              <span className="font-bold text-sm text-[#2B2422]">
                Plouk Cafe
              </span>

            </div>

            {/* HEADER */}

            <div className="space-y-1">

              <h2 className="text-2xl font-bold text-[#2B2422] tracking-tight">

                Create your account

              </h2>

              <p className="text-xs text-[#6F6864]">

                Join us and enjoy a better coffee
                ordering experience.

              </p>

            </div>

            {/* ERROR */}

            {error && (

              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">

                {error}

              </div>

            )}

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="space-y-3.5"
            >

              {/* FULL NAME */}

              <div className="space-y-1">

                <label className="text-[11px] font-semibold text-[#2B2422] block">

                  Full name

                </label>

                <input
                  type="text"
                  required
                  minLength={3}
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-[#FDFCF0] border border-[#DBDBCF] rounded-lg text-xs text-[#2B2422] placeholder-[#8C8782] focus:outline-none focus:border-[#3E2723] transition-colors"
                />

              </div>

              {/* EMAIL */}

              <div className="space-y-1">

                <label className="text-[11px] font-semibold text-[#2B2422] block">

                  Email address

                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-[#FDFCF0] border border-[#DBDBCF] rounded-lg text-xs text-[#2B2422] placeholder-[#8C8782] focus:outline-none focus:border-[#3E2723] transition-colors"
                />

              </div>

              {/* PASSWORD */}

              <div className="space-y-1">

                <label className="text-[11px] font-semibold text-[#2B2422] block">

                  Password

                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full pl-3 pr-9 py-2 bg-[#FDFCF0] border border-[#DBDBCF] rounded-lg text-xs text-[#2B2422] placeholder-[#8C8782] focus:outline-none focus:border-[#3E2723] transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8782] hover:text-[#2B2422] cursor-pointer"
                  >

                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}

                  </button>

                </div>

                <p className="text-[10px] text-[#8C8782]">
                  Password must contain at least 6 characters.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="space-y-1">

                <label className="text-[11px] font-semibold text-[#2B2422] block">

                  Confirm password

                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 bg-[#FDFCF0] border border-[#DBDBCF] rounded-lg text-xs text-[#2B2422] placeholder-[#8C8782] focus:outline-none focus:border-[#3E2723] transition-colors"
                />

              </div>

              {/* TERMS */}
              

              {/* <div className="grid grid-cols-2 left">

                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) =>
                    setAgreeTerms(
                      e.target.checked
                    )
                  }
                  className="w-2.5 h-2.5 cursor-pointer"
                />

                <span className="text-[11px] text-[#6F6864] w-full">

                  I agree to the{' '}

                  <span className="underline font-medium text-[#2B2422] cursor-pointer">

                    Terms and Conditions

                  </span>

                </span>

              </div> */}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3E2723] transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading
                  ? 'Creating account...'
                  : 'Create Account'}

              </button>

            </form>

            {/* LOGIN */}

            <div className="pt-2 text-center">

              <p className="text-[11px] text-[#6F6864]">

                Already have an account?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-[#2B2422] hover:text-[#3E2723]"
                >
                  Sign in
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}