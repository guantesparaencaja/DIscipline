-- ====================================================================
-- SAYAYIN FINANCIAL & HABIT RADAR - SUITE DE PRUEBAS DE SEGURIDAD RLS
-- Archivo: scripts/test-rls.sql
-- Ejecuta este script en Supabase SQL Editor para validar las políticas RLS.
-- ====================================================================

DO $$
DECLARE
    -- IDs de prueba
    user_a UUID := '11111111-1111-1111-1111-111111111111'::UUID;
    user_b UUID := '22222222-2222-2222-2222-222222222222'::UUID; -- Compañero de A
    user_c UUID := '33333333-3333-3333-3333-333333333333'::UUID; -- Desconocido (no conectado)
    
    test_count INTEGER := 0;
    passed_count INTEGER := 0;
    row_count INTEGER := 0;
    today_date DATE := (NOW() AT TIME ZONE 'America/Bogota')::DATE;
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '⚔️ INICIANDO SUITE DE PRUEBAS RLS - RADAR SAYAYIN';
    RAISE NOTICE '=======================================================';

    -- 1. SETUP DE DATOS DE PRUEBA
    -- Limpiar posibles registros previos de prueba
    DELETE FROM public.connections WHERE user_a IN (user_a, user_b, user_c) OR user_b IN (user_a, user_b, user_c);
    DELETE FROM public.expenses WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.goals WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.financial_settings WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.xp_events WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.daily_objectives WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.user_achievements WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.profiles WHERE id IN (user_a, user_b, user_c);

    -- Insertar perfiles
    INSERT INTO public.profiles (id, email, display_name, xp, level, invite_code)
    VALUES 
        (user_a, 'goku@sayayin.com', 'Son Goku (Usuario A)', 500, 3, 'SAYAYIN-GOKU1'),
        (user_b, 'vegeta@sayayin.com', 'Príncipe Vegeta (Usuario B)', 450, 2, 'SAYAYIN-VEGETA'),
        (user_c, 'freezer@sayayin.com', 'Lord Freezer (Usuario C)', 100, 1, 'SAYAYIN-FREEZER');

    -- Conexión de compañeros: Usuario A <-> Usuario B
    INSERT INTO public.connections (user_a, user_b)
    VALUES (user_a, user_b), (user_b, user_a);

    -- Datos privados de Usuario A
    INSERT INTO public.expenses (user_id, description, amount, category_name, date, is_saving)
    VALUES (user_a, 'Semillas del Ermitaño', 150000, 'Salud', today_date, FALSE);

    INSERT INTO public.goals (user_id, title, target_amount, current_amount, start_date, target_date, priority)
    VALUES (user_a, 'Nave Espacial Capsule Corp', 50000000, 10000000, today_date, today_date + INTERVAL '1 year', 'alta');

    INSERT INTO public.financial_settings (user_id, base_monthly_income, emergency_fund_target)
    VALUES (user_a, 5000000, 15000000);

    INSERT INTO public.xp_events (user_id, source_type, description, xp_amount)
    VALUES (user_a, 'training', 'Gravedad x100 completada', 250);

    -- Objetivos de Usuario A: uno visible para compañero y otro estrictamente privado
    INSERT INTO public.daily_objectives (user_id, title, date, slot, difficulty, xp_reward, is_partner_visible, status)
    VALUES 
        (user_a, 'Meditar en el templo (VISIBLE)', today_date, 'manana', 'normal', 20, TRUE, 'pendiente'),
        (user_a, 'Entrenamiento secreto Ultra Instinto (PRIVADO)', today_date, 'noche', 'legendario', 75, FALSE, 'pendiente');

    -- Logro de prueba para Usuario A
    INSERT INTO public.achievements (id, code, title, description, xp_reward, category)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 'SUPER_SAIYAJIN_TEST', 'Despertar Saiyajin', 'Alcanzó el primer nivel de poder', 100, 'disciplina')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT user_a, id FROM public.achievements WHERE code = 'SUPER_SAIYAJIN_TEST'
    ON CONFLICT DO NOTHING;

    -------------------------------------------------------------------
    -- TEST 1: Usuario B NO puede leer los GASTOS de Usuario A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    -- Simulamos contexto auth como user_b
    PERFORM set_config('request.jwt.claim.sub', user_b::TEXT, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO row_count FROM public.expenses WHERE user_id = user_a;
    IF row_count = 0 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 1 PASSED: Usuario B no puede leer los gastos privados de Usuario A (filas: %)', row_count;
    ELSE
        RAISE EXCEPTION '❌ TEST 1 FAILED: Usuario B pudo leer los gastos de Usuario A (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- TEST 2: Usuario B NO puede leer las METAS (goals) de Usuario A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.goals WHERE user_id = user_a;
    IF row_count = 0 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 2 PASSED: Usuario B no puede leer las metas financieras de Usuario A (filas: %)', row_count;
    ELSE
        RAISE EXCEPTION '❌ TEST 2 FAILED: Usuario B pudo leer metas ajenas (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- TEST 3: Usuario B NO puede leer financial_settings de Usuario A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.financial_settings WHERE user_id = user_a;
    IF row_count = 0 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 3 PASSED: Usuario B no puede leer configuraciones financieras de Usuario A (filas: %)', row_count;
    ELSE
        RAISE EXCEPTION '❌ TEST 3 FAILED: Usuario B pudo leer financial_settings de A (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- TEST 4: Usuario B NO puede leer los xp_events de Usuario A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.xp_events WHERE user_id = user_a;
    IF row_count = 0 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 4 PASSED: Usuario B no puede leer historial de xp_events de Usuario A (filas: %)', row_count;
    ELSE
        RAISE EXCEPTION '❌ TEST 4 FAILED: Usuario B pudo leer xp_events de A (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- TEST 5: Compañero B SOLO ve los objetivos visibles (is_partner_visible = TRUE)
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.daily_objectives WHERE user_id = user_a;
    IF row_count = 1 THEN
        -- Comprobamos que el objetivo visible sea el que se puede leer
        SELECT COUNT(*) INTO row_count FROM public.daily_objectives 
        WHERE user_id = user_a AND is_partner_visible = FALSE;

        IF row_count = 0 THEN
            passed_count := passed_count + 1;
            RAISE NOTICE '✅ TEST 5 PASSED: Usuario B solo puede ver el objetivo público; el objetivo privado está bloqueado.';
        ELSE
            RAISE EXCEPTION '❌ TEST 5 FAILED: Usuario B pudo leer el objetivo oculto de Usuario A.';
        END IF;
    ELSE
        RAISE EXCEPTION '❌ TEST 5 FAILED: Número inesperado de objetivos leídos por compañero (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- TEST 6: Compañero B PUEDE leer el perfil de Usuario A (Modo Compañero)
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.profiles WHERE id = user_a;
    IF row_count = 1 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 6 PASSED: Compañero B puede leer el perfil público y nivel de su compañero Usuario A.';
    ELSE
        RAISE EXCEPTION '❌ TEST 6 FAILED: Compañero B no pudo leer el perfil de su compañero A.';
    END IF;

    -------------------------------------------------------------------
    -- TEST 7: Compañero B PUEDE leer los logros desbloqueados de Usuario A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    SELECT COUNT(*) INTO row_count FROM public.user_achievements WHERE user_id = user_a;
    IF row_count >= 1 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 7 PASSED: Compañero B puede ver los logros desbloqueados de Usuario A.';
    ELSE
        RAISE EXCEPTION '❌ TEST 7 FAILED: Compañero B no pudo leer los logros de su compañero.';
    END IF;

    -------------------------------------------------------------------
    -- TEST 8: Usuario C (DESCONOCIDO / NO COMPAÑERO) NO PUEDE LEER NADA DE A
    -------------------------------------------------------------------
    test_count := test_count + 1;
    -- Cambiamos el contexto a Usuario C
    PERFORM set_config('request.jwt.claim.sub', user_c::TEXT, true);

    -- No puede ver objetivos de A (ni siquiera los marcados is_partner_visible)
    SELECT COUNT(*) INTO row_count FROM public.daily_objectives WHERE user_id = user_a;
    IF row_count = 0 THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '✅ TEST 8 PASSED: Usuario C (no compañero) no puede leer NINGÚN objetivo de Usuario A (filas: 0)';
    ELSE
        RAISE EXCEPTION '❌ TEST 8 FAILED: Usuario C no conectado pudo leer objetivos de A (filas: %)', row_count;
    END IF;

    -------------------------------------------------------------------
    -- RESUMEN FINAL
    -------------------------------------------------------------------
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '🏁 RESUMEN: % DE % PRUEBAS RLS SUPERADAS EXITOSAMENTE (100%%)', passed_count, test_count;
    RAISE NOTICE '🔒 Las políticas RLS de Supabase garantizan privacidad estricta.';
    RAISE NOTICE '=======================================================';

    -- Limpieza de datos de prueba
    DELETE FROM public.connections WHERE user_a IN (user_a, user_b, user_c) OR user_b IN (user_a, user_b, user_c);
    DELETE FROM public.expenses WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.goals WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.financial_settings WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.xp_events WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.daily_objectives WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.user_achievements WHERE user_id IN (user_a, user_b, user_c);
    DELETE FROM public.profiles WHERE id IN (user_a, user_b, user_c);
END $$;
