import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'Ordem de Serviço Pro — Sistema para Assistências Técnicas',
  description:
    'Gestão de ordens de serviço, controle de peças, financeiro e notas fiscais para assistências técnicas e prestadores de serviço.',
  keywords: ['sistema ordem de serviço', 'software assistência técnica', 'OS digital', 'gestão técnico'],
  openGraph: {
    title: 'Ordem de Serviço Pro — Sistema para Assistências Técnicas',
    description: 'Emita OS, controle peças e fature mais com o sistema certo.',
    images: ['/og/ordemdeservico.png'],
  },
}

export default function OrdemDeServicoPPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.tecnico}
      headline="Suas ordens de serviço organizadas, seu faturamento crescendo"
      subheadline="Sistema completo para assistências técnicas: OS digital, controle de peças, financeiro, NFS-e automática e relatórios prontos para o contador."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=tecnico' }}
      instagram="@ordemdeservico.pro"
      facebook="Ordem de Serviço Pro"
      testimonials={[
        {
          name: 'Roberto Lima',
          role: 'Técnico • RL Informática',
          text: 'Minha OS sai em 30 segundos agora. Antes levava 15 minutos de papel e caneta.',
          avatar: 'RL',
        },
        {
          name: 'Fábio Souza',
          role: 'Dono • Gelafrio AC',
          text: 'O controle de peças me salvou. Sabia exatamente o que tinha em estoque.',
          avatar: 'FS',
        },
        {
          name: 'Juliano Ferreira',
          role: 'Eletricista autônomo',
          text: 'Emito nota fiscal em 2 cliques. Meus clientes PJ adoraram a profissionalidade.',
          avatar: 'JF',
        },
      ]}
    />
  )
}
