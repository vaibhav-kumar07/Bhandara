'use client'
import React, { useState } from 'react'
import { loginAdmin } from '@/actions/Admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UsernameInput from '@/app/components/shared/UsernameInput'
import PinInput from '@/app/components/shared/PinInput'
import Button from '@/app/components/shared/Button'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    pin: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const handleUsernameChange = (value: string) => {
    if (!isRedirecting) {
      setFormData(prev => ({ ...prev, username: value }))
    }
  }

  const handlePinChange = (value: string) => {
    if (!isRedirecting) {
      setFormData(prev => ({ ...prev, pin: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRedirecting) return
    
    setIsSubmitting(true)
    
    try {
      const result = await loginAdmin({
        username: formData.username,
        pin: formData.pin
      })
      
      if (result.success) {
        toastSuccess('Login successful! Redirecting...')
        setIsSubmitting(false)
        setIsRedirecting(true)
        setFormData({ username: '', pin: '' })
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toastError(result.message || 'Login failed')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error logging in:', error)
      toastError('Invalid credentials or server error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <UsernameInput
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              autoFocus
            />

            <PinInput
              value={formData.pin}
              onChange={handlePinChange}
              disabled={isRedirecting}
            />

            <Button
              type="submit"
              isLoading={isSubmitting || isRedirecting}
              disabled={isRedirecting}
            >
              {isRedirecting ? 'Redirecting...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/admin/create" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Need an account? Create admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}