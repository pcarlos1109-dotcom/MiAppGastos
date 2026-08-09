# Prompt para generar "Libro de Cuentas" como app nativa de Android

> Copia todo el contenido de abajo y pégalo en el asistente de IA de Android Studio (Gemini), en Claude Code, o en cualquier otro asistente de código conectado a tu proyecto. Está escrito para que la IA genere el proyecto completo de una sola vez.

---

## PROMPT (copiar desde aquí)

Quiero que generes un proyecto completo de Android Studio, nativo, en **Kotlin + Jetpack Compose**, para una app de finanzas personales llamada **"Libro de Cuentas"**. Es un rediseño nativo de una app web que ya existe (React), así que replica exactamente la lógica de negocio y las pantallas descritas abajo.

### Stack técnico requerido
- Kotlin, Jetpack Compose, Material 3.
- Persistencia local con **Room** (una base de datos, sin backend ni internet).
- Arquitectura MVVM: un `ViewModel` con `StateFlow` por cada entidad, inyectado con Hilt o construcción manual simple (lo que prefieras, prioriza simplicidad).
- Un único `Activity` con navegación por pestañas (`TabRow` de Compose), sin necesidad de Navigation Component.
- Formato de moneda en `es-MX`, 2 decimales, símbolo `$`.

### Modelo de datos (entidades Room)

```
Debt: id (UUID), name (String), total (Double), monthlyPayment (Double), paid (Double, default 0)

Expense (gasto fijo): id (UUID), category (enum: comida, transporte, vivienda, salud, entretenimiento, otros), amount (Double), date (String ISO "yyyy-MM-dd"), note (String?)

DailyExpense (gasto diario): id (UUID), amount (Double), date (String ISO), note (String?)

Saving (ahorro): id (UUID), name (String), type (enum: cuenta, efectivo), amount (Double)

Income (ingreso): id (UUID), source (enum: salario, freelance, negocio, inversiones, regalo, otros), amount (Double), date (String ISO), note (String?)

SavingsGoal (meta anual): valor único persistido (DataStore o tabla de una fila): amount (Double)
```

### Pantallas / pestañas (en este orden)

1. **Meta anual** (`MetaAhorroScreen`)
2. **Ingresos** (`IngresosScreen`)
3. **Deudas** (`DeudasScreen`)
4. **Gastos** (`GastosScreen`) — gastos fijos categorizados
5. **Gastos diarios** (`DiariosScreen`)
6. **Ahorros** (`AhorrosScreen`)

Arriba de las pestañas, en la pantalla principal, debe haber:

- **Banner destacado de "Disponible para gastar hoy"** (ver fórmula abajo). Si no hay meta anual fijada, el banner invita a fijarla en vez de mostrar el cálculo.
- **Grid de tarjetas resumen** (6 tarjetas, 2 columnas en móvil): Ingresos del mes, Deuda pendiente, Gastos fijos mensuales, Gastos diarios (hoy + total del mes), Total ahorrado, Patrimonio neto. Cada tarjeta es tocable y navega a su pestaña correspondiente (excepto Patrimonio neto).

### Funcionalidad por pantalla

**Deudas**: lista de deudas con barra de progreso (pagado / total), botón para registrar un abono parcial (input numérico + botón check), estado visual "PAGADO" cuando `paid >= total`. Formulario para agregar: nombre del acreedor, monto total, cuota mensual. Botón eliminar por fila.

**Gastos** (fijos): lista ordenada por fecha descendente, cada fila muestra categoría, fecha, nota opcional y monto. Formulario: selector de categoría, monto, fecha (date picker), nota opcional.

**Gastos diarios**: dos tarjetas arriba con "Gastado hoy" y "Este mes". Lista de registros (fecha, nota, monto). Formulario: monto, fecha, nota.

**Ahorros**: lista de cuentas bancarias o efectivo, cada una editable en línea (ícono lápiz abre input para actualizar el monto directamente, sin abrir formulario completo). Formulario para agregar: nombre, tipo (cuenta/efectivo), monto inicial.

**Ingresos**: igual patrón que Gastos diarios (tarjetas de "Este mes" y "Total registrado" arriba, lista abajo). Formulario: fuente (selector), monto, fecha, nota opcional. Los montos se muestran con signo `+`.

**Meta anual**: tarjeta con el monto de la meta (editable con ícono de lápiz), barra de progreso (ahorro acumulado del año / meta), y debajo un desglose línea por línea de cómo se calcula el presupuesto diario (ver fórmula). Incluye una nota aclaratoria de que el ahorro acumulado es una estimación.

### Lógica de negocio (fórmulas exactas a implementar)

