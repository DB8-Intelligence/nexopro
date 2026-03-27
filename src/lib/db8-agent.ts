/**
 * Cliente HTTP para o db8-agent (Railway Python/FastAPI)
 * URL: https://api.db8intelligence.com.br
 *
 * AVISO: FFmpeg precisa de servidor persistente — NUNCA migrar para serverless.
 * Usar APENAS em API Routes server-side (nunca em componentes client-side).
 */

const DB8_AGENT_URL = process.env.DB8_AGENT_URL ?? 'https://api.db8intelligence.com.br'

export async function db8Fetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${DB8_AGENT_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`db8-agent error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

/** Verifica se o db8-agent está online */
export async function db8Health(): Promise<boolean> {
  try {
    await db8Fetch('/health')
    return true
  } catch {
    return false
  }
}

/** FormData upload (para generate-video com imagens) */
export async function db8Upload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${DB8_AGENT_URL}${path}`, {
    method: 'POST',
    body: formData,
    // Não setar Content-Type — o browser/Node define o boundary do multipart automaticamente
  })

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`db8-agent upload error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}
