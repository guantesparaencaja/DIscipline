import { TransformationConfig, TransformationId, Achievement, ExpenseCategory, FixedDeduction, Habit } from '../types';

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
    description: 'Doctrina Egoísta (Señal). Tus hábitos ocurren en automático sin fricción ni dudas.',
    lore: 'Tu mente y tu cuerpo actúan en perfecta sincronía. Gastos y tiempo fluyen sin esfuerzo.',
    quote: 'El cuerpo se mueve por sí solo... la verdadera maestría de los hábitos.'
  },
  ultra_instinto: {
    id: 'ultra_instinto',
    name: 'Ultra Instinto',
    shortName: 'UI Dominado',
    minPower: 96,
    maxPower: 100,
    color: '#E0E7FF',
    auraGradient: 'from-slate-100 via-indigo-300 to-purple-500',
    textColor: 'text-slate-100',
    description: 'Estado definitivo de los Ángeles y Dioses. Dominio absoluto de finanzas, hábitos y mente.',
    lore: 'Cabello plateado y resplandor celestial. Has trascendido toda debilidad financiera y procrastinación.',
    quote: 'Este es el resultado del entrenamiento supremo.'
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

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat_vivienda', name: 'Vivienda / Arriendo', icon: 'Home', color: '#3B82F6', isDefault: true },
  { id: 'cat_alimentacion', name: 'Alimentación / Mercado', icon: 'Utensils', color: '#10B981', isDefault: true },
  { id: 'cat_transporte', name: 'Transporte & Movilidad', icon: 'Car', color: '#F59E0B', isDefault: true },
  { id: 'cat_salud', name: 'Salud & Bienestar', icon: 'HeartPulse', color: '#EF4444', isDefault: true },
  { id: 'cat_educacion', name: 'Educación & Crecimiento', icon: 'BookOpen', color: '#8B5CF6', isDefault: true },
  { id: 'cat_salidas', name: 'Salidas & Ocio', icon: 'Sparkles', color: '#EC4899', isDefault: true },
  { id: 'cat_ropa', name: 'Vestimenta / Traje', icon: 'Shirt', color: '#6366F1', isDefault: true },
  { id: 'cat_ahorro', name: 'Ahorro para Metas', icon: 'PiggyBank', color: '#FF6600', isDefault: true },
  { id: 'cat_otros', name: 'Otros Imprevistos', icon: 'MoreHorizontal', color: '#6B7280', isDefault: true }
];

