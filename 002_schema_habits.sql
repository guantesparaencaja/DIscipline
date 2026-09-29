-- ====================================================================
-- SAYAYIN FINANCIAL & HABIT RADAR - MÓDULO DE HÁBITOS
-- Archivo: 002_schema_habits.sql
-- Tablas: habits, habit_logs con RLS e índices
-- ====================================================================

-- 1. TABLA: HABITS
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'diaria' CHECK (frequency IN ('diaria', 'semanal', 'personalizada')),
    custom_days JSONB DEFAULT '[]'::jsonb, -- Array de números de día 0-6 (0 = Domingo, 1 = Lunes, ...)
    optional_time TEXT, -- Formato 'HH:mm' ej: '07:30'
    time_slot TEXT NOT NULL DEFAULT 'manana' CHECK (time_slot IN ('manana', 'tarde', 'noche', 'personalizada')),
    xp_reward INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: HABIT_LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_habit_log_day UNIQUE (habit_id, date)
);

-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON public.habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);

-- 4. POLÍTICAS DE SEGURIDAD (RLS) - PRIVACIDAD ESTRICTA DEL GUERRERO
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo el dueño gestiona sus hábitos" ON public.habits;
CREATE POLICY "Solo el dueño gestiona sus hábitos" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño gestiona sus registros de hábitos" ON public.habit_logs;
CREATE POLICY "Solo el dueño gestiona sus registros de hábitos" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id);
