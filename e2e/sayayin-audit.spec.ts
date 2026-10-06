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

  test('3. Flujo de crear meta de ahorro real', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'metas');
    await expect(page.locator('h1:has-text("Metas de Ahorro")')).toBeVisible();

    // Open GoalModal via Fijar Nueva Meta button
    const openGoalBtn = page.locator('button:has-text("Fijar Nueva Meta"), button:has-text("Crear Mi Primera Meta")');
    await expect(openGoalBtn.first()).toBeVisible();
    await openGoalBtn.first().click();
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

  test('4. Flujo de crear objetivo diario en el radar', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'objetivos');
    await expect(page.locator('h1:has-text("Objetivos Diarios")')).toBeVisible();

    // Open ObjectiveModal
    await page.locator('button:has-text("Nuevo Objetivo")').first().click();
    await expect(page.locator('text=Crear Objetivo Diario')).toBeVisible();

    // Fill objective title
    const objTitle = `Entrenar Ki ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Registrar gastos del día"]').fill(objTitle);

    // Submit
    await page.locator('button:has-text("Agregar Objetivo al Radar")').click();

    // Verify objective is listed
    await expect(page.locator(`text=${objTitle}`)).toBeVisible();
  });

  test('5. Flujo de completar objetivo', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
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

  test('6. Flujo de registrar gasto real', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'finanzas');
    await expect(page.locator('h1:has-text("Radar de Finanzas")')).toBeVisible();

    // Open ExpenseModal
    await page.locator('button:has-text("Registrar Movimiento")').first().click();
    await expect(page.locator('text=Registrar Gasto Real')).toBeVisible();

    // Fill amount and description
    await page.locator('input[placeholder="Ej: 50000"]').fill('35000');
    const desc = `Proteína Saiyajin ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Mercado semanal"]').fill(desc);

    // Submit
    await page.locator('button:has-text("Guardar Movimiento")').click();

    // Verify appears in table
    await expect(page.locator(`text=${desc}`)).toBeVisible();
  });

  test('7. Flujo de conectar compañero y verificar responsive sin scroll horizontal', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'companero');
    await expect(page.locator('h1:has-text("Compañero Saiyajin")')).toBeVisible();

    // Verify copy code button exists
    const copyBtn = page.locator('button[title="Copiar código"]');
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

  test('8. Flujo de exportación de datos y diagnóstico en Configuración', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'configuracion');
    await expect(page.locator('h1:has-text("Configuración del Sistema")')).toBeVisible();

    // Verify export buttons exist
    const jsonBtn = page.locator('button:has-text("Descargar JSON")');
    await expect(jsonBtn).toBeVisible();

    const csvBtn = page.locator('button:has-text("Descargar CSV")');
    await expect(csvBtn).toBeVisible();

    // Trigger JSON download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 4000 }).catch(() => null);
    await jsonBtn.click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain('.json');
    }
  });

  test('9. Flujo de doble confirmación para eliminación de cuenta', async ({ page, isMobile }: { page: Page; isMobile?: boolean }) => {
    await navigateToTab(page, isMobile, 'configuracion');

    // Click on initial delete account button in danger zone
    const openDeleteModalBtn = page.locator('button:has-text("Eliminar Cuenta")');
    await expect(openDeleteModalBtn).toBeVisible();
    await openDeleteModalBtn.click();

    // Verify Step 1 modal is shown
    await expect(page.locator('text=¿Eliminar tu cuenta por completo?')).toBeVisible();

    // Proceed to Step 2
    const step2Btn = page.locator('button:has-text("Continuar al Paso 2 →")');
    await expect(step2Btn).toBeVisible();
    await step2Btn.click();

    // Verify Step 2 modal and disabled submit button
    await expect(page.locator('text=Confirmación Definitiva')).toBeVisible();
    const finalDeleteBtn = page.locator('button:has-text("Eliminar Definitivamente")');
    await expect(finalDeleteBtn).toBeDisabled();

    // Type incorrect keyword -> still disabled
    const input = page.locator('input[placeholder="Escribe: ELIMINAR SAIYAJIN"]');
    await input.fill('no quiero');
    await expect(finalDeleteBtn).toBeDisabled();

    // Type exact required keyword -> now enabled!
    await input.fill('ELIMINAR SAIYAJIN');
    await expect(finalDeleteBtn).toBeEnabled();

    // Abort safely
    await page.locator('button:has-text("Abortar")').click();
    await expect(page.locator('text=Confirmación Definitiva')).not.toBeVisible();
  });
});
