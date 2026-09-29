-- ====================================================================
-- SAYAYIN FINANCIAL & HABIT RADAR - ESQUEMA OFICIAL FASE 1
-- Archivo: 001_schema_fase1.sql
-- Ejecuta este script en el Editor SQL de tu proyecto Supabase
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT DEFAULT 'Guerrero Saiyajin',
    avatar_url TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    invite_code TEXT UNIQUE NOT NULL DEFAULT ('SAYAYIN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))),
    total_power NUMERIC(5,2) NOT NULL DEFAULT 0,
    base_power NUMERIC(5,2) NOT NULL DEFAULT 0,
    evolution_power NUMERIC(5,2) NOT NULL DEFAULT 0,
    financial_power NUMERIC(5,2) NOT NULL DEFAULT 0,
    habits_power NUMERIC(5,2) NOT NULL DEFAULT 0,
    transformation TEXT NOT NULL DEFAULT 'base',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRACIÓN ADICIONAL PARA PODERES Y TRANSFORMACIÓN
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_power NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_power NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evolution_power NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS financial_power NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS habits_power NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transformation TEXT NOT NULL DEFAULT 'base';

-- 3. TABLA: CONNECTIONS (Compañeros de entrenamiento)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_connection UNIQUE (user_a, user_b)
);

-- 4. TABLA: FINANCIAL_SETTINGS (Configuración de finanzas del usuario)
CREATE TABLE IF NOT EXISTS public.financial_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    base_monthly_income NUMERIC(14,2) NOT NULL DEFAULT 1250000.00,
    emergency_fund_target NUMERIC(14,2) NOT NULL DEFAULT 3750000.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: FIXED_DEDUCTIONS (Deducciones fijas mensuales)
CREATE TABLE IF NOT EXISTS public.fixed_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    category TEXT DEFAULT 'Varios',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    due_day INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: EXPENSE_CATEGORIES
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Tag',
    color TEXT DEFAULT '#FF6600',
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. TABLA: GOALS (Metas de ahorro)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Financiera',
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'high', -- low, medium, high, maximum
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, cancelled
    target_amount NUMERIC(14,2) NOT NULL,
    current_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    motivation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: PLANS (Planes para metas)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, cancelled
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: EXPENSES (Gastos y Ahorros reales)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    payment_method TEXT NOT NULL DEFAULT 'cash', -- cash, debit_card, credit_card, transfer
    is_saving BOOLEAN NOT NULL DEFAULT FALSE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: DAILY_OBJECTIVES (Objetivos diarios con horario y dificultad)
CREATE TABLE IF NOT EXISTS public.daily_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    slot TEXT NOT NULL, -- morning, afternoon, night, custom
    custom_time TEXT,
    difficulty TEXT NOT NULL DEFAULT 'normal', -- easy (+10), normal (+20), hard (+40), extreme (+75)
    xp_reward INTEGER NOT NULL DEFAULT 20,
    saving_amount NUMERIC(14,2) DEFAULT 0.00,
    is_partner_visible BOOLEAN NOT NULL DEFAULT TRUE,
    recurrence TEXT NOT NULL DEFAULT 'once', -- once, daily, weekdays
    recurrence_days JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: XP_EVENTS (Historial de por qué tengo este nivel)
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- objective, saving, achievement, streak_bonus, fear_action, fear_conquered
    description TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLA: ACHIEVEMENTS & USER_ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    category TEXT NOT NULL DEFAULT 'disciplina'
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 13. TABLA: FEARS Y FEAR_STEPS (Módulo de Miedos & Escalera de Exposición)
CREATE TABLE IF NOT EXISTS public.fears (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'escasez',
    impact_score INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'enfrentando', -- enfrentando, superado
    bravery_score INTEGER NOT NULL DEFAULT 0,
    actions JSONB DEFAULT '[]'::jsonb,
    reflection TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    conquered_at TIMESTAMPTZ
);

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

CREATE INDEX IF NOT EXISTS idx_fears_user_id ON public.fears(user_id);
CREATE INDEX IF NOT EXISTS idx_fear_steps_fear_id ON public.fear_steps(fear_id);
CREATE INDEX IF NOT EXISTS idx_fear_steps_user_id ON public.fear_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_fear_steps_order ON public.fear_steps(fear_id, step_order);


