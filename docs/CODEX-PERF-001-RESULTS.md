# CODEX-PERF-001 · Pruebas y comparación de rendimiento

Fecha: 2026-10-25. Contrato: issue #8. Base de código 6091b56667b9042c3da72e42fd1dc7e206b56b8f; candidato de esta rama con huellas de entrada registradas en CODEX-PERF-001-BENCHMARK.json. Solo tres DEMO en el producto normal; ampliaciones temporales sintéticas fuera de Git.

## Pruebas ejecutadas

- `npm ci --no-fund --no-audit`: código 0; mismas dependencias y lockfile.
- `CI=1 npm test`: código 0; Astro/TS sin errores, advertencias o hints; 60 unitarias aprobadas; 18 HTML + índice JSON estático; Playwright 89 aprobadas, una omisión intencional, cero fallos e inestables.
- La omisión es el caso exclusivo móvil dentro de desktop. El menú tiene cobertura móvil y de teclado/breakpoints.
- Axe: 68 auditorías de regresión + dos de búsqueda paginada con 100 DEMO, sin infracciones detectadas; no certificación WCAG ni prueba de lector real.
- Zoom desktop real Chromium 200/400 mediante chrome.tabs.setZoom: ventana 1280×960 → layouts 640/320 CSS px; 17 rutas y controles, sin overflow detectado. Pinch móvil CDP se registra separadamente, sin equivalencia con reflow o teléfono físico.
- Responsive 320/768/1440 CSS px, teclado, índice→h2, A−/A+, fichas↔lecturas, recursos locales y referencias anteriores conservados.
- Nuevas pruebas: paginación 100 DEMO (12 por página, cuatro en la última), foco y límites; total, rango, filtros y vacío; historial atrás/adelante y recarga; índice fallido/no confiable conserva SSR; XSS tratado como texto; rechazo de aprobación/build/pointer/namespace/slug/scheme/duplicados; 18 títulos y descripciones únicos y 404 semántico; noindex y ausencia de canonical; modo sin JS explícito.
- El benchmark emparejado comprueba además los listados estáticos reales: sin JS navega a página 2 con IDs DEMO-013 en conjuntos de 100/500/900. No es solo un mock del algoritmo de páginas.

Las rondas exploratorias no se presentan como aprobadas: una prueba de foco necesitaba enfocar el select antes de cambiar su valor; la advertencia sin JS se hizo visible en el listado fuera de noscript. Después pasaron las 16 pruebas nuevas y la suite completa. No se eliminaron regresiones anteriores. Los cambios posteriores a esa suite son documentación/metadatos del tooling, no código de aplicación.

## Condiciones de laboratorio

Misma ejecución emparejada, servidor loopback sin compresión ni throttling de red, cache no-store, viewport 1280×900, Chromium 156.0.8078.4, Node v24.19.0. CPU normal y CDP 4×; no CPU física ni móvil real. Máquina reportada: INTEL(R) XEON(R) PLATINUM 8573C, 6.18.55 / x64. Runner cloud compartido, no laboratorio dedicado.

Baseline toma blobs de 6091b56; candidato superpone src/ de esta rama. Ambos reciben el mismo generador: tres DEMO originales y registros DEMO adicionales de interfaz, seis párrafos de frases repetidas, sin datos de DayZ. El único overlay baseline es el catálogo artificial. Counts 3/100/500/900, 4 consultas, 5 eventos input iguales por consulta (20 muestras por celda; 320 en total). Se guardan resultados crudos, p50/p95 nearest-rank, min/max, desviación, IQR y datos por consulta. Secuencia fija por tamaño: baseline normal/4×, después candidato normal/4×. Se cerraron otras pruebas de navegador antes de la comparación.

Los eventos idénticos repetidos aprovechan la firma del DOM candidato sin recomponer nodos; eso forma parte de la mejora y no se oculta. Se incluyen máximos y estadísticas por consulta. Estos resultados no describen todos los gestos posibles ni tienen intervalos de confianza de una campaña estadística.

## Manejador y segundo fotograma

Todas las cifras son ms. Cada celda muestra p50 / p95. El segundo fotograma usa dos requestAnimationFrame desde input sintético: NO es INP, LCP ni una interacción humana.

