# DESIGN-001-B · Resultados y límites de verificación

Fecha: 2026-10-25. Entorno ejecutor: Linux x64, Node 24.19.0, npm 11.9.0, Playwright 1.64.1 y Chromium automatizado. Fuente: rama `feat/design-001-b`, basada en b922bc9. No es una ejecución Windows ni aprobación de interfaz.

## Pruebas ejecutadas

| Comando / revisión | Resultado |
| --- | --- |
| `npm ci --no-fund --no-audit` | Código 0; dependencias y lockfile existentes sin cambios |
| `CI=1 npm test` | Código 0 en la ejecución final sobre fuentes estables |
| `npm run check` dentro de la suite | 0 errores, 0 advertencias, 0 hints |
| Unitarias dentro de la suite | 46 aprobadas, 0 fallos: las 34 anteriores y 12 nuevas |
| Validación/build dentro de la suite | Tres artículos y tres fichas DEMO; 18 HTML contando 404 |
| Playwright dentro de la suite | 73 aprobadas, 1 omisión intencional, 0 fallos, 0 inestables |
| Axe | 68 auditorías sin infracciones detectadas: 34 vistas base y 34 con zoom desktop |
| Diff y fronteras | Sin cambios en importación de producción, dependencias, workflow, ART-001, demo original o AGENTS.md; sin originales privados incorporados |
| WEB-004 | SHA-256 original conservado, 43.999.242 bytes; no modificado ni reempaquetado |

La omisión es el caso de menú exclusivo móvil en el proyecto desktop. El menú sí se prueba en el proyecto mobile y en el caso de teclado/cambio de breakpoint. Los tests nuevos amplían las regresiones, no eliminan cobertura de los recorridos anteriores. Los selectores se ajustaron para tarjetas parametrizadas y para comprobar el estado actual del menú después de reabrirlo, sin atribuir al estado oculto una interacción visible.

Las rondas exploratorias detectaron una etiqueta ausente en el primer ejemplo para la consulta «interfaz» y selectores de prueba incompatibles con los términos de una dl/menú oculto. Se usaron etiquetas explícitas en los filtros y selectores más precisos. Una ronda exploratoria se interrumpió durante los ajustes; no se presenta como aprobada. Tras corregir y congelar el build se ejecutó la suite completa. La revisión visual posterior detectó la tipografía serif heredada del lector; se cambió a sans local y se repitió la suite final sobre ese CSS. El log entregado corresponde a esa última ejecución, no al intento interrumpido.

## Cobertura funcional

- Seis áreas de navegación y acceso a Buscar, con teclado y estado actual de página.
- Tres resultados reales para «interfaz», combinación ámbito/nivel/tema, estado vacío, limpieza conservando foco y cambio de destino a ficha rápida.
- Persistencia de filtros en URL tras recarga; parámetros desconocidos descartados y consulta con HTML tratada como texto.
- Tres lectores y tres fichas independientes, con situación/decisión/error/dos señales/salida/fuente, referencias resueltas y vuelta al texto extenso.
- Skip link, landmarks, encabezados, índice a h2 con foco visible, controles A−/A+ 100–135%, límite anunciado, Escape y recuperación de foco del menú al cambiar de ancho.
- Recorrido de enlaces internos y fragmentos desde las 17 páginas navegables sin destinos inválidos. Peticiones ajenas al origen local bloqueadas durante el recorrido; ninguna observada y ningún error de script de página. Es una prueba de navegador, no desconexión física de un PC Windows.
- Lector y enlaces originales sin JavaScript conservados. Búsqueda interactiva requiere JS; las tarjetas estáticas siguen visibles.

## Responsive y zoom

| Método | Matriz | Resultado observado |
| --- | --- | --- |
| Ancho CSS explícito | 320 / 768 / 1440 px, proyectos desktop y mobile emulado, ocho vistas representativas | Sin desbordamiento horizontal; navegación/búsqueda operativas; capturas en tres anchos |
| Zoom real de navegador | Chromium `chrome.tabs.setZoom`, ventana 1280×960, 200% | Layout 640×480 CSS px, DPR 2; 17 rutas, teclado, búsqueda múltiple/filtros/vacío, lector A+ y axe |
| Zoom real de navegador | Mismo método, 400% | Layout 320×240 CSS px, DPR 4; 17 rutas y mismas comprobaciones |
| Pinch móvil emulado | CDP, layout 412×839, 200% | Viewport visual 206 px; layout sin desbordamiento |
| Pinch móvil emulado | CDP, layout 412×839, 400% | Viewport visual 103 px; layout sin desbordamiento |

