import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getStoredSupabaseConfig = () => {
  try {
    const stored = localStorage.getItem('sayayin_supabase_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  };
};

let currentConfig = getStoredSupabaseConfig();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(currentConfig.url) &&
    Boolean(currentConfig.anonKey) &&
    currentConfig.url.startsWith('https://')
  );
};

export let supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(currentConfig.url, currentConfig.anonKey)
  : null;

export const updateSupabaseCredentials = (url: string, anonKey: string): boolean => {
  try {
    if (url && anonKey) {
      localStorage.setItem('sayayin_supabase_config', JSON.stringify({ url, anonKey }));
      currentConfig = { url, anonKey };
      supabase = createClient(url, anonKey);
      return true;
    } else {
      localStorage.removeItem('sayayin_supabase_config');
      currentConfig = { url: '', anonKey: '' };
      supabase = null;
      return false;
    }
  } catch (e) {
    console.error('Error saving Supabase configuration:', e);
    return false;
  }
};

export const SCHEMA_SQL_FASE_1 = `-- ====================================================================
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
    source_type TEXT NOT NULL,
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

-- 13. TABLA: FEARS (Módulo de Miedos & Dominio Mental)
CREATE TABLE IF NOT EXISTS public.fears (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'escasez',
    impact_score INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'enfrentando',
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    reflection TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    conquered_at TIMESTAMPTZ
);

-- 14. FUNCIÓN Y TRIGGERS PARA LEVEL Y XP
CREATE OR REPLACE FUNCTION public.level_for_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF xp <= 0 THEN RETURN 1; END IF;
    RETURN GREATEST(1, FLOOR((-1 + SQRT(1 + (8 * xp)::NUMERIC / 100)) / 2)::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- RPC: UNIRSE POR CÓDIGO (join_by_code)
CREATE OR REPLACE FUNCTION public.join_by_code(target_invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
    target_user RECORD;
    current_uid UUID := auth.uid();
BEGIN
    SELECT * INTO target_user FROM public.profiles WHERE invite_code = UPPER(TRIM(target_invite_code));
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código de invitación no encontrado.');
    END IF;
    IF target_user.id = current_uid THEN
        RETURN jsonb_build_object('success', false, 'error', 'No puedes enlazarte contigo mismo.');
    END IF;

    INSERT INTO public.connections (user_a, user_b)
    VALUES (current_uid, target_user.id)
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object('success', true, 'partner_name', target_user.display_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

