# WEB-005 · Pruebas y límites

Fecha de cierre de ejecución local: 2 de noviembre de 2026 UTC. Linux, Node 24.19.0, npm 11.9.0, Python 3; Chromium automatizado. Ningún resultado representa una prueba física de Windows, móvil/tablet o lector de pantalla.

## Resultados ejecutados

| Comprobación | Resultado |
| --- | --- |
| Instalación fijada `npm ci --no-fund --no-audit` | Código 0, sin cambios de dependencias/lockfile |
| `npm run check`, final | 0 errores, 0 advertencias, 0 hints |
| `CI=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`, ejecución final | Código 0: 61 unitarias, build DEMO, 89 Playwright aprobadas y 1 omisión intencional |
| Importador privado, corpus completo | 308 IDs únicos, 294 históricos + 14 LIV; contenido no vacío en todos |
| Fidelidad histórica por bytes | 84 v0.16.1 + 11 CHR r02 + 4 pilotos LIV coinciden con sus archivos históricos |
| Hash de entrega integral | Coincide con SHA-256 suministrado separadamente en Drive: `4738c473c7da77a9e6d3ae47c1fbf0024ad5c35041e907dfcdaa1e1cfbad86bc`; CRC del ZIP correcto |
| Repetición del importador final | 317 archivos generados idénticos byte a byte entre dos importaciones |
| Build privado | 323 HTML, incluidos los 308 artículos completos, más índice de búsqueda |
| `verify-build.py` sobre salida completa | 308 hashes de originales y 308 textos visibles comparados; 10.168 enlaces internos comprobados, 0 rotos |
| HTTP del paquete | 308 páginas de artículo + 308 originales devuelven 200; ruta inexistente devuelve 404 |
| axe sobre corpus completo | 308 artículos a 320 CSS px, 0 infracciones detectadas y 0 desbordamientos generales |
| Responsive + funciones privadas | 42 auditorías axe: 14 rutas × 320/768/1440 CSS px, 0 infracciones; teclado, foco, búsqueda, AND/substrings por texto, filtros, vacío, paginación, atrás, controles A−/A+ y no-JS |
| Zoom privado real de Chromium | 10 auditorías axe, 5 rutas × 200/400%; `chrome.tabs.setZoom`, viewport físico 1280 → layout 640/320 CSS px; 0 infracciones/desbordamientos generales |
| HTML autónomo sin conexión | 3 contextos 320/768/1440; navegación, búsqueda, descarga del original exacto, JSON/TXT y 3 axe sin infracciones; 0 solicitudes de red y 0 errores JS |
| Servidor privado, fixtures sintéticos | 8 pruebas Node aprobadas: loopback, Host, traversal, HEAD, escritura rechazada, cierre autenticado, symlink e integridad |
| Lista permitida de HTML, fixtures sintéticos | 9 casos Python aprobados, incluidos en una de las 61 unitarias Node: conservación de texto, referencias, scripts/eventos/URLs inseguras |
| Privacidad en navegación automatizada | 0 solicitudes remotas espontáneas, sin telemetría ni cuentas |
| Registro de ilustraciones | 308 IDs coincidentes + portada + 8 separadores; ningún asset aprobado automáticamente |

Las 363 auditorías axe específicas privadas (308 + 42 + 10 + 3) son ejecuciones, no 363 documentos únicos. Las pruebas previas del modo DEMO se conservan; sus auditorías no se confunden con las del corpus. Las tablas admiten desplazamiento local mediante foco de teclado; no se oculta desbordamiento a nivel de documento para simular reflow.

## Incidencias observadas y corregidas

- Una tabla de equipo era desplazable sin poder recibir foco a 320 CSS px. La representación ahora añade foco y nombre accesible, sin tocar el Markdown ni el texto; la repetición completa de 308 artículos pasó.
- Una prueba suponía un único resultado al buscar un ID. La búsqueda universal también encuentra menciones de ese ID en otros textos: se corrigió la expectativa, conservando la semántica de búsqueda.
- El Chromium del sistema no cargaba la extensión QA de zoom. Los intentos iniciales fallaron por timeout; la configuración de prueba ahora elige explícitamente el Chromium instalado de Playwright y retira su argumento de desactivación de extensiones. No se desactiva ninguna comprobación de la aplicación. La ejecución final completa y el zoom privado real pasan.
- La API de zoom devuelve 3.9999999999999996 para 400% en una ejecución; la prueba usa tolerancia numérica, comprobando además ancho CSS y devicePixelRatio reales.
- El navegador gestionado rechazó `file://` con `ERR_BLOCKED_BY_ADMINISTRATOR`. No se eludió su política. El HTML autónomo se probó cargando los mismos bytes con `setContent` en contextos offline; la apertura local real sigue pendiente. No se presenta como doble clic validado.
- Un glifo decorativo sin cobertura de fuente se sustituyó por el SVG funcional existente. El registro CSV de ilustraciones usa separador `;`, que ahora se valida explícitamente contra los 308 IDs.

## Comprobaciones humanas pendientes

| Entorno | Estado |
| --- | --- |
| Windows x64: extracción, doble clic CMD, ejecución de node.exe, apertura/cierre y exportaciones | **NO EJECUTADO**; runtime comprobado por SHA oficial y PE AMD64, no por ejecución Windows |
| NVDA + Firefox en Windows | **NO EJECUTADO** |
| Narrador + Edge en Windows | **NO EJECUTADO** |
| Dispositivos móviles y tablet físicos, apertura de HTML local y descargas | **NO EJECUTADO**; emulación responsive no equivale a dispositivo real |
| Relectura humana de los 308 manuscritos y validación de sus mecánicas | **NO EJECUTADO**; la fidelidad automática no es certificación de juego |
| Aprobación definitiva de ARCHIVE-86 implementado, derechos/alt de futuras ilustraciones | Pendiente del propietario |

La hoja independiente `/revision/` incorpora protocolo de teclado, lectores, zoom y exportación JSON/TXT con `automaticApproval:false`. Nunca se marca una prueba humana por un resultado automático. Axe no acredita por sí solo WCAG 2.2 AA.

## Evidencias, CI y rollback

La entrega privada contiene logs, JSON por ruta, capturas de responsive y zoom, manifiestos y hashes. No se suben a artefactos públicos datos del corpus ni capturas de artículos. La CI del PR solo puede comprobar código, modo DEMO y fixtures sintéticos; su estado debe leerse en GitHub para el SHA final, sin atribuirle pruebas privadas que no ejecuta.

Para repetir: `python3 tools/web-005/verify-build.py private/web005/dist`, `node --test tools/web-005/server.test.cjs`, y los tres scripts `audit-browser.mjs`, `audit-all-articles.mjs`, `audit-zoom.mjs` contra el origen loopback del paquete. `audit-portable.mjs` recibe el HTML y directorio de evidencia privados. Instalar Chromium de Playwright para el zoom real.

Rollback: cerrar la sesión local y volver a la base `5a06e69` o compilar el modo DEMO sin la variable privada. No modifica originales, WEB-004, Cloudflare ni DNS. No hay migraciones ni cambios públicos que revertir. La integración pública y cualquier despliegue necesitan autorización posterior.