-- 14. FUNCIÓN Y TRIGGERS PARA LEVEL Y XP
CREATE OR REPLACE FUNCTION public.level_for_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF xp <= 0 THEN RETURN 1; END IF;
    RETURN GREATEST(1, FLOOR((-1 + SQRT(1 + (8 * xp)::NUMERIC / 100)) / 2)::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- RPC: UNIRSE POR CÓDIGO (join_by_code)
-- Lanza excepción si el código es inválido o es el propio
CREATE OR REPLACE FUNCTION public.join_by_code(code TEXT)
RETURNS UUID AS $$
DECLARE
    target_user RECORD;
    current_uid UUID := auth.uid();
BEGIN
    SELECT * INTO target_user FROM public.profiles WHERE invite_code = UPPER(TRIM(code));
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Código de invitación inválido o no existe.';
    END IF;
    IF target_user.id = current_uid THEN
        RAISE EXCEPTION 'No puedes conectarte con tu propio código de invitación.';
    END IF;

    -- Conexión bidireccional
    INSERT INTO public.connections (user_a, user_b)
    VALUES (current_uid, target_user.id)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.connections (user_a, user_b)
    VALUES (target_user.id, current_uid)
    ON CONFLICT DO NOTHING;

    RETURN target_user.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: DESCONECTAR COMPAÑERO
CREATE OR REPLACE FUNCTION public.disconnect_partner(target_partner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_uid UUID := auth.uid();
BEGIN
    DELETE FROM public.connections
    WHERE (user_a = current_uid AND user_b = target_partner_id)
       OR (user_b = current_uid AND user_a = target_partner_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. TRIGGER: MOTOR DE PROGRESO CONFIABLE (XP, RACHA, LOGROS, DESHACER)
CREATE OR REPLACE FUNCTION public.handle_objective_status_change()
RETURNS TRIGGER AS $$
DECLARE
    user_prof RECORD;
    today_bogota DATE := (NOW() AT TIME ZONE 'America/Bogota')::DATE;
    calculated_streak INTEGER;
    new_best INTEGER;
    earned_xp INTEGER;
BEGIN
    SELECT * INTO user_prof FROM public.profiles WHERE id = NEW.user_id;

    -- CASO 1: OBJETIVO COMPLETADO (pending -> completed)
    IF NEW.status = 'completado' AND (OLD.status IS DISTINCT FROM 'completado') THEN
        earned_xp := COALESCE(NEW.xp_reward, 20);

        -- Cálculo de racha confiable:
        IF user_prof.last_active_date IS NULL THEN
            calculated_streak := 1;
        ELSIF user_prof.last_active_date = today_bogota THEN
            calculated_streak := COALESCE(user_prof.current_streak, 1);
        ELSIF user_prof.last_active_date = (today_bogota - 1) THEN
            calculated_streak := COALESCE(user_prof.current_streak, 0) + 1;
        ELSE
            -- Se saltó un día: la racha se rompe correctamente
            calculated_streak := 1;
        END IF;

        new_best := GREATEST(COALESCE(user_prof.best_streak, 0), calculated_streak);

        -- Registrar evento inmutable de XP
        INSERT INTO public.xp_events (user_id, source_type, description, xp_amount, created_at)
        VALUES (NEW.user_id, 'objective', 'Completado: ' || NEW.title, earned_xp, NOW());

        -- Actualizar perfil
        UPDATE public.profiles
        SET xp = xp + earned_xp,
            level = public.level_for_xp(xp + earned_xp),
            current_streak = calculated_streak,
            best_streak = new_best,
            last_active_date = today_bogota,
            updated_at = NOW()
        WHERE id = NEW.user_id;

        -- Ahorro automático vinculado a meta
        IF NEW.saving_amount > 0 AND NEW.goal_id IS NOT NULL THEN
            INSERT INTO public.expenses (user_id, description, amount, category_name, date, is_saving, goal_id)
            VALUES (NEW.user_id, 'Ahorro objetivo: ' || NEW.title, NEW.saving_amount, 'Ahorro para Metas', today_bogota, TRUE, NEW.goal_id);

            UPDATE public.goals
            SET current_amount = current_amount + NEW.saving_amount,
                updated_at = NOW()
            WHERE id = NEW.goal_id;
        END IF;

    -- CASO 2: DESHACER COMPLETADO (completed -> pending) CON EVENTO COMPENSATORIO SIN ROMPER LA RACHA
    ELSIF OLD.status = 'completado' AND NEW.status = 'pendiente' THEN
        earned_xp := COALESCE(OLD.xp_reward, 20);

        -- Evento compensatorio negativo en xp_events
        INSERT INTO public.xp_events (user_id, source_type, description, xp_amount, created_at)
        VALUES (NEW.user_id, 'compensatory_undo', 'Compensación: Deshacer ' || OLD.title, -earned_xp, NOW());

        -- Revertir XP y nivel sin tocar la racha
        UPDATE public.profiles
        SET xp = GREATEST(0, xp - earned_xp),
            level = public.level_for_xp(GREATEST(0, xp - earned_xp)),
            updated_at = NOW()
        WHERE id = NEW.user_id;

        -- Revertir ahorro si existía
        IF OLD.saving_amount > 0 AND OLD.goal_id IS NOT NULL THEN
            UPDATE public.goals
            SET current_amount = GREATEST(0, current_amount - OLD.saving_amount),
                updated_at = NOW()
            WHERE id = OLD.goal_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_objective_status_change ON public.daily_objectives;
CREATE TRIGGER tr_objective_status_change
AFTER UPDATE OF status ON public.daily_objectives
FOR EACH ROW
EXECUTE FUNCTION public.handle_objective_status_change();

-- 16. GENERADOR DE OBJETIVOS RECURRENTES DIARIOS (JOB / ON LOAD)
CREATE OR REPLACE FUNCTION public.generate_recurring_objectives_daily(target_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    gen_count INTEGER := 0;
    target_date DATE := (NOW() AT TIME ZONE 'America/Bogota')::DATE;
    target_day_of_week INTEGER := EXTRACT(DOW FROM (NOW() AT TIME ZONE 'America/Bogota'))::INTEGER;
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT DISTINCT ON (title, user_id) *
        FROM public.daily_objectives
        WHERE recurrence IN ('diaria', 'dias_semana')
          AND (target_user_id IS NULL OR user_id = target_user_id)
    LOOP
        IF rec.recurrence = 'diaria' OR (rec.recurrence_days IS NOT NULL AND (rec.recurrence_days @> to_jsonb(target_day_of_week))) THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.daily_objectives
                WHERE user_id = rec.user_id
                  AND title = rec.title
                  AND date = target_date
            ) THEN
                INSERT INTO public.daily_objectives (
                    user_id, goal_id, title, date, slot, custom_time, difficulty,
                    xp_reward, saving_amount, is_partner_visible, recurrence, recurrence_days, status
                ) VALUES (
                    rec.user_id, rec.goal_id, rec.title, target_date, rec.slot, rec.custom_time, rec.difficulty,
                    rec.xp_reward, rec.saving_amount, rec.is_partner_visible, rec.recurrence, rec.recurrence_days, 'pendiente'
                );
                gen_count := gen_count + 1;
            END IF;
        END IF;
    END LOOP;
    RETURN gen_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. POLÍTICAS DE SEGURIDAD (RLS) - PRIVACIDAD ESTRICTA
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo el dueño puede ver sus gastos" ON public.expenses;
CREATE POLICY "Solo el dueño puede ver sus gastos" ON public.expenses
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño puede ver sus finanzas" ON public.financial_settings;
CREATE POLICY "Solo el dueño puede ver sus finanzas" ON public.financial_settings
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño puede ver sus deducciones" ON public.fixed_deductions;
CREATE POLICY "Solo el dueño puede ver sus deducciones" ON public.fixed_deductions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño puede ver sus metas" ON public.goals;
CREATE POLICY "Solo el dueño puede ver sus metas" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño puede ver sus planes" ON public.plans;
CREATE POLICY "Solo el dueño puede ver sus planes" ON public.plans
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dueño gestiona sus objetivos" ON public.daily_objectives;
CREATE POLICY "Dueño gestiona sus objetivos" ON public.daily_objectives
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Compañero ve objetivos visibles de hoy" ON public.daily_objectives;
CREATE POLICY "Compañero ve objetivos visibles de hoy" ON public.daily_objectives
    FOR SELECT USING (
        is_partner_visible = TRUE
        AND date = (NOW() AT TIME ZONE 'America/Bogota')::DATE
        AND EXISTS (
            SELECT 1 FROM public.connections
            WHERE (user_a = auth.uid() AND user_b = daily_objectives.user_id)
               OR (user_b = auth.uid() AND user_a = daily_objectives.user_id)
        )
    );

-- 18. MÓDULO DE HÁBITOS & REGISTROS (HABITS & HABIT_LOGS)
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'diaria' CHECK (frequency IN ('diaria', 'semanal', 'personalizada')),
    custom_days JSONB DEFAULT '[]'::jsonb,
    optional_time TEXT,
    time_slot TEXT NOT NULL DEFAULT 'manana' CHECK (time_slot IN ('manana', 'tarde', 'noche', 'personalizada')),
    xp_reward INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_habit_log_day UNIQUE (habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON public.habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo el dueño gestiona sus hábitos" ON public.habits;
CREATE POLICY "Solo el dueño gestiona sus hábitos" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Solo el dueño gestiona sus registros de hábitos" ON public.habit_logs;
CREATE POLICY "Solo el dueño gestiona sus registros de hábitos" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id);


