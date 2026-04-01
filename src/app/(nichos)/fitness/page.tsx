import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'Omnix Fitness — Sistema de Gestão para Academias e Personal Trainers',
  description:
    'Gestão completa para academias, studios e personal trainers: agenda de treinos, controle de alunos, financeiro, NFS-e e Agente IA Contador.',
  keywords: ['sistema para academia', 'software personal trainer', 'gestão fitness', 'controle de alunos academia'],
  openGraph: {
    title: 'Omnix Fitness — Sistema de Gestão para Academias e Personal Trainers',
    description: 'Foque nos seus alunos, deixe a gestão com a IA.',
    images: ['/og/fitness.png'],
  },
}

export default function FitnessPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.fitness}
      headline="Mais alunos, menos planilha"
      subheadline="O único sistema com agenda de treinos, evolução de alunos, financeiro, notas fiscais e Contador IA no mesmo lugar. Feito para academias e personal trainers."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=fitness' }}
      instagram="@omnix.fitness"
      facebook="Omnix Fitness"
      testimonials={[
        {
          name: 'Thiago Souza',
          role: 'Personal Trainer • Studio TS Fit',
          text: 'Antes gerenciava 40 alunos no WhatsApp. Hoje tenho 80 e administro tudo em 15 minutos por dia.',
          avatar: 'TS',
        },
        {
          name: 'Juliana Rocha',
          role: 'Proprietária • Academia Corpo & Mente',
          text: 'O DRE automático mostrou que minha turma de spinning era a mais lucrativa. Abri mais 2 turmas e cresci 40%.',
          avatar: 'JR',
        },
        {
          name: 'Marcus Vinicius',
          role: 'Sócio • CrossFit MV Box',
          text: 'A emissão de notas fiscais que levava 2 horas por mês agora é automática. Foco 100% nos atletas.',
          avatar: 'MV',
        },
      ]}
    />
  )
}
