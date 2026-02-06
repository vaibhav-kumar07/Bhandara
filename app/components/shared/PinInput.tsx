'use client'
import React, { useRef, useEffect } from 'react'

interface PinInputProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export default function PinInput({
  value,
  onChange,
  required = true,
  autoFocus = false,
  disabled = false
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, digit: string) => {
    if (disabled) return
    
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) {
      return
    }

    const newValue = value.split('')
    newValue[index] = digit || ''
    const updatedValue = newValue.join('').slice(0, 5)
    onChange(updatedValue)

    // Auto-focus next input
    if (digit && index < 4 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 5)
    if (/^\d*$/.test(pastedData)) {
      onChange(pastedData)
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 4)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        PIN
      </label>
      <div className="flex gap-2 justify-start flex-wrap">
        {[0, 1, 2, 3, 4].map((index) => (
          <input
            key={index}
            ref={(el:any) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            required={required && index === 0}
            disabled={disabled}
            className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500 text-center">Enter 5-digit PIN</p>
    </div>
  )
}

