-- ====================================================================
-- SAYAYIN FINANCIAL & HABIT RADAR - MÓDULO DE ACCIONES, PLANES, RECOMPENSAS Y PRESUPUESTO
-- Archivo: 004_schema_actions_rewards_budgets.sql
-- ====================================================================

-- 1. ACTUALIZAR PROFILE CON XP DISPONIBLE (GASTABLE) Y PUNTOS DE VALENTÍA
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS available_xp INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bravery_score INTEGER NOT NULL DEFAULT 0;

-- 2. TABLA: ACTIONS (Acciones tácticas ligadas a metas, planes, objetivos o hábitos)
CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_type TEXT NOT NULL DEFAULT 'general' CHECK (target_type IN ('meta', 'plan', 'objetivo', 'habito', 'general')),
    target_id TEXT,
    target_title TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 20,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_user_id ON public.actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_completed ON public.actions(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_actions_target ON public.actions(user_id, target_type, target_id);

ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo el dueño gestiona sus acciones" ON public.actions;
CREATE POLICY "Solo el dueño gestiona sus acciones" ON public.actions
    FOR ALL USING (auth.uid() = user_id);

-- 3. TABLA: PERSONAL_REWARDS (Recompensas personales canjeables con XP)
CREATE TABLE IF NOT EXISTS public.personal_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cost_xp INTEGER NOT NULL DEFAULT 100,
    icon TEXT DEFAULT 'Gift',
    category TEXT DEFAULT 'Bienestar',
    times_redeemed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_rewards_user_id ON public.personal_rewards(user_id);

ALTER TABLE public.personal_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo el dueño gestiona sus recompensas" ON public.personal_rewards;
CREATE POLICY "Solo el dueño gestiona sus recompensas" ON public.personal_rewards
    FOR ALL USING (auth.uid() = user_id);

-- 4. TABLA: REWARD_REDEMPTIONS (Historial de canje de recompensas)
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.personal_rewards(id) ON DELETE CASCADE,
    reward_title TEXT NOT NULL,
    cost_xp INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo el dueño gestiona sus canjes" ON public.reward_redemptions;
CREATE POLICY "Solo el dueño gestiona sus canjes" ON public.reward_redemptions
    FOR ALL USING (auth.uid() = user_id);

-- 5. TABLA: CATEGORY_BUDGETS (Presupuesto por categoría con límites mensuales)
CREATE TABLE IF NOT EXISTS public.category_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    budget_limit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_budget UNIQUE (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id ON public.category_budgets(user_id);

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo el dueño gestiona sus presupuestos" ON public.category_budgets;
CREATE POLICY "Solo el dueño gestiona sus presupuestos" ON public.category_budgets
    FOR ALL USING (auth.uid() = user_id);
