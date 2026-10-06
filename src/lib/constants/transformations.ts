import { TransformationConfig, TransformationId } from '../../types';

export const TRANSFORMATIONS: Record<TransformationId, TransformationConfig> = {
  base: {
    id: 'base',
    name: 'Estado Base',
    shortName: 'Base',
    minPower: 0,
    maxPower: 10,
    color: '#8E8E93',
    auraGradient: 'from-zinc-600 to-zinc-800',
    textColor: 'text-zinc-300',
    description: 'Guerrero en fase inicial. Despertando el ki y estableciendo hábitos fundamentales.',
    lore: 'El entrenamiento comienza aquí. Cada objetivo completado eleva tu espíritu de combate.',
    quote: 'El poder viene en respuesta a una necesidad, no a un deseo.'
  },
  ozaru: {
    id: 'ozaru',
    name: 'Ozaru',
    shortName: 'Ozaru',
    minPower: 11,
    maxPower: 20,
    color: '#D97706',
    auraGradient: 'from-amber-700 to-amber-950',
    textColor: 'text-amber-400',
    description: 'Transformación del Gran Simio. Fuerza bruta y primera manifestación de disciplina.',
    lore: 'Bajo la luna llena de tus compromisos diarios, multiplicas tu energía x10.',
    quote: '¡Siente la fuerza primitiva que corre por tus venas!'
  },
  ssj: {
    id: 'ssj',
    name: 'Super Sayayin',
    shortName: 'SSJ',
    minPower: 21,
    maxPower: 35,
    color: '#EAB308',
    auraGradient: 'from-yellow-400 to-amber-600',
    textColor: 'text-yellow-400',
    description: 'Aura dorada reluciente. Control consistente de tus finanzas y constancia inquebrantable.',
    lore: 'La furia canalizada hacia tus metas ha despertado al guerrero legendario que duerme en ti.',
    quote: 'Soy el guerrero del que has oído hablar en las leyendas...'
  },
  ssj2: {
    id: 'ssj2',
    name: 'Super Sayayin 2',
    shortName: 'SSJ 2',
    minPower: 36,
    maxPower: 50,
    color: '#FACC15',
    auraGradient: 'from-yellow-300 via-amber-500 to-orange-600',
    textColor: 'text-yellow-300',
    description: 'Chispas eléctricas y velocidad fulgurante. Tus ahorros y hábitos marchan al compás.',
    lore: 'Superando los límites del Super Sayayin ordinario, el ki fluye con precisión milimétrica.',
    quote: '¡No dejaré que nadie destruya la disciplina que he forjado!'
  },
  ssj3: {
    id: 'ssj3',
    name: 'Super Sayayin 3',
    shortName: 'SSJ 3',
    minPower: 51,
    maxPower: 65,
    color: '#F59E0B',
    auraGradient: 'from-amber-400 via-orange-500 to-red-600',
    textColor: 'text-amber-300',
    description: 'Melena dorada y ki colosal. Dominio de presupuestos complejos y metas ambiciosas.',
    lore: 'Llevas tu cuerpo y mente al límite absoluto para extraer hasta la última gota de potencial.',
    quote: 'Perdón por la tardanza... este es el Super Sayayin 3.'
  },
  ssj_god: {
    id: 'ssj_god',
    name: 'Super Sayayin God',
    shortName: 'SSJ God',
    minPower: 66,
    maxPower: 75,
    color: '#EF4444',
    auraGradient: 'from-red-500 via-rose-600 to-red-900',
    textColor: 'text-rose-400',
    description: 'Aura divina de fuego carmesí. Serenidad mental, cero deudas y ahorro automatizado.',
    lore: 'El ritual de la armonía financiera y disciplina absoluta te eleva al rango de las deidades.',
    quote: 'El poder divino no se busca con furia, sino con perfecta calma y enfoque.'
  },
  ssj_blue: {
    id: 'ssj_blue',
    name: 'Super Sayayin Blue',
    shortName: 'SSJ Blue',
    minPower: 76,
    maxPower: 85,
    color: '#3B82F6',
    auraGradient: 'from-sky-400 via-blue-600 to-indigo-800',
    textColor: 'text-sky-400',
    description: 'Ki divino combinado con la fuerza Super Sayayin. Control total de tus recursos y tiempo.',
    lore: 'Poder divino imbuido de determinación terrenal. Máxima eficiencia energética sin desperdicio.',
    quote: 'Poder divino y corazón implacable. No existe distracción que me desvíe.'
  },
  ultra_instinto_sign: {
    id: 'ultra_instinto_sign',
    name: 'Ultra Instinto Sign',
    shortName: 'UI Sign',
    minPower: 86,
    maxPower: 95,
    color: '#A855F7',
    auraGradient: 'from-violet-500 via-purple-600 to-indigo-900',
    textColor: 'text-purple-300',
    description: 'Presagio del estado supremo. Movimientos y decisiones financieras fluidas e instintivas.',
    lore: 'La mente se desliga de la duda. Cada acción diaria responde con fluidez matemática perfecta.',
    quote: 'Mi cuerpo se mueve por sí solo... el juicio ya no entorpece la ejecución.'
  },
  ultra_instinto: {
    id: 'ultra_instinto',
    name: 'Ultra Instinto Dominado',
    shortName: 'Ultra Instinto',
    minPower: 96,
    maxPower: 100,
    color: '#FFFFFF',
    auraGradient: 'from-slate-100 via-cyan-300 to-blue-600',
    textColor: 'text-white',
    description: 'Cúspide de la evolución. Cero fricción, maestría financiera absoluta y serenidad total.',
    lore: 'El estado supremo de los dioses alcanzado a través del esfuerzo incesante de un mortal.',
    quote: 'El entrenamiento nunca termina, pero hoy el poder fluye en perfecta armonía con el universo.'
  }
};

