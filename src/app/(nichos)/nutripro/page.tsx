import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'NutriPro — Sistema de Gestão para Nutricionistas e Personal Trainers',
  description:
    'Gestão completa para nutricionistas e personal trainers: agendamento, anamnese, planos alimentares, financeiro e NFS-e.',
  keywords: ['sistema nutricionista', 'software personal trainer', 'gestão fitness', 'agenda nutrição'],
  openGraph: {
    title: 'NutriPro — Sistema de Gestão para Nutricionistas e Personal Trainers',
    description: 'Organize seus pacientes e faturamento. Foque nos resultados deles.',
    images: ['/og/nutripro.png'],
  },
}

export default function NutriProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.nutricao}
      headline="Chega de WhatsApp para gerenciar seus pacientes"
      subheadline="O único sistema com agendamento online, controle de consultas, financeiro e Agente IA Contador. Feito para nutricionistas e personal trainers brasileiros."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=nutricao' }}
      instagram="@nutripro.app"
      facebook="NutriPro Gestão"
      testimonials={[
        {
          name: 'Dra. Beatriz Ramos',
          role: 'Nutricionista • Nutri Bem Estar',
          text: 'Parei de perder consultas por falta de lembretes. O sistema confirmação automática salvou minha agenda.',
          avatar: 'BR',
        },
        {
          name: 'Thiago Ferreira',
          role: 'Personal Trainer • TF Performance',
          text: 'Organizei meus 40 alunos, controlo mensalidades e emito nota fiscal tudo num lugar. Revolucionou meu negócio.',
          avatar: 'TF',
        },
        {
          name: 'Larissa Pinto',
          role: 'Nutricionista esportiva • LP Nutrição',
          text: 'O DRE automático me mostrou que eu estava cobrando pouco pela consulta online. Reajustei e cresci 35%.',
          avatar: 'LP',
        },
      ]}
    />
  )
}
