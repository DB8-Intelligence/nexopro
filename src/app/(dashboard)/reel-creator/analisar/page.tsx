'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Link2, Upload, Sparkles, RefreshCw, Copy, Check,
  ChevronDown, Film, AlertCircle, Instagram, Youtube, Play,
  Loader2, FileVideo, X, Zap, Download,
} from 'lucide-react'
import Link from 'next/link'

// ─── Platform badge ───────────────────────────────────────────

const PLATFORM_CONFIG = {
  youtube:   { label: 'YouTube',   color: 'bg-red-100 text-red-700',    icon: <Youtube className="w-3.5 h-3.5" /> },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700',  icon: <Instagram className="w-3.5 h-3.5" /> },
  tiktok:    { label: 'TikTok',    color: 'bg-gray-900 text-white',     icon: <Play className="w-3.5 h-3.5" /> },
  facebook:  { label: 'Facebook',  color: 'bg-blue-100 text-blue-700',  icon: <Film className="w-3.5 h-3.5" /> },
  twitter:   { label: 'X/Twitter', color: 'bg-gray-100 text-gray-700',  icon: <Film className="w-3.5 h-3.5" /> },
  unknown:   { label: 'Vídeo',     color: 'bg-gray-100 text-gray-600',  icon: <Film className="w-3.5 h-3.5" /> },
}

type PlatformKey = keyof typeof PLATFORM_CONFIG

function detectPlatform(url: string): PlatformKey {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook'
  if (/twitter\.com|x\.com/.test(url)) return 'twitter'
  return 'unknown'
}

// ─── Section markers for splitting results ────────────────────

const SECTION_MARKERS = [
  '## 🔍 ANÁLISE DO REEL',
  '## 🎬 ROTEIRO RECRIADO',
  '## 📱 TEXTO DO POST',
  '## 🏷️ HASHTAGS SUGERIDAS',
  '## 💡 DIFERENCIAIS PARA SUPERAR O ORIGINAL',
]

function splitSections(text: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = []
  let remaining = text

  for (let i = 0; i < SECTION_MARKERS.length; i++) {
    const marker = SECTION_MARKERS[i]
    const idx = remaining.indexOf(marker)
    if (idx === -1) continue
    const nextMarkers = SECTION_MARKERS.slice(i + 1)
    let end = remaining.length
    for (const nm of nextMarkers) {
      const ni = remaining.indexOf(nm, idx + marker.length)
      if (ni !== -1 && ni < end) end = ni
    }
    sections.push({
      title: marker.replace('## ', ''),
      body: remaining.slice(idx + marker.length, end).trim(),
    })
  }

  return sections
}

// ─── Copy button ─────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
      className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

// ─── Result section card ──────────────────────────────────────

