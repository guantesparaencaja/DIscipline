# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sayayin-audit.spec.ts >> Auditoría Integral y Responsive · Sayayin Radar >> 4. Flujo de crear objetivo diario en el radar
- Location: e2e/sayayin-audit.spec.ts:88:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Entrenar Ki 1232')
Expected: visible
Error: strict mode violation: locator('text=Entrenar Ki 1232') resolved to 2 elements:
    1) <p class="text-sm font-bold text-white">Entrenar Ki 1232</p> aka getByText('Entrenar Ki 1232', { exact: true })
    2) <p class="text-[11px] text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">Entrenar Ki 1232 (+20 XP)</p> aka getByText('Entrenar Ki 1232 (+20 XP)')

Call log:
  - Expect "toBeVisible" locator('text=Entrenar Ki 1232') with timeout 5000ms
  - waiting for locator('text=Entrenar Ki 1232')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7] [cursor=pointer]
          - generic [ref=e12]:
            - generic [ref=e13]:
              - generic [ref=e14]: SAYAYIN.RADAR
              - generic [ref=e15]: FASE 1
            - paragraph [ref=e16]: Evolución RPG · Finanzas & Hábitos
        - generic [ref=e17]: "\"El dolor es temporal, pero el orgullo de un Saiyajin es eterno.\""
        - generic [ref=e23]:
          - button "Conectar Google" [ref=e25]
          - button "Entrar al Radar" [ref=e29]:
            - generic [ref=e33]: Entrar
          - button "Notificaciones" [ref=e35]
          - generic [ref=e40] [cursor=pointer]:
            - generic [ref=e41]: "4"
            - generic [ref=e43]:
              - generic [ref=e44]: Nivel 4
              - generic [ref=e45]: ·
              - generic [ref=e46]: SSJ 2
          - button "Configuración" [ref=e49]
    - generic [ref=e53]:
      - complementary [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]: Menú de Entrenamiento
          - button "Inicio" [ref=e58]
          - button "Finanzas" [ref=e66]
          - button "Hábitos 0/3" [ref=e72]:
            - generic [ref=e73]: Hábitos
            - generic [ref=e77]: 0/3
          - button "Objetivos Diarios 2" [ref=e79]:
            - generic [ref=e80]: Objetivos Diarios
            - generic [ref=e85]: "2"
          - button "Metas 1" [ref=e87]:
            - generic [ref=e88]: Metas
            - generic [ref=e94]: "1"
          - button "Planes" [ref=e96]
          - button "Acciones Rápidas" [ref=e102]
          - button "Recompensas 1470 XP" [ref=e107]:
            - generic [ref=e108]: Recompensas
            - generic [ref=e114]: 1470 XP
          - button "Miedos & Creencias" [ref=e116]
          - button "Logros & Rachas 🔥 4d" [ref=e121]:
            - generic [ref=e122]: Logros & Rachas
            - generic [ref=e130]: 🔥 4d
          - button "Estadísticas" [ref=e132]
          - button "Calendario" [ref=e137]
          - button "Compañero" [ref=e142]
          - button "Configuración" [ref=e150]
        - button "Instalar aplicación en dispositivo" [ref=e157]:
          - generic [ref=e161]: Instalar App
        - generic [ref=e162]:
          - generic [ref=e163]:
            - generic [ref=e164]: Racha Actual
            - generic [ref=e165]: 🔥 4 Días
          - generic [ref=e166]:
            - generic [ref=e167]: Mejor Racha
            - generic [ref=e168]: 7 Días
      - main [ref=e169]:
        - generic [ref=e170]:
          - generic [ref=e171]:
            - generic [ref=e172]:
              - text: Rutina & Horarios
              - heading "Objetivos Diarios & Hábitos" [level=1] [ref=e173]
              - paragraph [ref=e177]: Programados por franja horaria (Mañana, Tarde, Noche). Otorga Ki (+XP) únicamente por hechos consumados.
            - generic [ref=e178]:
              - textbox [ref=e179]: 2026-10-03
              - button "Nuevo Objetivo" [ref=e180]
          - generic [ref=e183]:
            - generic [ref=e184]:
              - button "Todas las franjas" [ref=e185]
              - button "Mañana" [ref=e186]
              - button "Tarde" [ref=e194]
              - button "Noche" [ref=e201]
            - generic [ref=e205]:
              - button "Todos" [ref=e206]
              - button "Pendientes" [ref=e207]
              - button "Completados" [ref=e208]
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]:
                - button [ref=e212]
                - generic [ref=e215]:
                  - paragraph [ref=e216]: Entrenar Ki 1232
                  - generic [ref=e217]:
                    - generic [ref=e218]: 🕒 Mañana (06:00 - 12:00)
                    - generic [ref=e219]: +20 XP
                    - generic [ref=e220]: 🔁 Diario
              - generic [ref=e221]:
                - button "Calendar" [ref=e222]
                - button "Tasks" [ref=e226]
                - button "Eliminar objetivo" [ref=e231]
            - generic [ref=e235]:
              - generic [ref=e236]:
                - button [ref=e237]
                - generic [ref=e241]:
                  - paragraph [ref=e242]: Apartar $20.000 para el Fondo de Emergencia
                  - generic [ref=e243]:
                    - generic [ref=e244]: 🕒 Mañana (08:00)
                    - generic [ref=e245]: +20 XP
                    - generic [ref=e246]: "Ahorro: $ 20.000"
                    - generic [ref=e250]: 🔁 Diario
              - generic [ref=e251]:
                - button "Calendar" [ref=e252]
                - button "Tasks" [ref=e256]
                - button "Eliminar objetivo" [ref=e261]
            - generic [ref=e265]:
              - generic [ref=e266]:
                - button [ref=e267]
                - generic [ref=e271]:
                  - paragraph [ref=e272]: Entrenamiento de fuerza y resistencia (40 min)
                  - generic [ref=e273]:
                    - generic [ref=e274]: 🕒 Mañana (09:30)
                    - generic [ref=e275]: +40 XP
                    - generic [ref=e276]: 🔁 Diario
              - generic [ref=e277]:
                - button "Calendar" [ref=e278]
                - button "Tasks" [ref=e282]
                - button "Eliminar objetivo" [ref=e287]
            - generic [ref=e291]:
              - generic [ref=e292]:
                - button [ref=e293]
                - generic [ref=e296]:
                  - paragraph [ref=e297]: Cero gastos impulsivos o compras hormiga hoy
                  - generic [ref=e298]:
                    - generic [ref=e299]: 🕒 Tarde (12:00 - 18:00)
                    - generic [ref=e300]: +20 XP
                    - generic [ref=e301]: 🔁 Diario
              - generic [ref=e302]:
                - button "Calendar" [ref=e303]
                - button "Tasks" [ref=e307]
                - button "Eliminar objetivo" [ref=e312]
            - generic [ref=e316]:
              - generic [ref=e317]:
                - button [ref=e318]
                - generic [ref=e321]:
                  - paragraph [ref=e322]: Registrar cada recibo y auditar fondo disponible
                  - generic [ref=e323]:
                    - generic [ref=e324]: 🕒 Noche (21:00)
                    - generic [ref=e325]: +10 XP
                    - generic [ref=e326]: 🔁 Diario
              - generic [ref=e327]:
                - button "Calendar" [ref=e328]
                - button "Tasks" [ref=e332]
                - button "Eliminar objetivo" [ref=e337]
    - generic:
      - generic [ref=e341]:
        - generic [ref=e346]:
          - heading "Objetivo agregado a tu rutina" [level=5] [ref=e347]
          - paragraph [ref=e348]: Entrenar Ki 1232 (+20 XP)
        - button [ref=e349]
      - generic [ref=e353]:
        - generic [ref=e358]:
          - 'heading "¡HAS ALCANZADO: SUPER SAYAYIN 2!" [level=5] [ref=e359]'
          - paragraph [ref=e360]: Chispas eléctricas y velocidad fulgurante. Tus ahorros y hábitos marchan al compás.
        - button [ref=e361]
      - generic [ref=e365]:
        - generic [ref=e373]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Mirar al Dragón a los Ojos!" [level=5] [ref=e374]'
          - paragraph [ref=e375]: Identifica y registra tu primer miedo financiero o bloqueo mental. (+100 XP)
        - button [ref=e376]
      - generic [ref=e380]:
        - generic [ref=e388]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Despertar Dorado (Super Sayayin)!" [level=5] [ref=e389]'
          - paragraph [ref=e390]: Desbloquea y alcanza el estado Super Sayayin (Poder > 20). (+300 XP)
        - button [ref=e391]
      - generic [ref=e395]:
        - generic [ref=e403]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Ahorro Maestro (>20% Ingreso)!" [level=5] [ref=e404]'
          - paragraph [ref=e405]: Ahorra más del 20% de tu ingreso base en un mes. (+500 XP)
        - button [ref=e406]
  - generic [aria-hidden] [ref=e410]: "0"