El zoom desktop **no es CSS zoom ni un mero cambio de viewport**. El pinch conserva el layout y exige desplazamiento del viewport visual: no se confunde con reflow de navegador. Los controles A+/A− son una tercera cosa y se verifican por separado. No se prueba un teléfono físico.

Evidencias generadas y entregadas fuera de Git:

- `artifacts/design-001-b/`: 24 capturas responsive (cuatro vistas × tres anchos × dos proyectos). Desktop 768 muestra el lector nuevo; el navegador del proyecto mobile sigue siendo emulación aunque se cambie su ancho.
- `artifacts/screenshots/`: cuatro capturas base de inicio y lector, desktop/mobile.
- `artifacts/zoom/`: 30 capturas (20 desktop viewport/full y 10 pinch) y cuatro JSON de métricas de 17 rutas cada uno. FullPage usa clip CDP con dimensiones DIP para evitar capturar solo una fracción en zoom alto; imágenes sin retoques.
- `artifacts/playwright-results.json`: resultados de la suite final; el informe HTML de Playwright/artefacto Actions puede duplicar adjuntos. Las **58 imágenes únicas de estas tres carpetas** son las capturas de revisión, no se cuentan duplicados como pruebas adicionales.
- Evidencia de entrega externa: log de suite, resultados JSON, escaneo limitado de salida, hashes de fronteras y mediciones de contraste por pareja.

Se inspeccionaron capturas de inicio desktop/320, lector tablet y zoom 400. La inspección visual es una revisión de esas imágenes, no una prueba humana exhaustiva de uso, lector de pantalla o ausencia de cualquier recorte posible.

## Integridad, privacidad y alcance del escaneo

Se compararon con los blobs de b922bc9: `AGENTS.md`, `package.json`, `package-lock.json`, `src/data/demo.ts`, `src/lib/content.ts`, `scripts/validate-import.ts`, `docs/ART-001-VISUAL-POLICY.md` y `.github/workflows/ci.yml`. Permanecen idénticos. `DESIGN-001-B-BOUNDARIES.json` identifica estos archivos públicos de desarrollo, no los originales editoriales.

La salida pública se revisó para formatos conocidos de tokens GitHub, cabeceras de claves privadas y marcadores de rutas privadas/locales. No se encontraron esos patrones. No se imprimieron variables/credenciales ni se leyeron manuscritos para compararlos. Este escaneo es limitado y no certifica detección universal de secretos; la frontera principal es que solo se consumen los fixtures DEMO controlados y se revisa el diff de entrega.

Fuente Maestra v0.16.1: 84 artículos, 294 IDs, 42 paquetes; cuatro matrices no son plazas. Son referencias del propietario, sin inspección de originales. CHR/LIV/AUD-130 siguen separados y bloqueados para importación real. D26 permanece bloqueado, vías C29/E30/CE26/D30DOC distintas, sin certificación 1.30 por inferencia.

WEB-004: `fbc5dde13575856ae144df8cda4b3e36d95b567cea2eb248967a167e4290ec60`. La rama fuente de PR #2 y la documental de PR #5 no se modifican. No se fusiona, publica, conecta dominio ni modifica Cloudflare/DNS.

## Pendientes reales

- **NO EJECUTADOS:** Windows real, Edge/Firefox Windows, NVDA/Firefox y Narrador/Edge. Seguir el protocolo de `DESIGN-001-B.md` y M01–M12 de WEB-003; registrar versiones, operador y lo realmente escuchado. No se declaran aprobados por axe, capturas o automatización.
- Revisión del propietario de legibilidad, claridad de estados, prioridades visuales y recorridos; sin aprobación definitiva automática.
- Auditoría completa WCAG 2.2 AA, dispositivo físico, rendimiento de corpus real y validación editorial/técnica de cualquier futura exportación. No son resultados acreditados por esta suite.
- DESIGN-001-C requiere autorización y datos revisados; no se ha implementado. Sin cartografía ni calculadoras hasta derechos/evidencia.

La CI del nuevo PR es una comprobación separada en Ubuntu/Chromium. Su enlace y estado se registran en el PR al concluir; no se da por aprobada a partir de las pruebas locales. Las CI de los PR anteriores no se atribuyen a esta rama.
