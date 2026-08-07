# Compilar SAN.exe y SAN.apk

Esta guía documenta cómo generar los dos artefactos distribuibles de la
app —el ejecutable de escritorio (`SAN.exe`, Electron) y el APK de Android
(`SAN.apk`, Capacitor)— y deja registrados los problemas reales que
aparecieron la primera vez que se compiló todo desde cero, para que la
próxima vez sea más rápido.

## Requisitos previos

- Node.js 18+ y npm
- Para `SAN.exe` en Linux: [Wine](https://www.winehq.org/) (permite que
  `electron-builder` empaquete un `.exe` de Windows sin tener Windows)
- Para `SAN.apk`: Android SDK (`ANDROID_HOME`/`ANDROID_SDK_ROOT`
  configurados, con el platform 35 instalado) y **JDK 21** — ver la nota
  de compatibilidad de JDK más abajo.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Branding

Los 3 archivos de marca (`icono.png`, `Logo.png`, `letters.png` en la raíz
del repo) ya se procesaron una vez y sus derivados quedaron commiteados:

- `resources/icon.png`, `resources/splash.png` — fuente para
  `@capacitor/assets` (íconos y splash de Android).
- `build/icon.png` — ícono para `electron-builder`.
- `public/favicon.png` — favicon de la app web.
- `src/assets/logo-icon.png`, `src/assets/wordmark.png` — usados dentro
  de la UI (header de `src/App.jsx`).

Si cambias el logo original, regenera todo con:

```bash
npx capacitor-assets generate --android
```

## 3. Build web (Vite)

```bash
npm run build
```

## 4. SAN.exe (Electron)

La configuración de `electron-builder` vive en el bloque `"build"` de
`package.json` (target `portable`, salida `release/SAN.exe`).

```bash
npx electron-builder --win
```

Esto descarga el binario de Electron para Windows y lo empaqueta con
Wine. El resultado queda en `release/SAN.exe`.

## 5. SAN.apk (Capacitor / Android)

### 5.1 Firma (una sola vez)

El repo **no incluye el keystore de firma** (queda fuera de git a
propósito). Si es la primera vez que compilas en esta máquina, genera
uno:

```bash
keytool -genkeypair -v \
  -keystore android/app/san-release-key.jks \
  -alias san \
  -keyalg RSA -keysize 2048 -validity 10000
```

Y crea `android/keystore.properties` (también fuera de git) con:

```properties
storeFile=san-release-key.jks
storePassword=<tu password>
keyAlias=san
keyPassword=<tu password>
```

`android/app/build.gradle` ya está preparado para leer este archivo y
firmar el `release` automáticamente si existe.

> ⚠️ Guarda el `.jks` y su password en un lugar seguro fuera del repo.
> Si los pierdes, no podrás publicar futuras actualizaciones de esta
> misma app — Android exige la misma firma para actualizar una app ya
> instalada.

### 5.2 Build

```bash
npx cap sync android
cd android
JAVA_HOME=<ruta a un JDK 21> ./gradlew assembleRelease
```

El APK firmado queda en
`android/app/build/outputs/apk/release/app-release.apk` — cópialo/
renómbralo a `release/SAN.apk` si quieres tenerlo junto al `.exe`.

## Problemas conocidos y cómo se resolvieron

Estos 4 errores aparecieron en cadena la primera vez que se compiló el
proyecto Android en este entorno. Ya están corregidos en el repo, pero
quedan documentados por si reaparecen en otra máquina:

1. **JDK demasiado nuevo** — `Unsupported class file major version 69`
   al configurar `settings.gradle`. Gradle 8.x no soporta JDK 25 como
   runtime. *Solución: usar JDK 21 para ejecutar Gradle
   (`JAVA_HOME`).*
2. **Gradle no podía leer una dependencia compilada para Java 21** —
   `Failed to create Jar file .../bcprov-jdk18on-1.79.jar`, causado por
   clases `META-INF/versions/21/...` (bytecode versión 65) dentro de un
   JAR multi-release que el Gradle 8.2.1 original no sabía parsear.
   *Solución: subir el wrapper a Gradle 8.6
   (`android/gradle/wrapper/gradle-wrapper.properties`).*
3. **`compileSdk` desactualizado** — `@capacitor/android` 8.5.x usa
   `Build.VERSION_CODES.VANILLA_ICE_CREAM` (API 35), pero el proyecto
   compilaba contra API 34. *Solución: `compileSdkVersion` /
   `targetSdkVersion` a 35 en `android/variables.gradle`.*
4. **Clases duplicadas de Kotlin** —
   `:app:checkReleaseDuplicateClasses` fallaba porque un plugin de
   Cordova arrastraba `kotlin-stdlib-jdk7`/`jdk8` 1.6.21, cuyas clases ya
   viven dentro de `kotlin-stdlib` 1.8.22. *Solución: forzar una versión
   única de `kotlin-stdlib*` vía `resolutionStrategy` en
   `android/build.gradle`.*

Si alguno de estos reaparece con versiones distintas de Capacitor/AGP,
el patrón de diagnóstico fue siempre el mismo: correr
`./gradlew assembleRelease --stacktrace` y leer la última línea
`Caused by:`.
