'use client'
import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export default function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  className = ''
}: ButtonProps) {
  const baseClasses = 'w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

