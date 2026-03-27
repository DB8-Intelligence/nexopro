import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'EducaPro — Sistema de Gestão para Escolas, Cursos e Professores',
  description:
    'Gestão completa para escolas e cursos: matrículas, alunos, aulas, financeiro, DRE automático e Agente IA Contador.',
  keywords: ['sistema escola', 'software curso online', 'gestão educacional', 'agenda professor'],
  openGraph: {
    title: 'EducaPro — Sistema de Gestão para Escolas, Cursos e Professores',
    description: 'Organize suas turmas e matrículas. Mais tempo para ensinar.',
    images: ['/og/educapro.png'],
  },
}

export default function EducaProPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.educacao}
      headline="Chega de planilha para controlar alunos e mensalidades"
      subheadline="O único sistema com matrículas online, controle de inadimplência, financeiro e Agente IA Contador. Feito para escolas e cursos brasileiros."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=educacao' }}
      instagram="@educapro.app"
      facebook="EducaPro Gestão"
      testimonials={[
        {
          name: 'Prof. Ricardo Alves',
          role: 'Diretor • Instituto Alves Idiomas',
          text: 'Reduzi a inadimplência em 60% só com os lembretes automáticos. O IA Contador é incrível.',
          avatar: 'RA',
        },
        {
          name: 'Patrícia Moura',
          role: 'Coordenadora • Escola Criativa',
          text: 'Antes eu passava horas controlando pagamentos de alunos. Hoje o sistema faz tudo e eu foco no pedagógico.',
          avatar: 'PM',
        },
        {
          name: 'Diego Carvalho',
          role: 'Fundador • CodeSchool BR',
          text: 'Abri minha escola de programação e já tinha tudo organizado desde o primeiro aluno. Fácil demais.',
          avatar: 'DC',
        },
      ]}
    />
  )
}
