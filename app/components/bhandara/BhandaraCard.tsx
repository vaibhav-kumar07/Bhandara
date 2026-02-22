import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

interface BhandaraCardProps {
  bhandara: {
    id: string
    name: string
    date: string
    description?: string
  }
  isAdmin?: boolean
}

export default function BhandaraCard({ bhandara, isAdmin = false }: BhandaraCardProps) {
  const href = `${isAdmin ? '/admin' : ''}/bhandara/${bhandara.id}`

  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300 active:scale-[0.98]"
    >
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
        {/* Left: Bhandara Name, Date and Description */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="capitalize text-sm sm:text-base font-semibold text-gray-900 truncate">
            {bhandara.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {new Date(bhandara.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          {bhandara.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {bhandara.description}
            </p>
          )}
        </div>

        {/* Right: Arrow Icon */}
        <div className="shrink-0">
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}