| DEMO | CPU | Manejador antes | Manejador después | Segundo frame antes | Segundo frame después |
| --- | --- | --- | --- | --- | --- |
| 3 | 1× | 0.4 / 1.0 | 0.2 / 0.9 | 31.5 / 32.0 | 29.3 / 30.4 |
| 3 | 4× | 2.7 / 6.8 | 1.1 / 4.7 | 27.9 / 32.2 | 26.6 / 28.6 |
| 100 | 1× | 3.7 / 5.0 | 0.2 / 1.6 | 31.6 / 32.3 | 29.9 / 30.8 |
| 100 | 4× | 18.7 / 25.8 | 1.3 / 7.5 | 43.8 / 92.3 | 26.5 / 34.5 |
| 500 | 1× | 24.2 / 25.8 | 0.3 / 1.4 | 38.3 / 91.1 | 29.7 / 30.5 |
| 500 | 4× | 144.9 / 182.3 | 1.2 / 6.6 | 250.5 / 577.6 | 25.7 / 36.4 |
| 900 | 1× | 61.9 / 67.3 | 0.3 / 1.8 | 84.4 / 194.3 | 30.2 / 31.4 |
| 900 | 4× | 349.7 / 1664.3 | 1.5 / 6.0 | 705.3 / 3120.0 | 27.8 / 36.6 |

## Tamaño, DOM y coste inicial

Bytes decodificados sin compresión. JS y JSON se suman para no presentar el traslado de datos como eliminación. Trans es ResourceTiming transferSize, con overhead HTTP.

| DEMO | DOM antes→después | Visibles antes→después | HTML antes→después | JS antes→después | JSON después | JS+JSON antes→después | Trans JS+JSON antes→después |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 191→203 | 3→3 | 11625→13353 | 9502→7444 | 4179 | 9502→11623 | 9802→12223 |
| 100 | 2520→430 | 100→12 | 119871→23595 | 454923→7444 | 88111 | 454923→95555 | 455223→96155 |
| 500 | 12120→430 | 500→12 | 565671→23596 | 2294656→7444 | 434644 | 2294656→442088 | 2294956→442688 |
| 900 | 21720→430 | 900→12 | 1011471→23596 | 4134390→7444 | 781178 | 4134390→788622 | 4134690→789222 |

| DEMO | CPU | DOMContentLoaded antes→después (ms) | Load antes→después (ms) | Mayor long task inicial antes→después (ms) | Build Node antes→después (ms) |
| --- | --- | --- | --- | --- | --- |
| 3 | 1× | 47.7→66.2 | 70.6→66.3 | 0.0→0.0 | 6127.0→5840.4 |
| 3 | 4× | 88.3→179.8 | 169.1→180.0 | 92.0→96.0 | 6127.0→5840.4 |
| 100 | 1× | 166.0→31.6 | 179.0→52.9 | 99.0→0.0 | 5778.5→5872.5 |
| 100 | 4× | 491.0→198.9 | 544.6→199.7 | 271.0→105.0 | 5778.5→5872.5 |
| 500 | 1× | 350.9→45.1 | 399.0→69.3 | 253.0→0.0 | 6007.6→5906.6 |
| 500 | 4× | 1711.1→199.8 | 2008.5→200.1 | 515.0→123.0 | 6007.6→5906.6 |
| 900 | 1× | 629.7→51.3 | 704.9→51.5 | 258.0→0.0 | 5810.8→5952.5 |
| 900 | 4× | 2364.7→229.4 | 2829.1→230.2 | 850.0→120.0 | 5810.8→5952.5 |

El build se hace una vez por variante/tamaño en Node; la CPU 4× solo afecta al navegador, no al build. DCL/load no equivalen a que todos los índices async estén listos: las mediciones de input empiezan después de networkidle y de comprobar el total/visibles. Las métricas completas de recursos y tareas iniciales están en la evidencia cruda.

## Dispersión del manejador

