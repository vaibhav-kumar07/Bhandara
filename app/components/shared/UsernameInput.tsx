'use client'
import React from 'react'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export default function UsernameInput({
  value,
  onChange,
  placeholder = 'Enter username',
  required = true,
  autoFocus = false,
  disabled = false
}: UsernameInputProps) {
  return (
    <div>
      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
        Username
      </label>
      <input
        type="text"
        id="username"
        name="username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{ textTransform: 'uppercase' }}
        placeholder={placeholder}
        autoComplete="username"
      />
    </div>
  )
}

