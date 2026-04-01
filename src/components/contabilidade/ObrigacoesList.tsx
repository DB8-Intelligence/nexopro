'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import type { ObrigacaoFiscal } from '@/types/database'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ObrigacoesListProps {
  obrigacoes: ObrigacaoFiscal[]
  onPagar: (id: string, valor: number) => Promise<void>
}

export function ObrigacoesList({ obrigacoes, onPagar }: ObrigacoesListProps) {
  const [pagandoId, setPagandoId] = useState<string | null>(null)

  async function handlePagar(obrigacao: ObrigacaoFiscal) {
    const valor = obrigacao.valor_calculado ?? 0
    setPagandoId(obrigacao.id)
    await onPagar(obrigacao.id, valor)
    setPagandoId(null)
  }

  if (obrigacoes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
        Nenhuma obrigação fiscal pendente
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {obrigacoes.map(o => {
        const vencimento = parseISO(o.vencimento)
        const diasRestantes = differenceInDays(vencimento, new Date())
        const vencida = diasRestantes < 0 && o.status !== 'pago'
        const urgente = diasRestantes >= 0 && diasRestantes <= 7 && o.status !== 'pago'

        return (
          <div
            key={o.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              o.status === 'pago'
                ? 'border-green-100 bg-green-50'
                : vencida
                ? 'border-red-200 bg-red-50'
                : urgente
                ? 'border-amber-200 bg-amber-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex-shrink-0">
              {o.status === 'pago' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : vencida || urgente ? (
                <AlertTriangle className={`w-5 h-5 ${vencida ? 'text-red-500' : 'text-amber-500'}`} />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{o.descricao}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {o.tipo.toUpperCase()} • {String(o.competencia_mes).padStart(2, '0')}/{o.competencia_ano} •{' '}
                Vence {format(vencimento, 'dd/MM/yyyy', { locale: ptBR })}
                {o.status !== 'pago' && diasRestantes >= 0 && (
                  <span className={`ml-1 ${urgente ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                    ({diasRestantes}d)
                  </span>
                )}
                {vencida && <span className="ml-1 text-red-600 font-medium">VENCIDA</span>}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              {o.valor_calculado != null && (
                <p className="text-sm font-semibold text-gray-900">
                  R$ {o.valor_calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
              {o.status === 'pago' ? (
                <span className="text-xs text-green-600 font-medium">Pago</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePagar(o)}
                  disabled={pagandoId === o.id}
                  className="mt-1 flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {pagandoId === o.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  Marcar pago
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
