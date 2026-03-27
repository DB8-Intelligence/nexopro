'use client'

import { useState } from 'react'
import { FileText, BarChart3, AlertTriangle, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { useContabilidade } from '@/hooks/useContabilidade'
import { NFSeForm } from './NFSeForm'
import { ObrigacoesList } from './ObrigacoesList'
import type { NotaFiscal } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Tab = 'dre' | 'notas' | 'obrigacoes'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-700' },
  emitida:   { label: 'Emitida',   color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  erro:      { label: 'Erro',      color: 'bg-red-100 text-red-700' },
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function ContabilidadeView() {
  const { notas, obrigacoes, dreAtual, loading, createNota, updateNotaStatus, pagarObrigacao, calcularDRE } = useContabilidade()
  const [tab, setTab] = useState<Tab>('dre')
  const [showNFSeForm, setShowNFSeForm] = useState(false)
  const [dreMes, setDreMes] = useState(new Date().getMonth() + 1)
  const [dreAno, setDreAno] = useState(new Date().getFullYear())

  const pendentes = obrigacoes.filter(o => o.status !== 'pago')

  async function handleNFSeSubmit(data: Parameters<typeof createNota>[0]) {
    await createNota(data as Parameters<typeof createNota>[0])
  }

  async function handleDREChange(mes: number, ano: number) {
    setDreMes(mes)
    setDreAno(ano)
    await calcularDRE(mes, ano)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {pendentes.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{pendentes.length} obrigação{pendentes.length > 1 ? 'ões' : ''} fiscal{pendentes.length > 1 ? 'is' : ''} pendente{pendentes.length > 1 ? 's' : ''}</span>
            {' '}— verifique os vencimentos abaixo.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-1">
          {(['dre', 'notas', 'obrigacoes'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'dre' ? 'DRE' : t === 'notas' ? 'NFS-e' : 'Obrigações'}
              {t === 'obrigacoes' && pendentes.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {pendentes.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DRE Tab */}
      {tab === 'dre' && (
        <div>
          {/* Period selector */}
          <div className="flex items-center gap-3 mb-6">
            <select
              value={dreMes}
              onChange={e => handleDREChange(Number(e.target.value), dreAno)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number"
              value={dreAno}
              onChange={e => handleDREChange(dreMes, Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              min="2020" max="2030"
            />
          </div>

          {dreAtual ? (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Receita total</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {dreAtual.receitas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Despesa total</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    R$ {dreAtual.despesas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-4 border rounded-xl ${dreAtual.resultado_liquido >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className={`w-4 h-4 ${dreAtual.resultado_liquido >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                    <span className={`text-xs font-medium uppercase tracking-wide ${dreAtual.resultado_liquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Resultado</span>
                  </div>
                  <p className={`text-2xl font-bold ${dreAtual.resultado_liquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    R$ {dreAtual.resultado_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Margem: {dreAtual.margem_liquida.toFixed(1)}%</p>
                </div>
              </div>

              {/* Detail rows */}
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="font-semibold bg-green-50/50">
                      <td className="px-4 py-3 text-green-700">RECEITAS</td>
                      <td className="px-4 py-3 text-right text-green-700">R$ {dreAtual.receitas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {dreAtual.receitas.servicos > 0 && <DRERow label="  Serviços" value={dreAtual.receitas.servicos} />}
                    {dreAtual.receitas.produtos > 0 && <DRERow label="  Produtos" value={dreAtual.receitas.produtos} />}
                    {dreAtual.receitas.outros > 0 && <DRERow label="  Outros" value={dreAtual.receitas.outros} />}
                    <tr className="font-semibold bg-red-50/50">
                      <td className="px-4 py-3 text-red-700">DESPESAS</td>
                      <td className="px-4 py-3 text-right text-red-700">R$ {dreAtual.despesas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {dreAtual.despesas.pessoal > 0 && <DRERow label="  Pessoal" value={dreAtual.despesas.pessoal} />}
                    {dreAtual.despesas.fixo > 0 && <DRERow label="  Custos fixos" value={dreAtual.despesas.fixo} />}
                    {dreAtual.despesas.variavel > 0 && <DRERow label="  Custos variáveis" value={dreAtual.despesas.variavel} />}
                    {dreAtual.despesas.fiscal > 0 && <DRERow label="  Fiscal / Tributos" value={dreAtual.despesas.fiscal} />}
                    <tr className={`font-bold border-t-2 ${dreAtual.resultado_liquido >= 0 ? 'border-blue-200 bg-blue-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <td className={`px-4 py-3 ${dreAtual.resultado_liquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>RESULTADO LÍQUIDO</td>
                      <td className={`px-4 py-3 text-right ${dreAtual.resultado_liquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        R$ {dreAtual.resultado_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhuma transação encontrada para este período
            </div>
          )}
        </div>
      )}

      {/* NFS-e Tab */}
      {tab === 'notas' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{notas.length} nota{notas.length !== 1 ? 's' : ''} fiscal{notas.length !== 1 ? 'is' : ''}</p>
            <button
              type="button"
              onClick={() => setShowNFSeForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Emitir NFS-e
            </button>
          </div>

          {notas.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Nenhuma nota fiscal emitida
            </div>
          ) : (
            <div className="space-y-2">
              {notas.map(nota => {
                const statusInfo = STATUS_LABELS[nota.status] ?? { label: nota.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={nota.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {nota.tomador_nome || 'Tomador não informado'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {nota.descricao_servico.slice(0, 60)}
                        {nota.numero && ` • NF ${nota.numero}`}
                        {' • '}{format(parseISO(nota.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {nota.valor_servico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {nota.status === 'pendente' && (
                      <button
                        type="button"
                        onClick={() => updateNotaStatus(nota.id, 'emitida')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Marcar emitida
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Obrigações Tab */}
      {tab === 'obrigacoes' && (
        <ObrigacoesList obrigacoes={obrigacoes} onPagar={pagarObrigacao} />
      )}

      {/* NFS-e Form Modal */}
      {showNFSeForm && (
        <NFSeForm
          clients={[]}
          onSubmit={async (data) => {
            await handleNFSeSubmit({
              ...data,
              status: 'pendente',
              valor_iss: (data.valor_servico * data.aliquota_iss) / 100,
              valor_deducoes: 0,
              valor_liquido: data.valor_servico - (data.valor_servico * data.aliquota_iss) / 100,
              numero: null, serie: null, codigo_verificacao: null,
              provider: 'manual', provider_id: null, provider_response: null,
              xml_url: null, pdf_url: null, emitida_at: null, cancelada_at: null,
              transaction_id: null,
            })
          }}
          onClose={() => setShowNFSeForm(false)}
        />
      )}
    </div>
  )
}

function DRERow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-gray-600">{label}</td>
      <td className="px-4 py-2.5 text-right text-gray-900">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  )
}
