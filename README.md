# ⚔️ Sayayin Financial & Habit Radar

> **Sistema RPG de Alto Rendimiento y Soberanía Financiera Inspirado en Dragon Ball.**
> Transforma el control de gastos en Colombia (COP), la creación de hábitos y la conquista de metas diarias en un entrenamiento Saiyajin de nivel dios.

---

## ⚡ Características Principales

1. **Dashboard Táctico & Transformaciones Saiyajin**:
   - 9 Transformaciones canónicas: *Base, Ōzaru, Super Saiyajin, SSJ2, SSJ3, SSJ Dios, SSJ Blue, Ultra Instinto Señal y Ultra Instinto Dominado*.
   - Medidor de **Ki Total** compuesto por 4 pilares: Ki Base, Ki de Evolución, Ki Financiero y Ki de Hábitos.

2. **Finanzas de Guerrero (100% en Pesos Colombianos - COP)**:
   - Metodología **50/30/20 Adaptativa**: Necesidades Básicas, Inversiones/Metas y Gastos Flexibles.
   - Deducciones fijas automáticas (arriendo, servicios, internet, gimnasio).
   - Presupuestos por categoría y cálculo en tiempo real de holgura financiera diaria.

3. **Disciplinas Diarias con Franja Horaria**:
   - Mañana (05:00 - 12:00), Tarde (12:00 - 18:00), Noche (18:00 - 23:00) y Horas Personalizadas.
   - 4 Niveles de dificultad con recompensas progresivas de Ki (+10, +20, +40, +75 XP).
   - Modo deshacer compensatorio que preserva la racha legítima ante correcciones.

4. **Escalera de Exposición y Dominio Mental (Miedos)**:
   - Superación progresiva de bloqueos de escasez, inversión, deuda o juicio social.
   - Escaleras desensibilizadoras de 3 a 10 peldaños con Puntos de Valentía y medallas.

5. **Modo Compañero de Entrenamiento (Realtime)**:
   - Conexión simbiótica bidireccional mediante Códigos de Invitación únicos (`SAYAYIN-XXXXXX`).
   - Radar de Ki compartido con visualización en vivo de nivel, racha, medallas y disciplinas públicas.
   - Privacidad estricta: los gastos, montos de metas y finanzas personales son 100% invisibles para el compañero.

6. **Soberanía y Seguridad de Datos**:
   - **Row Level Security (RLS)** estricto en PostgreSQL/Supabase.
   - Validación integral con **Zod** y sanitización anti-XSS previa a la inserción en base de datos.
   - Exportación de datos en **JSON** completo y **CSV** contable.
   - Eliminación de cuenta con **doble confirmación** obligatoria.

7. **Soporte Offline & PWA**:
   - Instalable en Android (Chrome/Edge) y iPhone/iPad (Safari Add to Home Screen).
   - Service Worker y almacenamiento reactivo con cola de sincronización automática al recuperar conexión.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18+ o Bun 1.0+
- Gestor de paquetes: `npm` o `bun`

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/tu-usuario/sayayin-financial-radar.git
cd sayayin-financial-radar
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Variables requeridas:
```env
# URL y clave anónima pública de tu proyecto Supabase (opcional para modo nube)
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key-de-supabase"
```
*Nota: Si no se configuran credenciales de Supabase, la app funciona de forma 100% autónoma en modo local mediante IndexedDB / LocalStorage persistente con motor de sincronización offline.*

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### 4. Compilación para Producción
```bash
npm run build
```

---

## 🗄️ Esquema de Base de Datos y Seguridad (SQL)

El proyecto incluye scripts SQL modulares listos para ejecutar en el Editor SQL de Supabase:

1. **`001_schema_fase1.sql`**: Esquema base, tablas `profiles`, `connections`, `financial_settings`, `fixed_deductions`, `goals`, `daily_objectives`, `xp_events`, triggers de racha, funciones RPC (`join_by_code`, `disconnect_partner`) y políticas **Row Level Security (RLS)**.
2. **`002_schema_habits.sql`**: Módulo de hábitos recurrentes (`habits`, `habit_logs`) con RLS.
3. **`003_schema_fears.sql`**: Módulo de miedos y escalones de exposición (`fears`, `fear_steps`) con RLS.
4. **`004_schema_actions_rewards_budgets.sql`**: Acciones tácticas, recompensas personales canjeables con Ki y presupuestos por categoría.

### 🛡️ Matriz de Permisos Row Level Security (RLS)

| Tabla | Dueño (`auth.uid() = user_id`) | Compañero Conectado | Usuario Desconocido |
| :--- | :---: | :---: | :---: |
| `profiles` | Lectura / Escritura | Solo Lectura | Bloqueado |
| `connections` | Gestión de su vínculo | Gestión de su vínculo | Bloqueado |
| `expenses` | **Lectura / Escritura** | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `goals` | **Lectura / Escritura** | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `financial_settings` | **Lectura / Escritura** | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `fixed_deductions` | **Lectura / Escritura** | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `xp_events` | **Lectura / Escritura** | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `daily_objectives` | Lectura / Escritura | **Solo `is_partner_visible = TRUE`** | ❌ **BLOQUEADO** |
| `user_achievements` | Lectura / Escritura | **Solo Lectura** | ❌ **BLOQUEADO** |
| `habits` | Lectura / Escritura | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| `fears` | Lectura / Escritura | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |

---

## 🧪 Pruebas de Seguridad y Calidad

### Pruebas de RLS en SQL
Ejecuta el script de prueba automatizado en Supabase SQL Editor:
```sql
-- Archivo: scripts/test-rls.sql
-- Ejecuta un bloque DO plpgsql que simula 3 usuarios y valida que el compañero no puede leer finanzas ajenas
```

O corre el verificador TypeScript:
```bash
npx tsx scripts/test-rls.ts
```

### Pruebas End-to-End (Playwright)
```bash
npx playwright test
```

### Verificación de Sintaxis y Tipos
```bash
npm run lint
```

---

## 📱 Instalación PWA en Dispositivos Móviles

### Android (Google Chrome & Edge)
1. Ingresa a la URL de la app desplegada.
2. Presiona el botón flotante o el banner de **Instalar Sayayin Radar**.
3. O abre el menú de tres puntos de Chrome y pulsa **"Instalar aplicación"**.

### iPhone / iPad (Safari)
1. Ingresa a la URL en Safari.
2. Toca el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Selecciona **"Añadir a pantalla de inicio"** (Add to Home Screen).
4. La aplicación se abrirá en modo nativo a pantalla completa sin barras de navegación.

---

## ☁️ Despliegue en Vercel

El proyecto incluye configuración nativa en `vercel.json` con:
- Rewrite SPA para enrutamiento del lado del cliente.
- Encabezados de caché optimizados para el Service Worker (`sw.js`) y `manifest.json`.
- Encabezados de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

Para desplegar:
```bash
npm install -g vercel
vercel
```
Configura en Vercel Dashboard las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

---

## 📜 Licencia
Este proyecto es software de libre desarrollo bajo licencia MIT. Desarrollado con disciplina espartana y espíritu Saiyajin.
