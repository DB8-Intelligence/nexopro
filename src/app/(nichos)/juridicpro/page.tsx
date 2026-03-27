import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'JurídicPro — Sistema de Gestão para Advogados e Escritórios',
  description:
    'Gestão completa para advogados e escritórios jurídicos: clientes, processos, financeiro, DRE automático, NFS-e e Agente IA Contador.',
  keywords: ['sistema para advogado', 'software escritório jurídico', 'gestão advocacia', 'CRM jurídico'],
  openGraph: {
    title: 'JurídicPro — Sistema de Gestão para Advogados e Escritórios',
    description: 'Organize seus clientes e processos. Foque no que importa: a causa.',
    images: ['/og/juridicpro.png'],
  },
}

export default function JuridicProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.juridico}
      headline="Chega de processos perdidos e clientes sem retorno"
      subheadline="O único sistema com gestão de clientes, controle financeiro, DRE automático e Agente IA Contador. Feito para advogados e escritórios brasileiros."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=juridico' }}
      instagram="@juridicpro.app"
      facebook="JurídicPro Gestão"
      testimonials={[
        {
          name: 'Dr. Paulo Mendes',
          role: 'Advogado • Mendes & Associados',
          text: 'O DRE automático me mostrou exatamente quais áreas do escritório eram mais lucrativas. Mudou minha estratégia.',
          avatar: 'PM',
        },
        {
          name: 'Dra. Letícia Faria',
          role: 'Advogada tributarista • Faria Advocacia',
          text: 'Nunca mais esqueci prazo de obrigação fiscal. O IA Contador me avisa com 7 dias de antecedência.',
          avatar: 'LF',
        },
        {
          name: 'Carlos Braga',
          role: 'Sócio • Braga Direito Empresarial',
          text: 'Centralizei todos os clientes e honorários num só sistema. Economia de 4 horas por semana em administração.',
          avatar: 'CB',
        },
      ]}
    />
  )
}