export const TRANSFORMATION_ORDER: TransformationId[] = [
  'base',
  'ozaru',
  'ssj',
  'ssj2',
  'ssj3',
  'ssj_god',
  'ssj_blue',
  'ultra_instinto_sign',
  'ultra_instinto'
];

export const DIFFICULTY_CONFIG = {
  facil: {
    label: 'Fácil',
    xp: 10,
    badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    accentColor: '#10B981'
  },
  normal: {
    label: 'Normal',
    xp: 20,
    badgeColor: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    accentColor: '#3B82F6'
  },
  dificil: {
    label: 'Difícil',
    xp: 40,
    badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    accentColor: '#F59E0B'
  },
  extremo: {
    label: 'Extremo',
    xp: 75,
    badgeColor: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    accentColor: '#A855F7'
  }
};

export const TIME_SLOT_CONFIG = {
  manana: {
    label: 'Mañana',
    icon: 'Sun',
    timeRange: '06:00 - 12:00',
    color: 'text-amber-400'
  },
  tarde: {
    label: 'Tarde',
    icon: 'Sunset',
    timeRange: '12:00 - 18:00',
    color: 'text-orange-400'
  },
  noche: {
    label: 'Noche',
    icon: 'Moon',
    timeRange: '18:00 - 23:59',
    color: 'text-indigo-400'
  },
  personalizada: {
    label: 'Hora fija',
    icon: 'Clock',
    timeRange: 'Hora exacta',
    color: 'text-sky-400'
  }
};

export const MOTIVATIONAL_QUOTES = [
  'El dolor es temporal, pero el orgullo de un Saiyajin es eterno.',
  'Trabaja en tus metas en silencio y deja que tu ki hable por ti.',
  'Un verdadero guerrero no busca excusas para ahorrar; busca formas de vencer.',
  'No luches para ser mejor que otros; lucha para superar tu versión de ayer.',
  'Incluso el guerrero de clase baja puede superar a la élite con disciplina implacable.',
  'Tus hábitos diarios son las semillas que alimentan tu próxima transformación.',
  'El límite solo existe en la mente de quien teme romper su propio cascarón.',
  'Controlar tu dinero es la primera prueba de dominio de tu ki.'
];