```
mesActual = mes y año actuales ("yyyy-MM")
anoActual = año actual ("yyyy")
hoy = fecha de hoy ("yyyy-MM-dd")

totalDeudaPendiente = suma de max(0, total - paid) de todas las deudas
gastoMes = suma de amount de Expense donde date empieza con mesActual
totalAhorrado = suma de amount de todas las Saving
patrimonioNeto = totalAhorrado - totalDeudaPendiente

ingresoMes = suma de amount de Income donde date empieza con mesActual
totalHoy = suma de amount de DailyExpense donde date == hoy
totalDiariosMes = suma de amount de DailyExpense donde date empieza con mesActual

// --- Meta anual y presupuesto diario ---
ingresosAno = suma de Income del año actual (date empieza con anoActual)
gastosFijosAno = suma de Expense del año actual
gastosDiariosAno = suma de DailyExpense del año actual
ahorroAcumuladoAno = ingresosAno - gastosFijosAno - gastosDiariosAno

metaRestante = max(0, savingsGoal - ahorroAcumuladoAno)
diasRestantesAno = días entre hoy y el 31 de diciembre del año actual (inclusive), mínimo 1
ahorroDiarioObjetivo = si savingsGoal > 0: metaRestante / diasRestantesAno, si no: 0

diasEnMesActual = número de días del mes actual
cuotaDeudaMensual = suma de monthlyPayment de deudas donde (total - paid) > 0
ingresoDiarioProm = ingresoMes / diasEnMesActual
gastosFijosDiarios = gastoMes / diasEnMesActual
cuotaDeudaDiaria = cuotaDeudaMensual / diasEnMesActual

presupuestoDiario = ingresoDiarioProm - gastosFijosDiarios - cuotaDeudaDiaria - ahorroDiarioObjetivo

metaCumplida = savingsGoal > 0 AND ahorroAcumuladoAno >= savingsGoal
```

Si `presupuestoDiario` es negativo, el banner debe mostrarse en un color de alerta (tono rojizo/burdeos) en vez del color normal (teal).

### Estilo visual (diseño tipo "cuaderno de cuentas")

Paleta de colores (usar como `Color` en el theme de Compose):

```
paper       = #EAF1F8   (fondo general)
paperDark   = #DCE7F2   (fondo de formularios)
ink         = #132C4D   (texto principal)
inkSoft     = #4F6E8F   (texto secundario)
burgundy    = #1B4B87   (alertas / deuda)
burgundySoft= #BFD3EA
teal        = #1D7DA8   (positivo / gastos)
tealSoft    = #B8E1EE
gold        = #3F6FA8   (ahorro)
goldSoft    = #CBDCEF
line        = #C2D3E3   (bordes)
```

Tipografía: usar Google Fonts vía `downloadable fonts` o incluidas como recursos: **Fraunces** (serif, para el título "Libro de Cuentas" y encabezados), **IBM Plex Mono** (para todos los montos en dinero), **Inter** (texto general del cuerpo).

Las filas de listas ("ledger rows") deben llevar un acento visual: una barra vertical delgada de color azul/rojizo semitransparente pegada al borde izquierdo de cada fila, evocando el margen rojo de un libro contable de papel. Tarjetas con esquinas redondeadas, fondo blanco, borde sutil de 1dp con el color `line`.

### Persistencia

Todo se guarda localmente con Room (o DataStore para la meta anual, que es un solo valor). No requiere backend, cuenta de usuario ni conexión a internet. Los datos deben sobrevivir a cerrar y reabrir la app.

### Entregable esperado

Genera la estructura completa del proyecto: `build.gradle.kts`, entidades y DAOs de Room, `AppDatabase`, ViewModels, Composables de cada pantalla, el `MainActivity`, y el `Theme.kt` con la paleta de colores y tipografías indicadas. Prioriza que compile y corra sin errores sobre agregar funcionalidades extra no pedidas.

## FIN DEL PROMPT (copiar hasta aquí)

---

### Cómo usarlo

1. Abre Android Studio → **File → New → New Project → Empty Activity (Compose)**.
2. Nómbralo, por ejemplo, `LibroDeCuentas`.
3. Abre el panel de **Gemini** (icono en la barra lateral derecha) o tu asistente de código preferido dentro del IDE.
4. Pega el prompt completo de arriba (desde "PROMPT" hasta "FIN DEL PROMPT") y envíalo.
5. Revisa los archivos que genera, corrige el `build.gradle` si falta alguna dependencia (Room, Compose Material 3), y dale **Run**.

Si el asistente que uses no tiene acceso directo a modificar archivos del proyecto (por ejemplo, si usas un chat externo en vez del panel integrado), pídele que te entregue el código archivo por archivo y ve creándolos manualmente en Android Studio.
