'use client'

import { Users, MessageSquare, Target, Film, ArrowRight, RotateCcw } from 'lucide-react'
import type { ContentAnalysis } from '@/types/database'

interface AnalysisResultProps {
  analysis: ContentAnalysis
  onContinue: () => void
  onReanalyze: () => void
  loading?: boolean
}

export function AnalysisResult({ analysis, onContinue, onReanalyze, loading = false }: AnalysisResultProps) {
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Análise da IA</h2>
        <p className="text-sm text-gray-500 mt-0.5">Revise o plano de conteúdo antes de continuar.</p>
      </div>

      {/* Title */}
      <div className="card bg-blue-50 border-blue-100">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Título sugerido</p>
        <p className="text-sm font-semibold text-gray-900">{analysis.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Target audience */}
        <div className="card">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Público-alvo</p>
          </div>
          <p className="text-sm text-gray-700">{analysis.target_audience}</p>
        </div>

        {/* Format + tone */}
        <div className="card">
          <div className="flex items-center gap-1.5 mb-2">
            <Film className="w-3.5 h-3.5 text-orange-500" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Formato / Tom</p>
          </div>
          <p className="text-sm text-gray-700 capitalize">{analysis.suggested_format}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">{analysis.tone}</p>
        </div>
      </div>

      {/* Key messages */}
      <div className="card">
        <div className="flex items-center gap-1.5 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-green-500" />
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mensagens-chave</p>
        </div>
        <ul className="space-y-1">
          {analysis.key_messages.map((msg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {msg}
            </li>
          ))}
        </ul>
      </div>

      {/* Hook + CTA */}
      <div className="grid grid-cols-1 gap-3">
        <div className="card">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Abertura (hook)</p>
          </div>
          <p className="text-sm text-gray-800 font-medium italic">&ldquo;{analysis.hook}&rdquo;</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">CTA</p>
          <p className="text-sm text-gray-700">{analysis.cta}</p>
        </div>
      </div>

      {/* Scenes */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Roteiro — {analysis.scenes.length} cenas
        </p>
        <div className="space-y-2">
          {analysis.scenes.map(scene => (
            <div key={scene.id} className="flex gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] flex items-center justify-center flex-shrink-0">
                {scene.id}
              </span>
              <div>
                <p className="text-gray-700">{scene.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{scene.duration_sec}s</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReanalyze}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
          Reanalisar
        </button>
        <button
          onClick={onContinue}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
