import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'PetPro — Sistema de Gestão para Pet Shop e Clínica Veterinária',
  description:
    'Gestão completa para pet shops e clínicas veterinárias: agendamento de banho & tosa, consultas, clientes, financeiro e NFS-e.',
  keywords: ['sistema pet shop', 'software veterinário', 'gestão pet', 'agenda banho e tosa'],
  openGraph: {
    title: 'PetPro — Sistema de Gestão para Pet Shop e Clínica Veterinária',
    description: 'Organize seus agendamentos e faturamento. Mais tempo para cuidar dos pets.',
    images: ['/og/petpro.png'],
  },
}

export default function PetProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.pet}
      headline="Chega de bagunça na agenda do seu pet shop"
      subheadline="O único sistema com agendamento online, prontuário pet, controle financeiro e Agente IA Contador. Feito para pet shops e veterinários brasileiros."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=pet' }}
      instagram="@petpro.app"
      facebook="PetPro Gestão"
      testimonials={[
        {
          name: 'Camila Oliveira',
          role: 'Proprietária • Mundo Pet',
          text: 'Minha agenda de banho e tosa ficou cheia em 3 semanas com o agendamento online. Os tutores adoram.',
          avatar: 'CO',
        },
        {
          name: 'Dr. André Santos',
          role: 'Veterinário • Clínica VetCare',
          text: 'Fechei o DRE do mês em 5 minutos. Antes gastava uma tarde inteira no Excel todo mês.',
          avatar: 'AS',
        },
        {
          name: 'Juliana Lima',
          role: 'Sócia • PetFeliz Centro',
          text: 'O IA Contador me alertou que meu estoque de rações estava com margem negativa. Economizei muito.',
          avatar: 'JL',
        },
      ]}
    />
  )
}