export const DEFAULT_FIXED_DEDUCTIONS: Omit<FixedDeduction, 'id' | 'userId'>[] = [
  { name: 'Diezmo / Donación', amount: 125000, category: 'Espiritual', isActive: true, dueDay: 1 },
  { name: 'Arriendo', amount: 600000, category: 'Vivienda', isActive: true, dueDay: 5 },
  { name: 'Traje de Entrenamiento / Ropa', amount: 200000, category: 'Vestimenta', isActive: true, dueDay: 10 },
  { name: 'Salidas y Recreación', amount: 200000, category: 'Ocio', isActive: true, dueDay: 15 },
  { name: 'Fondo de Emergencia', amount: 125000, category: 'Ahorro', isActive: true, dueDay: 20 }
];

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_ki_meditation',
    userId: 'usr_default',
    name: 'Meditación Ki & Respiración Profunda',
    description: '10 minutos al despertar para alinear el ki mental y foco estratégico.',
    frequency: 'diaria',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    optionalTime: '06:30',
    timeSlot: 'manana',
    xpReward: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'habit_gravity_workout',
    userId: 'usr_default',
    name: 'Entrenamiento Físico (Gravedad 100G)',
    description: 'Ejercicio de fuerza o cardiovascular intenso para forjar el cuerpo Saiyajin.',
    frequency: 'personalizada',
    customDays: [1, 3, 5],
    optionalTime: '17:00',
    timeSlot: 'tarde',
    xpReward: 25,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'habit_expense_logging',
    userId: 'usr_default',
    name: 'Registro Táctico de Gastos del Día',
    description: 'Control de ki financiero: anotar cada peso gastado antes de dormir.',
    frequency: 'diaria',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    optionalTime: '21:30',
    timeSlot: 'noche',
    xpReward: 20,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'habit_strategic_reading',
    userId: 'usr_default',
    name: 'Lectura de Crecimiento & Filosofía',
    description: '20 páginas de finanzas, superación personal o habilidades clave.',
    frequency: 'diaria',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    optionalTime: '20:00',
    timeSlot: 'noche',
    xpReward: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'habit_weekly_audit',
    userId: 'usr_default',
    name: 'Revisión Semanal de Metas y Radar',
    description: 'Auditoría dominguera de gastos, metas de ahorro y plan de la semana.',
    frequency: 'semanal',
    customDays: [0],
    optionalTime: '19:00',
    timeSlot: 'noche',
    xpReward: 30,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // 1. DISCIPLINA & HÁBITOS
  {
    id: 'ach_first_step',
    code: 'first_step',
    title: 'Primer Paso Saiyajin',
    description: 'Completa tu primer objetivo diario con éxito.',
    requirement: 'Completar 1 objetivo diario.',
    icon: 'Flame',
    xpReward: 50,
    category: 'disciplina'
  },
  {
    id: 'ach_first_habit',
    code: 'first_habit',
    title: 'Primer Hábito Forjado',
    description: 'Registra el cumplimiento de tu primer hábito en el radar.',
    requirement: 'Completar 1 hábito con éxito.',
    icon: 'Flame',
    xpReward: 75,
    category: 'disciplina'
  },
  {
    id: 'ach_habit_streak_7',
    code: 'habit_streak_7',
    title: 'Hábito Inquebrantable',
    description: 'Alcanza una racha de 7 días consecutivos en cualquier hábito.',
    requirement: 'Mantener una racha de 7 días en un hábito.',
    icon: 'Zap',
    xpReward: 250,
    category: 'disciplina'
  },
  {
    id: 'ach_habit_streak_21',
    code: 'habit_streak_21',
    title: 'Doctrina de Acero (21 Días)',
    description: 'Consolida 21 días seguidos en un hábito. Ya es parte de tu ADN Saiyajin.',
    requirement: 'Alcanzar racha de 21 días en un hábito.',
    icon: 'Crown',
    xpReward: 600,
    category: 'disciplina'
  },
  {
    id: 'ach_all_habits_today',
    code: 'all_habits_today',
    title: 'Día Perfecto de Disciplina',
    description: 'Cumple el 100% de los hábitos programados para el día de hoy.',
    requirement: 'Completar todos los hábitos que corresponden hoy.',
    icon: 'Sparkles',
    xpReward: 150,
    category: 'disciplina'
  },
  {
    id: 'ach_streak_3',
    code: 'streak_3',
    title: 'Disciplina de Acero',
    description: 'Alcanza una racha de 3 días consecutivos.',
    requirement: 'Mantener una racha activa de 3 días.',
    icon: 'Zap',
    xpReward: 100,
    category: 'disciplina'
  },
  {
    id: 'ach_streak_7',
    code: 'streak_7',
    title: 'Guerrero Constante',
    description: 'Mantén tu fuego encendido por 7 días seguidos.',
    requirement: 'Mantener una racha activa de 7 días.',
    icon: 'ShieldAlert',
    xpReward: 250,
    category: 'disciplina'
  },
  {
    id: 'ach_streak_21',
    code: 'streak_21',
    title: 'Maestro del Hábito',
    description: 'Consolida tu poder con 21 días ininterrumpidos.',
    requirement: 'Mantener una racha activa de 21 días seguidos.',
    icon: 'Crown',
    xpReward: 600,
    category: 'disciplina'
  },
  {
    id: 'ach_streak_30',
    code: 'streak_30',
    title: 'Senda de los Dioses (30 Días)',
    description: 'Completa 30 objetivos diarios seguidos sin romper la racha.',
    requirement: 'Alcanzar una racha ininterrumpida de 30 días de entrenamiento.',
    icon: 'Flame',
    xpReward: 1000,
    category: 'disciplina'
  },
  {
    id: 'ach_extreme_objective',
    code: 'extreme_objective',
    title: 'Prueba del Gran Kaiosama',
    description: 'Supera con éxito un objetivo diario catalogado con dificultad Extrema.',
    requirement: 'Completar al menos 1 objetivo de dificultad Extremo (+75 XP).',
    icon: 'Sparkles',
    xpReward: 200,
    category: 'disciplina'
  },
  {
    id: 'ach_total_objectives_25',
    code: 'total_objectives_25',
    title: 'Cadete de Alto Rendimiento',
    description: 'Acumula un total de 25 objetivos diarios completados.',
    requirement: 'Completar 25 objetivos en tu historial.',
    icon: 'CheckCircle2',
    xpReward: 300,
    category: 'disciplina'
  },

  // 2. FINANZAS & AHORRO
  {
    id: 'ach_first_expense',
    code: 'first_expense',
    title: 'Guardián del Ki',
    description: 'Registra tus primeros gastos con rigurosidad.',
    requirement: 'Registrar tu primer movimiento de gasto en el radar.',
    icon: 'Wallet',
    xpReward: 50,
    category: 'finanzas'
  },
  {
    id: 'ach_expense_streak_7',
    code: 'expense_streak_7',
    title: 'Vigilancia Financiera Impecable',
    description: 'Registra gastos durante 7 días consecutivos sin interrupciones.',
    requirement: 'Tener registros de gastos en 7 días calendario seguidos.',
    icon: 'Calendar',
    xpReward: 350,
    category: 'finanzas'
  },
  {
    id: 'ach_first_saving',
    code: 'first_saving',
    title: 'Semilla del Ermitaño',
    description: 'Aparta tu primer ahorro explícito vinculado a una meta.',
    requirement: 'Registrar un movimiento con la casilla de ahorro hacia una meta.',
    icon: 'Coins',
    xpReward: 150,
    category: 'finanzas'
  },
  {
    id: 'ach_savings_20_percent',
    code: 'savings_20_percent',
    title: 'Ahorro Maestro (>20% Ingreso)',
    description: 'Ahorra más del 20% de tu ingreso base en un mes.',
    requirement: 'Acumular ahorros mensuales que superen el 20% de tu ingreso mensual base.',
    icon: 'Trophy',
    xpReward: 500,
    category: 'finanzas'
  },
  {
    id: 'ach_savings_500k',
    code: 'savings_500k',
    title: 'Super Saiyajin Financiero',
    description: 'Acumula más de $500.000 COP en ahorros reales para metas.',
    requirement: 'Alcanzar $500.000 COP en ahorros reales acumulados en metas.',
    icon: 'Trophy',
    xpReward: 500,
    category: 'finanzas'
  },
  {
    id: 'ach_savings_1m',
    code: 'savings_1m',
    title: 'Cofre Dorado ($1.000.000 COP)',
    description: 'Supera $1.000.000 COP en ahorros reales protegidos en tus metas.',
    requirement: 'Acumular $1.000.000 COP o más en tus metas activas.',
    icon: 'Coins',
    xpReward: 800,
    category: 'finanzas'
  },
  {
    id: 'ach_goal_completed',
    code: 'goal_completed',
    title: 'Meta Conquistada',
    description: 'Completa al 100% el valor objetivo de una meta de ahorro.',
    requirement: 'Llevar los ahorros de una meta al 100% de su valor objetivo.',
    icon: 'Trophy',
    xpReward: 600,
    category: 'finanzas'
  },

  // 3. PODER & TRANSFORMACIÓN
  {
    id: 'ach_power_50',
    code: 'power_50',
    title: 'Poder de Élite',
    description: 'Alcanza un Poder Total superior a 50 puntos.',
    requirement: 'Superar 50.0 de Poder Total en el anillo de ki.',
    icon: 'Sparkles',
    xpReward: 350,
    category: 'poder'
  },
  {
    id: 'ach_reach_ssj',
    code: 'reach_ssj',
    title: 'Despertar Dorado (Super Sayayin)',
    description: 'Desbloquea y alcanza el estado Super Sayayin (Poder > 20).',
    requirement: 'Alcanzar la transformación SSJ con disciplina real.',
    icon: 'Zap',
    xpReward: 300,
    category: 'poder'
  },
  {
    id: 'ach_reach_ssj2',
    code: 'reach_ssj2',
    title: 'Poder Eléctrico (SSJ 2)',
    description: 'Supera el límite y desata chispas de Super Sayayin 2 (Poder > 35).',
    requirement: 'Alcanzar la transformación SSJ 2.',
    icon: 'Zap',
    xpReward: 500,
    category: 'poder'
  },

  // 4. MIEDOS & DOMINIO MENTAL
  {
    id: 'ach_fear_registered',
    code: 'fear_registered',
    title: 'Mirar al Dragón a los Ojos',
    description: 'Identifica y registra tu primer miedo financiero o bloqueo mental.',
    requirement: 'Registrar al menos 1 miedo en el Módulo de Dominio Mental.',
    icon: 'Shield',
    xpReward: 100,
    category: 'mental'
  },
  {
    id: 'ach_fear_conquered',
    code: 'fear_conquered',
    title: 'Mente Inquebrantable',
    description: 'Supera por completo un miedo completando todas sus acciones de combate.',
    requirement: 'Marcar 1 miedo como Superado.',
    icon: 'Crown',
    xpReward: 500,
    category: 'mental'
  },
  {
    id: 'ach_valiente',
    code: 'valiente',
    title: 'Valiente',
    description: 'Completa todos los niveles de una escalera de exposición gradual y conquista tu miedo.',
    requirement: 'Completar todos los escalones de un miedo para superarlo.',
    icon: 'Shield',
    xpReward: 100,
    category: 'mental'
  },

  // 5. SOCIAL & COMPAÑERO
  {
    id: 'ach_partner_linked',
    code: 'partner_linked',
    title: 'Compañero de Entrenamiento',
    description: 'Enlaza tu radar con un compañero de entrenamiento en tiempo real.',
    requirement: 'Conectar un compañero mediante código de invitación.',
    icon: 'Users',
    xpReward: 200,
    category: 'social'
  }
];

