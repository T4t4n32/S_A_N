SAN — PROYECTO LISTO PARA CREAR EL APK
=============================================

Este paquete contiene el HTML entregado, preparado como aplicación Android con Capacitor.

NO TIENES QUE EDITAR CÓDIGO.

COMANDO PRINCIPAL
-----------------
1. Extrae SAN_APK_LISTO.zip.
2. Abre una terminal dentro de la carpeta SAN_APK_LISTO.
3. Ejecuta:

   chmod +x construir-apk.sh
   ./construir-apk.sh

El APK terminado aparecerá en:

   SALIDA/SAN-debug.apk

QUÉ HACE EL SCRIPT
------------------
- Detecta Java 21 incluido en Android Studio o instalado en Ubuntu.
- Detecta el Android SDK.
- Instala las dependencias de Node.
- Convierte las dependencias CDN del HTML en archivos locales.
- Genera el CSS de Tailwind.
- Crea o actualiza el proyecto Android.
- Verifica que no exista server.url apuntando a https://localhost.
- Ejecuta Gradle y copia el APK final a SALIDA/.

PRIMERA COMPILACIÓN
-------------------
La primera compilación necesita conexión a internet para descargar:
- Dependencias npm.
- Dependencias de Gradle.
- Android SDK 35, si todavía no está instalado.

El APK generado queda preparado para abrir la interfaz sin depender de los CDN.

REQUISITOS
----------
- Ubuntu o una distribución Linux compatible.
- Node.js 20 o superior.
- Android Studio Ladybug 2024.2.1 o superior.
- Java 21, preferiblemente el JBR incluido con Android Studio.
- Android SDK Platform 35.

SI FALTA JAVA 21
----------------
Ejecuta:

   sudo apt update
   sudo apt install openjdk-21-jdk

Luego repite:

   ./construir-apk.sh

INSTALAR EN EL CELULAR POR USB
------------------------------
Con la depuración USB activada:

   chmod +x instalar-en-celular.sh
   ./instalar-en-celular.sh

También puedes copiar SALIDA/SAN-debug.apk al celular e instalarlo manualmente.

ABRIR EN ANDROID STUDIO
-----------------------
Después de la primera compilación:

   chmod +x abrir-android-studio.sh
   ./abrir-android-studio.sh

DATOS DE LA APLICACIÓN
----------------------
Las notas y anotaciones se guardan mediante localStorage dentro de la aplicación.
Desinstalar la aplicación o borrar sus datos desde Android puede eliminar esa información.

ARCHIVOS IMPORTANTES
--------------------
- src/index.html: versión preparada para Android y uso local.
- original/index.html: copia intacta del HTML entregado.
- capacitor.config.json: configuración sin server.url.
- construir-apk.sh: compilación automática.
- SALIDA/SAN-debug.apk: APK generado.
