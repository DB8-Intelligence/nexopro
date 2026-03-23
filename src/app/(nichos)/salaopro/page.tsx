import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'Salão Pro — Sistema de Gestão para Salões e Barbearias',
  description:
    'Gestão completa para salões de beleza e barbearias: agenda online, controle financeiro, DRE automático, NFS-e e Agente IA Contador.',
  keywords: ['sistema para salão', 'agenda salão', 'software barbearia', 'gestão beleza'],
  openGraph: {
    title: 'Salão Pro — Sistema de Gestão para Salões e Barbearias',
    description: 'Pare de usar papel e WhatsApp para gerenciar seu salão.',
    images: ['/og/salaopro.png'],
  },
}

export default function SalaoProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.beleza}
      headline="Chega de papel e bagunça no seu salão"
      subheadline="O único sistema com agenda, clientes, financeiro, notas fiscais e Contador IA no mesmo lugar. Feito por quem entende de salão."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=beleza' }}
      instagram="@salaopro.app"
      facebook="Salão Pro Gestão"
      testimonials={[
        {
          name: 'Ana Paula',
          role: 'Proprietária • Espaço Ana Beleza',
          text: 'Fechei meu primeiro DRE em 5 minutos. Antes perdia horas toda semana no Excel.',
          avatar: 'AP',
        },
        {
          name: 'Carlos Henrique',
          role: 'Dono • Barbearia do Carlão',
          text: 'A agenda online trouxe 30% mais clientes em 2 meses. Os clientes adoram.',
          avatar: 'CH',
        },
        {
          name: 'Mariana Costa',
          role: 'Gestora • Studio Mariana',
          text: 'O IA Contador me avisou que meu custo com produtos subiu 40%. Economizei muito.',
          avatar: 'MC',
        },
      ]}
    />
  )
}