export const FEAR_TEMPLATES = [
  {
    title: 'Hablar en público & Liderar reuniones',
    description: 'Bloqueo y ansiedad al comunicar ideas, liderar presentaciones o defender presupuestos frente a otros.',
    category: 'juicio_social' as const,
    impactScore: 8,
    steps: [
      { title: 'Hablar 3 minutos frente al espejo', description: 'Practicar postura firme, respiración diafragmática y contacto visual.', xpReward: 20, braveryPoints: 10 },
      { title: 'Grabarse en video de 3 minutos', description: 'Grabar una explicación de un proyecto o idea y analizarla con compasión.', xpReward: 25, braveryPoints: 15 },
      { title: 'Exponer la propuesta a 1 amigo de confianza', description: 'Presentar la idea y recibir retroalimentación honesta en privado.', xpReward: 30, braveryPoints: 20 },
      { title: 'Intervenir y opinar frente a 5 personas', description: 'Hacer una pregunta o dar una opinión proactiva en una reunión de equipo.', xpReward: 40, braveryPoints: 25 },
      { title: 'Presentar formalmente ante 20 personas', description: 'Liderar una charla o presentación grupal con seguridad y calma.', xpReward: 60, braveryPoints: 35 }
    ],
    actions: [
      'Hablar 3 minutos frente al espejo',
      'Grabarse en video de 3 minutos',
      'Exponer la propuesta a 1 amigo de confianza',
      'Intervenir y opinar frente a 5 personas',
      'Presentar formalmente ante 20 personas'
    ]
  },
  {
    title: 'Miedo a Invertir & Riesgo Calculado',
    description: 'Parálisis al intentar poner a rentar los ahorros por temor a la volatilidad o cometer errores.',
    category: 'inversion' as const,
    impactScore: 8,
    steps: [
      { title: 'Estudiar opciones de renta fija (CDT / cuentas)', description: 'Leer cómo funcionan los fondos de bajo riesgo y calcular rendimientos.', xpReward: 20, braveryPoints: 10 },
      { title: 'Abrir cuenta en plataforma regulada', description: 'Completar verificación de identidad y configurar seguridad de 2 factores.', xpReward: 25, braveryPoints: 15 },
      { title: 'Invertir una suma de prueba ($50.000 COP)', description: 'Colocar una suma pequeña que no afecte el presupuesto para familiarizarse.', xpReward: 30, braveryPoints: 20 },
      { title: 'Diversificar en fondo indexado ($200.000 COP)', description: 'Dar el paso hacia renta variable global o índices a largo plazo.', xpReward: 45, braveryPoints: 25 },
      { title: 'Automatizar inversión mensual periódica', description: 'Establecer transferencia automática cada mes sin dudar ni especular.', xpReward: 60, braveryPoints: 35 }
    ],
    actions: [
      'Estudiar opciones de renta fija (CDT / cuentas)',
      'Abrir cuenta en plataforma regulada',
      'Invertir una suma de prueba ($50.000 COP)',
      'Diversificar en fondo indexado ($200.000 COP)',
      'Automatizar inversión mensual periódica'
    ]
  },
  {
    title: 'Miedo a la Escasez & Revisar el Dinero',
    description: 'Ansiedad constante al gastar o mirar el saldo bancario, creyendo que los recursos nunca alcanzarán.',
    category: 'escasez' as const,
    impactScore: 9,
    steps: [
      { title: 'Mirar el extracto bancario con calma y sin culpa', description: 'Observar los números reales reconociendo que son solo datos neutros.', xpReward: 20, braveryPoints: 10 },
      { title: 'Registrar cada gasto durante 7 días seguidos', description: 'Tomar control visual absoluto del flujo diario de dinero.', xpReward: 25, braveryPoints: 15 },
      { title: 'Construir colchón de $300.000 COP de emergencia', description: 'Separar una reserva exclusiva e intocable para imprevistos.', xpReward: 35, braveryPoints: 20 },
      { title: 'Realizar un gasto consciente de bienestar sin culpa', description: 'Comprar algo que nutre tu salud o mente aceptando el merecimiento.', xpReward: 40, braveryPoints: 25 }
    ],
    actions: [
      'Mirar el extracto bancario con calma y sin culpa',
      'Registrar cada gasto durante 7 días seguidos',
      'Construir colchón de $300.000 COP de emergencia',
      'Realizar un gasto consciente de bienestar sin culpa'
    ]
  },
  {
    title: 'Cobrar lo Justo & Negociar Honorarios',
    description: 'Subestimar el valor profesional propio aceptando tarifas bajas por temor a perder clientes o empleo.',
    category: 'merecimiento' as const,
    impactScore: 8,
    steps: [
      { title: 'Listar 5 resultados tangibles que aporto a mis clientes', description: 'Escribir las métricas de valor, tiempo y dinero que hago ganar.', xpReward: 20, braveryPoints: 10 },
      { title: 'Investigar tarifas de mercado de profesionales destacados', description: 'Conocer los rangos reales de la industria para calibrar el precio.', xpReward: 25, braveryPoints: 15 },
      { title: 'Decir NO con respeto a un cliente que paga por debajo', description: 'Establecer un límite firme y proteger el tiempo y la dignidad laboral.', xpReward: 35, braveryPoints: 20 },
      { title: 'Enviar propuesta con tarifa completa sin descuentos', description: 'Presentar el valor sin disculparse ni rebajar el precio anticipadamente.', xpReward: 45, braveryPoints: 25 },
      { title: 'Cerrar contrato o acuerdo con la tarifa meta definida', description: 'Defender el valor durante la llamada o reunión hasta el apretón de manos.', xpReward: 60, braveryPoints: 35 }
    ],
    actions: [
      'Listar 5 resultados tangibles que aporto a mis clientes',
      'Investigar tarifas de mercado de profesionales destacados',
      'Decir NO con respeto a un cliente que paga por debajo',
      'Enviar propuesta con tarifa completa sin descuentos',
      'Cerrar contrato o acuerdo con la tarifa meta definida'
    ]
  }
];

