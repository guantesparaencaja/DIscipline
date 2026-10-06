import { ExpenseCategory, FixedDeduction, Habit } from '../../types';

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat_vivienda', name: 'Vivienda / Arriendo', icon: 'Home', color: '#3B82F6', isDefault: true, budgetLimit: 650000 },
  { id: 'cat_alimentacion', name: 'Alimentación / Mercado', icon: 'Utensils', color: '#10B981', isDefault: true, budgetLimit: 400000 },
  { id: 'cat_transporte', name: 'Transporte & Movilidad', icon: 'Car', color: '#F59E0B', isDefault: true, budgetLimit: 150000 },
  { id: 'cat_salud', name: 'Salud & Bienestar', icon: 'HeartPulse', color: '#EF4444', isDefault: true, budgetLimit: 100000 },
  { id: 'cat_educacion', name: 'Educación & Crecimiento', icon: 'BookOpen', color: '#8B5CF6', isDefault: true, budgetLimit: 120000 },
  { id: 'cat_salidas', name: 'Salidas & Ocio', icon: 'Sparkles', color: '#EC4899', isDefault: true, budgetLimit: 150000 },
  { id: 'cat_ropa', name: 'Vestimenta / Traje', icon: 'Shirt', color: '#6366F1', isDefault: true, budgetLimit: 120000 },
  { id: 'cat_ahorro', name: 'Ahorro para Metas', icon: 'PiggyBank', color: '#FF6600', isDefault: true, budgetLimit: 300000 },
  { id: 'cat_otros', name: 'Otros Imprevistos', icon: 'MoreHorizontal', color: '#6B7280', isDefault: true, budgetLimit: 80000 }
];

export const DEFAULT_PERSONAL_REWARDS = [
  {
    id: 'rew_nap',
    userId: 'usr_default',
    title: 'Siesta de Recuperación (30 min)',
    description: 'Pausa regenerativa de ki para reiniciar foco y energía mental.',
    costXp: 120,
    icon: 'Moon',
    category: 'Descanso',
    timesRedeemed: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'rew_cheat_meal',
    userId: 'usr_default',
    title: 'Comida Especial / Banquete Saiyajin',
    description: 'Una comida deliciosa elegida libremente sin culpa para celebrar victorias.',
    costXp: 300,
    icon: 'Utensils',
    category: 'Celebración',
    timesRedeemed: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'rew_book',
    userId: 'usr_default',
    title: 'Comprar Libro de Crecimiento o Finanzas',
    description: 'Invertir en sabiduría táctica para el siguiente nivel.',
    costXp: 450,
    icon: 'BookOpen',
    category: 'Conocimiento',
    timesRedeemed: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'rew_gaming',
    userId: 'usr_default',
    title: 'Tarde de Videojuegos / Película sin Culpa',
    description: '3 horas de entretenimiento inmersivo con el orgullo de haber cumplido la rutina.',
    costXp: 250,
    icon: 'Tv',
    category: 'Ocio',
    timesRedeemed: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'rew_gear',
    userId: 'usr_default',
    title: 'Nuevo Accesorio / Ropa de Entrenamiento',
    description: 'Mejora de equipamiento físico para entrenar con porte de guerrero.',
    costXp: 750,
    icon: 'Shirt',
    category: 'Equipamiento',
    timesRedeemed: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEFAULT_ACTIONS = [
  {
    id: 'act_audit_funds',
    userId: 'usr_default',
    title: 'Auditar extracto bancario y verificar gastos del mes',
    description: 'Revisión minuciosa de cada transacción contra el presupuesto asignado.',
    targetType: 'meta' as const,
    targetId: 'goal_emergency_01',
    targetTitle: 'Fondo de Emergencia Inquebrantable',
    xpReward: 30,
    isCompleted: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'act_prep_workout',
    userId: 'usr_default',
    title: 'Dejar preparado el traje y termo la noche anterior',
    description: 'Elimina toda fricción para arrancar el entrenamiento matutino a primera hora.',
    targetType: 'habito' as const,
    targetId: 'habit_gravity_workout',
    targetTitle: 'Entrenamiento Físico (Gravedad 100G)',
    xpReward: 20,
    isCompleted: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'act_plan_groceries',
    userId: 'usr_default',
    title: 'Hacer lista de mercado estricta antes de salir a comprar',
    description: 'Evitar compras impulsivas y mantener el gasto bajo el 80% del presupuesto.',
    targetType: 'plan' as const,
    targetTitle: 'Plan Blindaje de Costos Fijos',
    xpReward: 25,
    isCompleted: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'act_save_daily',
    userId: 'usr_default',
    title: 'Separar $10.000 COP hoy en la alcancía o cuenta de ahorro',
    description: 'Cuota diaria táctica para cumplir el ritmo requerido de la meta.',
    targetType: 'objetivo' as const,
    targetTitle: 'Apartar cuota diaria de meta',
    xpReward: 20,
    isCompleted: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
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
