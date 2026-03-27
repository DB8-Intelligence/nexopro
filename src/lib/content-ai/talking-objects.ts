export interface TalkingObject {
  id: string
  name: string
  emoji: string
  prompt: string
}

export const TALKING_OBJECTS: Record<string, TalkingObject[]> = {
  imoveis: [
    {
      id: 'house_key',
      name: 'Chave de Casa',
      emoji: '🔑',
      prompt: 'A magical golden house key character with expressive friendly face, glowing eyes, floating in warm light, photorealistic 3D render, Pixar-like quality, lip-sync ready mouth, aspect ratio 9:16',
    },
    {
      id: 'sold_sign',
      name: 'Placa VENDIDO',
      emoji: '🏠',
      prompt: 'An animated Brazilian VENDIDO real estate sign character with happy expressive face, bold red and white colors, 3D render, lip-sync ready mouth, aspect ratio 9:16',
    },
    {
      id: 'contract',
      name: 'Contrato',
      emoji: '📄',
      prompt: 'An animated official real estate contract character with reading glasses and trustworthy face, professional blue tones, 3D render, lip-sync mouth, aspect ratio 9:16',
    },
    {
      id: 'apartment_window',
      name: 'Janela com Vista',
      emoji: '🪟',
      prompt: 'A beautiful apartment window character with warm welcoming face, ocean view through glass, golden hour lighting, 3D animated style, lip-sync ready, aspect ratio 9:16',
    },
    {
      id: 'house_robot',
      name: 'Robô Corretor',
      emoji: '🤖',
      prompt: 'A friendly real estate robot character in tiny blazer, holding miniature house, metallic silver with gold accents, Pixar-style 3D, expressive lip-sync face, aspect ratio 9:16',
    },
  ],
  beleza: [
    {
      id: 'scissors',
      name: 'Tesoura Mágica',
      emoji: '✂️',
      prompt: 'An animated magical hair scissors character with sparkly personality, rainbow sheen, expressive lip-sync face, salon background, 3D Pixar render, aspect ratio 9:16',
    },
    {
      id: 'mirror',
      name: 'Espelho da Beleza',
      emoji: '🪞',
      prompt: 'A glamorous vanity mirror character, ornate gold frame, flirty expressive face, beauty salon, 3D Pixar style, lip-sync ready, aspect ratio 9:16',
    },
    {
      id: 'hair_brush',
      name: 'Escova Profissional',
      emoji: '💇',
      prompt: 'A professional hair brush character with wavy hair flowing, warm friendly face, salon context, 3D render, lip-sync mouth, aspect ratio 9:16',
    },
    {
      id: 'nail_polish',
      name: 'Esmalte Animado',
      emoji: '💅',
      prompt: 'An animated nail polish bottle character, glamorous sparkly personality, expressive face, beauty context, 3D Pixar render, lip-sync mouth, aspect ratio 9:16',
    },
    {
      id: 'hair_dryer',
      name: 'Secador Falante',
      emoji: '💨',
      prompt: 'A friendly hair dryer character blowing colorful wind, expressive animated face, salon environment, 3D render, lip-sync ready, aspect ratio 9:16',
    },
  ],
  saude: [
    {
      id: 'stethoscope',
      name: 'Estetoscópio',
      emoji: '🩺',
      prompt: 'An animated medical stethoscope character with caring face, doctor look, clinical environment, 3D render, lip-sync ready mouth, aspect ratio 9:16',
    },
    {
      id: 'medical_chart',
      name: 'Prontuário',
      emoji: '📊',
      prompt: 'An animated medical chart clipboard character, reading glasses, helpful expression, 3D medical aesthetic, lip-sync mouth, aspect ratio 9:16',
    },
    {
      id: 'tooth',
      name: 'Dente Feliz',
      emoji: '🦷',
      prompt: 'A cheerful animated tooth character with wide smile, clean white, dental clinic background, 3D Pixar style, lip-sync ready, aspect ratio 9:16',
    },
    {
      id: 'pill',
      name: 'Cápsula Saudável',
      emoji: '💊',
      prompt: 'A friendly medicine capsule character half red half white, health-focused, clean background, 3D animated, expressive lip-sync face, aspect ratio 9:16',
    },
    {
      id: 'heart',
      name: 'Coração Animado',
      emoji: '❤️',
      prompt: 'An animated healthy heart character, energetic personality, red with golden highlights, fitness context, 3D Pixar style, lip-sync face, aspect ratio 9:16',
    },
  ],
  juridico: [
    {
      id: 'law_book',
      name: 'Livro de Leis',
      emoji: '⚖️',
      prompt: 'An animated law book in burgundy leather, golden scales, wise authoritative face, 3D render, lip-sync mouth, legal setting, aspect ratio 9:16',
    },
    {
      id: 'gavel',
      name: 'Martelo do Juiz',
      emoji: '🔨',
      prompt: 'An animated judge gavel character, stern fair expression, wooden texture, courtroom background, 3D Pixar render, lip-sync face, aspect ratio 9:16',
    },
    {
      id: 'briefcase',
      name: 'Pasta do Advogado',
      emoji: '💼',
      prompt: 'A professional lawyer briefcase character with spectacles, dark leather, golden clasps, 3D render, lip-sync ready mouth, legal office, aspect ratio 9:16',
    },
    {
      id: 'shield',
      name: 'Escudo da Justiça',
      emoji: '🛡️',
      prompt: 'An animated justice shield character, protective expression, blue and gold, legal protection concept, 3D Pixar style, lip-sync face, aspect ratio 9:16',
    },
    {
      id: 'contract_legal',
      name: 'Contrato Legal',
      emoji: '📜',
      prompt: 'An animated legal contract scroll character, official seal, trustworthy face, law firm setting, 3D render, lip-sync mouth, aspect ratio 9:16',
    },
  ],
  tecnico: [
    {
      id: 'wrench',
      name: 'Chave de Fenda',
      emoji: '🔧',
      prompt: 'An animated wrench character, expert confident expression, metallic silver, workshop background, 3D render, lip-sync mouth, aspect ratio 9:16',
    },
    {
      id: 'circuit',
      name: 'Placa de Circuito',
      emoji: '💡',
      prompt: 'An animated circuit board character, bright LED eyes, tech blue color, electronics workshop, 3D Pixar style, lip-sync ready face, aspect ratio 9:16',
    },
    {
      id: 'hard_hat',
      name: 'Capacete Técnico',
      emoji: '⛑️',
      prompt: 'A friendly hard hat safety helmet character, expert look, yellow, construction setting, 3D render, expressive lip-sync face, aspect ratio 9:16',
    },
    {
      id: 'multimeter',
      name: 'Multímetro',
      emoji: '🔌',
      prompt: 'An animated multimeter character with digital display face, electrical testing tool, workshop background, 3D Pixar style, lip-sync ready, aspect ratio 9:16',
    },
    {
      id: 'gear',
      name: 'Engrenagem Mestre',
      emoji: '⚙️',
      prompt: 'An animated master gear character, mechanical expert expression, metallic with oil sheen, industrial setting, 3D render, lip-sync face, aspect ratio 9:16',
    },
  ],
}

export function getTalkingObjectsForNiche(nicho: string): TalkingObject[] {
  return TALKING_OBJECTS[nicho] ?? TALKING_OBJECTS['tecnico']
}