export const SMART_OBJECTIVE_TEMPLATES = [
  {
    title: 'Registrar gastos del día y verificar fondo',
    difficulty: 'facil' as const,
    timeSlot: 'noche' as const,
    category: 'Finanzas',
    description: 'Revisar recibos y registrar cada gasto para proteger el fondo disponible.'
  },
  {
    title: 'Apartar dinero para mi meta de ahorro',
    difficulty: 'normal' as const,
    timeSlot: 'manana' as const,
    category: 'Ahorro',
    description: 'Transferir la cuota diaria o semanal hacia la meta activa.'
  },
  {
    title: 'Revisión presupuestal semanal del guerrero',
    difficulty: 'normal' as const,
    timeSlot: 'tarde' as const,
    category: 'Finanzas',
    description: 'Comparar el ritmo de gasto semanal contra las deducciones fijas.'
  },
  {
    title: 'Cero gastos hormiga e impulsivos hoy',
    difficulty: 'dificil' as const,
    timeSlot: 'tarde' as const,
    category: 'Disciplina',
    description: 'Mantener estricto autocontrol y evitar compras no programadas.'
  },
  {
    title: 'Lectura o estudio financiero por 25 minutos',
    difficulty: 'facil' as const,
    timeSlot: 'manana' as const,
    category: 'Conocimiento',
    description: 'Alimentar la mente con conceptos de inversión, ahorro y desarrollo.'
  },
  {
    title: 'Entrenamiento físico de alta intensidad (Fuerza Saiyajin)',
    difficulty: 'dificil' as const,
    timeSlot: 'manana' as const,
    category: 'Cuerpo',
    description: '45 minutos de ejercicio para forjar resistencia y vitalidad.'
  },
  {
    title: 'Auditoría mensual de gastos fijos y suscripciones',
    difficulty: 'extremo' as const,
    timeSlot: 'noche' as const,
    category: 'Finanzas',
    description: 'Revisar y recortar cualquier fuga de dinero innecesaria.'
  }
];
