# Historia de SAN

Este directorio conserva los artefactos reales de las etapas previas a la
versión actual del proyecto (React + Vite + Electron + Capacitor, ver
[BUILD.md](../../BUILD.md)). No es código que se compile ni se mantenga:
es documentación de cómo se llegó hasta aquí, por si en el futuro es útil
recordar una decisión o retomar una idea descartada.

Las fechas de los archivos son anteriores a la creación de este repositorio
git (primer commit: 2026-07-09) — todo lo de aquí es trabajo previo al
`git init`, hecho entre el 23 y el 24 de junio de 2026.

## Línea de tiempo

### 1. Prototipo HTML de un solo archivo — [`01-prototipo-html/`](01-prototipo-html/)

La primera solución real, tal como se describe en el
[README](../../README.md#por-qué-nació-san): una sola página HTML con
React y Babel cargados desde CDN (`unpkg`, `cdn.tailwindcss.com`), pensada
para abrirse directamente en un navegador sin instalación ni build.

- **`SAN.html`** — versión inicial, título "Sistema de Notas - Ciudadela
  Desepaz" (el nombre del colegio para el que se hizo originalmente).
- **`SAN1.html`** — segunda iteración del mismo archivo, con
  optimizaciones de renderizado (`useCallback`/`useMemo`).

Esta versión funcionaba bien en el navegador, pero tenía limitaciones de
compatibilidad entre dispositivos y no se podía instalar como app — el
motivo original para buscar algo más.

### 2. Intento de empaquetado como app de escritorio — [`02-intento-electron/`](02-intento-electron/)

Primer intento de convertir el HTML en un ejecutable de Windows,
envolviendo el prototipo en una ventana de Electron sin ningún paso de
build intermedio.

- **`main.js`** — proceso principal de Electron: crea una `BrowserWindow`
  y carga `SAN.html` directamente con `loadFile`.
- **`SAN.html`** — la misma página, ajustada para ejecutarse desde
  `file://` en vez de un navegador (sin `crossorigin` en los `<script>`,
  versión de Babel fijada a `7.21.4` para evitar que su runtime
  automático inyectara `import`s incompatibles con `file://`).

Este intento nunca llegó a un build final — quedó como prueba de
concepto antes de explorar Capacitor para Android.

### 3. Intento de build automatizado con Capacitor — [`03-intento-capacitor-automatizado/`](03-intento-capacitor-automatizado/)

Un paquete más elaborado ("SAN_APK_LISTO"), pensado para que generar el
APK fuera un solo comando en Linux, sin tocar código:

```bash
./construir-apk.sh
```

El script (ver `README_PRIMERO.txt`) detectaba Java 21 y el Android SDK,
convertía las dependencias CDN del HTML en archivos locales
(`scripts/preparar-web.cjs`), generaba el CSS de Tailwind, sincronizaba
el proyecto Android con Capacitor y corría Gradle.

- **`original/index.html`** — copia intacta del HTML entregado en esta
  etapa (misma familia que el de `02-intento-electron/`).
- **`src/index.html`** + **`src/tailwind.input.css`** — versión preparada
  para funcionar sin CDN, con las dependencias vendored localmente
  (fuentes, React, Babel) para que la app Android no dependiera de
  internet.
- **`scripts/preparar-web.cjs`** — script que hacía esa conversión de CDN
  a archivos locales automáticamente.
- **`construir-apk.sh`**, **`instalar-en-celular.sh`**,
  **`abrir-android-studio.sh`** — automatización del build, instalación
  por USB y apertura del proyecto en Android Studio.
- **`capacitor.config.json`**, **`tailwind.config.cjs`**, **`package.json`**
  — configuración del paquete.

Este enfoque sí llegó a generar un APK funcional, pero el proyecto vivía
fuera de un flujo de desarrollo normal (sin componentes, sin control de
versiones del código fuente real, con las dependencias vendored a mano).
Por eso el siguiente paso fue migrar todo a una estructura de proyecto
estándar con Vite, lo cual se puede ver en el commit
`2e16754 — refactor: migrate project structure to Capacitor and integrate
Vite build system`, el punto donde nace el código que hoy vive en
[`src/`](../../src/) y se compila según [BUILD.md](../../BUILD.md).

> Nota: se excluyeron de este archivo los artefactos puramente
> reproducibles del intento 3 (`node_modules/`, el proyecto `android/`
> compilado, `.idea/`, `www/` de salida) — no aportaban nada que no se
> pueda regenerar, y sumaban más de 80 MB sin valor de documentación.
