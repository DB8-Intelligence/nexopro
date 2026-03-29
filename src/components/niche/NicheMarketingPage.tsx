import Link from 'next/link'
import {
  Check, Zap, Calendar, Users, DollarSign, BarChart3,
  FileText, Bot, Share2, Globe, ChevronRight, Star,
  Instagram, Facebook
} from 'lucide-react'
import { PLANS } from '@/lib/niche-config'
import { formatCurrency } from '@/lib/utils'
import type { NicheConfig } from '@/lib/niche-config'

interface Testimonial {
  name: string
  role: string
  text: string
  avatar: string
}

interface NicheMarketingPageProps {
  niche: NicheConfig
  headline: string
  subheadline: string
  cta: { label: string; href: string }
  instagram: string
  facebook: string
  testimonials: Testimonial[]
}

const COMPETITOR_FEATURES = [
  'Agenda ✓',
  'Clientes ✓',
  'Financeiro básico ✓',
]

const NEXOOMNIX_EXTRA_FEATURES = [
  'DRE automático',
  'Fluxo de caixa real',
  'Notas fiscais (NFS-e)',
  'Pró-labore e MEI',
  'IR simplificado',
  'Relatório contábil',
  'Agente IA Contador',
]

const ALL_FEATURES = [
  { icon: <Calendar className="w-5 h-5" />, label: 'Agenda completa' },
  { icon: <Users className="w-5 h-5" />, label: 'Gestão de clientes/CRM' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Financeiro e fluxo de caixa' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'DRE automático mensal' },
  { icon: <FileText className="w-5 h-5" />, label: 'Notas fiscais NFS-e' },
  { icon: <Bot className="w-5 h-5" />, label: 'Agente IA Contador 24h' },
  { icon: <Share2 className="w-5 h-5" />, label: 'Posts e Reels por IA' },
  { icon: <Globe className="w-5 h-5" />, label: 'Site público com agendamento' },
]

export function NicheMarketingPage({
  niche, headline, subheadline, cta,
  instagram, facebook, testimonials
}: NicheMarketingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: niche.primaryColor }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">{niche.brandName}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={`https://facebook.com/${facebook.replace(' ', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Entrar
            </Link>
            <Link
              href={cta.href}
              className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: niche.primaryColor }}
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="py-20 md:py-32 px-4"
        style={{ background: `linear-gradient(135deg, ${niche.primaryColor}12, ${niche.primaryColor}04)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white mb-6"
            style={{ backgroundColor: niche.primaryColor }}
          >
            {instagram} · {facebook}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: niche.primaryColor }}
            >
              {cta.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-gray-700 font-semibold px-8 py-4 rounded-full text-base border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            14 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Comparison: competitor vs NexoOmnix */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              O que os outros oferecem vs o que você realmente precisa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Competitor */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="font-bold text-gray-500 mb-4 text-sm uppercase tracking-wide">
                Concorrente comum
              </div>
              <ul className="space-y-2.5">
                {COMPETITOR_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-gray-600">
                    <Check className="w-4 h-4 text-gray-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* NexoOmnix */}
            <div
              className="rounded-2xl border-2 p-6"
              style={{ borderColor: niche.primaryColor, background: `${niche.primaryColor}08` }}
            >
              <div
                className="font-bold mb-4 text-sm uppercase tracking-wide"
                style={{ color: niche.primaryColor }}
              >
                {niche.brandName} — Completo
              </div>
              <ul className="space-y-2.5">
                {COMPETITOR_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-gray-700">
                    <Check className="w-4 h-4" style={{ color: niche.primaryColor }} />
                    {f}
                  </li>
                ))}
                {NEXOOMNIX_EXTRA_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-gray-900 font-medium">
                    <Check className="w-4 h-4" style={{ color: niche.primaryColor }} />
                    + {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Tudo que seu negócio precisa em um só lugar
            </h2>
            <p className="text-gray-500">Sem precisar de 4 sistemas diferentes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_FEATURES.map(feat => (
              <div key={feat.label} className="p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white"
                  style={{ backgroundColor: niche.primaryColor }}
                >
                  {feat.icon}
                </div>
                <div className="font-semibold text-gray-900 text-sm">{feat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Quem já usa não volta atrás
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: niche.primaryColor }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Preços simples e transparentes
            </h2>
            <p className="text-gray-500">Sem taxa de setup. Sem surpresa na fatura.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border-2 transition-all ${
                  plan.highlight
                    ? 'border-2 shadow-lg scale-105'
                    : 'border-gray-200'
                }`}
                style={plan.highlight ? { borderColor: niche.primaryColor } : {}}
              >
                {plan.highlight && (
                  <div
                    className="text-xs font-bold text-white px-2.5 py-1 rounded-full inline-block mb-3"
                    style={{ backgroundColor: niche.primaryColor }}
                  >
                    Mais popular
                  </div>
                )}
                <div className="font-bold text-gray-900 mb-1">{plan.name}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-gray-400">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <ul className="space-y-1.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: niche.primaryColor }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${cta.href}&plan=${plan.id}`}
                  className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-all ${
                    plan.highlight
                      ? 'text-white hover:opacity-90'
                      : 'text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={plan.highlight ? { backgroundColor: niche.primaryColor } : {}}
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-20 px-4"
        style={{ background: `linear-gradient(135deg, ${niche.primaryColor}, ${niche.primaryColor}cc)` }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Pronto para organizar seu negócio de vez?
          </h2>
          <p className="text-white/90 mb-8">
            Junte-se a centenas de profissionais que já usam o {niche.brandName}.
          </p>
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-full text-base transition-all hover:bg-gray-50 shadow-lg"
            style={{ color: niche.primaryColor }}
          >
            {cta.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: niche.primaryColor }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">{niche.brandName}</span>
            <span className="text-gray-400 text-xs ml-2">powered by NexoOmnix</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/privacidade" className="hover:text-gray-600">Privacidade</a>
            <a href="/termos" className="hover:text-gray-600">Termos</a>
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              {instagram}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
