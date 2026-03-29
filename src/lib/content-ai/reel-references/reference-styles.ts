/**
 * Estilos de objetos falantes extraídos de referências virais do Instagram.
 * Análise baseada em perfis: @objetos_falando, @objetos.ensinando.ia, mundoiaa_, @objetosdodia, @dinheirofalante, etc.
 *
 * INSIGHT: O estilo mais viral NÃO é Pixar/Disney suave em fundo renderizado.
 * Os estilos dominantes usam FUNDO DE FOTO REAL + Pixar 3D.
 *
 * INSIGHT @objetosdodia (482K, 1.7M views):
 * "Pixar 3D + Ação + Fundo Real" — objeto como HERÓI/ESPECIALISTA realizando ação útil.
 * Jaleco branco = autoridade. Nicho nutrição/saúde.
 *
 * INSIGHT @dinheirofalante (795K, até 3M views):
 * "Pixar 3D + Raiva + Cenário Real Brasileiro" — objeto como ANTAGONISTA/VILÃO.
 * Objeto REPRESENTA o problema financeiro (conta de luz, cartão, gasolina) olhando furioso.
 * Fundo = ambiente brasileiro real (supermercado, rua, posto BR, banco).
 * Framing: "Este [gasto/dívida] está destruindo sua vida" → alta identificação + compartilhamento.
 * NÃO realiza ação — CONFRONTA o espectador com olhar raivoso ou defensivo.
 */

/**
 * INSIGHT @coisadecasa.ia (33.8K seguidores, até 2M views):
 * "Pixar 3D + Humano na Cena + Introdução do Objeto" — o objeto SE APRESENTA numa cena doméstica real.
 * Fórmula: humano e objeto dividem o frame. Objeto diz "Eu sou [X] e vou te ensinar..."
 * Ambientes: cozinha, banheiro, sala de estar real com família.
 * Mix de emoções (não só raiva) — amigável, surpreso, determinado funcionam igual.
 * Formatos únicos: múltiplos objetos em grupo, objeto em close extremo, objeto no interior do corpo humano.
 */

export type CharacterStyle =
  | 'fotorrealista'
  | 'miniatura-acao'
  | 'pixar-3d'
  | 'pixar-acao'
  | 'pixar-antagonista'
  | 'pixar-humano'
export type CharacterExpression = 'raiva' | 'chocado' | 'determinado' | 'alegre' | 'irritado'

export interface StyleDefinition {
  id: CharacterStyle
  label: string
  viralScore: number // 1-10 baseado em engajamento das referências
  description: string
  promptPrefix: string
  promptSuffix: string
  bestExpressions: CharacterExpression[]
  bestEnvironments: string[]
}

