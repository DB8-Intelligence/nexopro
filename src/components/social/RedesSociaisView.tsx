'use client'

import { useState } from 'react'
import { Share2, Instagram, Facebook, Sparkles, Lock, Calendar, Image as ImageIcon, Plus } from 'lucide-react'
import Link from 'next/link'

type Tab = 'calendario' | 'criar' | 'contas'

interface PostIdea {
  titulo: string
  legenda: string
  hashtags: string[]
  formato: 'reel' | 'post' | 'stories' | 'carrossel'
}

const FORMATO_COLORS = {
  reel:      'bg-purple-100 text-purple-700',
  post:      'bg-blue-100 text-blue-700',
  stories:   'bg-pink-100 text-pink-700',
  carrossel: 'bg-orange-100 text-orange-700',
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface RedesSociaisViewProps {
  isPro: boolean
}

export function RedesSociaisView({ isPro }: RedesSociaisViewProps) {
  const [tab, setTab] = useState<Tab>('calendario')
  const [gerando, setGerando] = useState(false)
  const [ideias, setIdeias] = useState<PostIdea[]>([])
  const [tema, setTema] = useState('')

  // Mock calendar data
  const hoje = new Date()
  const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getDay()

  async function gerarIdeias() {
    if (!tema.trim()) return
    setGerando(true)
    try {
      const res = await fetch('/api/ai/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ideias_posts',
          tema,
          quantidade: 4,
        }),
      })
      const data = await res.json() as { ideias?: PostIdea[] }
      if (data.ideias) setIdeias(data.ideias)
    } catch {
      // silent fail
    } finally {
      setGerando(false)
    }
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Redes Sociais IA — Plano Pro</h3>
        <p className="text-gray-500 text-sm max-w-xs mb-4">
          Crie posts, reels e stories com IA, gerencie seu calendário editorial e conecte Instagram e Facebook.
        </p>
        <Link
          href="/assinatura"
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
        >
          Fazer upgrade
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-1">
          {([
            { key: 'calendario', label: 'Calendário', icon: Calendar },
            { key: 'criar', label: 'Criar com IA', icon: Sparkles },
            { key: 'contas', label: 'Contas conectadas', icon: Share2 },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendário editorial */}
      {tab === 'calendario' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-900">
              {hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              onClick={() => setTab('criar')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo post
            </button>
          </div>

          {/* Mini calendar */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: diasMes }).map((_, i) => {
              const dia = i + 1
              const isHoje = dia === hoje.getDate()
              return (
                <div
                  key={dia}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                    isHoje ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : 'text-gray-700'
                  }`}
                >
                  {dia}
                </div>
              )
            })}
          </div>

          <div className="mt-6 text-center py-8 text-gray-400 text-sm">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            Nenhum post agendado. Crie conteúdo com IA para preencher seu calendário.
          </div>
        </div>
      )}

      {/* Criar com IA */}
      {tab === 'criar' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual o tema ou produto que quer divulgar?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tema}
                onChange={e => setTema(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && gerarIdeias()}
                placeholder="Ex: promoção de natal, novo serviço, dica profissional..."
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={gerarIdeias}
                disabled={gerando || !tema.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {gerando ? 'Gerando...' : 'Gerar ideias'}
              </button>
            </div>
          </div>

          {/* Ideias geradas */}
          {ideias.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ideias.map((ideia, i) => (
                <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{ideia.titulo}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${FORMATO_COLORS[ideia.formato]}`}>
                      {ideia.formato}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">{ideia.legenda}</p>
                  <div className="flex flex-wrap gap-1">
                    {ideia.hashtags.slice(0, 4).map(h => (
                      <span key={h} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">#{h}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                    <Link
                      href="/conteudo"
                      className="flex-1 text-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                    >
                      Criar com ContentAI
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              Digite um tema e clique em &quot;Gerar ideias&quot; para criar posts com IA
            </div>
          )}
        </div>
      )}

      {/* Contas conectadas */}
      {tab === 'contas' && (
        <div className="space-y-3">
          {[
            { plataforma: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-100' },
            { plataforma: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          ].map(({ plataforma, icon: Icon, color }) => (
            <div key={plataforma} className={`flex items-center gap-4 p-4 border rounded-xl ${color}`}>
              <Icon className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{plataforma}</p>
                <p className="text-xs text-gray-500">Não conectado</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 border border-current text-xs font-medium rounded-lg hover:bg-white/50"
              >
                Conectar
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center mt-2">
            Integração direta com Instagram e Facebook em breve
          </p>
        </div>
      )}
    </div>
  )
}
