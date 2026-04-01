'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, User, Lock } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'Como está meu resultado do mês?',
  'Tenho impostos a pagar esta semana?',
  'Como reduzir minhas despesas fixas?',
  'Qual minha margem de lucro atual?',
  'Explique meu DRE deste mês',
]

interface AgenteContadorProps {
  isPlanAllowed: boolean
}

export function AgenteContador({ isPlanAllowed }: AgenteContadorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/contador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json() as { message?: string; error?: string }

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.error ?? 'Erro ao processar.'}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? '' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isPlanAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">IA Contador — Pro Plus</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          O Agente IA Contador está disponível nos planos Pro Plus e Enterprise.
          Faça upgrade para ter acesso 24h a um contador especializado no seu negócio.
        </p>
        <a
          href="/assinatura"
          className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
        >
          Ver planos
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">IA Contador</h3>
            <p className="text-gray-500 text-sm mb-6">
              Seu contador pessoal disponível 24h. Pergunte sobre suas finanças, impostos e resultados.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Pergunte sobre suas finanças..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          IA especializada no seu negócio • máx. 10 perguntas/min
        </p>
      </div>
    </div>
  )
}
