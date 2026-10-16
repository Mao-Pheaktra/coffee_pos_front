import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Security() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true,
    sessionTimeout: '30 Minutes',
    multipleSessions: false,
    loginProtection: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleUpdatePassword = () => {
    alert('Password updated successfully!')
  }

  const handleDiscard = () => {
    alert('Changes discarded')
  }

  const handleSaveAll = () => {
    alert('All security settings saved!')
  }

  return (
    <div className="flex-1 space-y-6">
      
      {/* Top Header Description */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight font-[family-name:var(--font-heading)]">
          Security Settings
        </h2>
        <p className="text-xs text-neutral-500 font-medium">
          Protect your administrative account with advanced security measures.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-5 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">Change Password</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-2 pr-10 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden focus:border-neutral-400"
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700">New Password</label>
            <div className="relative">
              <input 
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-2 pr-10 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden focus:border-neutral-400"
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-2 pr-10 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden focus:border-neutral-400"
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleUpdatePassword}
            className="px-5 py-2.5 bg-[#1f1611] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs mt-2"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Authentication & Sessions Card */}
      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-6 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">Authentication & Sessions</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Manage how you log in and how long your sessions remain active.</p>
        </div>

        <div className="divide-y divide-neutral-100 space-y-4">
          
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">Two-Factor Authentication</div>
              <div className="text-[11px] text-neutral-500 font-medium">Require an extra security code when logging in.</div>
            </div>
            <button 
              type="button"
              onClick={() => handleToggle('twoFactor')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                formData.twoFactor ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                formData.twoFactor ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">Session Timeout</div>
              <div className="text-[11px] text-neutral-500 font-medium">Automatically log out of inactive sessions.</div>
            </div>
            <select 
              aria-label="Session Timeout duration"
              name="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={handleChange}
              className="px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden cursor-pointer w-full sm:w-44"
            >
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>Never</option>
            </select>
          </div>

          {/* Allow Multiple Sessions */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">Allow Multiple Sessions</div>
              <div className="text-[11px] text-neutral-500 font-medium">Permit logging into the admin portal from multiple devices simultaneously.</div>
            </div>
            <button 
              type="button"
              onClick={() => handleToggle('multipleSessions')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                formData.multipleSessions ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                formData.multipleSessions ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Login Attempt Protection */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">Login Attempt Protection</div>
              <div className="text-[11px] text-neutral-500 font-medium">Temporarily lock the account after 5 consecutive failed login attempts.</div>
            </div>
            <button 
              type="button"
              onClick={() => handleToggle('loginProtection')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                formData.loginProtection ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                formData.loginProtection ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button 
          type="button" 
          onClick={handleDiscard}
          className="px-5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
        >
          Discard Changes
        </button>
        <button 
          type="button" 
          onClick={handleSaveAll}
          className="px-6 py-2.5 bg-[#1f1611] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
        >
          Save All Changes
        </button>
      </div>

    </div>
  )
}