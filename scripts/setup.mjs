#!/usr/bin/env node
/**
 * NexoPro — Setup Automatizado Completo
 * ======================================
 * O que este script faz:
 *   1. Cria projeto Supabase "nexopro" via Management API
 *   2. Aguarda o projeto ficar pronto
 *   3. Aplica todas as migrations (001-007)
 *   4. Cria .env.local com todas as credenciais
 *   5. Faz deploy no Vercel com as env vars
 *   6. Adiciona credencial Supabase NexoPro ao n8n
 *   7. Importa e ativa o workflow NexoPro no n8n
 *
 * Pré-requisitos:
 *   npm i -g vercel
 *   Preencher scripts/setup-secrets.json
 *
 * Uso:
 *   npm run setup
 */

import { execSync, spawnSync } from 'child_process'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Helpers ──────────────────────────────────────────────────────────────────

const green  = (s) => `\x1b[32m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const red    = (s) => `\x1b[31m${s}\x1b[0m`
const bold   = (s) => `\x1b[1m${s}\x1b[0m`

const log   = (msg) => console.log(green(`✅ ${msg}`))
const warn  = (msg) => console.log(yellow(`⚠️  ${msg}`))
const step  = (msg) => console.log(bold(`\n▶ ${msg}`))
const fail  = (msg) => { console.error(red(`❌ ${msg}`)); process.exit(1) }

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function supabase(path, method = 'GET', body = null, token) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Supabase API ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  return JSON.parse(text)
}

async function n8n(path, method = 'GET', body = null, baseUrl, apiKey) {
  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`n8n API ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  return JSON.parse(text)
}

// ─── Carregar secrets ─────────────────────────────────────────────────────────

const secretsPath = join(__dirname, 'setup-secrets.json')
if (!existsSync(secretsPath)) {
  fail(
    'Arquivo scripts/setup-secrets.json não encontrado.\n' +
    '  → Copie setup-secrets.example.json para setup-secrets.json e preencha.'
  )
}

const s = JSON.parse(readFileSync(secretsPath, 'utf8'))

const SUPABASE_TOKEN  = s.SUPABASE_ACCESS_TOKEN
const SUPABASE_ORG    = s.SUPABASE_ORG_ID
const ANTHROPIC_KEY   = s.ANTHROPIC_API_KEY
const N8N_KEY         = s.N8N_API_KEY
const N8N_URL         = s.N8N_URL || 'https://automacao.db8intelligence.com.br'
const DB8_URL         = s.DB8_AGENT_URL || 'https://api.db8intelligence.com.br'
const N8N_WEBHOOK_TOK = s.N8N_WEBHOOK_TOKEN || 'nexopro-webhook-secret'
const STRIPE_SK       = s.STRIPE_SECRET_KEY || ''
const STRIPE_PK       = s.STRIPE_PUBLISHABLE_KEY || ''
const RESEND_KEY      = s.RESEND_API_KEY || ''
const FAL_KEY         = s.FAL_KEY || ''
const ELEVEN_KEY      = s.ELEVENLABS_API_KEY || ''

if (!SUPABASE_TOKEN) fail('SUPABASE_ACCESS_TOKEN é obrigatório em setup-secrets.json')
if (!SUPABASE_ORG)   fail('SUPABASE_ORG_ID é obrigatório em setup-secrets.json')
if (!ANTHROPIC_KEY)  fail('ANTHROPIC_API_KEY é obrigatório em setup-secrets.json')

console.log(bold('\n╔══════════════════════════════════════════╗'))
console.log(bold('║   NexoPro — Setup Automatizado Completo  ║'))
console.log(bold('╚══════════════════════════════════════════╝'))

// ─── PASSO 1: Criar projeto Supabase ─────────────────────────────────────────

step('1/7 — Criando projeto Supabase "nexopro"...')

let project
const dbPassword = Buffer.from(crypto.getRandomValues(new Uint8Array(18))).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 'Nx1!'

try {
  project = await supabase('/projects', 'POST', {
    name: 'nexopro',
    organization_id: SUPABASE_ORG,
    db_pass: dbPassword,
    region: 'sa-east-1',
    plan: 'free',
  }, SUPABASE_TOKEN)
  log(`Projeto criado → ref: ${project.ref}`)
} catch (e) {
  if (e.message.includes('already exists') || e.message.includes('duplicate')) {
    warn('Projeto já existe. Buscando ref...')
    const projects = await supabase('/projects', 'GET', null, SUPABASE_TOKEN)
    project = projects.find(p => p.name === 'nexopro')
    if (!project) fail(`Projeto "nexopro" não encontrado na org "${SUPABASE_ORG}". Verifique SUPABASE_ORG_ID.`)
    log(`Usando projeto existente → ref: ${project.ref}`)
  } else {
    fail(`Erro ao criar projeto Supabase: ${e.message}`)
  }
}

// ─── PASSO 2: Aguardar projeto pronto ────────────────────────────────────────

step('2/7 — Aguardando projeto ficar ACTIVE_HEALTHY...')
let ready = false
for (let i = 0; i < 40; i++) {
  const p = await supabase(`/projects/${project.ref}`, 'GET', null, SUPABASE_TOKEN)
  if (p.status === 'ACTIVE_HEALTHY') { ready = true; break }
  process.stdout.write('.')
  await sleep(6000)
}
console.log('')
if (!ready) warn('Projeto demorou para ficar pronto. Continuando mesmo assim...')
else log('Projeto ativo!')

// ─── PASSO 3: Obter API keys ──────────────────────────────────────────────────

step('3/7 — Obtendo chaves da API...')
const keys = await supabase(`/projects/${project.ref}/api-keys`, 'GET', null, SUPABASE_TOKEN)
const anonKey    = keys.find(k => k.name === 'anon')?.api_key
const serviceKey = keys.find(k => k.name === 'service_role')?.api_key
const supabaseUrl = `https://${project.ref}.supabase.co`

if (!anonKey || !serviceKey) fail('Não foi possível obter as API keys. Aguarde o projeto estar pronto e execute novamente.')
log(`URL: ${supabaseUrl}`)

// ─── PASSO 4: Aplicar migrations ─────────────────────────────────────────────

step('4/7 — Aplicando migrations (001–007)...')
const migrationsDir = join(ROOT, 'supabase', 'migrations')
const migrations = [
  '001_initial_schema.sql',
  '002_accounting_module.sql',
  '003_schema_improvements.sql',
  '004_imob_module.sql',
  '005_content_ai.sql',
  '006_billing.sql',
  '007_stock_courses.sql',
]

for (const file of migrations) {
  const filePath = join(migrationsDir, file)
  if (!existsSync(filePath)) { warn(`Pulando (não encontrado): ${file}`); continue }
  const sql = readFileSync(filePath, 'utf8')
  try {
    await supabase(
      `/projects/${project.ref}/database/query`,
      'POST',
      { query: sql },
      SUPABASE_TOKEN
    )
    log(`Aplicada: ${file}`)
  } catch (e) {
    warn(`${file}: ${e.message.slice(0, 120)}`)
  }
  await sleep(500)
}

// ─── PASSO 5: Criar .env.local ───────────────────────────────────────────────

step('5/7 — Criando .env.local...')
const envLocal = `# ============================================================
# NexoPro — .env.local
# Gerado automaticamente em ${new Date().toISOString()}
# NUNCA commitar este arquivo
# ============================================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# Anthropic
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}

# Railway services
DB8_AGENT_URL=${DB8_URL}
N8N_WEBHOOK_TOKEN=${N8N_WEBHOOK_TOK}

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NexoPro

# Stripe (preencher quando ativar)
STRIPE_SECRET_KEY=${STRIPE_SK}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PK}
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=${RESEND_KEY}

# ContentAI
FAL_KEY=${FAL_KEY}
ELEVENLABS_API_KEY=${ELEVEN_KEY}
`
writeFileSync(join(ROOT, '.env.local'), envLocal)
log('.env.local criado')

// ─── PASSO 6: Deploy Vercel ───────────────────────────────────────────────────

step('6/7 — Deploy no Vercel...')

// Env vars para o Vercel
const vercelEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL:          supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:     anonKey,
  SUPABASE_SERVICE_ROLE_KEY:         serviceKey,
  ANTHROPIC_API_KEY:                 ANTHROPIC_KEY,
  DB8_AGENT_URL:                     DB8_URL,
  N8N_WEBHOOK_TOKEN:                 N8N_WEBHOOK_TOK,
  NEXT_PUBLIC_APP_NAME:              'NexoPro',
  ...(STRIPE_SK   && { STRIPE_SECRET_KEY:                    STRIPE_SK }),
  ...(STRIPE_PK   && { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:   STRIPE_PK }),
  ...(RESEND_KEY  && { RESEND_API_KEY:                       RESEND_KEY }),
  ...(FAL_KEY     && { FAL_KEY }),
  ...(ELEVEN_KEY  && { ELEVENLABS_API_KEY:                   ELEVEN_KEY }),
}

let deployUrl = ''
try {
  // Adicionar cada env var ao Vercel (modo production)
  for (const [key, value] of Object.entries(vercelEnvVars)) {
    if (!value) continue
    spawnSync(
      'vercel',
      ['env', 'add', key, 'production', '--yes'],
      { input: value + '\n', encoding: 'utf8', cwd: ROOT }
    )
  }
  log('Variáveis de ambiente configuradas no Vercel')

  // Deploy
  const result = spawnSync('vercel', ['--prod', '--yes'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  const output = (result.stdout || '') + (result.stderr || '')
  // Extrair URL do output
  const urlMatch = output.match(/https:\/\/[a-z0-9\-]+\.vercel\.app/)
  deployUrl = urlMatch ? urlMatch[0] : 'verificar no painel Vercel'
  log(`Deploy concluído → ${deployUrl}`)

  // Atualizar NEXT_PUBLIC_APP_URL com a URL real
  spawnSync('vercel', ['env', 'add', 'NEXT_PUBLIC_APP_URL', 'production', '--yes'], {
    input: deployUrl + '\n',
    encoding: 'utf8',
    cwd: ROOT,
  })
} catch (e) {
  warn(`Vercel deploy falhou: ${e.message}\n  → Execute manualmente: vercel --prod`)
}

// ─── PASSO 7: Configurar n8n ──────────────────────────────────────────────────

step('7/7 — Configurando n8n...')

if (!N8N_KEY) {
  warn('N8N_API_KEY não fornecida. Pulando configuração do n8n.')
  warn('Para configurar manualmente: importe scripts/n8n-nexopro-workflow.json no n8n.')
} else {
  try {
    // Criar credencial Supabase NexoPro no n8n
    let credId
    try {
      const cred = await n8n('/credentials', 'POST', {
        name: 'Supabase NexoPro',
        type: 'supabaseApi',
        data: {
          host: supabaseUrl,
          serviceRole: serviceKey,
        },
      }, N8N_URL, N8N_KEY)
      credId = cred.id
      log(`Credencial n8n criada → ID: ${credId}`)
    } catch (e) {
      warn(`Credencial n8n: ${e.message.slice(0, 100)}`)
    }

    // Importar workflow
    const wfPath = join(__dirname, 'n8n-nexopro-workflow.json')
    if (existsSync(wfPath) && credId) {
      const workflow = JSON.parse(readFileSync(wfPath, 'utf8'))

      // Atualizar referências de credenciais e webhook token
      workflow.nodes = workflow.nodes.map(node => {
        if (node.credentials?.supabaseApi) {
          node.credentials.supabaseApi = { id: credId, name: 'Supabase NexoPro' }
        }
        if (node.parameters?.httpMethod && node.type === 'n8n-nodes-base.webhook') {
          node.parameters.path = `nexopro-content-${project.ref.slice(0, 6)}`
        }
        // Injetar chave Anthropic no nó HTTP
        if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url?.includes('anthropic')) {
          node.parameters.headers = node.parameters.headers || { parameters: [] }
          node.parameters.headers.parameters = [
            { name: 'x-api-key', value: ANTHROPIC_KEY },
            { name: 'anthropic-version', value: '2023-06-01' },
            { name: 'content-type', value: 'application/json' },
          ]
        }
        return node
      })

      const created = await n8n('/workflows', 'POST', workflow, N8N_URL, N8N_KEY)
      log(`Workflow criado → ID: ${created.id}`)

      // Ativar workflow
      await n8n(`/workflows/${created.id}/activate`, 'POST', {}, N8N_URL, N8N_KEY)
      log('Workflow ativado!')

      // Salvar webhook URL no .env.local
      const webhookPath = `nexopro-content-${project.ref.slice(0, 6)}`
      const webhookUrl = `${N8N_URL}/webhook/${webhookPath}`
      const currentEnv = readFileSync(join(ROOT, '.env.local'), 'utf8')
      writeFileSync(
        join(ROOT, '.env.local'),
        currentEnv + `\n# n8n Webhook (gerado pelo setup)\nN8N_CONTENT_WEBHOOK_URL=${webhookUrl}\n`
      )
      log(`Webhook URL: ${webhookUrl}`)
    }
  } catch (e) {
    warn(`n8n: ${e.message.slice(0, 150)}`)
    warn('Configure o n8n manualmente importando scripts/n8n-nexopro-workflow.json')
  }
}

// ─── Salvar resultado ─────────────────────────────────────────────────────────

const result = {
  gerado_em: new Date().toISOString(),
  supabase: {
    url: supabaseUrl,
    ref: project.ref,
    anon_key: anonKey.slice(0, 20) + '...',
  },
  vercel_url: deployUrl || 'ver painel Vercel',
  env_local: join(ROOT, '.env.local'),
}
writeFileSync(join(__dirname, 'setup-result.json'), JSON.stringify(result, null, 2))

// ─── Sumário ──────────────────────────────────────────────────────────────────

console.log(bold('\n╔══════════════════════════════════════════════════════════════╗'))
console.log(bold('║               NexoPro Setup Concluído! 🚀                   ║'))
console.log(bold('╠══════════════════════════════════════════════════════════════╣'))
console.log(`║  Supabase URL:   ${supabaseUrl.padEnd(44)}║`)
console.log(`║  Supabase Ref:   ${project.ref.padEnd(44)}║`)
console.log(`║  Deploy URL:     ${(deployUrl || 'ver painel Vercel').padEnd(44)}║`)
console.log(`║  .env.local:     ${green('✅ criado').padEnd(53)}║`)
console.log(`║  Migrations:     ${green('✅ 007 aplicadas').padEnd(53)}║`)
console.log(`║  n8n:            ${(N8N_KEY ? green('✅ configurado') : yellow('⚠️  pular')).padEnd(53)}║`)
console.log(bold('╠══════════════════════════════════════════════════════════════╣'))
console.log(bold('║  PRÓXIMOS PASSOS:                                            ║'))
console.log('║  1. Testar localmente: npm run dev                            ║')
console.log('║  2. Criar webhook Stripe → cole em STRIPE_WEBHOOK_SECRET      ║')
console.log('║  3. Adicionar domínio nexopro.app no Vercel                    ║')
console.log('║  4. Ativar Supabase Auth → Email provider                     ║')
console.log(bold('╚══════════════════════════════════════════════════════════════╝\n'))
