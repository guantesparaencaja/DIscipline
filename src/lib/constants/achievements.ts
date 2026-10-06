import { Achievement } from '../../types';

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
