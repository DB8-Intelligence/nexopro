import { Resend } from 'resend'

// Server-side only — lazy singleton
const FROM = process.env.RESEND_FROM ?? 'NexoPro <noreply@nexopro.app>'

interface SendOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(opts: SendOptions) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({ from: FROM, ...opts })
}

// ── Email templates ────────────────────────────────────────────

export function welcomeEmail(tenantName: string, plan: string): { subject: string; html: string } {
  return {
    subject: `Bem-vindo ao NexoPro, ${tenantName}! 🚀`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:24px;color:#1d4ed8">Bem-vindo ao NexoPro!</h1>
        <p style="color:#374151">Olá, <strong>${tenantName}</strong>!</p>
        <p style="color:#374151">
          Sua assinatura <strong>${plan}</strong> foi ativada com sucesso.
          Acesse o painel e comece a transformar seu negócio com IA.
        </p>
        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
          style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px"
        >
          Acessar meu painel →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          NexoPro • Gestão inteligente para seu negócio
        </p>
      </div>
    `,
  }
}

export function paymentFailedEmail(tenantName: string, retryUrl: string): { subject: string; html: string } {
  return {
    subject: `Pagamento não processado — NexoPro`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:22px;color:#dc2626">Problema com seu pagamento</h1>
        <p style="color:#374151">Olá, <strong>${tenantName}</strong>!</p>
        <p style="color:#374151">
          Não conseguimos processar o pagamento da sua assinatura NexoPro.
          Para evitar a interrupção do serviço, atualize seu método de pagamento.
        </p>
        <a
          href="${retryUrl}"
          style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px"
        >
          Atualizar pagamento →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          NexoPro • Se precisar de ajuda, responda este e-mail.
        </p>
      </div>
    `,
  }
}

export function trialEndingEmail(tenantName: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `Seu trial expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} — NexoPro`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:22px;color:#d97706">Seu período gratuito está acabando</h1>
        <p style="color:#374151">Olá, <strong>${tenantName}</strong>!</p>
        <p style="color:#374151">
          Seu trial do NexoPro expira em <strong>${daysLeft} dia${daysLeft !== 1 ? 's' : ''}</strong>.
          Escolha um plano para continuar usando todas as funcionalidades.
        </p>
        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}/assinatura"
          style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px"
        >
          Escolher meu plano →
        </a>
      </div>
    `,
  }
}
