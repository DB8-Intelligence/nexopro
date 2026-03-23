import { getNicheConfig } from '@/lib/niche-config'
import { formatCurrency } from '@/lib/utils'
import {
  Phone, MessageCircle, MapPin, Clock, Star, ChevronRight, Zap
} from 'lucide-react'
import type { Tenant, TenantSettings, Service } from '@/types/database'

interface NicheLandingPageProps {
  tenant: Tenant
  settings: TenantSettings
  services: Service[]
}

export function NicheLandingPage({ tenant, settings, services }: NicheLandingPageProps) {
  const niche = getNicheConfig(tenant.niche)
  const whatsappUrl = settings.whatsapp_number
    ? `https://wa.me/55${settings.whatsapp_number.replace(/\D/g, '')}?text=Olá, quero agendar um ${niche.terms.appointment}!`
    : null

  return (
    <div className="min-h-screen bg-white" style={{ '--primary': niche.primaryColor } as React.CSSProperties}>
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: niche.primaryColor }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-bold text-gray-900">{tenant.name}</span>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: niche.primaryColor }}
            >
              <MessageCircle className="w-4 h-4" />
              Agendar via WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-16 md:py-24 px-4"
        style={{
          background: settings.site_hero_image
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.site_hero_image}) center/cover`
            : `linear-gradient(135deg, ${niche.primaryColor}18, ${niche.primaryColor}05)`,
          color: settings.site_hero_image ? 'white' : 'inherit',
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: niche.primaryColor }}
            >
              {niche.brandName}
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight ${settings.site_hero_image ? 'text-white' : 'text-gray-900'}`}>
            {settings.site_title ?? tenant.name}
          </h1>
          <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${settings.site_hero_image ? 'text-white/90' : 'text-gray-600'}`}>
            {settings.site_description ?? niche.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-base transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: niche.primaryColor }}
              >
                <MessageCircle className="w-5 h-5" />
                {settings.site_cta_text ?? 'Agendar agora'}
              </a>
            )}
            {tenant.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className={`inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full text-base border-2 transition-all ${
                  settings.site_hero_image
                    ? 'border-white text-white hover:bg-white/10'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-5 h-5" />
                Ligar agora
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Nossos {niche.terms.services}
              </h2>
              <p className="text-gray-500 mt-2">
                Escolha o {niche.terms.service} ideal para você
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div
                    className="w-10 h-10 rounded-xl mb-3"
                    style={{ backgroundColor: `${service.color ?? niche.primaryColor}20` }}
                  />
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(service.price)}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration_min} min
                      </div>
                    </div>
                    {whatsappUrl && (
                      <a
                        href={`${whatsappUrl}&text=Quero agendar: ${encodeURIComponent(service.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: niche.primaryColor }}
                      >
                        Agendar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social proof */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-600 text-lg">
            Gestão profissional com tecnologia {niche.brandName}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Powered by NexoPro
          </p>
        </div>
      </section>

      {/* Contact / Location */}
      {(tenant.address_city || tenant.phone || tenant.whatsapp) && (
        <section className="py-12 px-4 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
              {(tenant.address_city || tenant.address_state) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {[tenant.address_street, tenant.address_city, tenant.address_state]
                    .filter(Boolean).join(', ')}
                </div>
              )}
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 hover:text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {tenant.phone}
                </a>
              )}
              {tenant.whatsapp && (
                <a
                  href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gray-900"
                >
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.</span>
          <span>
            Gerenciado com{' '}
            <a href="https://nexopro.com.br" className="hover:text-gray-600 font-medium">NexoPro</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
