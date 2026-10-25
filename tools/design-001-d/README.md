# Herramientas DESIGN-001-D

Auditan `6091b56` y preparan un paquete externo sin editar el sitio ni WEB-004. Ejecutar desde un clon Git completo que contenga ese commit, Node 24.19.0/npm 11.9.0 y dependencias fijadas (`npm ci`); Python 3 para empaquetar, Chromium Playwright para QA. Estos requisitos son del constructor/QA; el usuario Windows solo necesita extraer todo y abrir el CMD, con runtime incluido.

```sh
CI=1 npm test
npm audit --json
node --test tools/design-001-d/server.test.cjs
# En otra terminal, preview de fuente sin daemon:
npm run preview -- --ignore-lock --port 4333
node tools/design-001-d/audit-client.mjs http://127.0.0.1:4333 artifacts/design-001-d/client
# Detener preview con Ctrl+C. Carga: sin otras pruebas/browser trabajando en paralelo.
node tools/design-001-d/performance.mjs artifacts/design-001-d/performance
```

La carga genera copias temporales desde blobs Git, enlaza node_modules de QA, amplía solo el catálogo sintético a 100/500/900 y compila con el controlador original. No es una modificación del proyecto ni un test con originales. El script elimina sus copias al terminar. No llamar a sus timings INP/LCP o prueba móvil física.

Descargar por HTTPS del distribuidor oficial `node-v24.19.0-win-x64.zip` y `SHASUMS256.txt` de https://nodejs.org/dist/v24.19.0/ en un directorio externo, por ejemplo `/ruta/runtime/`. El builder compara listado y hash fijado, extrae node.exe/README/LICENSE sin cambios y valida PE AMD64. No comprueba Authenticode ni ejecuta el binario Windows. No añadir runtime o descargas a Git.

```sh
python tools/design-001-d/build-package.py --dest '/ruta/Revision ñ/DESIGN-001-D' --runtime-dir /ruta/runtime
node tools/design-001-d/verify-package.mjs '/ruta/Revision ñ/DESIGN-001-D' artifacts/design-001-d/package
```

El builder exige un destino nuevo, compara todas las entradas de aplicación contra 6091b56 y usa el build ya producido por `npm test`. Incluir el informe final de `docs/` en el paquete y recalcular hashes después de cualquier añadido; nunca reusar una lista de hashes anterior. `verify-package.mjs` exige ruta con espacios y acentos y ausencia de .git/node_modules, sirve con el CJS incluido y Node Linux de igual versión; QA usa Playwright del clon. No implica prueba del CMD/EXE Windows.

Distribución: añadir solo resultados/capturas seleccionados, nunca exportaciones sintéticas QA como si fueran revisiones humanas. Crear SHA256SUMS de todos los archivos finales salvo la propia lista y sesión temporal; crear ZIP, comprobar CRC/hashes, extraerlo en otra carpeta y repetir `verify-package.mjs` sobre ese ZIP exacto. Publicar el SHA-256 del ZIP fuera del archivo evita una autorreferencia. No incorporar ZIP/bundle/runtime/capturas a Git.

`server.cjs`, formulario y estilos derivan del tooling de WEB-004, copiados a este directorio con identidad, estado, esquema, casos y revisión nuevos. No se modifica ninguna ruta original de WEB-004. El servidor tiene ocho pruebas de seguridad y aislamiento. Las nuevas exportaciones solo aceptan DESIGN-001-D, source SHA y revisión correctos; todas las evaluaciones empiezan pendientes y no se transmiten.