```

# Test source

```ts
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
  15  |     await page.locator(`aside [data-testid="nav-tab-${tab}"]`).click();
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
> 104 |     await expect(page.locator(`text=${objTitle}`)).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
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
  116 |       await checkButtons.first().click();
  117 |       await page.waitForTimeout(500);
  118 |       const pendingCheck = page.locator('button[aria-label="Marcar como pendiente"], button[title="Marcar como pendiente"]');
  119 |       await expect(pendingCheck.first()).toBeVisible();
  120 |     }
  121 |   });
  122 | 
  123 |   test('6. Flujo de registrar gasto real', async ({ page, isMobile }) => {
  124 |     await navigateToTab(page, isMobile, 'finanzas');
  125 |     await expect(page.locator('h1:has-text("Radar de Finanzas")')).toBeVisible();
  126 | 
  127 |     // Open ExpenseModal
  128 |     await page.locator('button:has-text("Registrar Movimiento")').first().click();
  129 |     await expect(page.locator('text=Registrar Gasto Real')).toBeVisible();
  130 | 
  131 |     // Fill amount and description
  132 |     await page.locator('input[placeholder="Ej: 50000"]').fill('35000');
  133 |     const desc = `Proteína Saiyajin ${Date.now().toString().slice(-4)}`;
  134 |     await page.locator('input[placeholder*="Mercado semanal"]').fill(desc);
  135 | 
  136 |     // Submit
  137 |     await page.locator('button:has-text("Guardar Movimiento")').click();
  138 | 
  139 |     // Verify appears in table
  140 |     await expect(page.locator(`text=${desc}`)).toBeVisible();
  141 |   });
  142 | 
  143 |   test('7. Flujo de conectar compañero y verificar responsive sin scroll horizontal', async ({ page, isMobile }) => {
  144 |     await navigateToTab(page, isMobile, 'companero');
  145 |     await expect(page.locator('h1:has-text("Compañero Saiyajin")')).toBeVisible();
  146 | 
  147 |     // Verify copy code button exists
  148 |     const copyBtn = page.locator('button[title="Copiar código"]');
  149 |     await expect(copyBtn.first()).toBeVisible();
  150 | 
  151 |     // Test partner code input
  152 |     const partnerInput = page.locator('input[placeholder*="Ej: SAYAYIN-"]');
  153 |     if (await partnerInput.isVisible()) {
  154 |       await partnerInput.fill('SAYA-TEST-99');
  155 |       const linkBtn = page.locator('button:has-text("Vincular Compañero")');
  156 |       await expect(linkBtn).toBeVisible();
  157 |     }
  158 | 
  159 |     // Verify zero horizontal scroll on this module
  160 |     const hasOverflow = await page.evaluate(() => {
  161 |       return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  162 |     });
  163 |     expect(hasOverflow).toBe(false);
  164 |   });
  165 | 
  166 |   test('8. Flujo de exportación de datos y diagnóstico en Configuración', async ({ page, isMobile }) => {
  167 |     await navigateToTab(page, isMobile, 'configuracion');
  168 |     await expect(page.locator('h1:has-text("Configuración del Sistema")')).toBeVisible();
  169 | 
  170 |     // Verify export buttons exist
  171 |     const jsonBtn = page.locator('button:has-text("Descargar JSON")');
  172 |     await expect(jsonBtn).toBeVisible();
  173 | 
  174 |     const csvBtn = page.locator('button:has-text("Descargar CSV")');
  175 |     await expect(csvBtn).toBeVisible();
  176 | 
  177 |     // Trigger JSON download listener
  178 |     const downloadPromise = page.waitForEvent('download', { timeout: 4000 }).catch(() => null);
  179 |     await jsonBtn.click();
  180 |     const download = await downloadPromise;
  181 |     if (download) {
  182 |       expect(download.suggestedFilename()).toContain('.json');
  183 |     }
  184 |   });
  185 | 
  186 |   test('9. Flujo de doble confirmación para eliminación de cuenta', async ({ page, isMobile }) => {
  187 |     await navigateToTab(page, isMobile, 'configuracion');
  188 | 
  189 |     // Click on initial delete account button in danger zone
  190 |     const openDeleteModalBtn = page.locator('button:has-text("Eliminar Cuenta")');
  191 |     await expect(openDeleteModalBtn).toBeVisible();
  192 |     await openDeleteModalBtn.click();
  193 | 
  194 |     // Verify Step 1 modal is shown
  195 |     await expect(page.locator('text=¿Eliminar tu cuenta por completo?')).toBeVisible();
  196 | 
  197 |     // Proceed to Step 2
  198 |     const step2Btn = page.locator('button:has-text("Continuar al Paso 2 →")');
  199 |     await expect(step2Btn).toBeVisible();
  200 |     await step2Btn.click();
  201 | 
  202 |     // Verify Step 2 modal and disabled submit button
  203 |     await expect(page.locator('text=Confirmación Definitiva')).toBeVisible();
  204 |     const finalDeleteBtn = page.locator('button:has-text("Eliminar Definitivamente")');
```