import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  trend?: number        // positivo = crescimento, negativo = queda
  trendLabel?: string  // ex: "vs. mês anterior"
  icon?: React.ReactNode
  accent?: boolean      // usa a cor do nicho
  loading?: boolean
}

export function KpiCard({
  label, value, trend, trendLabel = 'vs. mês anterior',
  icon, accent = false, loading = false
}: KpiCardProps) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNeutral = trend === undefined || trend === 0

  return (
    <div className={cn(
      'card p-5 flex flex-col gap-3',
      accent && 'border-brand/20'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accent ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn(
        'text-2xl font-bold text-gray-900',
        loading && 'animate-pulse bg-gray-200 rounded h-8 w-32'
      )}>
        {!loading && value}
      </div>

      {/* Trend */}
      {trend !== undefined && !loading && (
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-semibold',
            trendNeutral ? 'text-gray-400' : trendPositive ? 'text-green-600' : 'text-red-500'
          )}>
            {trendNeutral ? (
              <Minus className="w-3 h-3" />
            ) : trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
          <span className="text-xs text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
