import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'EngePro — Sistema de Gestão para Engenheiros e Arquitetos',
  description:
    'Gestão completa para engenheiros e arquitetos: orçamentos, clientes, controle de obras, financeiro, DRE automático e NFS-e.',
  keywords: ['sistema engenheiro', 'software arquiteto', 'gestão obras', 'orçamento engenharia'],
  openGraph: {
    title: 'EngePro — Sistema de Gestão para Engenheiros e Arquitetos',
    description: 'Controle seus projetos e faturamento. Mais tempo para criar.',
    images: ['/og/engepro.png'],
  },
}

export default function EngeProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.engenharia}
      headline="Chega de orçamento perdido e obra sem controle"
      subheadline="O único sistema com gestão de projetos, controle financeiro, DRE automático e Agente IA Contador. Feito para engenheiros e arquitetos brasileiros."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=engenharia' }}
      instagram="@engepro.app"
      facebook="EngePro Gestão"
      testimonials={[
        {
          name: 'Eng. Lucas Martins',
          role: 'Engenheiro civil • LM Projetos',
          text: 'Meus orçamentos ficaram profissionais e rastreáveis. Nunca mais perdi proposta por falta de follow-up.',
          avatar: 'LM',
        },
        {
          name: 'Arq. Renata Souza',
          role: 'Arquiteta • RS Studio',
          text: 'O DRE me mostrou que projetos residenciais eram mais lucrativos que comerciais. Mudei meu foco e dobrei o faturamento.',
          avatar: 'RS',
        },
        {
          name: 'Felipe Rocha',
          role: 'Engenheiro eletricista • Rocha Elétrica',
          text: 'Emito NFS-e em 1 minuto pelo sistema. Antes levava horas tentando entrar no portal da prefeitura.',
          avatar: 'FR',
        },
      ]}
    />
  )
}
