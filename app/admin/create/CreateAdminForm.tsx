'use client'
import React, { useState } from 'react'
import { createAdmin } from '@/actions/Admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UsernameInput from '@/app/components/shared/UsernameInput'
import PinInput from '@/app/components/shared/PinInput'
import Button from '@/app/components/shared/Button'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

export default function CreateAdminForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    pin: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
      const result = await createAdmin({
        username: formData.username,
        pin: formData.pin,
      })
      
      if (result.success) {
        toastSuccess('Admin added successfully!')
        setIsSubmitting(false)
        setIsRedirecting(true)
        setFormData({ username: '', pin: '' })
        setTimeout(() => {
          router.push('/admin/Dashboard')
        }, 1500)
      } else {
        toastError(result.message || 'Failed to add admin')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error adding admin:', error)
      toastError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <UsernameInput
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
              autoFocus
              disabled={isRedirecting}
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
              {isRedirecting ? 'Redirecting...' : 'Add Admin'}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/admin/Dashboard" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

