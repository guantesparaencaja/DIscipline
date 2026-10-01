import { test, expect, Page } from '@playwright/test';

async function navigateToTab(page: Page, isMobile: boolean | undefined, tab: string) {
  if (isMobile) {
    const directTab = page.locator(`nav [data-testid="nav-tab-${tab}"]`);
    if (await directTab.isVisible()) {
      await directTab.click();
    } else {
      const moreBtn = page.locator('[data-testid="nav-tab-more"]');
      await moreBtn.click();
      await page.waitForTimeout(250);
      await page.locator(`[data-testid="nav-tab-${tab}"]`).click();
    }
  } else {
    await page.locator(`aside [data-testid="nav-tab-${tab}"]`).click();
  }
}

test.describe('Auditoría Integral y Responsive · Sayayin Radar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Verificación de cero desbordamiento horizontal', async ({ page }) => {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(hasOverflow).toBe(false);
  });

  test('2. Flujo de registro en Supabase Auth Modal', async ({ page }) => {
    // Open auth modal via data-testid
    const authBtn = page.locator('[data-testid="auth-modal-btn"]');
    await expect(authBtn).toBeVisible();
    await authBtn.click();

    // Verify modal is visible
    const modalTitle = page.locator('text=Iniciar Sesión').or(page.locator('text=Sesión de Guerrero'));
    await expect(modalTitle.first()).toBeVisible();

    // Switch to register
    const registerLink = page.locator('button:has-text("Regístrate aquí")');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page.locator('text=Registrar Guerrero')).toBeVisible();

      // Fill registration form
      await page.locator('input[type="email"]').fill('guerrero-test@sayayin.app');
      await page.locator('input[type="password"]').fill('claveSaiyajin123');

      const submitRegisterBtn = page.locator('button:has-text("Crear Cuenta Saiyajin")');
      await expect(submitRegisterBtn).toBeVisible();
    }

    // Close modal
    await page.locator('button[aria-label="Cerrar modal de autenticación"]').click();
    await expect(modalTitle.first()).not.toBeVisible();
  });

  test('3. Flujo de crear meta de ahorro real', async ({ page, isMobile }) => {
    await navigateToTab(page, isMobile, 'metas');
    await expect(page.locator('h1:has-text("Metas de Ahorro Real")')).toBeVisible();

    // Open GoalModal
    await page.locator('button:has-text("Crear Meta")').first().click();
    await expect(page.locator('text=Crear Meta Saiyajin')).toBeVisible();

    // Fill goal form
    const goalTitle = `Meta Test ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Fondo de Emergencia"]').fill(goalTitle);

    // Target amount
    const targetInput = page.locator('input[placeholder*="1200000"]').or(page.locator('input[inputmode="numeric"]'));
    if (await targetInput.first().isVisible()) {
      await targetInput.first().fill('500000');
    }

    // Submit goal
    await page.locator('button:has-text("Guardar Meta Saiyajin")').click();

    // Check goal appears in list
    await expect(page.locator(`text=${goalTitle}`)).toBeVisible();
  });

  test('4. Flujo de crear objetivo diario en el radar', async ({ page, isMobile }) => {
    await navigateToTab(page, isMobile, 'objetivos');
    await expect(page.locator('h1:has-text("Radar de Objetivos")')).toBeVisible();

    // Open ObjectiveModal
    await page.locator('button:has-text("Nuevo Objetivo")').first().click();
    await expect(page.locator('text=Nuevo Objetivo Diario')).toBeVisible();

    // Fill objective title
    const objTitle = `Entrenar Ki ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Registrar gastos del día"]').fill(objTitle);

    // Submit
    await page.locator('button:has-text("Agregar Objetivo al Radar")').click();

    // Verify objective is listed
    await expect(page.locator(`text=${objTitle}`)).toBeVisible();
  });

  test('5. Flujo de completar objetivo', async ({ page, isMobile }) => {
    await navigateToTab(page, isMobile, 'inicio');
    await expect(page.locator('h3:has-text("Objetivos del Día")')).toBeVisible();

    // Find incomplete objective toggle button
    const checkButtons = page.locator('button[aria-label="Completar objetivo (+XP)"], button[title="Completar objetivo (+XP)"]');
    const count = await checkButtons.count();

    if (count > 0) {
      await checkButtons.first().click();
      await page.waitForTimeout(500);
      const pendingCheck = page.locator('button[aria-label="Marcar como pendiente"], button[title="Marcar como pendiente"]');
      await expect(pendingCheck.first()).toBeVisible();
    }
  });

  test('6. Flujo de registrar gasto real', async ({ page, isMobile }) => {
    await navigateToTab(page, isMobile, 'finanzas');
    await expect(page.locator('h1:has-text("Presupuesto & Finanzas Reales")')).toBeVisible();

    // Open ExpenseModal
    await page.locator('button:has-text("Registrar Movimiento")').first().click();
    await expect(page.locator('text=Registrar Gasto Real')).toBeVisible();

    // Fill amount and description
    await page.locator('input[placeholder="Ej: 50000"]').fill('35000');
    const desc = `Proteína Saiyajin ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Ej: Mercado de la semana"]').fill(desc);

    // Submit
    await page.locator('button:has-text("Guardar Movimiento")').click();

    // Verify appears in table
    await expect(page.locator(`text=${desc}`)).toBeVisible();
  });

  test('7. Flujo de conectar compañero y verificar responsive sin scroll horizontal', async ({ page, isMobile }) => {
    await navigateToTab(page, isMobile, 'companero');
    await expect(page.locator('h1:has-text("Entrenamiento en Pareja")')).toBeVisible();

    // Verify copy code button exists
    const copyBtn = page.locator('button:has-text("Copiar Código"), button:has-text("Copiado")');
    await expect(copyBtn.first()).toBeVisible();

    // Test partner code input
    const partnerInput = page.locator('input[placeholder*="Ej: SAYAYIN-"]');
    if (await partnerInput.isVisible()) {
      await partnerInput.fill('SAYA-TEST-99');
      const linkBtn = page.locator('button:has-text("Vincular Compañero")');
      await expect(linkBtn).toBeVisible();
    }

    // Verify zero horizontal scroll on this module
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(hasOverflow).toBe(false);
  });
});
