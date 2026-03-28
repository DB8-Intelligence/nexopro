import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ReelCreator AI — Crie Reels Virais com Inteligência Artificial',
  description:
    'Gere roteiros, imagens, narração e vídeos de objetos falantes em minutos. IA completa para criadores de conteúdo e agências.',
  keywords: ['reels ia', 'objetos falantes', 'talking objects', 'criar reels', 'ia para instagram'],
  openGraph: {
    title: 'ReelCreator AI — Reels Virais com IA',
    description: 'Do roteiro ao vídeo final em minutos. Imagens, narração e lip-sync automático.',
    url: 'https://reelcreator.app',
    siteName: 'ReelCreator AI',
    type: 'website',
  },
}

const PLANS = [
  {
    name: 'Starter',
    price: 'R$97',
    period: '/mês',
    color: 'border-gray-200',
    highlight: false,
    description: 'Para criadores independentes',
    features: [
      '30 pacotes de reel/mês',
      'Roteiro + prompts de cenas',
      'Geração de imagens 9:16 (Fal.ai)',
      'Narração em 6 vozes (OpenAI TTS)',
      'Montagem em MP4 (FFmpeg)',
      '5 nichos de negócio',
      'Suporte por email',
    ],
    cta: 'Começar grátis 14 dias',
  },
  {
    name: 'Pro',
    price: 'R$197',
    period: '/mês',
    color: 'border-violet-500',
    highlight: true,
    description: 'Para agências e criadores profissionais',
    features: [
      '100 pacotes de reel/mês',
      'Tudo do Starter',
      '🎭 Talking Objects — 5 opções/nicho',
      'Lip-sync automático (Replicate)',
      '10 nichos de negócio',
      'Suporte prioritário via WhatsApp',
      'Acesso antecipado a novas features',
    ],
    cta: 'Assinar Pro',
  },
  {
    name: 'Studio',
    price: 'R$497',
    period: '/mês',
    color: 'border-gray-200',
    highlight: false,
    description: 'Para estúdios e times de produção',
    features: [
      'Pacotes ilimitados',
      'Tudo do Pro',
      'Multi-usuário (até 5 contas)',
      'API access para integração',
      'Análise de branding personalizada',
      'Gerente de conta dedicado',
      'SLA 99.9%',
    ],
    cta: 'Falar com Vendas',
  },
]

const PIPELINE = [
  {
    step: '01',
    icon: '🤖',
    title: 'Roteiro com Claude AI',
    desc: 'Descreva o tema. A IA gera roteiro completo de cenas, narração, legendas, hashtags e CTAs — tudo em segundos.',
    color: 'from-blue-500 to-blue-600',
    tech: 'Claude Sonnet 4.6',
  },
  {
    step: '02',
    icon: '🖼️',
    title: 'Imagens 9:16 Automáticas',
    desc: 'Cada cena vira uma imagem vertical ultra-realista gerada com Flux Schnell. Estilo Pixar, fotorrealista ou conceitual.',
    color: 'from-violet-500 to-violet-600',
    tech: 'Fal.ai · Flux Schnell',
  },
  {
    step: '03',
    icon: '🎙️',
    title: 'Narração em Voz',
    desc: '6 vozes profissionais. Script extraído automaticamente, marcações de pausa respeitadas. Baixe o MP3 em segundos.',
    color: 'from-pink-500 to-pink-600',
    tech: 'OpenAI TTS',
  },
  {
    step: '04',
    icon: '🎬',
    title: 'Reel MP4 Pronto',
    desc: 'Slideshow das cenas com narração sincronizada. Encode H.264 no browser — sem upload, sem fila, sem custo de servidor.',
    color: 'from-emerald-500 to-emerald-600',
    tech: 'FFmpeg.wasm',
  },
]

const FEATURES = [
  { icon: '🎭', title: 'Talking Objects Virais', desc: '5 opções de objetos animados com face e lip-sync por nicho. Chave, tesoura, prontuário, gavel — todos falando pela sua marca.' },
  { icon: '🎯', title: 'Nichos Específicos', desc: 'Vocabulário, cenários, dores e soluções adaptados para 10 nichos: beleza, saúde, imóveis, jurídico, pet, educação e mais.' },
  { icon: '⚡', title: 'Streaming em Tempo Real', desc: 'Veja o roteiro sendo gerado palavra por palavra. Sem tela de loading — resultados imediatos, edite enquanto a IA escreve.' },
  { icon: '📋', title: 'Pacote Completo', desc: 'Roteiro de cenas, script de voz, legendas em tela, texto do post, 25 hashtags segmentadas e 3 opções de CTA — tudo de uma vez.' },
  { icon: '💰', title: 'Custo Ultra-Baixo', desc: 'Menos de R$0,50 por pacote completo. Imagens a R$0,015, narração a R$0,04, lip-sync a R$0,075. Repasse para clientes com margem de 20x.' },
  { icon: '🔌', title: 'Integrado ao NexoPro', desc: 'Funciona standalone ou como módulo do NexoPro — o mesmo pacote completo disponível para todos os nichos do ecossistema.' },
]