function SectionCard({ title, body }: { title: string; body: string }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-900"
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          {title}
        </button>
        <CopyBtn text={body} />
      </div>
      {!collapsed && (
        <div className="px-4 py-3">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AnalisarReelPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState<PlatformKey | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [output, setOutput] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [hasFrames, setHasFrames] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Detect platform as user types
  useEffect(() => {
    if (url.trim()) {
      setPlatform(detectPlatform(url))
    } else {
      setPlatform(null)
    }
  }, [url])

  const sections = done ? splitSections(output) : []

  const analyze = useCallback(async () => {
    if ((!url.trim() && !uploadFile) || analyzing) return
    setAnalyzing(true)
    setOutput('')
    setDone(false)
    setError('')
    setHasFrames(false)

    try {
      let res: Response

      if (uploadFile) {
        const form = new FormData()
        form.append('file', uploadFile)
        if (url.trim()) form.append('url', url.trim())
        if (niche.trim()) form.append('niche', niche.trim())

        res = await fetch('/api/reel-creator/analyze-video', {
          method: 'POST',
          body: form,
        })
      } else {
        res = await fetch('/api/reel-creator/analyze-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), niche: niche.trim() }),
        })
      }

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        if (res.status === 403) {
          setError('Esta funcionalidade requer o plano Pro ou superior. Faça upgrade em Assinatura.')
        } else {
          setError(d.error ?? 'Erro ao analisar')
        }
        return
      }

      setHasFrames(res.headers.get('X-Has-Frames') === 'true')

      if (!res.body) { setError('Resposta vazia'); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value, { stream: true })
        setOutput(prev => prev + chunk)
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
      }

      setDone(true)
    } catch {
      setError('Erro de conexão. Verifique sua rede e tente novamente.')
    } finally {
      setAnalyzing(false)
    }
  }, [url, niche, uploadFile, analyzing])

  function handleFile(file: File) {
    if (!file.type.startsWith('video/')) {
      setError('Envie apenas arquivos de vídeo (.mp4, .mov, .avi)')
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('Arquivo muito grande. Limite de 200MB.')
      return
    }
    setUploadFile(file)
    setError('')
  }

  // Extract script section for "Recriar" button
  const scriptSection = sections.find(s => s.title.includes('ROTEIRO RECRIADO'))?.body ?? ''

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/reel-creator"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao ReelCreator
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Analisar Reel por Link
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cole o link de qualquer reel viral → analise → recrie melhor para o seu nicho
          </p>
        </div>
        {done && (
          <button
            type="button"
            onClick={() => { setOutput(''); setDone(false); setUploadFile(null) }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Nova análise
          </button>
        )}
      </div>

      {/* Input form */}
      {!done && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">

          {/* URL Input */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Link do vídeo
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Cole o link — Instagram, TikTok, YouTube Shorts, Facebook..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              {url && platform && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${PLATFORM_CONFIG[platform].color}`}>
                  {PLATFORM_CONFIG[platform].icon}
                  {PLATFORM_CONFIG[platform].label}
                </div>
              )}
            </div>
          </div>

          {/* File upload (alternative) */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">ou faça upload do arquivo</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {uploadFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <FileVideo className="w-4 h-4 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{uploadFile.name}</p>
                  <p className="text-xs text-green-600">{(uploadFile.size / (1024 * 1024)).toFixed(1)}MB</p>
                </div>
                <button onClick={() => setUploadFile(null)} className="text-green-600 hover:text-green-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) handleFile(f)
                }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500">Arraste o .mp4 ou clique para selecionar</p>
                <p className="text-[10px] text-gray-400 mt-0.5">MP4, MOV, AVI — até 200MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>
            )}
          </div>

          {/* Niche override */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Nicho para recriar (opcional)
            </label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="Ex: Corretor de Imóveis, Nutricionista, Salão de Beleza..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Deixe em branco para usar o nicho do seu perfil. Ou insira outro nicho para adaptar o conteúdo.
            </p>
          </div>

          {/* Platforms info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2 font-medium">Plataformas suportadas:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(PLATFORM_CONFIG).filter(([k]) => k !== 'unknown').map(([key, cfg]) => (
                <span key={key} className={`flex items-center gap-1 px-2 py-1 rounded-full ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              YouTube: análise com frames + transcrição automática.
              Instagram/TikTok: análise por thumbnail + metadados (ou upload do arquivo para análise completa).
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('plano') && (
                  <Link href="/assinatura" className="text-xs text-red-600 underline mt-1 inline-block">
                    Ver planos disponíveis →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            type="button"
            onClick={analyze}
            disabled={(!url.trim() && !uploadFile) || analyzing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
              : <><Zap className="w-4 h-4" /> Analisar e Recriar</>
            }
          </button>
        </div>
      )}

      {/* Streaming output */}
      {analyzing && (
        <div
          ref={outputRef}
          className="bg-gray-900 text-green-400 rounded-2xl p-4 text-xs font-mono leading-relaxed max-h-96 overflow-y-auto"
        >
          <div className="flex items-center gap-2 mb-3 text-gray-500 text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Analisando vídeo...
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      {/* Results */}
      {done && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">Análise completa ✓</p>
              {!hasFrames && (
                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                  Sem frames — análise textual
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {scriptSection && (
                <button
                  type="button"
                  onClick={() => {
                    // Store the script in localStorage and navigate to reel-creator
                    localStorage.setItem('reelcreator_prefill', JSON.stringify({
                      description: scriptSection.slice(0, 800),
                      source: 'analisar',
                    }))
                    router.push('/reel-creator')
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Film className="w-3.5 h-3.5" />
                  Recriar no ReelCreator
                </button>
              )}
              <CopyBtn text={output} />
            </div>
          </div>

          {/* Fallback guide for Instagram/TikTok without frames */}
          {!hasFrames && platform && ['instagram', 'tiktok', 'facebook'].includes(platform) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Quer análise visual completa com frames?
              </p>
              <p className="text-xs text-blue-700">
                Baixe o vídeo manualmente e faça upload para análise completa com Claude Vision:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {platform === 'instagram' && (
                  <div className="bg-white border border-blue-100 rounded-lg p-2.5">
                    <p className="font-semibold text-blue-700 mb-1">📸 Instagram</p>
                    <p className="text-gray-600">snapinsta.app → Baixar HD → Fazer upload acima</p>
                  </div>
                )}
                {platform === 'tiktok' && (
                  <div className="bg-white border border-blue-100 rounded-lg p-2.5">
                    <p className="font-semibold text-blue-700 mb-1">🎵 TikTok</p>
                    <p className="text-gray-600">ssstik.io → Download sem watermark → Upload acima</p>
                  </div>
                )}
                {platform === 'facebook' && (
                  <div className="bg-white border border-blue-100 rounded-lg p-2.5">
                    <p className="font-semibold text-blue-700 mb-1">📘 Facebook</p>
                    <p className="text-gray-600">fbdown.net → Download → Upload acima</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {sections.length > 0
            ? sections.map(s => <SectionCard key={s.title} title={s.title} body={s.body} />)
            : (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Resultado</p>
                  <CopyBtn text={output} />
                </div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}
