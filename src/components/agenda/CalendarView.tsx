'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/types/database'

const HOUR_START = 7   // 07:00
const HOUR_END = 21    // 21:00
const TOTAL_HOURS = HOUR_END - HOUR_START
const ROW_HEIGHT_PX = 64

const STATUS_COLORS: Record<string, string> = {
  agendado:        'bg-blue-100 border-blue-400 text-blue-900',
  confirmado:      'bg-green-100 border-green-400 text-green-900',
  em_atendimento:  'bg-yellow-100 border-yellow-400 text-yellow-900',
  concluido:       'bg-gray-100 border-gray-400 text-gray-600',
  cancelado:       'bg-red-50 border-red-300 text-red-600 opacity-60',
  falta:           'bg-orange-100 border-orange-300 text-orange-700 opacity-70',
}

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${weekStart.toLocaleDateString('pt-BR', opts)} – ${weekEnd.toLocaleDateString('pt-BR', opts)}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface CalendarViewProps {
  appointments: Appointment[]
  loading: boolean
  onWeekChange: (weekStart: Date) => void
  onSelectAppointment: (appointment: Appointment) => void
  onNewAppointment: (date: Date) => void
}

export function CalendarView({
  appointments,
  loading,
  onWeekChange,
  onSelectAppointment,
  onNewAppointment,
}: CalendarViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()))

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }),
  [weekStart])

  useEffect(() => {
    onWeekChange(weekStart)
  }, [weekStart, onWeekChange])

  function navigate(direction: -1 | 1) {
    setWeekStart(prev => {
      const next = new Date(prev)
      next.setDate(next.getDate() + direction * 7)
      return next
    })
  }

  function getAppointmentStyle(appt: Appointment): React.CSSProperties {
    const start = new Date(appt.starts_at)
    const end = new Date(appt.ends_at)
    const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes()
    const durationMinutes = Math.max((end.getTime() - start.getTime()) / 60000, 15)
    const totalMinutes = TOTAL_HOURS * 60
    const topPct = (startMinutes / totalMinutes) * 100
    const heightPct = (durationMinutes / totalMinutes) * 100
    return { top: `${topPct}%`, height: `${heightPct}%`, position: 'absolute', left: 2, right: 2 }
  }

  function handleGridClick(day: Date, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const totalPx = TOTAL_HOURS * ROW_HEIGHT_PX
    const minuteOffset = Math.floor((clickY / totalPx) * TOTAL_HOURS * 60)
    const h = HOUR_START + Math.floor(minuteOffset / 60)
    const m = Math.floor((minuteOffset % 60) / 30) * 30
    const clicked = new Date(day)
    clicked.setHours(h, m, 0, 0)
    onNewAppointment(clicked)
  }

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i)
  const today = new Date()

  return (
    <div className="flex flex-col h-full">
      {/* Navegação de semana */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <span className="text-sm font-medium text-gray-700 min-w-[190px] text-center">
          {formatWeekLabel(weekStart)}
        </span>

        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={() => setWeekStart(getWeekStart(new Date()))}
          className="ml-1 px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
        >
          Hoje
        </button>

        {loading && (
          <span className="ml-auto text-xs text-gray-400 animate-pulse">Carregando...</span>
        )}
      </div>

      {/* Grade */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-xl bg-white">
        <div className="flex min-w-[640px]">
          {/* Coluna de horários */}
          <div className="w-14 flex-shrink-0 border-r border-gray-100">
            {/* espaço para alinhar com o cabeçalho dos dias */}
            <div className="h-12 border-b border-gray-100" />
            {hours.map(h => (
              <div
                key={h}
                className="border-b border-gray-50 flex items-start justify-end pr-2 pt-1"
                style={{ height: ROW_HEIGHT_PX }}
              >
                <span className="text-[10px] text-gray-400">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today)
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.starts_at), day))

            return (
              <div key={idx} className="flex-1 min-w-0 border-r border-gray-100 last:border-r-0">
                {/* Cabeçalho do dia */}
                <button
                  type="button"
                  onClick={() => onNewAppointment(day)}
                  className={cn(
                    'w-full h-12 border-b border-gray-100 flex flex-col items-center justify-center',
                    'hover:bg-gray-50 transition-colors',
                    isToday && 'bg-blue-50 hover:bg-blue-100'
                  )}
                >
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {DAY_NAMES[idx]}
                  </span>
                  <span className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  )}>
                    {day.getDate()}
                  </span>
                </button>

                {/* Grade de horários */}
                <div
                  className="relative cursor-pointer"
                  style={{ height: TOTAL_HOURS * ROW_HEIGHT_PX }}
                  onClick={e => handleGridClick(day, e)}
                >
                  {/* Linhas de hora */}
                  {hours.map(h => (
                    <div
                      key={h}
                      className="absolute w-full border-b border-gray-50 pointer-events-none"
                      style={{ top: (h - HOUR_START) * ROW_HEIGHT_PX, height: ROW_HEIGHT_PX }}
                    />
                  ))}

                  {/* Agendamentos */}
                  {dayAppts.map(appt => (
                    <div
                      key={appt.id}
                      style={getAppointmentStyle(appt)}
                      className={cn(
                        'rounded border-l-2 px-1.5 py-0.5 overflow-hidden z-10',
                        'hover:brightness-95 transition-all text-xs cursor-pointer',
                        STATUS_COLORS[appt.status] ?? 'bg-blue-100 border-blue-400 text-blue-900'
                      )}
                      onClick={e => {
                        e.stopPropagation()
                        onSelectAppointment(appt)
                      }}
                    >
                      <p className="font-semibold truncate leading-tight">
                        {appt.client?.full_name ?? 'Sem cliente'}
                      </p>
                      <p className="truncate opacity-75">
                        {appt.service?.name ?? ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
