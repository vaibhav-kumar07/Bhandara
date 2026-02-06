import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

/**
 * Simple and reusable toast utility
 * @param options - Toast options with message and type
 * @example
 * toast({ message: 'Donor added successfully!', type: 'success' })
 * toast({ message: 'Failed to create donor', type: 'error' })
 */
export function toast({ message, type = 'success', duration = 3000 }: ToastOptions) {
  switch (type) {
    case 'success':
      sonnerToast.success(message, { 
        duration,
        classNames: {
          toast: 'bg-green-500 text-white border-green-600',
          title: 'text-white font-semibold',
          description: 'text-white/90'
        }
      })
      break
    case 'error':
      sonnerToast.error(message, { 
        duration,
        classNames: {
          toast: 'bg-red-500 text-white border-red-600',
          title: 'text-white font-semibold',
          description: 'text-white/90'
        }
      })
      break
    case 'warning':
      sonnerToast.warning(message, { 
        duration,
        classNames: {
          toast: 'bg-yellow-500 text-white border-yellow-600',
          title: 'text-white font-semibold',
          description: 'text-white/90'
        }
      })
      break
    case 'info':
    default:
      sonnerToast.info(message, { 
        duration,
        classNames: {
          toast: 'bg-blue-500 text-white border-blue-600',
          title: 'text-white font-semibold',
          description: 'text-white/90'
        }
      })
      break
  }
}

/**
 * Success toast - Green color
 */
export function toastSuccess(message: string) {
  toast({ message, type: 'success' })
}

/**
 * Error toast - Red color
 */
export function toastError(message: string) {
  toast({ message, type: 'error' })
}

/**
 * Warning toast - Yellow/Orange color
 */
export function toastWarning(message: string) {
  toast({ message, type: 'warning' })
}

/**
 * Info toast - Blue color
 */
export function toastInfo(message: string) {
  toast({ message, type: 'info' })
}

