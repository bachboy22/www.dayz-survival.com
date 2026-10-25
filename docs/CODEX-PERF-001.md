# CODEX-PERF-001 · Corrección incremental de búsqueda, SEO y microtexto

Contrato: [issue #8](https://github.com/bachboy22/www.dayz-survival.com/issues/8). Base exacta `6091b56667b9042c3da72e42fd1dc7e206b56b8f`, rama `fix/codex-perf-001`, borrador dirigido a `feat/design-001-b`. Evidencia de partida: DESIGN-001-D en PR #7, `9b2fda09a584941590a58942be178354401860b5`, consultada sin modificar. Sin fusión, publicación, integración editorial, DNS o Cloudflare.

## Cambio y decisiones

El controlador anterior normalizaba cuerpos completos por cada entrada y recorría todas las tarjetas con una búsqueda lineal por ID. Este cambio mueve la derivación a build y limita el DOM de búsqueda a doce resultados por página. No reconstruye el proyecto Astro ni añade un backend, librería de producto, cuenta, almacenamiento o telemetría.

- `src/lib/search-index.ts`: modelo mínimo, generador de índice DEMO y validador estricto. Se seleccionan campos de presentación, etiquetas normalizadas y una cadena de términos derivados; no se serializan párrafos, fichas completas, referencias ni campos desconocidos/pointers privados. Los cuerpos siguen en las páginas estáticas de lectura.
- Se normaliza en build, y se deduplican tokens completos delimitados por whitespace manteniendo su orden inicial. Cada token de una consulta AND carece de whitespace: sus coincidencias de subcadena dentro de un token se preservan, incluidas puntuación y acentos según el normalizador original. No es un buscador por palabras exactas ni un ranking nuevo. Las pruebas comparan contra el motor anterior.
- `/search-index.json` es un archivo estático producido por Astro. El navegador lo obtiene una vez por origen local con credentials omit y cache no-store; no hay peticiones por tecla ni servicio remoto. Solo se normalizan consulta (máximo 200 unidades UTF-16, igual que el límite anterior) y etiqueta al buscar. Datos y acceso por ID se reutilizan mediante Map.
- El índice es estrictamente DEMO: rechaza aprobación editorial, verificación técnica, build evaluada, permiso de producción, namespaces no DEMO, slugs inseguros, duplicados y campos extra. No relaja el importador de producción. Un hash o un resultado de búsqueda no conceden aprobación.
- `SearchPanel.astro` renderiza solo la página inicial, no cientos de tarjetas. `SearchCardTemplate.astro` contiene markup inerte propio y el mismo EvidenceLabel; el controlador clona como máximo doce tarjetas y escribe texto con textContent. Si IDs/vista no cambian se conserva el DOM inicial, sin segundo render. No se mantiene una caché de nodos de todo el corpus.
- Paginación con total real, rango y página, controles con aria-disabled que mantienen foco en límites, enlace explícito a resultados y anuncios polite/atomic con debounce de 250 ms. No mueve el foco al buscar, filtrar o paginar. Si atrás/adelante elimina el enlace enfocado, recupera un enlace equivalente o el h2 de resultados.
- Teclear actualiza la entrada actual con replaceState. Filtros, reset y páginas generan pushState cuando cambia la URL. Atrás/adelante y recarga restauran consulta, filtros, tipo y página; no se crea una entrada de historial por pulsación. Valores desconocidos se descartan y páginas fuera de rango se acotan.
- Falla el JSON o no hay JS: se conserva el listado SSR, sin fingir que se aplican los filtros de URL. `/buscar/pagina/{n}/` se genera para páginas 2…N y permite recorrer todo el catálogo sin JS. Con tres DEMO solo existe la página uno; las copias ampliadas comprueban las páginas posteriores reales.

## SEO, versiones y conservación

Metadatos específicos por página y por plantilla de lector/ficha, con descripción de su contenido DEMO real. Se conservan títulos semánticos, 404, `noindex,nofollow` y robots.txt. No se añade canonical/sitemap público ni se afirma contenido editorial disponible. Las dieciocho páginas normales mantienen rutas y anclas.

Fuentes distingue producto web 0.1.0 (package.json), experiencia DESIGN-001-B, corrección CODEX-PERF-001 e historia del MVP web v0.1. La Fuente Maestra v0.16.1 y la build de DayZ son conceptos diferentes. No se incrementa package.version ni se finge una versión desplegada. El shell conserva identidad bosque/papel y la tipografía existente, sin imágenes nuevas o arte final IA.

Intactos: `src/lib/content.ts`, `scripts/validate-import.ts`, `src/data/demo.ts`, `AGENTS.md`, `docs/ART-001-VISUAL-POLICY.md`, lockfile y dependencias. Fuente Maestra solo lectura, 84 aprobados/294 IDs/42 paquetes históricos y cuatro matrices fuera de plazas según control del propietario; no se accedió a originales. LIV no consume cupos históricos, CHR r02 no se publica, AUD-130 sigue separado. D26 bloqueado, C29/E30/CE26/D30DOC independientes; ninguna certificación para 1.30.164078 inferida.

## Pruebas, benchmark y límites

Resultados finales, muestras comparativas, dispersión y condiciones: `CODEX-PERF-001-RESULTS.md` y evidencia descargable. Reproducción en `tools/codex-perf-001/README.md`.

Se conservan las regresiones anteriores y se añaden equivalencia AND/acentos/subcadenas, límites, orden, JSON negativo, XSS, fallo de red/índice, paginación de 100 DEMO, foco, URL/atrás/adelante, no-JS y metadatos. El benchmark compila los mismos 3/100/500/900 fixtures sintéticos para baseline y candidato y verifica la segunda página estática sin JS; esas ampliaciones no llegan al catálogo de la entrega normal.

Tradeoffs: un GET JSON inicial adicional; un índice estático sigue ocupando memoria O(N), aunque no incluye cuerpos completos y reduce repetición; el modo sin JS no busca ni filtra, solo pagina un listado. La búsqueda no cambia a semántica OR, stemming o palabras exactas. Paginación es preferible aquí a una lista infinita; el usuario conserva el foco y puede usar el enlace/encabezado de resultados para empezar a leer. Falta evaluar esa experiencia con lectores reales.

El benchmark usa textos repetitivos y CPU emulada en Linux; no equivale a INP/LCP, Windows o teléfono físico ni determina el tamaño de una futura exportación. El límite de doce aplica al buscador; otras vistas estáticas del prototipo no se convierten en una biblioteca virtualizada por esta corrección. La integración real necesita autorización y otra evaluación con el volumen autorizado.

**Windows real, NVDA/Firefox y Narrador/Edge: NO EJECUTADOS.** La revisión humana permanece pendiente, incluidos orden percibido, anuncios de paginación y comodidad de lectura. No se sustituye esa revisión por axe ni por screenshots. WEB-004 y el ZIP Windows DESIGN-001-D permanecen inmutables.

## Ejecutar y rollback

```sh
npm ci
npm run check
npm run test:unit
npm run build
npm run preview -- --ignore-lock --port 4321
# http://127.0.0.1:4321/ ; terminar con Ctrl+C
```

Solo preview local, sin publicación. Para descartar antes de integrar, detener el preview y volver al checkout 6091b56; cerrar únicamente el nuevo borrador por decisión del propietario. Los PR #2/#5/#6/#7, sus ramas y los dos paquetes Windows no requieren restauración porque no se modifican. Si se autoriza integrar en el futuro, revertir los commits PERF por un nuevo PR; no forzar ramas ni usar resets sobre trabajo ajeno. No hacen falta rollback de datos, Cloudflare o producción.
