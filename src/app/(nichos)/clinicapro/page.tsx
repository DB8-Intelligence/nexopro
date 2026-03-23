import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'ClínicaPro — Sistema de Gestão para Clínicas e Consultórios',
  description:
    'Agenda médica, prontuário eletrônico, gestão financeira e contabilidade para clínicas, consultórios e profissionais de saúde.',
  keywords: ['sistema para clínica', 'agenda médica', 'prontuário eletrônico', 'software consultório'],
  openGraph: {
    title: 'ClínicaPro — Sistema de Gestão para Clínicas e Consultórios',
    description: 'Foque nos seus pacientes. Deixe a gestão com a gente.',
    images: ['/og/clinicapro.png'],
  },
}

export default function ClinicaProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.saude}
      headline="Foque nos seus pacientes, não na burocracia"
      subheadline="Agenda, prontuário, financeiro e contabilidade em um só sistema. Com DRE automático e Agente IA Contador para você entender exatamente o que ganha."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=saude' }}
      instagram="@clinicapro.gestao"
      facebook="ClínicaPro Sistema"
      testimonials={[
        {
          name: 'Dra. Letícia Marques',
          role: 'Fisioterapeuta • Clínica LM Saúde',
          text: 'Consigo ver quanto lucrei no mês sem precisar chamar o contador. O IA Contador responde tudo.',
          avatar: 'LM',
        },
        {
          name: 'Dr. André Campos',
          role: 'Psicólogo • Consultório próprio',
          text: 'A agenda online reduziu o número de faltas pela metade com os lembretes automáticos.',
          avatar: 'AC',
        },
        {
          name: 'Dra. Camila Rocha',
          role: 'Nutricionista • Studio CR',
          text: 'Emito nota fiscal para todos os planos de saúde em 1 minuto. Que alívio!',
          avatar: 'CR',
        },
      ]}
    />
  )
}
