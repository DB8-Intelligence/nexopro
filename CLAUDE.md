# NEXOPRO — PROJECT MEMORY & AGENT INSTRUCTIONS
# Cole este arquivo na RAIZ do projeto Next.js
# O Claude Code lerá isso automaticamente em toda sessão
# ============================================================

## 🎯 VISÃO DO PRODUTO
NexoPro é uma plataforma SaaS multi-tenant white-label que entrega:
- Sistema de gestão operacional (agenda, clientes, serviços)
- Site público automático para cada cliente
- Gestão de redes sociais com geração de conteúdo por IA
- Financeiro e contabilidade completos (DRE, NFS-e, obrigações fiscais)
- Agente IA contador disponível 24h

Cada cliente (tenant) tem sua própria instância isolada, personalizada com as cores,
logo e módulos do seu nicho de negócio.

## 🏗️ STACK TÉCNICA — NUNCA ALTERAR SEM APROVAÇÃO
```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:    Supabase (PostgreSQL + Auth + Storage + Realtime)
Deploy:     Vercel (preview automático em cada PR)
IA:         Anthropic API — claude-sonnet-4-20250514
Pagamento:  Stripe (fase 5 — ainda não implementado)
Email:      Resend (fase 5 — ainda não implementado)
```

## 📁 ESTRUTURA DE PASTAS — SEGUIR SEMPRE
```
nexopro/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── cadastro/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── agenda/page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── financeiro/page.tsx
│   │   │   ├── contabilidade/page.tsx
│   │   │   ├── redes-sociais/page.tsx
│   │   │   ├── site-publico/page.tsx
│   │   │   ├── relatorios/page.tsx
│   │   │   └── layout.tsx           ← sidebar + topbar
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── gerar-conteudo/route.ts
│   │   │   │   └── contador/route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts
│   │   │   └── auth/
│   │   │       └── callback/route.ts
│   │   ├── s/[slug]/page.tsx        ← site público do cliente
│   │   ├── layout.tsx
│   │   └── page.tsx                 ← redirect para /dashboard
│   ├── components/
│   │   ├── ui/                      ← botões, inputs, modais base
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── KpiCard.tsx
│   │   ├── agenda/
│   │   │   ├── CalendarView.tsx
│   │   │   └── AppointmentModal.tsx
│   │   ├── clientes/
│   │   │   ├── ClientTable.tsx
│   │   │   └── ClientForm.tsx
│   │   ├── financeiro/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── DREView.tsx
│   │   │   └── FluxoCaixaView.tsx
│   │   ├── contabilidade/
│   │   │   ├── NFSeForm.tsx
│   │   │   └── ObrigacoesList.tsx
│   │   ├── social/
│   │   │   ├── ContentCreator.tsx
│   │   │   ├── MediaUpload.tsx
│   │   │   └── CalendarioEditorial.tsx
│   │   ├── site/
│   │   │   └── SiteEditor.tsx
│   │   └── ai/
│   │       └── AgenteContador.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useClients.ts
│   │   ├── useAppointments.ts
│   │   ├── useFinanceiro.ts
│   │   ├── useSocial.ts
│   │   └── useTenant.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── niche-config.ts          ← configurações dos 10 nichos
│   │   ├── plan-config.ts           ← regras dos planos
│   │   ├── utils.ts
│   │   └── ai.ts                    ← cliente Anthropic
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts                ← proteção de rotas
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_accounting_module.sql
├── CLAUDE.md                        ← este arquivo
├── .env.example
└── .env.local                       ← NUNCA commitar
```

## 🔐 VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # apenas server-side

# Anthropic
ANTHROPIC_API_KEY=                # apenas server-side, nunca expor

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NexoPro

