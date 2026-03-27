'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Calendar, DollarSign, AlertTriangle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ICON_MAP: Record<string, React.ReactNode> = {
  appointment_reminder: <Calendar className="w-4 h-4 text-blue-500" />,
  payment_overdue:      <DollarSign className="w-4 h-4 text-red-500" />,
  tax_due:              <AlertTriangle className="w-4 h-4 text-amber-500" />,
  system:               <Info className="w-4 h-4 text-gray-400" />,
}

export default function NotificacoesPage() {
  const supabase = createClient()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifs((data ?? []) as Notification[])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as unknown as Record<string, unknown>)
      .eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as unknown as Record<string, unknown>)
      .eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} não lida{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.is_read && markRead(n.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100/50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {ICON_MAP[n.type] ?? ICON_MAP.system}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(parseISO(n.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