export const CHARACTER_STYLES: Record<CharacterStyle, StyleDefinition> = {
  'pixar-acao': {
    id: 'pixar-acao',
    label: 'Pixar 3D em Ação (Fundo Real)',
    viralScore: 10,
    description: 'Personagem Pixar 3D com corpo completo REALIZANDO ação, colocado em fundo de foto real (cozinha, clínica). Maior alcance para nutrição/saúde. Padrão @objetosdodia.',
    promptPrefix: 'Pixar Disney 3D animated [OBJECT] character with full body, arms and legs, expressive lip-sync face, [EXPRESSION] personality, actively performing [ACTION],',
    promptSuffix: 'placed in a real photographic [ENVIRONMENT], photorealistic background with 3D animated character composited in, cinematic warm lighting, Pixar render quality, ultra-detailed 8K, 9:16 vertical aspect ratio',
    bestExpressions: ['determinado', 'alegre', 'raiva'],
    bestEnvironments: [
      'real modern kitchen with marble countertops',
      'real clinical nutrition office',
      'real gym with equipment',
      'real supermarket produce section',
      'real home kitchen with natural light',
    ],
  },
  'fotorrealista': {
    id: 'fotorrealista',
    label: 'Fotorrealista com Face Expressiva',
    viralScore: 9,
    description: 'O objeto mantém textura real com face cartoon embutida na superfície. Mais viral.',
    promptPrefix: 'photorealistic [OBJECT] with an expressive cartoon face deeply embedded in its natural surface, [EXPRESSION] expression, large bulging realistic eyes with detailed irises, thick dramatic eyebrows, wide open mouth with visible realistic teeth,',
    promptSuffix: 'natural [OBJECT] texture preserved, placed in a real photographic environment, cinematic lighting, ultra-detailed, 8K resolution, hyperrealistic, 9:16 vertical aspect ratio',
    bestExpressions: ['raiva', 'chocado', 'irritado'],
    bestEnvironments: [
      'real kitchen sink with dirty dishes',
      'real bedroom with unmade bed',
      'rainy street with puddles',
      'dirty bathroom floor',
      'cluttered workshop table',
    ],
  },

  'miniatura-acao': {
    id: 'miniatura-acao',
    label: 'Miniatura de Ação Hiperreal',
    viralScore: 10,
    description: 'Personagem miniatura com corpo musculoso/estilizado em cena real. Maior engajamento observado.',
    promptPrefix: 'hyperrealistic miniature [OBJECT] character transformed into a muscular action figure, [COLOR] plastic and rubber texture, intense [EXPRESSION] expression, dynamic action pose,',
    promptSuffix: 'placed on a real [SURFACE] surface, macro photography perspective, shallow depth of field blur on background, dramatic studio lighting, photorealistic environment, ultra-detailed 8K, 9:16 vertical',
    bestExpressions: ['determinado', 'raiva', 'irritado'],
    bestEnvironments: [
      'real wooden table surface',
      'real dirty floor being cleaned',
      'real human skin close-up',
      'real countertop with food items',
      'real outdoor pavement',
    ],
  },

  'pixar-3d': {
    id: 'pixar-3d',
    label: 'Pixar/Disney 3D Animado',
    viralScore: 6,
    description: 'Personagem totalmente renderizado em estilo Pixar. Funciona bem para grupos de objetos.',
    promptPrefix: 'Pixar Disney 3D animated [OBJECT] character with expressive face, articulated arms and legs, [EXPRESSION] personality,',
    promptSuffix: 'standing in a rendered [ENVIRONMENT], warm golden hour lighting, Pixar render quality, smooth surfaces, subsurface scattering, 8K, 9:16 vertical aspect ratio',
    bestExpressions: ['alegre', 'determinado', 'raiva'],
    bestEnvironments: [
      'wooden workshop with warm lighting',
      'colorful Brazilian street',
      'modern kitchen set',
      'office environment',
      'outdoor plaza',
    ],
  },

  'pixar-antagonista': {
    id: 'pixar-antagonista',
    label: 'Pixar 3D Antagonista (Cenário Real BR)',
    viralScore: 10,
    description: 'Objeto Pixar 3D como VILÃO/ANTAGONISTA — representa o problema financeiro em si (conta, cartão, gasolina). Olhar raivoso/desafiador direto para câmera. Fundo sempre foto real brasileira. Padrão @dinheirofalante: 795K seguidores, até 3M views.',
    promptPrefix: 'Pixar Disney 3D animated [OBJECT] character as a menacing villain antagonist, full body with arms and legs, [EXPRESSION] furious confrontational expression, glaring directly at camera,',
    promptSuffix: 'standing defiantly in a real photographic Brazilian [ENVIRONMENT], photorealistic background, dramatic cinematic lighting with moody shadows, Pixar render quality, ultra-detailed 8K, 9:16 vertical aspect ratio',
    bestExpressions: ['raiva', 'irritado', 'determinado'],
    bestEnvironments: [
      'real Brazilian supermarket aisle with price tags',
      'real gas station BR with fuel prices',
      'real bank branch interior',
      'real Brazilian street with buildings',
      'real gym interior with equipment',
      'dark dramatic financial office background',
      'real car dealership interior',
    ],
  },

  'pixar-humano': {
    id: 'pixar-humano',
    label: 'Pixar 3D + Humano (Introdução do Objeto)',
    viralScore: 8,
    description: 'Objeto Pixar 3D COEXISTE na mesma cena com humano real. Objeto se apresenta ou ensina. Fórmula @coisadecasa.ia: "Eu sou [X] e vou te mostrar como...". Ambiente doméstico caloroso. Mix de emoções — amigável ou surpreso predomina.',
    promptPrefix: 'Pixar Disney 3D animated [OBJECT] character with expressive friendly face, full body with arms and legs, [EXPRESSION] expression, appearing alongside a real person in a domestic scene,',
    promptSuffix: 'photorealistic [ENVIRONMENT] with warm natural lighting, 3D animated character seamlessly composited into real domestic setting, inviting and warm atmosphere, Pixar render quality, ultra-detailed 8K, 9:16 vertical aspect ratio',
    bestExpressions: ['alegre', 'chocado', 'determinado'],
    bestEnvironments: [
      'real home kitchen with family preparing food',
      'real bathroom with person at sink',
      'real living room with cozy furniture',
      'real dining table with family',
      'real bedroom with natural morning light',
    ],
  },
}

export const EXPRESSION_PROMPTS: Record<CharacterExpression, string> = {
  raiva:      'extremely angry, furrowed brows, clenched teeth, reddish tones',
  chocado:    'extremely shocked, wide open eyes, mouth agape, surprised expression',
  determinado:'fierce determined look, intense focused eyes, stern jaw',
  alegre:     'joyful enthusiastic smile, bright eyes, welcoming expression',
  irritado:   'deeply annoyed, side-eye expression, pursed lips, impatient look',
}

/**
 * Build a complete Fal.ai prompt using style + expression + object + environment
 */
