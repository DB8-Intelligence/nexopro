import type { Metadata } from 'next'
import { NicheMarketingPage } from '@/components/niche/NicheMarketingPage'
import { NICHE_CONFIGS } from '@/lib/niche-config'

export const metadata: Metadata = {
  title: 'Omnix Finanças — Sistema de Gestão para Contadores e Escritórios Contábeis',
  description:
    'Gestão completa para contadores, escritórios contábeis e consultores financeiros: CRM de clientes, controle de obrigações, NFS-e e Agente IA Contador.',
  keywords: ['sistema para contador', 'software contabilidade', 'gestão escritório contábil', 'controle de obrigações fiscais'],
  openGraph: {
    title: 'Omnix Finanças — Sistema de Gestão para Contadores e Escritórios Contábeis',
    description: 'Gerencie seus clientes contábeis com IA e nunca perca um prazo.',
    images: ['/og/financas.png'],
  },
}

export default function FinancasPage() {
  return (
    <NicheMarketingPage
      niche={NICHE_CONFIGS.financas}
      headline="Nunca mais perca um prazo fiscal"
      subheadline="O único sistema com CRM de clientes, controle de obrigações, DRE automático, NFS-e e Agente IA Contador no mesmo lugar. Feito para contadores e consultores."
      cta={{ label: 'Começar grátis por 14 dias', href: '/cadastro?niche=financas' }}
      instagram="@omnix.financas"
      facebook="Omnix Finanças"
      testimonials={[
        {
          name: 'Ricardo Barros',
          role: 'Contador • Barros Contabilidade',
          text: 'Gerencio 120 clientes MEI com muito mais organização. O alerta de obrigações me salvou de muitas multas.',
          avatar: 'RB',
        },
        {
          name: 'Cristiane Oliveira',
          role: 'Sócia • CRO Assessoria Fiscal',
          text: 'Meus clientes recebem relatórios automáticos todo mês. A percepção de valor do meu serviço aumentou muito.',
          avatar: 'CO',
        },
        {
          name: 'Alexandre Nunes',
          role: 'Consultor Financeiro • AN Finanças',
          text: 'O Agente IA responde dúvidas básicas dos meus clientes 24h. Reduzi 60% dos chamados de suporte.',
          avatar: 'AN',
        },
      ]}
    />
  )
}