const FAQS = [
  {
    q: 'Preciso saber editar vídeo?',
    a: 'Não. O sistema gera o MP4 pronto para upload no Instagram. Para reels avançados com lip-sync, basta colar a URL da imagem gerada.',
  },
  {
    q: 'Os vídeos têm marca d\'água?',
    a: 'Não. Todos os arquivos gerados são seus, sem marcas, sem restrições de uso comercial.',
  },
  {
    q: 'Funciona para qualquer nicho de negócio?',
    a: 'Sim. O sistema auto-detecta o nicho do seu negócio e adapta todo o vocabulário, cenários e talking objects automaticamente.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Planos mensais sem fidelidade. Cancele quando quiser diretamente pelo painel, sem burocracia.',
  },
  {
    q: 'O lip-sync funciona com qualquer imagem?',
    a: 'Funciona melhor com imagens que têm rosto visível — os talking objects gerados pela IA já são otimizados para isso com "lip-sync ready mouth".',
  },
]

export default function ReelCreatorLanding() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs">
              🎬
            </div>
            <span className="font-bold text-sm">ReelCreator AI</span>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium border border-violet-500/30">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-pink-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Pipeline completo · Claude + Fal.ai + OpenAI + Replicate
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Crie{' '}
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Reels Virais
            </span>
            {' '}com IA<br />em Minutos
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Roteiro, imagens 9:16, narração profissional, lip-sync de objetos falantes e
            vídeo MP4 — tudo gerado automaticamente para o nicho do seu cliente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/cadastro"
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold rounded-xl text-base transition-all shadow-lg shadow-violet-900/40"
            >
              Começar grátis — 14 dias
            </Link>
            <Link
              href="#pipeline"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium rounded-xl text-base transition-all"
            >
              Ver como funciona ↓
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span>✦ Sem cartão de crédito</span>
            <span>✦ Cancele quando quiser</span>
            <span>✦ &lt; R$0,50 por reel completo</span>
          </div>
        </div>
      </section>

      {/* ── Pipeline ────────────────────────────────────────── */}
      <section id="pipeline" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-3xl md:text-4xl font-bold">4 Passos · Do Zero ao Reel</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Cada etapa é automatizada. Você decide o tema, a IA faz o resto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PIPELINE.map((p) => (
              <div key={p.step} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-lg mb-4`}>
                  {p.icon}
                </div>
                <div className="text-xs text-gray-500 font-mono mb-1">PASSO {p.step}</div>
                <h3 className="font-bold text-sm mb-2">{p.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{p.desc}</p>
                <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded-md border border-white/8 font-mono">
                  {p.tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Talking Object highlight ─────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-violet-950/30 to-transparent border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Destaque</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              🎭 Objetos Falantes Virais
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              O sistema gera <strong className="text-white">5 opções de personagens animados</strong> representando o nicho do cliente —
              chaves, tesouras, estetoscópios, gavetas, qualquer objeto com rosto expressivo e boca sincronizada.
              Cada opção vem com prompt otimizado para Fal.ai, script de 7–10s e instruções de animação.
            </p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {['Prompts Pixar-style 3D prontos para geração', 'Boca sincronizável (lip-sync ready)', 'Script de fala com marcações de pausa', 'Compatível com D-ID · HeyGen · CapCut · Replicate'].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual mockup */}
          <div className="flex-1 flex justify-center">
            <div className="w-64 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-500 ml-2 font-mono">talking-object.mp4</span>
              </div>
              <div className="aspect-[9/16] bg-gradient-to-b from-violet-900/50 to-gray-900 flex flex-col items-center justify-center p-4 gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg shadow-violet-900/60">
                  ✂️
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">Tesoura Mágica</div>
                  <div className="text-[10px] text-gray-400 mt-1">Salão de Beleza</div>
                </div>
                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2">
                  <p className="text-[9px] text-gray-300 text-center italic">
                    &ldquo;Seu cabelo merece o<br />melhor corte da cidade!&rdquo;
                  </p>
                </div>
                <div className="flex gap-1.5 text-[9px] text-gray-500 items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  lip-sync ativo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">Por que usar</p>
            <h2 className="text-3xl md:text-4xl font-bold">Tudo que você precisa para produzir</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="precos" className="py-20 px-4 border-t border-white/5 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-3xl md:text-4xl font-bold">Comece grátis. Escale quando precisar.</h2>
            <p className="text-gray-400 mt-3">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white/5 border-2 ${plan.color} rounded-2xl p-6 flex flex-col ${plan.highlight ? 'shadow-lg shadow-violet-900/30' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-base mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-xs mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-900/30'
                      : 'bg-white/8 hover:bg-white/12 text-gray-300 border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white/5 border border-white/8 rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-violet-900/50">
            🎬
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para criar reels que<br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              realmente convertem?
            </span>
          </h2>
          <p className="text-gray-400 mb-8">
            Comece hoje. 14 dias grátis, sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="inline-block px-10 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold rounded-xl text-base transition-all shadow-xl shadow-violet-900/40"
          >
            Criar minha conta grátis →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs">
              🎬
            </div>
            <span className="text-sm font-semibold">ReelCreator AI</span>
            <span className="text-gray-600 text-xs ml-2">by NexoPro · DB8 Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-gray-400 transition-colors">Cadastrar</Link>
            <span>© 2026 DB8 Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
