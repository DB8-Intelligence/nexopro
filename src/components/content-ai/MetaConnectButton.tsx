'use client'

import { useState, useEffect } from 'react'
import { Instagram, Facebook, Unlink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface MetaConnection {
  id: string
  platform: 'instagram' | 'facebook'
  account_id: string
  account_name: string | null
  account_username: string | null
  account_avatar_url: string | null
  is_active: boolean
  connected_at: string
}

interface MetaConnectButtonProps {
  onConnectionChange?: (connections: MetaConnection[]) => void
  compact?: boolean
}

export function MetaConnectButton({ onConnectionChange, compact = false }: MetaConnectButtonProps) {
  const [connections, setConnections] = useState<MetaConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    loadConnections()
  }, [])

  async function loadConnections() {
    setLoading(true)
    try {
      const res = await fetch('/api/meta/accounts')
      if (res.ok) {
        const data = await res.json() as { connections: MetaConnection[] }
        setConnections(data.connections ?? [])
        onConnectionChange?.(data.connections ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect(connectionId: string) {
    setDisconnecting(connectionId)
    try {
      const res = await fetch('/api/meta/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      })
      if (res.ok) {
        await loadConnections()
      }
    } finally {
      setDisconnecting(null)
    }
  }

  const igConnections = connections.filter(c => c.platform === 'instagram')
  const fbConnections = connections.filter(c => c.platform === 'facebook')

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Verificando contas...
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {igConnections.length > 0 ? (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <Instagram className="w-3 h-3" />
            {igConnections[0].account_username
              ? `@${igConnections[0].account_username}`
              : igConnections[0].account_name}
          </div>
        ) : (
          <a
            href="/api/meta/connect"
            className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
          >
            <Instagram className="w-3 h-3" />
            Conectar Instagram
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Instagram */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Instagram</p>
              {igConnections.length > 0 ? (
                <p className="text-xs text-green-600">
                  {igConnections[0].account_username
                    ? `@${igConnections[0].account_username}`
                    : igConnections[0].account_name ?? 'Conectado'}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Não conectado</p>
              )}
            </div>
          </div>

          {igConnections.length > 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <button
                onClick={() => handleDisconnect(igConnections[0].id)}
                disabled={disconnecting === igConnections[0].id}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {disconnecting === igConnections[0].id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Unlink className="w-3 h-3" />
                )}
                Desconectar
              </button>
            </div>
          ) : (
            <a
              href="/api/meta/connect"
              className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Conectar
            </a>
          )}
        </div>
      </div>

      {/* Facebook */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Facebook className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Facebook</p>
              {fbConnections.length > 0 ? (
                <p className="text-xs text-green-600">
                  {fbConnections[0].account_name ?? 'Conectado'}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  {igConnections.length > 0 ? 'Conectado via Instagram' : 'Não conectado'}
                </p>
              )}
            </div>
          </div>

          {fbConnections.length > 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <button
                onClick={() => handleDisconnect(fbConnections[0].id)}
                disabled={disconnecting === fbConnections[0].id}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {disconnecting === fbConnections[0].id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Unlink className="w-3 h-3" />
                )}
                Desconectar
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {igConnections.length > 0 ? '✓ Via OAuth' : 'Conectar Instagram'}
            </span>
          )}
        </div>
      </div>

      {connections.length === 0 && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Você precisa de uma <strong>Conta Business ou Creator</strong> no Instagram vinculada a uma <strong>Página do Facebook</strong> para usar o auto-post.
          </p>
        </div>
      )}
    </div>
  )
}
