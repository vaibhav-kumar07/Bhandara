interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  icon?: React.ReactNode
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  icon 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number' && val >= 1000) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(val)
    }
    return val.toString()
  }

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center rounded-lg">
        {icon && (
          <div className="flex-shrink-0 mr-2 sm:mr-3">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium opacity-75 truncate">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold break-words">{formatValue(value)}</p>
          {subtitle && (
            <p className="text-xs opacity-60 mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}