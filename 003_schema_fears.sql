-- ====================================================================
-- SAYAYIN FINANCIAL & HABIT RADAR - MÓDULO DE MIEDOS & ESCALERA DE EXPOSICIÓN
-- Archivo: 003_schema_fears.sql
-- Tablas: fears, fear_steps con RLS, orden e índices
-- ====================================================================

-- 1. TABLA: FEARS (Miedos & Creencias limitantes)
CREATE TABLE IF NOT EXISTS public.fears (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'escasez',
    impact_score INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'enfrentando' CHECK (status IN ('enfrentando', 'superado')),
    bravery_score INTEGER NOT NULL DEFAULT 0,
    reflection TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    conquered_at TIMESTAMPTZ
);

-- Si la tabla ya existía, asegurar columnas bravery_score
ALTER TABLE public.fears
    ADD COLUMN IF NOT EXISTS bravery_score INTEGER NOT NULL DEFAULT 0;

-- 2. TABLA: FEAR_STEPS (Escalera de Exposición Gradual: 3 a 10 niveles)
CREATE TABLE IF NOT EXISTS public.fear_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fear_id UUID NOT NULL REFERENCES public.fears(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 25,
    bravery_points INTEGER NOT NULL DEFAULT 10,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_fear_step_order UNIQUE (fear_id, step_order)
);

-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_fears_user_id ON public.fears(user_id);
CREATE INDEX IF NOT EXISTS idx_fears_status ON public.fears(user_id, status);
CREATE INDEX IF NOT EXISTS idx_fear_steps_fear_id ON public.fear_steps(fear_id);
CREATE INDEX IF NOT EXISTS idx_fear_steps_user_id ON public.fear_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_fear_steps_order ON public.fear_steps(fear_id, step_order);

-- 4. POLÍTICAS DE SEGURIDAD (RLS) - PRIVACIDAD ESTRICTA DEL GUERRERO
ALTER TABLE public.fears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fear_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo el dueño gestiona sus miedos" ON public.fears;
CREATE POLICY "Solo el dueño gestiona sus miedos" ON public.fears
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño gestiona sus pasos de miedo" ON public.fear_steps;
CREATE POLICY "Solo el dueño gestiona sus pasos de miedo" ON public.fear_steps
    FOR ALL USING (auth.uid() = user_id);