# Stripe (fase 5)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 🏢 NICHOS SUPORTADOS
```typescript
type Niche =
  | 'beleza'      // Salão / Barbearia          → @salaopro.app
  | 'tecnico'     // Serviços Técnicos           → @ordemdeservico.pro
  | 'saude'       // Clínica / Consultório       → @clinicapro.gestao
  | 'juridico'    // Advocacia                   → @juridicpro.app
  | 'imoveis'     // Imobiliária / Corretor      → @imoveispro.app
  | 'pet'         // Veterinário / Pet Shop      → @petpro.app
  | 'educacao'    // Educação / Idiomas          → @educapro.app
  | 'nutricao'    // Nutrição / Fitness          → @nutripro.app
  | 'engenharia'  // Engenharia / Arquitetura    → @engepro.app
  | 'fotografia'  // Fotografia / Vídeo          → @fotopro.app
```
Config em: `src/lib/niche-config.ts`

## 💳 PLANOS E MÓDULOS
```
trial      → 14 dias, funcionalidades do starter
starter    → R$ 99/mês  — até 100 clientes, agenda básica, financeiro simples
pro        → R$199/mês  — ilimitado, financeiro completo, site público, 10 posts IA/mês
pro_plus   → R$349/mês  — tudo pro + posts IA ilimitados, NFS-e, DAS/ISS automático,
                           DRE automático, Agente IA Contador 24h
enterprise → R$699/mês  — tudo pro_plus + multi-usuários (até 10), API, gerente dedicado
```
**Regra crítica:** Sempre verificar `tenant.plan` antes de renderizar features.
Usar hook `isPlanAtLeast('pro_plus')` de `hooks/useAuth.ts`.

## 🗄️ BANCO DE DADOS — TABELAS PRINCIPAIS
```sql
-- Core
tenants                  -- cada cliente do SaaS
profiles                 -- usuários vinculados a tenants
tenant_settings          -- configurações + site público
tenant_modules           -- módulos ativos por tenant

-- Operacional
clients                  -- clientes do negócio
services                 -- serviços/produtos oferecidos
appointments             -- agendamentos
documents                -- contratos e documentos

-- Financeiro/Contábil
contas_bancarias         -- contas com saldo automático
categorias_financeiras   -- plano de contas
transactions             -- receitas e despesas
notas_fiscais            -- NFS-e emitidas
obrigacoes_fiscais       -- DAS, ISS, INSS com vencimentos
relatorios_contabeis     -- DRE, fluxo de caixa gerados

-- Redes Sociais
social_profiles          -- Instagram, Facebook, TikTok conectados
social_content           -- posts e reels (gerados ou manuais)
editorial_calendar       -- calendário editorial
media_library            -- imagens enviadas pelos clientes

-- Sistema
notifications
activity_logs
```
**RLS ATIVO EM TODAS AS TABELAS.** Sempre usar `get_tenant_id()` nas políticas.

## ⚙️ REGRAS DE DESENVOLVIMENTO — SEGUIR SEMPRE

### TypeScript
- Tipos explícitos em TUDO — nunca usar `any`
- Importar tipos de `src/types/database.ts`
- Props de componentes sempre tipadas com `interface`

### Supabase
- Queries no servidor: usar `createClient()` de `lib/supabase/server.ts`
- Queries no cliente: usar `createClient()` de `lib/supabase/client.ts`
- **NUNCA** usar `SUPABASE_SERVICE_ROLE_KEY` em componentes client-side
- Sempre tratar erros: `const { data, error } = await supabase...`
- RLS resolve segurança — não duplicar lógica de permissão no frontend

### Next.js App Router
- Server Components por padrão
- Marcar `'use client'` apenas em componentes com hooks ou eventos
- Usar `loading.tsx` e `error.tsx` em todas as rotas do dashboard
- API Routes em `src/app/api/` para chamadas à Anthropic e webhooks

### Segurança
- `ANTHROPIC_API_KEY` apenas em API Routes server-side
- Validar input do usuário antes de enviar para IA
- Rate limiting nas rotas de IA (máx 10 req/min por tenant)
- Sanitizar conteúdo gerado por IA antes de salvar

