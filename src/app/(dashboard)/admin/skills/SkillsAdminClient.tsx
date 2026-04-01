'use client'

import { useState } from 'react'
import { Bot, RefreshCw, Pause, Play, AlertCircle, CheckCircle2, Clock, Layers, Cpu, Hash, Lightbulb, ChevronRight } from 'lucide-react'

interface AgentSkill {
  id: string
  nicho: string
  display_name: string
  app_name: string
  status: 'ativo' | 'pausado' | 'arquivado' | 'pendente_geracao'
  versao: number
  gerado_em: string
  gerado_por: string
  pilares: { nome: string; percentual: string; objetivo: string }[]
  hooks_banco: string[]
  talking_objects: { id: string; emoji: string; nome: string }[]
  prompts_ai: { cena: string; prompt: string }[]
  ideias_conteudo: string[]
  ctas_banco: string[]
  skill_header: string
  gaps_comuns: { gap: string; receita: string }[]
}

interface SkillLog {
  id: string
  nicho: string
  evento: string
  detalhe: string
  created_at: string
}

const STATUS_CONFIG = {
  ativo:            { label: 'Ativo',     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  pausado:          { label: 'Pausado',   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',   icon: <Pause className="w-3 h-3" /> },
  pendente_geracao: { label: 'Gerando…',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',         icon: <Clock className="w-3 h-3" /> },
  arquivado:        { label: 'Arquivado', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',          icon: <AlertCircle className="w-3 h-3" /> },
} as const

const EVENT_COLOR: Record<string, string> = {
  gerado:     'text-emerald-400',
  ativado:    'text-blue-400',
  pausado:    'text-yellow-400',
  regenerado: 'text-violet-400',
  erro:       'text-red-400',
}

interface SkillsAdminClientProps {
  skills: AgentSkill[]
  logs: SkillLog[]
}

export function SkillsAdminClient({ skills: initialSkills, logs }: SkillsAdminClientProps) {
  const [skills, setSkills] = useState(initialSkills)
  const [selected, setSelected] = useState<AgentSkill | null>(null)
  const [tab, setTab] = useState<'skills' | 'logs'>('skills')
  const [loading, setLoading] = useState<string | null>(null)

  async function triggerAction(nicho: string, action: 'pausar' | 'reativar' | 'regenerar') {
    setLoading(`${nicho}-${action}`)
    try {
      const res = await fetch('/api/skills/trigger-factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, action }),
      })
      if (!res.ok) throw new Error('Falha na requisição')
      const newStatus = action === 'pausar' ? 'pausado' : action === 'reativar' ? 'ativo' : 'pendente_geracao'
      setSkills(prev => prev.map(s => s.nicho === nicho ? { ...s, status: newStatus as AgentSkill['status'] } : s))
      if (selected?.nicho === nicho) setSelected(prev => prev ? { ...prev, status: newStatus as AgentSkill['status'] } : null)
    } catch {
      alert('Erro ao executar ação. Verifique o console.')
    } finally {
      setLoading(null)
    }
  }

  const ativos = skills.filter(s => s.status === 'ativo').length
  const pendentes = skills.filter(s => s.status === 'pendente_geracao').length
  const pausados = skills.filter(s => s.status === 'pausado').length

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Skills Factory</h1>
            <p className="text-slate-500 text-xs">Skills de IA auto-geradas por nicho · NexoOmnix</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Skills Ativas',   value: ativos,   color: 'text-emerald-400' },
            { label: 'Em Geração',      value: pendentes, color: 'text-blue-400' },
            { label: 'Pausadas',        value: pausados,  color: 'text-yellow-400' },
          ].map(k => (
            <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 mb-6">
        {(['skills', 'logs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'skills' ? `Skills (${skills.length})` : `Logs (${logs.length})`}
          </button>
        ))}
      </div>

      {tab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lista */}
          <div className="lg:col-span-1 space-y-2">
            {skills.map(skill => {
              const cfg = STATUS_CONFIG[skill.status] || STATUS_CONFIG.ativo
              const isSelected = selected?.nicho === skill.nicho
              return (
                <div
                  key={skill.nicho}
                  onClick={() => setSelected(isSelected ? null : skill)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-violet-500/60 bg-violet-500/10'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{skill.display_name}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">{skill.app_name}</div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                  {skill.gerado_em && (
                    <div className="text-xs text-slate-600 mt-1">
                      {new Date(skill.gerado_em).toLocaleDateString('pt-BR')} · v{skill.versao}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Detalhe */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Header do detalhe */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/40">
                  <div>
                    <h2 className="font-bold text-white">{selected.display_name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selected.app_name} · nicho: <code className="text-violet-300">{selected.nicho}</code></p>
                  </div>
                  <div className="flex gap-2">
                    {selected.status === 'ativo' && (
                      <button
                        onClick={() => triggerAction(selected.nicho, 'pausar')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50"
                      >
                        <Pause className="w-3 h-3" />
                        Pausar
                      </button>
                    )}
                    {selected.status === 'pausado' && (
                      <button
                        onClick={() => triggerAction(selected.nicho, 'reativar')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Reativar
                      </button>
                    )}
                    <button
                      onClick={() => triggerAction(selected.nicho, 'regenerar')}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-400 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading === `${selected.nicho}-regenerar` ? 'animate-spin' : ''}`} />
                      Regenerar
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5 text-sm">
                  {/* Identidade */}
                  {selected.skill_header ? (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Identidade no Nicho</div>
                      <p className="text-slate-300 leading-relaxed text-xs bg-slate-800/50 rounded-lg p-3">{selected.skill_header}</p>
                    </div>
                  ) : (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-xs text-blue-300">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">Skill em geração pelo n8n</span>
                      </div>
                      O Skill Factory Agent irá preencher todos os campos automaticamente. Aguarde até 6h após a criação do registro.
                    </div>
                  )}

                  {/* Pilares */}
                  {selected.pilares?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Layers className="w-3 h-3" /> Pilares de Conteúdo
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.pilares.map(p => (
                          <span key={p.nome} className="bg-violet-500/10 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-full text-xs">
                            {p.nome} — {p.percentual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Talking Objects */}
                  {selected.talking_objects?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Cpu className="w-3 h-3" /> Talking Objects
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.talking_objects.map(o => (
                          <div key={o.id} className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg text-xs">
                            <span className="text-base">{o.emoji}</span>
                            <span className="text-slate-300">{o.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hooks */}
                  {selected.hooks_banco?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" /> Hooks ({selected.hooks_banco.length})
                      </div>
                      <div className="space-y-1">
                        {selected.hooks_banco.slice(0, 5).map((h, i) => (
                          <div key={i} className="text-xs text-slate-400 py-1.5 border-b border-slate-800 last:border-0">
                            &ldquo;{h}&rdquo;
                          </div>
                        ))}
                        {selected.hooks_banco.length > 5 && (
                          <div className="text-xs text-slate-600">+{selected.hooks_banco.length - 5} hooks no banco</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Prompts AI',   value: selected.prompts_ai?.length ?? 0,      icon: <Cpu className="w-3 h-3" /> },
                      { label: 'Ideias',        value: selected.ideias_conteudo?.length ?? 0,  icon: <Lightbulb className="w-3 h-3" /> },
                      { label: 'CTAs',          value: selected.ctas_banco?.length ?? 0,       icon: <ChevronRight className="w-3 h-3" /> },
                      { label: 'Gaps diag.',    value: selected.gaps_comuns?.length ?? 0,       icon: <AlertCircle className="w-3 h-3" /> },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">{s.icon}</div>
                        <div className="text-lg font-bold text-white">{s.value}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                <Bot className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">Selecione uma Skill para inspecionar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 text-xs text-slate-400">
            Últimos {logs.length} eventos de geração
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm">Nenhum log ainda</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {logs.map(log => (
                <div key={log.id} className="px-4 py-3 flex items-start gap-4">
                  <span className={`text-xs font-mono font-semibold w-24 shrink-0 ${EVENT_COLOR[log.evento] ?? 'text-slate-400'}`}>
                    {log.evento}
                  </span>
                  <span className="text-xs text-violet-300 w-20 shrink-0 font-mono">{log.nicho}</span>
                  <span className="text-xs text-slate-400 flex-1">{log.detalhe}</span>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
