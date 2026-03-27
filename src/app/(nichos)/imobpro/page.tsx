import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'iMobPro — Sistema de Gestão para Corretores e Imobiliárias',
  description:
    'Gestão completa para corretores e imobiliárias: captação, gestão de imóveis, geração de vídeos com IA, controle financeiro e NFS-e.',
  keywords: ['sistema para corretor', 'software imobiliária', 'gestão imóveis', 'CRM corretor'],
  openGraph: {
    title: 'iMobPro — Sistema de Gestão para Corretores e Imobiliárias',
    description: 'Pare de perder vendas por falta de organização. Gerencie sua carteira com IA.',
    images: ['/og/imobpro.png'],
  },
}

export default function ImobProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.imoveis}
      headline="Chega de planilha para gerenciar seus imóveis"
      subheadline="O único sistema com captação, geração de vídeos IA, financeiro, notas fiscais e Contador IA. Feito para corretores e imobiliárias brasileiras."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=imoveis' }}
      instagram="@imoveispro.app"
      facebook="iMobPro Gestão"
      testimonials={[
        {
          name: 'Roberto Almeida',
          role: 'Corretor • RA Imóveis',
          text: 'Gerei meu primeiro vídeo de imóvel em 2 minutos. Minha taxa de resposta no Instagram triplicou.',
          avatar: 'RA',
        },
        {
          name: 'Fernanda Torres',
          role: 'Diretora • Torres Imobiliária',
          text: 'Antes eram 3 planilhas e um caderno. Hoje tudo está num só lugar e o DRE fecha sozinho.',
          avatar: 'FT',
        },
        {
          name: 'Marcelo Nunes',
          role: 'Corretor autônomo • MN Imóveis',
          text: 'O IA Contador me mostrou que eu estava perdendo dinheiro com comissões erradas. Nunca mais.',
          avatar: 'MN',
        },
      ]}
    />
  )
}
