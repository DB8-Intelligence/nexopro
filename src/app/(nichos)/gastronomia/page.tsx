import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'Omnix Gastronomia — Sistema de Gestão para Restaurantes e Bares',
  description:
    'Gestão completa para restaurantes, bares e lanchonetes: reservas online, controle de caixa, DRE automático, NFS-e e Agente IA Contador.',
  keywords: ['sistema para restaurante', 'gestão de bar', 'software lanchonete', 'controle financeiro gastronomia'],
  openGraph: {
    title: 'Omnix Gastronomia — Sistema de Gestão para Restaurantes e Bares',
    description: 'Pare de perder dinheiro sem controle financeiro no seu restaurante.',
    images: ['/og/gastronomia.png'],
  },
}

export default function GastronomiaPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.gastronomia}
      headline="Seu restaurante cheio e seu caixa no azul"
      subheadline="O único sistema com reservas, clientes fidelizados, financeiro, notas fiscais e Contador IA no mesmo lugar. Feito para gastronomia."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=gastronomia' }}
      instagram="@omnix.gastronomia"
      facebook="Omnix Gastronomia"
      testimonials={[
        {
          name: 'Roberto Alves',
          role: 'Proprietário • Restaurante Sabor Caseiro',
          text: 'Reduzi o desperdício em 30% depois que comecei a acompanhar o DRE todo mês. O sistema pagou o investimento em 2 semanas.',
          avatar: 'RA',
        },
        {
          name: 'Fernanda Lima',
          role: 'Sócia • Bar da Fê',
          text: 'As reservas online triplicaram minha ocupação nas sextas. Antes ficava mesa vazia que eu nem sabia.',
          avatar: 'FL',
        },
        {
          name: 'Paulo Mendes',
          role: 'Chef • Bistrô Paulo',
          text: 'O IA Contador me alertou que minha margem no prato principal estava negativa. Ajustei o preço e saí do prejuízo.',
          avatar: 'PM',
        },
      ]}
    />
  )
}