export function buildObjectPrompt(params: {
  objectName: string
  style: CharacterStyle
  expression: CharacterExpression
  color: string
  environment?: string
  additionalDetails?: string
}): string {
  const styleDef = CHARACTER_STYLES[params.style]
  const expressionDesc = EXPRESSION_PROMPTS[params.expression]
  const env = params.environment ?? styleDef.bestEnvironments[0]

  const prefix = styleDef.promptPrefix
    .replace('[OBJECT]', params.objectName)
    .replace('[EXPRESSION]', expressionDesc)
    .replace('[COLOR]', params.color)

  const suffix = styleDef.promptSuffix
    .replace('[OBJECT]', params.objectName)
    .replace('[SURFACE]', env)
    .replace('[ENVIRONMENT]', env)

  const extra = params.additionalDetails ? `, ${params.additionalDetails}` : ''

  return `${prefix} ${params.color} color palette${extra}, ${suffix}`
}

/**
 * Returns the recommended style for a given niche based on viral patterns
 */
export function getRecommendedStyle(niche: string): CharacterStyle {
  const nicheStyleMap: Record<string, CharacterStyle> = {
    tecnico:      'miniatura-acao',      // ferramentas musculosas em ação
    beleza:       'fotorrealista',       // tesoura/esmalte com cara no espelho
    saude:        'fotorrealista',       // medicamento/dente com face expressiva
    pet:          'pixar-3d',            // animais/produtos pet em estilo animado
    imoveis:      'pixar-3d',            // chave/placa de venda animada
    juridico:     'fotorrealista',       // martelo/livro com face séria
    nutricao:     'pixar-acao',          // fruta/alimento Pixar 3D em cozinha real (@objetosdodia 1.7M views)
    educacao:     'pixar-3d',            // livro/lápis estilo animado
    engenharia:   'miniatura-acao',      // ferramentas/capacete miniatura
    fotografia:   'fotorrealista',       // câmera/lente com face expressiva
    financeiro:   'pixar-antagonista',   // cartão/nota/conta como vilão raivoso em cenário BR real (@dinheirofalante 3M views)
    casa:         'pixar-humano',        // objeto doméstico se apresenta ao lado de humano em cena real (@coisadecasa.ia 2M views)
  }
  return nicheStyleMap[niche] ?? 'fotorrealista'
}

/**
 * Reference profiles by engagement level
 * Use these as inspiration when guiding the AI
 */
export const REFERENCE_PROFILES = [
  { handle: '@coisadecasa.ia',      style: 'pixar-humano' as CharacterStyle,      avgViews: 2000000, followers: 33800,  notes: 'Objetos domésticos Pixar 3D COEXISTEM com humanos reais. Fórmula: objeto se apresenta ("Eu sou X") em cena doméstica calorosa. Nicho casa/saúde. Mix de emoções — amigável dominante. Formatos únicos: grupo de objetos, objeto em interior do corpo humano, objeto + família. 152 posts, top 2M views.' },
  { handle: '@dinheirofalante',     style: 'pixar-antagonista' as CharacterStyle, avgViews: 3000000, followers: 795000,  notes: 'Objetos financeiros (notas, cartões, contas) como VILÕES raivosos em cenários reais brasileiros. Nicho finanças/consumo. Framing: o gasto/dívida é o antagonista. 795K seguidores, pico de 3M views. Objetos: R$50/R$100, Nubank, Bradesco, Carteira de Trabalho, bomba de gasolina, conta de luz.' },
  { handle: '@objetosdodia',        style: 'pixar-acao' as CharacterStyle,        avgViews: 1700000, followers: 482000, notes: 'Frutas/alimentos Pixar 3D em cozinha real + jaleco branco (autoridade). Nicho nutrição/saúde. Fórmula: headline em negrito + objeto realizando ação em ambiente real.' },
  { handle: 'mundoiaa_',            style: 'miniatura-acao' as CharacterStyle,    avgViews: 9782,    followers: 0,      notes: 'Miniatura azul muscular fazendo tarefas domésticas' },
  { handle: '@objetos_falando',     style: 'fotorrealista' as CharacterStyle,     avgViews: 3801,    followers: 0,      notes: 'Objetos domésticos raivosos em ambientes reais sujos' },
  { handle: '@objetos.ensinando.ia',style: 'fotorrealista' as CharacterStyle,     avgViews: 2698,    followers: 0,      notes: 'Edredons/travesseiros com faces no quarto real' },
  { handle: '@objetodebochado',     style: 'pixar-3d' as CharacterStyle,          avgViews: 118,     followers: 0,      notes: 'Grupo de objetos estilo Pixar em workshop' },
  { handle: 'objetosfalantes_',     style: 'miniatura-acao' as CharacterStyle,    avgViews: 132,     followers: 0,      notes: 'Miniatura em close em pele/superfície real' },
  { handle: 'objeto.fala',          style: 'fotorrealista' as CharacterStyle,     avgViews: 72,      followers: 0,      notes: 'Cinto de couro andando em rua real na chuva' },
] as const
