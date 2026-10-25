# DESIGN-001-D · Auditoría y preparación de revisión humana

Fecha: 2026-10-25. Fuente auditada: [PR #6](https://github.com/bachboy22/www.dayz-survival.com/pull/6), commit `6091b56667b9042c3da72e42fd1dc7e206b56b8f`. El paquete Windows sirve el build de ese commit **sin modificarlo**. Rama independiente de auditoría: `audit/design-001-d`; añade herramientas, pruebas y documentación, no correcciones a la aplicación.

## Recomendación

**APLAZAR la aprobación definitiva de DESIGN-001-B hasta completar la revisión humana Windows.** El prototipo es apto como candidato a esa revisión: pasan las regresiones y las auditorías automáticas realizadas, sin un defecto crítico observado que impida recorrer sus tres DEMO. Esto no autoriza fusionar, publicar o integrar contenido editorial.

Antes de un catálogo grande conviene corregir el coste de búsqueda/render; antes de publicar, preparar metadatos por página y una revisión de seguridad del entorno de publicación. Esas correcciones quedan propuestas, no se aplican al PR #6 ni al paquete auditado. La decisión visual final pertenece al propietario.

## Hallazgos por gravedad

P0 crítico: ninguno observado en las comprobaciones realizadas; no equivale a una garantía de ausencia universal de fallos.

| ID | Gravedad y condición | Hecho comprobado / pendiente | Acción y criterio de cierre |
| --- | --- | --- | --- |
| D-H01 | **P1 · bloquea aprobación definitiva**, no es un fallo de código demostrado | Windows real, ejecución de node.exe/doble clic CMD, NVDA/Firefox y Narrador/Edge NO EJECUTADOS. Tampoco hay revisión física móvil ni aprobación humana de interfaz | Ejecutar paquete y protocolo M01–M16 en el PC; devolver JSON/TXT con versiones, operador, palabras escuchadas e incidencias. Resolver bloqueos antes de aprobar |
| D-P01 | **P2 · escalado**, no bloquea revisar los tres DEMO | Búsqueda síncrona por entrada, normalización del corpus y `catalog.find` para cada tarjeta. En copia temporal de 900 DEMO, CPU emulada 4×, p95 del manejador 552,9 ms; hasta el segundo frame 1.135,1 ms. Página con 21.720 nodos y JS decodificado 4,13 MB | Proponer índice normalizado, acceso por Map/ID y resultados paginados accesibles; medir de nuevo con la exportación autorizada y límites acordados. No prometer una mejora sin implementarla/probarla |
| D-S01 | **P3 · SEO futuro** | Las 18 páginas tienen la misma descripción genérica. Sus títulos son únicos y todas tienen lang=es, un h1 y noindex/nofollow | Descripciones específicas al preparar contenido autorizado. Mantener noindex mientras sea DEMO; no activar indexación por esta auditoría |
| D-V01 | **P3 · microtexto/versionado** | Fuentes conserva etiquetas «ESTA WEB / v0.1» y notas v0.1, mientras el shell identifica DESIGN-001-B | En una corrección independiente, distinguir versión de producto, iteración de diseño e historial; validar claridad con el propietario. No cambia hechos editoriales |
| D-G01 | **Condición previa a publicación**, fuera del alcance autorizado | Sin canonical/sitemap configurados para producción; no se inspeccionan headers, DNS, Cloudflare o configuración de una web pública | No es defecto del prototipo local ni autorización de conectar el dominio. Revisión específica del destino y permisos antes de publicar |

No se encontraron enlaces internos rotos, desbordamientos horizontales en la matriz ejecutada, peticiones externas del cliente ni equivalencias falsas entre aprobación editorial y verificación técnica. La búsqueda, lectura y fichas se comprobaron en el sitio real compilado, no en una maqueta alternativa. Las valoraciones de claridad visual y experiencia AT real permanecen abiertas.

## Matriz de requisitos

| Requisito | Estado | Evidencia y límite |
| --- | --- | --- |
| Seis áreas y compatibilidad de rutas | Cumplido automático | Inicio/Aprender/Manual/Atlas/Herramientas/Acerca; enlaces y fragmentos existentes conservados; 18 HTML contando 404 |
| Búsqueda múltiple y filtros | Cumplido funcional; escalado pendiente | Tres resultados para interfaz, ámbito/nivel/vista/estado, vacío, limpieza y URL recuperada; D-P01 para crecimiento |
| Lectura extensa ↔ rápida | Cumplido automático | Tres lectores y tres fichas parametrizadas, decisión/error/dos señales/salida/fuente; enlaces y A−/A+ |
| Editorial / técnico / publicación | Cumplido para DEMO | Tres ejes visibles; build evaluada ninguna. No se simulan estados de contenido aprobado |
| Atlas CHR/LIV independientes | Cumplido como placeholder | Entrada común y ámbitos separados; sin localidades, cartografía operativa ni datos inventados |
| Accesibilidad automatizada | Cumplido en alcance probado | Suite base, axe complementario y controles de hoja/paquete; no certificación WCAG 2.2 AA |
| Teclado, foco y encabezados | Cumplido automático; AT pendiente | Skip, índice→h2, menú/Escape/cambio de ancho, A−/A+, filtros y anuncios; experiencia escuchada por humanos pendiente |
| Zoom real 200/400 | Cumplido Chromium | 17 rutas de fuente; lector, buscador, atlas y hoja en paquete aislado. No sustituye Edge/Firefox Windows |
| Responsive y legibilidad | Cumplido automático; valoración humana pendiente | 42 combinaciones adicionales de 6 vistas × 7 anchos, además de suite 320/768/1440; inspección visual limitada de capturas |
| SEO básico de prototipo | Cumplido parcialmente | Título único, descripción presente, h1/lang/noindex; descripción duplicada D-S01 y preparación pública D-G01 |
| Seguridad cliente y privacidad | Cumplido en pruebas limitadas | Sin requests externos, cookies, almacenamiento o service worker del sitio; consultas HTML no ejecutables; revisión estática y npm audit sin avisos conocidos |
| Catálogo sintético ampliado | Medido; mejora pendiente | 100/500/900 registros en copias temporales, nunca en el build entregado; laboratorio, sin datos reales ni benchmark de móviles físicos |
| Runtime portable y licencia | Integridad/procedencia comprobadas; ejecución pendiente | Node oficial 24.19.0 win-x64, SHA oficial/PE/AMD64/LICENCE; no Authenticode ni EXE ejecutado aquí |
| Hoja independiente JSON/TXT | Cumplido automático | 12 casos generales + 16 por cada lector, 44 resultados inicialmente No probado; sin aprobación ni envío automático |
| Windows/NVDA/Narrador | **Bloqueante para aprobación final** | NO EJECUTADOS; protocolo y hoja listos para usuario |
| Fuente Maestra y límites históricos | Cumplido por aislamiento | Cero originales accedidos/importados; referencia del propietario 84/294/42 y cuatro matrices fuera de plazas; LIV independiente |
| PR anteriores y WEB-004 | Preservados | 83 archivos del commit auditado idénticos; WEB-004 conserva SHA original; sin modificar, cerrar o fusionar #2/#5/#6 |
| Publicación / integración editorial | No autorizadas, no ejecutadas | Sin Cloudflare, DNS, cuentas, telemetría o importación real |

## Investigación y pruebas ejecutadas

Entorno: Linux x64, Node 24.19.0, npm 11.9.0, Playwright 1.64.1 y Chromium 156.0.8078.4. NVDA, Narrador, Windows, Edge/Firefox Windows y dispositivo móvil físico no se ejecutaron. No se genera una aprobación humana mediante automatización.

| Comprobación | Resultado observado |
| --- | --- |
| `npm ci --no-fund --no-audit` | Código 0; lockfile/dependencias originales sin cambios |
| `CI=1 npm test` del prototipo original en checkout auditado | Código 0; 46 unitarias, tipos sin diagnósticos, 18 HTML; 73 Playwright aprobadas, una omisión intencional, cero fallos o inestables |
| Axe incluido en la suite original | 68 auditorías sin infracciones: 34 vistas base y 34 con zoom |
| `audit-client.mjs` | 18 documentos con axe adicional sin infracciones, 58 destinos/enlaces únicos, 42 combinaciones responsive; títulos únicos, h1/lang/jerarquía correctos |
| `npm audit --json` | 0 vulnerabilidades conocidas reportadas por el registro para el árbol instalado en esta fecha. No es certificación de seguridad ni auditoría del runtime/Windows |
| `node --test tools/design-001-d/server.test.cjs` | 8 pruebas aprobadas, 0 fallos |
| `verify-package.mjs` sobre paquete aislado | 19 comprobaciones agrupadas aprobadas en Linux/Chromium; 18 páginas y recursos, export/import, privacidad, zoom y ciclo de servicio |

La omisión intencional de Playwright es el caso exclusivo móvil en el proyecto desktop. El menú sí tiene cobertura en el proyecto móvil emulado y con teclado/breakpoints. La nueva rama añade una prueba unitaria que ejecuta las ocho pruebas de servidor; su CI prueba esa ampliación separadamente del SHA de aplicación auditado. Los resultados y enlaces de CI de la nueva rama se registran al concluir en su PR; no se atribuyen las CI previas como una ejecución nueva.

### Navegación, visual y accesibilidad

Se recorre el catálogo de tres DEMO, todas las áreas, índices, referencias y los dos atlas. Se comprueban foco visible, headings sin saltos, ausencia de tabindex positivo, nombres de controles, comportamiento sin JS del lector, tamaños 100–135% y estado de límites, colores forzados y reduced motion. Consultas de 200 caracteres y cadenas HTML no producen ejecución ni overflow observado. La hoja nueva usa labels, fieldsets, legends, details y estado polite/atomic.

La auditoría adicional comprueba seis vistas a 320, 375, 768, 1024, 1100, 1280 y 1440 CSS px (42 combinaciones). Las 58 capturas de regresión de DESIGN-001-B se regeneran; no son imágenes finales IA ni capturas de DayZ. Mantienen contexto y método de cada escenario. La valoración humana de tipografía secundaria, densidad de etiquetas, orientación y prioridades visuales sigue pendiente.

Zoom desktop real mediante `chrome.tabs.setZoom` a 200% y 400%: ventana 1280×960 → layouts 640×480 y 320×240 CSS px. Las 17 rutas y controles pasan sin desbordamiento detectado. El pinch CDP mantiene layout 412 px y reduce viewport visual a 206/103 px: es una prueba emulada distinta, no reflow ni teléfono físico. El paquete añade ocho escenarios reales desktop (lector con A+, hoja, búsqueda/filtro y atlas × dos factores), sin infracciones axe. Las capturas viewport se conservan sin retoque; el recorte visible no acredita por sí solo la usabilidad de toda la página.

La fuente heredada `Terrain.astro` permanece únicamente como esquema conceptual etiquetado, sin valor geográfico; no se usa para orientarse ni como cartografía. No se añaden arte final IA, fotografías, fuentes remotas, mapas ni recursos con derechos supuestos. ART-001 se conserva literalmente y se incluye como referencia.

### SEO, seguridad y privacidad

Los 18 títulos son únicos; las 18 descripciones son idénticas (D-S01). Todas las páginas tienen `lang=es`, un h1 y `noindex,nofollow`; robots.txt bloquea la indexación del prototipo. Canonical/sitemap y la estrategia pública se aplazan porque no hay publicación autorizada. No se eliminan protecciones de staging ni se declara una auditoría de SEO de producción.

En el recorrido de navegador: cero peticiones a otros orígenes mientras se bloquean, cero errores de página, cero métodos no GET observados, cero cookies, almacenamiento local/sesión vacío del sitio y cero registros de service worker. Buscar usa textContent/creación de nodos, sin convertir la consulta en HTML. No hay cuentas, analítica, SDK remoto o endpoints de comentarios. Revisar paquetes/headers de un despliegue futuro requiere otra auditoría: no se han inspeccionado Cloudflare ni el dominio.

La salida compilada también se escanea para formatos conocidos de tokens/claves privadas y marcadores de rutas privadas. No se hallan esos patrones; el escaneo no es exhaustivo ni compara originales privados, que no se han leído. El aislamiento de entradas DEMO y la revisión del diff son controles principales. Npm audit no examina la licencia o seguridad de todos los posibles entornos futuros.

## Rendimiento con catálogo ampliado

Se compilan copias temporales del commit 6091b56 con **100, 500 y 900 DEMO**, manteniendo el motor y controlador reales. Los artículos extra son texto de interfaz sintético con IDs DEMO, sin contenido editorial ni geografía. Se validan conteos de coincidencias/vacío y filtros; no se asignan IDs LIV ni se alteran 294/42. Se sirve cada build por loopback y se mide con Chromium en CPU normal y limitación CDP 4×. No se agregan esos registros al repositorio como corpus ni al paquete Windows: el sitio entregado sigue con tres DEMO.

Cada combinación usa cuatro consultas, cinco repeticiones por consulta (20 muestras), caché de recursos desactivada por el servidor de prueba y sin tráfico remoto. Los resultados finales se repitieron tras terminar regresión y auditoría cliente para reducir interferencia. El equipo cloud no es un laboratorio dedicado; una primera pasada dio 306,6 ms p95 en 900/4×, y la final 552,9 ms: esa variación impide extrapolar a un teléfono o PC concreto.

| Registros DEMO | CPU | p95 manejador síncrono | p95 hasta segundo frame | HTML búsqueda | JS decodificado | Nodos DOM |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | 1× | 5,7 ms | 33,4 ms | 119.871 B | 454.923 B | 2.520 |
| 100 | 4× | 22,7 ms | 74,7 ms | igual | igual | igual |
| 500 | 1× | 27,9 ms | 98,4 ms | 565.671 B | 2.294.656 B | 12.120 |
| 500 | 4× | 130,8 ms | 437,8 ms | igual | igual | igual |
| 900 | 1× | 65,1 ms | 201,4 ms | 1.011.471 B | 4.134.390 B | 21.720 |
| 900 | 4× | 552,9 ms | 1.135,1 ms | igual | igual | igual |

En 900/4×, DOMContentLoaded observado fue 4.314,8 ms y hubo una tarea inicial de 2.177 ms. Son muestras de laboratorio con datos artificiales; no se presentan como INP, LCP, Lighthouse, CrUX ni experiencia de usuarios reales. La métrica de segundo frame es una oportunidad de representación tras un input sintético, no una medición de interacción humana. Los bytes son decodificados/sin compresión de transporte; no representan una red móvil.

Como referencia, el build real de tres DEMO suma 189.614 bytes en 22 archivos: HTML de búsqueda 11.625 B, JS de búsqueda 9.502 B y CSS 32.027 B. Son tamaños de artefactos, no una puntuación de rendimiento. Se desconoce el volumen de una futura exportación editorial autorizada. Preindexar y paginar se propone por crecimiento observado; no se aplica silenciosamente una arquitectura nueva al prototipo congelado.

## Paquete Windows independiente

Nombre de entrega: `DAYZ-SURVIVAL_DESIGN-001-D_WINDOWS_REVISION.zip`, carpeta `DESIGN-001-D/`. No reemplaza, modifica ni reempaqueta WEB-004. El manifiesto y SHA256SUMS identifican sitio, runtime, herramientas locales, guía y evidencia; el SHA final del ZIP se facilita fuera del ZIP para evitar autorreferencia.

1. Extraer todo y abrir `ABRIR_REVISION.cmd` con doble clic.
2. Mantener consola; abrir la URL 127.0.0.1 indicada si el navegador no aparece. No usar sitio/index.html por file://.
3. Abrir hoja independiente y registrar solo pruebas realizadas; exportar JSON/TXT.
4. Cerrar con `CERRAR_REVISION.cmd` o Ctrl+C. Cerrar una pestaña no cierra el servicio.

Diseñado sin instalar Node/npm/Python/Git, sin administrador ni PowerShell. Se incluye Node 24.19.0 Windows x64 oficial, LICENSE original con avisos de terceros y procedencia. La ejecución real de CMD/EXE y posibles políticas del PC quedan pendientes; no se solicita desactivar protecciones.

| Runtime | Comprobación |
| --- | --- |
| Archivo | node-v24.19.0-win-x64.zip, archivo oficial cacheado; cotejo nuevo contra SHASUMS256 oficial descargado por HTTPS |
| Origen | https://nodejs.org/dist/v24.19.0/node-v24.19.0-win-x64.zip |
| SHA del archivo | 57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73 |
| SHA node.exe | 3602f2bb1a10f2cbab4c36886218a33c1ab3db87290e73b033c46c77147d0237 |
| Formato | PE32+ AMD64 comprobado; no se ejecutó en Linux |
| Licencia original | SHA d9c4eeda951d6d08f4aa1316b61aafcf67e6da5f79b18f8edeb56fa6abdc038c |
| Pendientes | Authenticode/WinTrust no comprobados, compatibilidad real y accesibilidad Windows no ejecutadas |

El servidor usa solo módulos integrados, escucha en IPv4 loopback con puerto asignado por el SO, sin directorios públicos o exposición de runtime/sesión. Rechaza Host ajeno, traversal, symlinks, métodos de escritura y cierre no autenticado; el token permanece en un archivo temporal local no servido. CSP con hashes para scripts inline originales, self para módulos y conexiones, object/base/frame bloqueados; style inline permitido para el tamaño del lector. No se aplica esta política al dominio de producción.

La identidad de servicio, archivo `SESION_DESIGN001D.json`, endpoints y hoja usan un namespace distinto de WEB-004. Dos aperturas reutilizan solo la instancia propia. Cierre, recuperación de sesión obsoleta, fallo ante bytes cambiados y limpieza sin huérfanos se verifican en Linux con Node de la misma versión; no se presentan como ejecución del EXE Windows.

La hoja `revision/REVISION_MANUAL.html` tiene 12 casos generales y M01–M16 por separado para NVDA/Firefox y Narrador/Edge: **44 resultados inicialmente No probado**, recomendación No evaluada y automaticApproval=false. Registra operador/fecha/Windows/navegador/lector/escala y notas por caso. El informe admite comentarios e incidencias con URL, pasos, esperado/observado, gravedad y nombres de capturas voluntarias. No adjunta audio/imágenes ni los envía.

JSON y TXT se descargan con Blob; borrador local solo al pulsar Guardar y ligado a origen/puerto. La importación exige paquete, SHA y revisión de esquema `DESIGN001D-R1`, valida todas las entradas antes de aplicarlas y nunca inserta HTML. Admite hasta 4 MB para no impedir reimportar notas Unicode válidas de los 44 casos; longitud/casos/valores/fechas se controlan. No se importan evaluaciones WEB-004 ni de otra versión. También funciona exportación file:// y desde la hoja ya cargada tras parar el servidor.

## Evidencias, reproducción y pendientes

Evidencia descargable incluye log de suite, client-audit.json, métricas de carga, npm audit, inventario/hash del build, tests de servidor y paquete, capturas y métricas de zoom. Los JSON QA generados para probar el formulario NO son revisiones humanas ni se distribuyen como respuestas del usuario; la hoja se entrega vacía.

Herramientas reproducibles en `tools/design-001-d/`; comandos y argumentos en su README. El test del servidor se integra a unitarias de la nueva rama. Los archivos grandes, runtime, capturas, ZIP y cuerpos sintéticos expandidos permanecen fuera de Git. El inventario `DESIGN-001-D-INTEGRITY.json` acredita que los 83 archivos Git de la versión auditada siguen iguales; **no es un manifiesto de los 84 originales editoriales privados**.

**Pendiente:** ejecutar en Windows real el lanzador, revisar advertencias del SO, usar teclado y combinaciones AT, probar zoom 200/400 en Firefox/Edge, registrar palabras escuchadas y devolver hoja. El protocolo incluye menú, índice, referencias, búsqueda múltiple, estados, atlas, nuevas áreas y exportación. La aprobación no se deduce de contadores automáticos.

## Conservación y rollback

PR #2 se conserva en b922bc9, PR #5 en 0e2efc0 y PR #6 en 6091b56; no se modifican, fusionan o cierran. WEB-004 conserva 43.999.242 bytes y SHA `fbc5dde13575856ae144df8cda4b3e36d95b567cea2eb248967a167e4290ec60`.

Fuente Maestra v0.16.1: 84 aprobados, 294 IDs, 42 paquetes históricos y cuatro matrices fuera de plazas, según control del propietario, sin inspección de originales. CHR r02 sigue sin certificación 1.30.164078 ni permiso de publicación. LIV y AUD-130 aislados; C29/E30/CE26/D30DOC separados, D26 bloqueado para cifras oficiales. No se añade integración editorial.

Rollback de revisión: exportar comentarios, cerrar con su CMD y eliminar exclusivamente la carpeta nueva si se decide descartar; WEB-004 y el prototipo fuente no requieren restauración. Mantener rama/PR de auditoría como evidencia o cerrarlo por decisión del propietario; no reescribir ramas ni hacer force push. Las propuestas D-P01/D-S01/D-V01, si se autorizan, irán en una rama y PR correctivos independientes con regresiones, límites y rollback propios. Sin despliegue, DNS o cambios de Cloudflare en ninguna fase de esta entrega.
