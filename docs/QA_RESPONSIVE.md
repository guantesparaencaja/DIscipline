# Auditoría Responsive y de Botones · Sayayin Radar

**Fecha de Ejecución:** Octubre 2026  
**Perfiles Auditados:** 
- Mobile Compact (360px)
- Mobile Standard (390px - iPhone 14)
- Mobile Large / Android (412px - Pixel 7)
- Celular Horizontal / Landscape (844×390 px / 915×412 px)
- Tablet (768px - iPad / Galaxy Tab)
- Desktop Compact (1024px)
- Desktop Wide (1440px)

---

## 1. Resumen de Reglas y Criterios Verificados

| Regla | Criterio de Aceptación | Estado Global |
|---|---|---|
| **Scroll Horizontal** | Cero scroll horizontal en el documento (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`). | OK |
| **Touch Targets** | Controles interactivos con tamaño mínimo de 44×44 px en móviles (`min-h-[44px]` / `min-w-[44px]`). | OK |
| **Tipografía Mínima** | Texto legible de al menos 12 px (`text-xs`), badges secundarios con alto contraste. | OK |
| **Modales Bottom Sheet** | En pantallas móviles actúan como bottom sheet (`items-end`, `rounded-t-3xl`, `max-h-[90dvh]`, contenido scrollable con botones fijos/sticky al pie). | OK |
| **Tablas y Gráficos** | Contenedores con `overflow-x-auto` para visualización sin quiebre de layout en pantallas estrechas. | OK |
| **Teclado del Celular** | Modales con scroll interno independiente (`overflow-y-auto`) para que los inputs no queden tapados por teclado virtual. | OK |
| **MobileNav** | Barra inferior fija que no obstruye el contenido gracias a `pb-28 md:pb-8` en `<main>`, con acceso a las 12+ secciones vía cajón "Más". | OK |
| **Orden de Tarjetas en Dashboard** | Apilado en una columna móvil con el orden exacto: 1. Objetivos del día, 2. Transformación y XP, 3. Fondo disponible, 4. Racha. | OK |
| **Estados de Botones** | Cada botón cuenta con acción real, estado disabled cuando aplica, foco visible (`focus-visible:ring-2`), aria-label en botones de solo icono. | OK |

---

## 2. Matriz Detallada de Auditoría: Pantallas y Controles

| Pantalla | Botón / Control | Qué Hace | Resultado Esperado | Estado |
|---|---|---|---|---|
| **Dashboard** | Botón "+ Agregar Objetivo" | Abre el modal de creación de objetivos. | Despliega `ObjectiveModal` como bottom sheet en móvil con foco accesible. | OK |
| **Dashboard** | Checkbox completar objetivo | Marca el objetivo como completado y suma XP. | Incrementa XP, actualiza barra de nivel, guarda en cola offline si no hay red. | OK |
| **Dashboard** | Botón de desglose de poder | Abre `PowerBreakdownModal`. | Muestra desglose de 6 poderes de combate y requisitos de ki. | OK |
| **Dashboard** | Selector de días (WeeklyCalendarStrip) | Cambia el día activo en el radar. | Carga los objetivos y hábitos correspondientes a la fecha seleccionada. | OK |
| **Dashboard** | Botón "+ Registrar Gasto" (Finanzas Card) | Abre `ExpenseModal`. | Permite registrar gasto o aporte a meta con cálculo instantáneo. | OK |
| **Dashboard** | Botón "Ver Finanzas Completas" | Navega al módulo de Finanzas. | Cambia pestaña activa a `finanzas` sin recarga de página. | OK |
| **Dashboard** | Botón "Gestionar Hábitos" | Navega a la vista de Hábitos. | Cambia pestaña activa a `habitos`. | OK |
| **Dashboard** | Checkbox de hábito diario | Alterna estado del hábito para hoy. | Actualiza racha, persiste estado en Supabase o cola IndexedDB. | OK |
| **Dashboard** | Escalera de Miedos ("+ Nuevo Miedo") | Abre modal de exposición a miedos. | Despliega `FearModal` con plantillas predefinidas y niveles. | OK |
| **Finanzas** | Botón "+ Registrar Movimiento" | Abre `ExpenseModal`. | Bottom sheet con teclado numérico optimizado (`inputMode="numeric"`). | OK |
| **Finanzas** | Filtros de tipo (Todos / Gastos / Ahorros) | Filtra la tabla de movimientos. | Actualiza lista de gastos sin scroll horizontal. | OK |
| **Finanzas** | Selector de categorías | Filtra movimientos por categoría específica. | Refleja cambios inmediatamente en la tabla. | OK |
| **Finanzas** | Botón Eliminar Gasto (Icono papelera) | Elimina un registro de gasto. | Botón accesible con `aria-label="Eliminar gasto"`, elimina y recalcula fondo. | OK |
| **Finanzas** | Tabla de Movimientos | Lista todos los gastos y ahorros. | Contenedor con `overflow-x-auto` para evitar desbordes en 360-390px. | OK |
| **Finanzas** | Formulario Presupuesto Mensual | Guarda ingreso base y fondo de emergencia. | Valida números > 0; muestra toast si hay error o éxito. | OK |
| **Finanzas** | Botón "+ Añadir Deducción" | Registra deducción fija mensual. | Valida campos requeridos y recalcula el fondo disponible. | OK |
| **Finanzas** | Botón Eliminar Deducción | Borra deducción fija. | `aria-label="Eliminar deducción fija"` con foco visible. | OK |
| **Objetivos** | Botón "+ Nuevo Objetivo" | Despliega `ObjectiveModal`. | Altura 90dvh en móvil, sticky buttons fijos abajo. | OK |
| **Objetivos** | Pestañas de Franja (Mañana/Tarde/Noche) | Filtra objetivos por bloque horario. | Actualiza la lista en vivo; touch target mínimo 44px. | OK |
| **Objetivos** | Checkbox de estado en cada objetivo | Alterna pendiente/completado. | Confetti en logros, suma XP inmediata y sync background. | OK |
| **Objetivos** | Botón Eliminar Objetivo | Elimina objetivo de la lista. | `aria-label="Eliminar objetivo"`, borra de store y DB. | OK |
| **Metas** | Botón "+ Crear Meta" | Abre `GoalModal`. | Bottom sheet con cálculo de ritmo diario/semanal/mensual. | OK |
| **Metas** | Botón "Añadir Objetivo a esta meta" | Abre `ObjectiveModal` con meta vinculada. | Precarga meta en el selector del objetivo. | OK |
| **Metas** | Botón Eliminar Meta | Elimina meta creada. | `aria-label="Eliminar meta Saiyajin"`, confirmación accesible. | OK |
| **Planes** | Botón "+ Nuevo Plan Táctico" | Abre creador de planes tácticos. | Genera fases y tareas accionables. | OK |
| **Planes** | Checkbox de Tarea de Plan | Marca tarea de fase como lista. | Calcula porcentaje de avance del plan táctico. | OK |
| **Acciones** | Botón "+ Acción Rápida" | Crea micro-acción de 2 minutos. | Registra acción inmediata para vencer procrastinación. | OK |
| **Acciones** | Checkbox de micro-acción | Completa la acción de 2 min. | Otorga micro-XP y registra en historial. | OK |
| **Recompensas** | Botón "Canjear Recompensa" | Canjea premio personal usando Ki. | Valida si el usuario tiene XP suficiente; descuenta XP gastable. | OK |
| **Recompensas** | Botón "+ Nueva Recompensa" | Crea recompensa personalizada. | Define nombre y costo de XP. | OK |
| **Miedos** | Botón "+ Registrar Miedo" | Abre `FearModal` con escalera. | Permite crear escalera progresiva de 5 niveles de exposición. | OK |
| **Miedos** | Botones de Plantillas de Combate | Carga plantilla de miedo predefinida. | Autocompleta título, categoría y 5 escalones. | OK |
| **Miedos** | Botón "Superar Nivel" | Marca escalón de exposición cumplido. | Suma Valentía, otorga XP y desbloquea siguiente escalón. | OK |
| **Miedos** | Botón "+ Agregar Nivel" | Añade nuevo escalón a la escalera. | `min-h-[44px]`, agrega fila con puntuación de valentía. | OK |
| **Compañero** | Botón "Copiar Código" | Copia código único de invitación. | Usa `navigator.clipboard`, muestra toast de confirmación. | OK |
| **Compañero** | Botón "Compartir en WhatsApp" | Invita compañero vía link/texto. | Usa Web Share API o copia al portapapeles sin `window.open`. | OK |
| **Compañero** | Input y Botón "Vincular" | Conecta con código de otro usuario. | Valida código, suscribe a canal en vivo de Supabase. | OK |
| **Compañero** | Botón "Desvincular Compañero" | Corta vínculo de entrenamiento. | Modal de confirmación accesible con botón cancelar y confirmar. | OK |
| **Logros** | Pestañas (Todos / Obtenidos / Bloqueados) | Filtra catálogo de logros. | Pestañas accesibles con navegación táctil fluida. | OK |
| **Estadísticas** | Gráfico de Torta (Distribución) | Muestra proporción de ingresos/gastos. | Contenedor con `overflow-x-auto`, tooltip táctil. | OK |
| **Estadísticas** | Gráfico de Barras (Franjas horarias) | Muestra completados vs totales por turno. | Contenedor con `overflow-x-auto`, sin corte en móvil. | OK |
| **Calendario** | Botones Mes Anterior / Siguiente | Navega entre meses del año. | Botones de 44×44 px con aria-labels `Mes anterior` y `Mes siguiente`. | OK |
| **Calendario** | Celdas de días del mes | Selecciona fecha para inspección. | Muestra cantidad de objetivos programados y tasa de éxito. | OK |
| **Configuración** | Switch Recordatorio Mañana/Tarde/Noche | Activa/desactiva recordatorios por franja. | Guarda en localStorage y programa evaluación periódica. | OK |
| **Configuración** | Input Hora Personalizada | Permite ajustar hora exacta de aviso. | Input tipo `time` compatible con teclado nativo. | OK |
| **Configuración** | Switch Resumen Nocturno | Activa recordatorio de balance del día. | Envía notificación "Hoy completaste X de Y objetivos". | OK |
| **Configuración** | Botón "Enviar Notificación de Prueba" | Dispara notificación inmediata. | Solicita permiso si no está otorgado; prueba Web Push local. | OK |
| **Configuración** | Botón "Instalar App" (PWAInstallButton) | Invoca prompt PWA o guía iPhone. | Android: `beforeinstallprompt`. iOS: Guía modal añadir a inicio. | OK |
| **Configuración** | Botón "Sincronizar Cola Offline" | Dispara sincronización forzada. | Procesa cola IndexedDB, envía a Supabase y notifica toast. | OK |
| **Navbar** | Logo Sayayin Radar | Abre desglose de poder. | Touch target amplio con animación de ki. | OK |
| **Navbar** | Botón Entrar / Perfil | Abre `AuthModal`. | Permite login, registro y logout con Supabase. | OK |
| **Navbar** | Botón Notificaciones (Campana) | Abre dropdown de eventos de Ki. | Badge con indicador visual de actividad reciente. | OK |
| **Navbar** | Botón Conectar Google | Conecta Calendar y Tasks. | Botón con estado loading disabled durante sincronización. | OK |
| **MobileNav** | Botones Inicio, Finanzas, Objetivos, Metas | Navegación directa de 1 toque. | Mínimo 48×56 px con foco visible y aria-labels claros. | OK |
| **MobileNav** | Botón "Más" | Abre cajón inferior con las 10 secciones restantes. | Modal bottom sheet con scroll que da acceso total a las 14 secciones. | OK |
| **OfflineIndicator** | Indicador "Sin conexión · N pendientes" | Informa estado de red y cola local. | Banner flotante superior con animación ping ámbar y sync manual. | OK |

---

## 3. Auditoría de Modales como Bottom Sheet en Móvil

| Modal | Vista Móvil (<640px) | Altura Máx | Scroll Interno | Botones Fijos Abajo | Validación en Pantalla | Estado |
|---|---|---|---|---|---|---|
| **ObjectiveModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`sticky bottom-0`) | Banner de error integrado | OK |
| **GoalModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`sticky bottom-0`) | Banner de error integrado | OK |
| **ExpenseModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`sticky bottom-0`) | Banner de error integrado | OK |
| **FearModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`sticky bottom-0`) | Banner de error integrado | OK |
| **HabitModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`sticky bottom-0`) | Inputs nativos accesibles | OK |
| **AuthModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (`w-full py-3`) | Banner de error/feedback | OK |
| **PowerBreakdownModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (Header/Footer fijos) | Lectura clara de fórmulas | OK |
| **NivelHistorialModal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí (Cierre sticky) | Historial cronológico | OK |
| **iOS PWA Guide Modal** | Bottom Sheet (`items-end`, `rounded-t-3xl`) | `90dvh` | Sí (`overflow-y-auto`) | Sí | Paso 1 y Paso 2 visuales | OK |

---

## 4. Pruebas Automatizadas con Playwright

Las pruebas están configuradas en `playwright.config.ts` y se ejecutan sobre los 3 perfiles requeridos:
1. **Chromium Desktop** (1440×900 px)
2. **Pixel 7** (412×915 px - Android Mobile)
3. **iPhone 14** (390×844 px - iOS Mobile)

Flujos validados en cada perfil:
- Cero desbordamiento horizontal (`scrollWidth <= clientWidth`).
- Apertura del modal de autenticación / registro.
- Creación de meta con cálculo de ritmo.
- Creación de objetivo diario con asignación de franja horaria.
- Completar objetivo en el radar y verificación de aumento de ki.
- Registro de gasto real en pesos colombianos.
- Acceso al módulo de compañero e interacción con código de enlace.

**Resultado de la Auditoría:** Aprobado al 100% sin observaciones pendientes.
