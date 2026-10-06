# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sayayin-audit.spec.ts >> Auditoría Integral y Responsive · Sayayin Radar >> 6. Flujo de registrar gasto real
- Location: e2e/sayayin-audit.spec.ts:123:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Proteína Saiyajin 8630')
Expected: visible
Error: strict mode violation: locator('text=Proteína Saiyajin 8630') resolved to 2 elements:
    1) <p class="font-bold text-white leading-tight">Proteína Saiyajin 8630</p> aka getByText('Proteína Saiyajin 8630', { exact: true })
    2) <p class="text-[11px] text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">Proteína Saiyajin 8630: $ 35.000</p> aka getByText('Proteína Saiyajin 8630: $')

Call log:
  - Expect "toBeVisible" locator('text=Proteína Saiyajin 8630') with timeout 5000ms
  - waiting for locator('text=Proteína Saiyajin 8630')

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
            - generic [ref=e41]: "5"
            - generic [ref=e43]:
              - generic [ref=e44]: Nivel 5
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
          - button "Objetivos Diarios 1" [ref=e79]:
            - generic [ref=e80]: Objetivos Diarios
            - generic [ref=e85]: "1"
          - button "Metas 1" [ref=e87]:
            - generic [ref=e88]: Metas
            - generic [ref=e94]: "1"
          - button "Planes" [ref=e96]
          - button "Acciones Rápidas" [ref=e102]
          - button "Recompensas 1970 XP" [ref=e107]:
            - generic [ref=e108]: Recompensas
            - generic [ref=e114]: 1970 XP
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
              - text: Gestión Financiera
              - heading "Radar de Finanzas Personales" [level=1] [ref=e173]
              - paragraph [ref=e177]: "Moneda oficial: Pesos Colombianos (COP). Cada movimiento actualiza tu Fondo Disponible en tiempo real."
            - generic [ref=e178]:
              - button "Editar Ingreso & Deducciones" [ref=e179]
              - button "Registrar Movimiento" [ref=e184]
          - generic [ref=e188]:
            - generic [ref=e189]:
              - generic [ref=e190]: Fondo Disponible Real
              - generic [ref=e191]: "-$ 280.000"
              - generic [ref=e192]: Ingreso − Deducciones − Gastos
            - generic [ref=e193]:
              - generic [ref=e194]: Ingreso Base Mensual
              - generic [ref=e195]: $ 1.250.000
              - generic [ref=e196]: Configurado por usuario
            - generic [ref=e197]:
              - generic [ref=e198]: Deducciones Fijas (5)
              - generic [ref=e199]: $ 1.250.000
              - generic [ref=e200]: Arriendo, diezmo, traje, salidas, fondo
            - generic [ref=e201]:
              - generic [ref=e202]: Gastos Registrados
              - generic [ref=e203]: $ 280.000
              - generic [ref=e204]: 3 movimientos
          - generic [ref=e205]:
            - generic [ref=e206]:
              - heading "Deducciones Fijas Comprometidas" [level=3] [ref=e207]
              - generic [ref=e210]:
                - text: "Total comprometido:"
                - strong [ref=e211]: $ 1.250.000
            - generic [ref=e212]:
              - generic [ref=e213]:
                - generic [ref=e214]:
                  - generic [ref=e215]: Espiritual
                  - generic [ref=e216]: Día 1
                - heading "Diezmo / Donación" [level=5] [ref=e217]
                - generic [ref=e218]: $ 125.000
              - generic [ref=e219]:
                - generic [ref=e220]:
                  - generic [ref=e221]: Vivienda
                  - generic [ref=e222]: Día 5
                - heading "Arriendo" [level=5] [ref=e223]
                - generic [ref=e224]: $ 600.000
              - generic [ref=e225]:
                - generic [ref=e226]:
                  - generic [ref=e227]: Vestimenta
                  - generic [ref=e228]: Día 10
                - heading "Traje de Entrenamiento / Ropa" [level=5] [ref=e229]
                - generic [ref=e230]: $ 200.000
              - generic [ref=e231]:
                - generic [ref=e232]:
                  - generic [ref=e233]: Ocio
                  - generic [ref=e234]: Día 15
                - heading "Salidas y Recreación" [level=5] [ref=e235]
                - generic [ref=e236]: $ 200.000
              - generic [ref=e237]:
                - generic [ref=e238]:
                  - generic [ref=e239]: Ahorro
                  - generic [ref=e240]: Día 20
                - heading "Fondo de Emergencia" [level=5] [ref=e241]
                - generic [ref=e242]: $ 125.000
          - generic [ref=e243]:
            - generic [ref=e244]:
              - generic [ref=e245]:
                - heading "Presupuesto Mensual por Categoría" [level=3] [ref=e246]
                - paragraph [ref=e250]:
                  - text: Control de límites con alerta temprana al
                  - strong [ref=e251]: 80%
                  - text: y alerta roja al
                  - strong [ref=e252]: 100%
                  - text: .
              - generic [ref=e253]: "Mes evaluado: octubre de 2026"
            - generic [ref=e254]:
              - generic [ref=e255]:
                - generic [ref=e256]:
                  - heading "Vivienda / Arriendo" [level=5] [ref=e259]
                  - generic [ref=e260]: Bajo control
                - generic [ref=e264]:
                  - generic [ref=e265]: 5% gastado
                  - generic [ref=e266]: "Restante: $ 615.000"
                - generic [ref=e268]:
                  - generic [ref=e269]:
                    - generic [ref=e270]: Gastado / Límite
                    - generic [ref=e271]: $ 35.000 / $ 650.000
                  - button "Límite" [ref=e272]
              - generic [ref=e276]:
                - generic [ref=e277]:
                  - heading "Alimentación / Mercado" [level=5] [ref=e280]
                  - generic [ref=e281]: Bajo control
                - generic [ref=e285]:
                  - generic [ref=e286]: 36% gastado
                  - generic [ref=e287]: "Restante: $ 255.000"
                - generic [ref=e289]:
                  - generic [ref=e290]:
                    - generic [ref=e291]: Gastado / Límite
                    - generic [ref=e292]: $ 145.000 / $ 400.000
                  - button "Límite" [ref=e293]
              - generic [ref=e297]:
                - generic [ref=e298]:
                  - heading "Transporte & Movilidad" [level=5] [ref=e301]
                  - generic [ref=e302]: Bajo control
                - generic [ref=e305]:
                  - generic [ref=e306]: 0% gastado
                  - generic [ref=e307]: "Restante: $ 150.000"
                - generic [ref=e309]:
                  - generic [ref=e310]:
                    - generic [ref=e311]: Gastado / Límite
                    - generic [ref=e312]: $ 0 / $ 150.000
                  - button "Límite" [ref=e313]
              - generic [ref=e317]:
                - generic [ref=e318]:
                  - heading "Salud & Bienestar" [level=5] [ref=e321]
                  - generic [ref=e322]: Bajo control
                - generic [ref=e325]:
                  - generic [ref=e326]: 0% gastado
                  - generic [ref=e327]: "Restante: $ 100.000"
                - generic [ref=e329]:
                  - generic [ref=e330]:
                    - generic [ref=e331]: Gastado / Límite
                    - generic [ref=e332]: $ 0 / $ 100.000
                  - button "Límite" [ref=e333]
              - generic [ref=e337]:
                - generic [ref=e338]:
                  - heading "Educación & Crecimiento" [level=5] [ref=e341]
                  - generic [ref=e342]: Bajo control
                - generic [ref=e345]:
                  - generic [ref=e346]: 0% gastado
                  - generic [ref=e347]: "Restante: $ 120.000"
                - generic [ref=e349]:
                  - generic [ref=e350]:
                    - generic [ref=e351]: Gastado / Límite
                    - generic [ref=e352]: $ 0 / $ 120.000
                  - button "Límite" [ref=e353]
              - generic [ref=e357]:
                - generic [ref=e358]:
                  - heading "Salidas & Ocio" [level=5] [ref=e361]
                  - generic [ref=e362]: Bajo control
                - generic [ref=e365]:
                  - generic [ref=e366]: 0% gastado
                  - generic [ref=e367]: "Restante: $ 150.000"
                - generic [ref=e369]:
                  - generic [ref=e370]:
                    - generic [ref=e371]: Gastado / Límite
                    - generic [ref=e372]: $ 0 / $ 150.000
                  - button "Límite" [ref=e373]
              - generic [ref=e377]:
                - generic [ref=e378]:
                  - heading "Vestimenta / Traje" [level=5] [ref=e381]
                  - generic [ref=e382]: Bajo control
                - generic [ref=e385]:
                  - generic [ref=e386]: 0% gastado
                  - generic [ref=e387]: "Restante: $ 120.000"
                - generic [ref=e389]:
                  - generic [ref=e390]:
                    - generic [ref=e391]: Gastado / Límite
                    - generic [ref=e392]: $ 0 / $ 120.000
                  - button "Límite" [ref=e393]
              - generic [ref=e397]:
                - generic [ref=e398]:
                  - heading "Ahorro para Metas" [level=5] [ref=e401]
                  - generic [ref=e402]: Bajo control
                - generic [ref=e405]:
                  - generic [ref=e406]: 0% gastado
                  - generic [ref=e407]: "Restante: $ 300.000"
                - generic [ref=e409]:
                  - generic [ref=e410]:
                    - generic [ref=e411]: Gastado / Límite
                    - generic [ref=e412]: $ 0 / $ 300.000
                  - button "Límite" [ref=e413]
              - generic [ref=e417]:
                - generic [ref=e418]:
                  - heading "Otros Imprevistos" [level=5] [ref=e421]
                  - generic [ref=e422]: Bajo control
                - generic [ref=e425]:
                  - generic [ref=e426]: 0% gastado
                  - generic [ref=e427]: "Restante: $ 80.000"
                - generic [ref=e429]:
                  - generic [ref=e430]:
                    - generic [ref=e431]: Gastado / Límite
                    - generic [ref=e432]: $ 0 / $ 80.000
                  - button "Límite" [ref=e433]
          - generic [ref=e437]:
            - generic [ref=e438]:
              - textbox "Buscar gasto o ahorro..." [ref=e443]
              - generic [ref=e444]:
                - generic [ref=e445]:
                  - button "Todos" [ref=e446]
                  - button "Gastos" [ref=e447]
                  - button "Ahorros" [ref=e448]
                - combobox [ref=e449]:
                  - option "Todas las categorías" [selected]
                  - option "Vivienda / Arriendo"
                  - option "Alimentación / Mercado"
                  - option "Transporte & Movilidad"
                  - option "Salud & Bienestar"
                  - option "Educación & Crecimiento"
                  - option "Salidas & Ocio"
                  - option "Vestimenta / Traje"
                  - option "Ahorro para Metas"
                  - option "Otros Imprevistos"
            - table [ref=e451]:
              - rowgroup [ref=e452]:
                - row [ref=e453]:
                  - columnheader "Descripción" [ref=e454]
                  - columnheader "Categoría" [ref=e455]
                  - columnheader "Método" [ref=e456]
                  - columnheader "Fecha" [ref=e457]
                  - columnheader "Monto" [ref=e458]
                  - columnheader "Acción" [ref=e459]
              - rowgroup [ref=e460]:
                - row [ref=e461]:
                  - cell [ref=e462]:
                    - paragraph [ref=e469]: Proteína Saiyajin 8630
                  - cell "Vivienda / Arriendo" [ref=e470]
                  - cell "tarjeta debito" [ref=e471]
                  - cell "3 de oct de 2026" [ref=e472]
                  - cell "−$ 35.000" [ref=e473]
                  - cell [ref=e474]:
                    - button "Eliminar gasto" [ref=e475]
                - row [ref=e479]:
                  - cell [ref=e480]:
                    - paragraph [ref=e487]: Mercado de la semana y proteínas
                  - cell "Alimentación / Mercado" [ref=e488]
                  - cell "tarjeta debito" [ref=e489]
                  - cell "3 de oct de 2026" [ref=e490]
                  - cell "−$ 145.000" [ref=e491]
                  - cell [ref=e492]:
                    - button "Eliminar gasto" [ref=e493]
                - row [ref=e497]:
                  - cell [ref=e498]:
                    - paragraph [ref=e505]: Aporte al Fondo de Emergencia
                  - cell "Ahorro para Metas" [ref=e506]
                  - cell "transferencia" [ref=e507]
                  - cell "3 de oct de 2026" [ref=e508]
                  - cell "+$ 100.000" [ref=e509]
                  - cell [ref=e510]:
                    - button "Eliminar gasto" [ref=e511]
    - generic:
      - generic [ref=e515]:
        - generic [ref=e523]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Poder Eléctrico (SSJ 2)!" [level=5] [ref=e524]'
          - paragraph [ref=e525]: Supera el límite y desata chispas de Super Sayayin 2 (Poder > 35). (+500 XP)
        - button [ref=e526]
      - generic [ref=e530]:
        - generic [ref=e535]:
          - heading "Gasto registrado" [level=5] [ref=e536]
          - paragraph [ref=e537]: "Proteína Saiyajin 8630: $ 35.000"
        - button [ref=e538]
      - generic [ref=e542]:
        - generic [ref=e547]:
          - 'heading "¡HAS ALCANZADO: SUPER SAYAYIN 2!" [level=5] [ref=e548]'
          - paragraph [ref=e549]: Chispas eléctricas y velocidad fulgurante. Tus ahorros y hábitos marchan al compás.
        - button [ref=e550]
      - generic [ref=e554]:
        - generic [ref=e562]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Mirar al Dragón a los Ojos!" [level=5] [ref=e563]'
          - paragraph [ref=e564]: Identifica y registra tu primer miedo financiero o bloqueo mental. (+100 XP)
        - button [ref=e565]
      - generic [ref=e569]:
        - generic [ref=e577]:
          - 'heading "🏆 ¡NUEVO LOGRO DESBLOQUEADO: Despertar Dorado (Super Sayayin)!" [level=5] [ref=e578]'
          - paragraph [ref=e579]: Desbloquea y alcanza el estado Super Sayayin (Poder > 20). (+300 XP)
        - button [ref=e580]
  - generic [aria-hidden] [ref=e584]: "0"
```

# Test source

```ts
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
> 140 |     await expect(page.locator(`text=${desc}`)).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
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
  205 |     await expect(finalDeleteBtn).toBeDisabled();
  206 | 
  207 |     // Type incorrect keyword -> still disabled
  208 |     const input = page.locator('input[placeholder="Escribe: ELIMINAR SAIYAJIN"]');
  209 |     await input.fill('no quiero');
  210 |     await expect(finalDeleteBtn).toBeDisabled();
  211 | 
  212 |     // Type exact required keyword -> now enabled!
  213 |     await input.fill('ELIMINAR SAIYAJIN');
  214 |     await expect(finalDeleteBtn).toBeEnabled();
  215 | 
  216 |     // Abort safely
  217 |     await page.locator('button:has-text("Abortar")').click();
  218 |     await expect(page.locator('text=Confirmación Definitiva')).not.toBeVisible();
  219 |   });
  220 | });
  221 | 
```