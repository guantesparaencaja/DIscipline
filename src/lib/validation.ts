import { z } from 'zod';

/**
 * Sanitizes input strings:
 * - Trims leading/trailing whitespace
 * - Strips HTML tags and script elements
 * - Removes control characters
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>'"]/g, '') // Strip angle brackets and quotes
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
    .trim();
}

/**
 * Validates date string in YYYY-MM-DD format
 */
const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;

// 1. Expense Validation Schema
export const ExpenseSchema = z.object({
  description: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(1, 'La descripción es obligatoria').max(150, 'Máximo 150 caracteres')),
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0 COP')
    .max(100_000_000_000, 'Monto excede el límite permitido'),
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  categoryName: z.string().default('Varios'),
  date: z.string().regex(dateStringRegex, 'Formato de fecha inválido (YYYY-MM-DD)'),
  paymentMethod: z.enum(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia']),
  isSaving: z.boolean().default(false),
  goalId: z.string().optional(),
  note: z.string().optional().transform((val) => (val ? sanitizeText(val) : undefined))
});

// 2. Daily Objective Validation Schema
export const ObjectiveSchema = z.object({
  title: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, 'El título debe tener al menos 2 caracteres').max(150, 'Máximo 150 caracteres')),
  date: z.string().regex(dateStringRegex, 'Formato de fecha inválido (YYYY-MM-DD)'),
  timeSlot: z.enum(['manana', 'tarde', 'noche', 'personalizada']),
  customTime: z.string().optional(),
  difficulty: z.enum(['facil', 'normal', 'dificil', 'extremo']),
  savingAmount: z.number().min(0).optional(),
  goalId: z.string().optional(),
  isPartnerVisible: z.boolean().default(true),
  recurrence: z.enum(['una_vez', 'diaria', 'dias_semana']).default('diaria')
});

// 3. Goal Validation Schema
export const GoalSchema = z
  .object({
    title: z
      .string()
      .transform(sanitizeText)
      .pipe(z.string().min(2, 'El nombre de la meta es obligatorio').max(120, 'Máximo 120 caracteres')),
    description: z
      .string()
      .optional()
      .transform((val) => (val ? sanitizeText(val) : '')),
    targetAmount: z
      .number()
      .positive('El monto objetivo debe ser mayor a 0 COP')
      .max(100_000_000_000, 'Monto excede límite permitido'),
    category: z.string().min(1, 'La categoría es obligatoria'),
    startDate: z.string().regex(dateStringRegex, 'Fecha de inicio inválida'),
    targetDate: z.string().regex(dateStringRegex, 'Fecha objetivo inválida'),
    priority: z.enum(['baja', 'media', 'alta', 'maxima']),
    status: z.enum(['activa', 'en_pausa', 'completada', 'cancelada']).default('activa')
  })
  .refine(
    (data) => new Date(data.targetDate) > new Date(data.startDate),
    {
      message: 'La fecha objetivo debe ser posterior a la fecha de inicio',
      path: ['targetDate']
    }
  );

// 4. Habit Validation Schema
export const HabitSchema = z.object({
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, 'El nombre del hábito es obligatorio').max(120, 'Máximo 120 caracteres')),
  frequency: z.enum(['diaria', 'semanal', 'personalizada']).default('diaria'),
  timeSlot: z.enum(['manana', 'tarde', 'noche', 'personalizada']).default('manana'),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  xpReward: z.number().min(5).max(200).default(15),
  description: z.string().optional().transform((val) => (val ? sanitizeText(val) : undefined))
});

// 5. Fear & Exposure Ladder Step Validation
export const FearStepSchema = z.object({
  title: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, 'El título del escalón es obligatorio').max(120, 'Máximo 120 caracteres')),
  braveryPoints: z.number().min(5, 'Mínimo 5 puntos de valentía').max(100, 'Máximo 100 puntos'),
  stepOrder: z.number().min(1)
});

export const FearSchema = z.object({
  title: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(3, 'El nombre del miedo o bloqueo es obligatorio').max(120, 'Máximo 120 caracteres')),
  category: z.enum([
    'escasez',
    'inversion',
    'fracaso',
    'deuda',
    'juicio_social',
    'merecimiento',
    'social',
    'personal',
    'profesional'
  ]),
  steps: z
    .array(FearStepSchema)
    .min(1, 'Debe incluir al menos un escalón de exposición')
    .max(10, 'La escalera no puede exceder 10 niveles')
});

// 6. Financial Settings Schema
export const FinancialSettingsSchema = z.object({
  baseMonthlyIncome: z
    .number()
    .positive('El ingreso mensual debe ser mayor a 0 COP')
    .max(100_000_000_000, 'Ingreso excede el límite permitido'),
  emergencyFundTarget: z
    .number()
    .min(0, 'El fondo de emergencia no puede ser negativo')
    .max(100_000_000_000, 'Fondo excede el límite permitido')
});

// 7. Fixed Deduction Schema
export const FixedDeductionSchema = z.object({
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, 'El nombre de la deducción es obligatorio').max(100, 'Máximo 100 caracteres')),
  amount: z
    .number()
    .positive('El monto de la deducción debe ser mayor a 0 COP')
    .max(100_000_000_000, 'Monto excede el límite'),
  category: z.string().default('fijo')
});

// 8. Partner Invite Code Schema
export const PartnerCodeSchema = z
  .string()
  .transform(sanitizeText)
  .pipe(
    z
      .string()
      .min(4, 'Código demasiado corto')
      .max(32, 'Código demasiado largo')
      .regex(/^[A-Z0-9_-]+$/i, 'El código solo puede contener letras, números y guiones')
  );

/**
 * Helper to safely validate and format validation errors for UI presentation
 */
export function validateForm<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  const errorMessage = firstIssue ? firstIssue.message : 'Error de validación';
  return { success: false, error: errorMessage };
}
