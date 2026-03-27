import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'FotoPro — Sistema de Gestão para Fotógrafos e Produtoras',
  description:
    'Gestão completa para fotógrafos e produtoras de vídeo: agenda de ensaios, clientes, entrega de arquivos, financeiro e NFS-e.',
  keywords: ['sistema fotógrafo', 'software produtora vídeo', 'gestão fotografia', 'agenda ensaio'],
  openGraph: {
    title: 'FotoPro — Sistema de Gestão para Fotógrafos e Produtoras',
    description: 'Organize seus ensaios e faturamento. Mais tempo para criar.',
    images: ['/og/fotopro.png'],
  },
}

export default function FotoProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.fotografia}
      headline="Chega de agenda confusa e cliente sem resposta"
      subheadline="O único sistema com agenda de ensaios, CRM de clientes, financeiro, ContentAI para reels e Agente IA Contador. Feito para fotógrafos e produtoras brasileiras."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=fotografia' }}
      instagram="@fotopro.app"
      facebook="FotoPro Gestão"
      testimonials={[
        {
          name: 'Isabela Cruz',
          role: 'Fotógrafa • IC Fotografia',
          text: 'O ContentAI gera reels dos meus ensaios automaticamente. Meu Instagram explodiu em seguidores.',
          avatar: 'IC',
        },
        {
          name: 'Gabriel Moreira',
          role: 'Diretor • GM Filmes',
          text: 'Controlo todos os projetos, contratos e pagamentos num lugar só. Profissionalizou minha produtora.',
          avatar: 'GM',
        },
        {
          name: 'Amanda Vieira',
          role: 'Fotógrafa de casamentos • AV Fotos',
          text: 'O DRE mostrou que casamentos de fim de semana tinham margem 3x maior. Reorganizei meu calendário.',
          avatar: 'AV',
        },
      ]}
    />
  )
}
