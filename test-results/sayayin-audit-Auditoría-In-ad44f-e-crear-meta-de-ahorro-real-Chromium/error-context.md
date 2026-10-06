# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sayayin-audit.spec.ts >> Auditoría Integral y Responsive · Sayayin Radar >> 3. Flujo de crear meta de ahorro real
- Location: e2e/sayayin-audit.spec.ts:61:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('aside [data-testid="nav-tab-metas"]')

```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | async function navigateToTab(page: Page, isMobile: boolean | undefined, tab: string) {
  4   |   if (isMobile) {
  5   |     const directTab = page.locator(`nav [data-testid="nav-tab-${tab}"]`);
  6   |     if (await directTab.isVisible()) {
  7   |       await directTab.click();
  8   |     } else {
  9   |       const moreBtn = page.locator('[data-testid="nav-tab-more"]');
  10  |       await moreBtn.click();
  11  |       await page.waitForTimeout(250);
  12  |       await page.locator(`[data-testid="nav-tab-${tab}"]`).click();
  13  |     }
  14  |   } else {
> 15  |     await page.locator(`aside [data-testid="nav-tab-${tab}"]`).click();
      |                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  16  |   }
  17  | }
  18  | 
  19  | test.describe('Auditoría Integral y Responsive · Sayayin Radar', () => {
  20  |   test.beforeEach(async ({ page }) => {
  21  |     await page.goto('/');
  22  |     await page.waitForLoadState('networkidle');
  23  |   });
  24  | 
  25  |   test('1. Verificación de cero desbordamiento horizontal', async ({ page }) => {
  26  |     const hasOverflow = await page.evaluate(() => {
  27  |       return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  28  |     });
  29  |     expect(hasOverflow).toBe(false);
  30  |   });
  31  | 
  32  |   test('2. Flujo de registro en Supabase Auth Modal', async ({ page }) => {
  33  |     // Open auth modal via data-testid
  34  |     const authBtn = page.locator('[data-testid="auth-modal-btn"]');
  35  |     await expect(authBtn).toBeVisible();
  36  |     await authBtn.click();
  37  | 
  38  |     // Verify modal is visible
  39  |     const modalTitle = page.locator('text=Iniciar Sesión').or(page.locator('text=Sesión de Guerrero'));
  40  |     await expect(modalTitle.first()).toBeVisible();
  41  | 
  42  |     // Switch to register
  43  |     const registerLink = page.locator('button:has-text("Regístrate aquí")');
  44  |     if (await registerLink.isVisible()) {
  45  |       await registerLink.click();
  46  |       await expect(page.locator('text=Registrar Guerrero')).toBeVisible();
  47  | 
  48  |       // Fill registration form
  49  |       await page.locator('input[type="email"]').fill('guerrero-test@sayayin.app');
  50  |       await page.locator('input[type="password"]').fill('claveSaiyajin123');
  51  | 
  52  |       const submitRegisterBtn = page.locator('button:has-text("Crear Cuenta Saiyajin")');
  53  |       await expect(submitRegisterBtn).toBeVisible();
  54  |     }
  55  | 
  56  |     // Close modal
  57  |     await page.locator('button[aria-label="Cerrar modal de autenticación"]').click();
  58  |     await expect(modalTitle.first()).not.toBeVisible();
  59  |   });
  60  | 
  61  |   test('3. Flujo de crear meta de ahorro real', async ({ page, isMobile }) => {
  62  |     await navigateToTab(page, isMobile, 'metas');
  63  |     await expect(page.locator('h1:has-text("Metas de Ahorro")')).toBeVisible();
  64  | 
  65  |     // Open GoalModal via Fijar Nueva Meta button
  66  |     const openGoalBtn = page.locator('button:has-text("Fijar Nueva Meta"), button:has-text("Crear Mi Primera Meta")');
  67  |     await expect(openGoalBtn.first()).toBeVisible();
  68  |     await openGoalBtn.first().click();
  69  |     await expect(page.locator('text=Crear Meta Saiyajin')).toBeVisible();
  70  | 
  71  |     // Fill goal form
  72  |     const goalTitle = `Meta Test ${Date.now().toString().slice(-4)}`;
  73  |     await page.locator('input[placeholder*="Fondo de Emergencia"]').fill(goalTitle);
  74  | 
  75  |     // Target amount
  76  |     const targetInput = page.locator('input[placeholder*="1200000"]').or(page.locator('input[inputmode="numeric"]'));
  77  |     if (await targetInput.first().isVisible()) {
  78  |       await targetInput.first().fill('500000');
  79  |     }
  80  | 
  81  |     // Submit goal
  82  |     await page.locator('button:has-text("Guardar Meta Saiyajin")').click();
  83  | 
  84  |     // Check goal appears in list
  85  |     await expect(page.locator(`text=${goalTitle}`)).toBeVisible();
  86  |   });
  87  | 
  88  |   test('4. Flujo de crear objetivo diario en el radar', async ({ page, isMobile }) => {
  89  |     await navigateToTab(page, isMobile, 'objetivos');
  90  |     await expect(page.locator('h1:has-text("Objetivos Diarios")')).toBeVisible();
  91  | 
  92  |     // Open ObjectiveModal
  93  |     await page.locator('button:has-text("Nuevo Objetivo")').first().click();
  94  |     await expect(page.locator('text=Crear Objetivo Diario')).toBeVisible();
  95  | 
  96  |     // Fill objective title
  97  |     const objTitle = `Entrenar Ki ${Date.now().toString().slice(-4)}`;
  98  |     await page.locator('input[placeholder*="Registrar gastos del día"]').fill(objTitle);
  99  | 
  100 |     // Submit
  101 |     await page.locator('button:has-text("Agregar Objetivo al Radar")').click();
  102 | 
  103 |     // Verify objective is listed
  104 |     await expect(page.locator(`text=${objTitle}`)).toBeVisible();
  105 |   });
  106 | 
  107 |   test('5. Flujo de completar objetivo', async ({ page, isMobile }) => {
  108 |     await navigateToTab(page, isMobile, 'inicio');
  109 |     await expect(page.locator('h3:has-text("Objetivos del Día")')).toBeVisible();
  110 | 
  111 |     // Find incomplete objective toggle button
  112 |     const checkButtons = page.locator('button[aria-label="Completar objetivo (+XP)"], button[title="Completar objetivo (+XP)"]');
  113 |     const count = await checkButtons.count();
  114 | 
  115 |     if (count > 0) {
```