| DEMO | CPU | Antes min…max / σ (ms) | Después min…max / σ (ms) |
| --- | --- | --- | --- |
| 3 | 1× | 0.3…3.5 / 0.7 | 0.1…1.1 / 0.3 |
| 3 | 4× | 0.4…7.8 / 1.8 | 0.2…6.0 / 1.5 |
| 100 | 1× | 3.1…6.4 / 0.7 | 0.1…1.7 / 0.5 |
| 100 | 4× | 13.4…26.8 / 3.3 | 0.6…13.1 / 3.0 |
| 500 | 1× | 21.0…30.6 / 2.0 | 0.2…2.5 / 0.6 |
| 500 | 4× | 125.8…211.7 / 19.9 | 0.2…20.1 / 4.3 |
| 900 | 1× | 59.7…67.5 / 2.0 | 0.1…1.9 / 0.5 |
| 900 | 4× | 192.3…2278.4 / 505.0 | 0.2…10.1 / 2.3 |

## Interpretación y límites

Con 900/4× en esta pasada, el p95 síncrono baja 1664,3→6,0 ms y el segundo frame 3120,0→36,6 ms. El DOM conectado baja 21720→430 y solo hay doce tarjetas visibles. JS+JSON decodificados bajan 4134390→788622 B. Son diferencias de este fixture y runner, no promesas para PCs o manuscritos desconocidos.

Existe variación visible: la pasada inicial aislada de baseline dio ~667,9 ms p95 en 900/4×; DESIGN-001-D había registrado ~552,9 ms en otra sesión. No se usan esas cifras históricas como denominador de la comparación final. La tabla usa únicamente los pares medidos en esta misma configuración; los máximos muestran la inestabilidad del runner/coste del baseline.

Con tres DEMO se añaden un GET JSON y 2121 B de JS+JSON (+22,3% en esa parte), además de markup de plantilla/paginación. DCL observado pasa 47,7→66,2 ms normal y 88,3→179,8 ms a CPU 4×: no se afirma una mejora universal de coste inicial. SSR conserva sus tarjetas y enlaces durante la carga, sin renderizar cientos ni bloquear acceso al texto. El beneficio buscado es escalado y menor trabajo por entrada; la petición extra es un tradeoff explícito.

La compresión léxica se beneficia de frases repetidas del generador. Se preserva la semántica AND/subcadena porque cada término de consulta sin whitespace mantiene todas sus coincidencias dentro de tokens; no se reescriben manuscritos. Un corpus con vocabulario más diverso puede dar índices mayores. No se ha calculado una previsión de tamaño/latencia de los 84 originales privados.

Sin JS o con JSON fallido no hay búsqueda/filtros activos; se conserva la navegación de un listado estático por páginas. El índice sigue siendo O(N) en memoria y el filtrado O(N) de términos ya normalizados; no se introduce un worker/backend o dependencia para esconder coste. Otras vistas de listados no se virtualizan por este cambio.

La paginación no roba foco; anuncia total/rango/página y ofrece enlace al h2. Las pruebas automáticas no deciden la comodidad de esa experiencia en NVDA o Narrador. Windows real, NVDA/Firefox y Narrador/Edge NO EJECUTADOS, aprobación humana pendiente.

## Evidencia y aceptación

- `CODEX-PERF-001-BENCHMARK.json`: condiciones, huellas de fuente, resumen, IQR y estadísticas por consulta. Muestras y ResourceTiming completos en la entrega de evidencia, fuera de Git.
- Log final CI=1 npm test, resultados Playwright, cuatro JSON de zoom y 58 capturas de regresión sin duplicar adjuntos.
- `CODEX-PERF-001-INTEGRITY.json`: archivos protegidos y ZIP WEB-004/DESIGN-001-D intactos. No es un manifiesto de originales privados.
- El SHA final y enlace/resultado de GitHub Actions se registran en el nuevo PR y cierre de entrega. No se atribuye una CI de otro SHA como prueba final.

Se cumple el alcance automatizado: mejora de escalado documentada, sin regresiones funcionales/accesibles detectadas, metadatos y microtexto corregidos; queda pendiente aprobación humana Windows. El PR se entrega siempre en borrador, sin fusión o despliegue. Rollback y límites en CODEX-PERF-001.md.
