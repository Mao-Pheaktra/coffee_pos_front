import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      console.error('Google login token is missing')
      navigate('/login')
      return
    }

    // Save authentication token
    localStorage.setItem('token', token)

    // Tell Navbar and other components that auth changed
    window.dispatchEvent(new Event('authChanged'))

    // Go to homepage
    navigate('/')
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
      <div className="text-center">
        <div className="mb-3 text-lg font-semibold text-[#2B2422]">
          Signing you in...
        </div>

        <p className="text-sm text-[#6F6864]">
          Please wait.
        </p>
      </div>
    </div>
  )
}