## 🤖 INTEGRAÇÃO COM ANTHROPIC API
```typescript
model: 'claude-sonnet-4-20250514'
max_tokens: 1000  // padrão para posts e respostas rápidas
max_tokens: 2000  // para DRE e relatórios contábeis
```

## 🔄 FLUXO DE ONBOARDING DO CLIENTE
```
1. /cadastro → criar conta (email + senha)
2. Escolher nicho (10 opções)
3. Informar nome do negócio + WhatsApp
4. Escolher plano (trial começa automaticamente)
5. setupTenant() → cria tenant + profile + settings + módulos + conta caixa
6. Redirect para /dashboard
```
Função: `setupTenant()` em `src/hooks/useAuth.ts`

## 🌐 SITE PÚBLICO DOS CLIENTES
Rota: `nexopro.app/s/[slug]` (pública — nunca exigir login)
Exibe: hero, serviços, galeria, depoimentos, botão de agendamento.
Config em: `tenant_settings` (campos `site_*`)

## 📊 MÓDULO CONTÁBIL — REGRAS IMPORTANTES

### DRE
Calculado a partir das `transactions` com:
- `competencia_ano` e `competencia_mes` preenchidos
- `status = 'paid'`
- Agrupado por `categorias_financeiras.grupo`

### NFS-e
Integração via API Focus NFe ou eNotas.
Status: `pendente → emitida → (cancelada)`

### Obrigações Fiscais
Alertas automáticos: 7 dias e 1 dia antes do vencimento.
DAS calculado sobre faturamento mensal (Simples Nacional).

## 🚀 COMANDOS FREQUENTES
```bash
npm run dev                    # inicia servidor local
npx supabase db push           # aplica migrations
npx supabase gen types typescript --local > src/types/database.ts
git push origin main           # Vercel faz deploy automático
```

## ❌ O QUE NUNCA FAZER
- Nunca commitar `.env.local` ou qualquer arquivo com chaves
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Nunca expor `ANTHROPIC_API_KEY` no client-side
- Nunca fazer queries sem filtro `tenant_id`
- Nunca desabilitar RLS nas tabelas
- Nunca usar `any` no TypeScript
- Nunca fazer deploy direto na main sem testar localmente
- Nunca remover migrations existentes — sempre criar novas

## ✅ CHECKLIST ANTES DE CADA COMMIT
- [ ] TypeScript sem erros (`npm run build`)
- [ ] Nenhuma chave secreta exposta no código
- [ ] RLS testado para o tenant correto
- [ ] Loading state implementado em queries
- [ ] Error handling em todas as chamadas async
- [ ] Tipos importados de `src/types/database.ts`
- [ ] Novo módulo verificando `isPlanAtLeast()` se necessário

## 📞 CONTEXTO DO DONO DO PROJETO
- Formação: Contador + Corretor de Imóveis + Avaliador de Imóveis
- Experiência técnica: Claude Code, Cursor, Bolt — não developer tradicional
- Objetivo: SaaS multi-nicho com receita recorrente (MRR)
- Nichos prioritários: Beleza (salões/barbearias) e Serviços Técnicos
- Meta de curto prazo: 100 clientes pagantes em 90 dias
- Stack decidida: Next.js + Supabase + Vercel (não mudar)

## 🗺️ ROADMAP — STATUS ATUAL
```
✅ FASE 1 — Dashboard base white-label
✅ FASE 2 — Schema SQL completo multi-tenant
✅ FASE 3 — Auth + Onboarding com escolha de nicho
✅ FASE 4 — Módulos: Financeiro, Contabilidade, Social, Site Público
⬜ FASE 5 — Stripe (pagamentos e assinaturas)
⬜ FASE 6 — Integrações externas (WhatsApp, NFS-e API, Open Finance)
⬜ FASE 7 — Landing pages de venda por nicho
⬜ FASE 8 — App mobile (React Native / Expo)
```

Última atualização: Março 2026
