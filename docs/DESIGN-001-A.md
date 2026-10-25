# DESIGN-001-A · Inventario y arquitectura incremental

Fecha: 2026-10-25. Estado: propuesta documental para revisión del propietario; no autoriza DESIGN-001-B, incorporación editorial ni despliegue. Referencia: contrato DESIGN-001 recibido en esta conversación. Fuente auditada: `b922bc9c0f4e0685b13f81f54228e1d07e4e62ba` de [PR #2](https://github.com/bachboy22/www.dayz-survival.com/pull/2).

## Alcance y decisiones

Conservar Astro estático, TypeScript, búsqueda local, patrones de teclado, lector y pruebas existentes. Separar presentación, procedencia y autorización editorial antes de ampliar el catálogo. No se necesita reconstruir la aplicación ni introducir un framework cliente, backend, cuentas o servicios remotos.

Este cambio añade solo este informe y `DESIGN-001-A-INVENTORY.json`. No modifica páginas, CSS, scripts, dependencias, workflow, WEB-004 ni la rama de PR #2. La rama documental parte de su SHA exacto y el PR apunta a `feat/web-v0.1` para mostrar únicamente documentación; depende de PR #2, pero no lo modifica ni lo fusiona. No debe retargetearse a main sin revisar el diff, pues main sigue siendo el bootstrap y mostraría también la aplicación pendiente de PR #2.

La Fuente Maestra v0.16.1 es solo lectura: 84 artículos aprobados, 294 IDs y 42 paquetes históricos. Las cuatro matrices derivadas no son plazas; LIV conserva IDs independientes y no consume cupos históricos. Son recuentos proporcionados por el propietario, no resultados de una inspección de originales. No se ha accedido, copiado, transformado ni calculado hashes de los 84 manuscritos privados. El manifiesto adjunto inventaría los 60 archivos Git de la aplicación de referencia, NO sustituye al futuro manifiesto editorial.

## Evidencia y estado real

| Objeto | Observación comprobada en DESIGN-001-A | Límite |
| --- | --- | --- |
| PR #2 | Abierto, no fusionado, head `b922bc9`, base main `7dbc4d3` al consultar GitHub | Revisión humana pendiente; no aprobación implícita |
| Checkout de referencia | Árbol limpio, branch `feat/web-v0.1`; 60 archivos rastreados en el SHA auditado | El acceso Git HTTPS por consola falló por falta de autenticación; se usa el conector GitHub |
| WEB-004 | ZIP disponible, 43.999.242 bytes; CRC íntegro; 73 entradas SHA-256 verificadas; los 13 archivos del sitio coinciden con MANIFEST | No se reempaquetó, arrancó ni modificó durante esta auditoría |
| Aplicación | Un artículo sintético DEMO-001 y una ficha DEMO-CARD-001; 10 páginas estáticas contando 404 | Cero manuscritos reales; no representa catálogo ni cobertura técnica |
| Datos de juego | Vías C29/E30/CE26/D30DOC separadas en tipos y validación; D26 rechazado | No existe aquí evidencia que permita certificar PC Stable 1.30.164078 |
| Windows | Informe WEB-004 declara Windows, EXE, doble clic CMD, NVDA/Firefox y Narrador/Edge NO EJECUTADOS | Siguen pendientes del PC real; esta auditoría no los ejecuta ni aprueba |

ZIP protegido: `DAYZ-SURVIVAL_WEB-004_WINDOWS_REVISION.zip`, SHA-256 `fbc5dde13575856ae144df8cda4b3e36d95b567cea2eb248967a167e4290ec60`. El inventario contiene ese valor y hashes de los archivos Git para repetir la comprobación. No se añaden binarios, capturas o ZIP a GitHub.

## Inventario de rutas

| Ruta actual | Fuente | Reutilización prevista, sujeta a autorización B |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Inicio: conservar accesos manual/fichas/atlas; añadir búsqueda principal y cobertura documentada, no inferida de 84/294/42 |
| `/buscar/` | `src/pages/buscar/index.astro` | SearchPanel reutilizable; ampliar a varios resultados y filtros reales |
| `/manual/` | `src/pages/manual/index.astro` | Listado DEMO, taxonomía todavía no implementada |
| `/manual/leer-una-ficha/` | `src/pages/manual/leer-una-ficha.astro` | Lector fijo DEMO con índice, A−/A+, ficha y referencias; futuro adaptador de rutas por contenido |
| `/fichas/` | `src/pages/fichas/index.astro` | Ficha DEMO independiente y enlace a lectura larga |
| `/atlas/chernarus/` | `src/pages/atlas/chernarus/index.astro` | Placeholder CHR: sin contenido autorizado ni mapa real |
| `/atlas/livonia/` | `src/pages/atlas/livonia/index.astro` | Placeholder LIV separado; sin localidades ni cartografía |
| `/fuentes/` | `src/pages/fuentes/index.astro` | Procedencia y límites; conservar enlaces al introducir Acerca/Herramientas |
| `/acerca/` | `src/pages/acerca/index.astro` | Alcance y proyecto; ampliar método, versiones y licencias |
| `/404.html` | `src/pages/404.astro` | Página de error estática; respuesta HTTP depende del servidor de destino |

No existen aún `/aprender/`, `/atlas/` como entrada general, `/herramientas/`, páginas territoriales, glosario o rutas de aprendizaje. El header actual tiene Inicio/Manual/Chernarus/Livonia/Fuentes/Acerca y búsqueda: no es todavía la navegación propuesta Inicio/Aprender/Manual/Atlas/Herramientas/Acerca del proyecto. Mantener compatibilidad con rutas y fragmentos existentes antes de cualquier reorganización. No crear rutas vacías que aparenten contenido aprobado.

## Inventario técnico

- `src/layouts/Layout.astro`: documento HTML español, metadatos básicos y noindex/nofollow, skip link, header/footer, menú con aria-expanded, Escape y recuperación del foco a través del breakpoint de 64rem. GlobalHeader y ResponsiveNavigation existen como lógica incrustada, no como componentes separados.
- `src/components/ArticleCard.astro`: tarjeta hardcodeada a DEMO-001; `DemoNotice.astro`: aviso DEMO; `Icon.astro`: SVG propio local; `AtlasPage.astro`: shell por mapa; `Terrain.astro`: SVG conceptual, nunca mapa verificable.
- Lector: ArticleReader, ArticleOutline, CrossReferencePanel, QuickFieldCard y ReadingPreferences están incrustados en páginas, no abstraídos. Controles de cuatro niveles de texto, aproximadamente 100–135%, sin persistencia; los límites mantienen el foco con aria-disabled. La ficha se muestra dentro del artículo y en `/fichas/`, no hay conmutador rápido/largo de producto.
- `src/styles/global.css` y `accessibility.css`: tokens actuales bosque/papel, sans Arial/Helvetica, capas CSS, reflow, foco, colores forzados, movimiento reducido e impresión. No hay fuentes remotas. La paleta propuesta Field Intelligence difiere de la actual y no se aplica en A.
- `src/data/demo.ts`: única fuente consumida por la web. `src/lib/search.ts`: normalización de acentos, AND de tokens y etiqueta sobre título/resumen/cuerpo. `src/scripts/search.ts`: filtros, querystring y anuncio polite/atomic con debounce 250 ms y textContent. **La vista solo oculta/muestra una tarjeta y anuncia 0/1**: aunque la función admite colecciones, el controlador y render no son todavía un buscador de catálogo.
- `src/lib/content.ts`: tipos, baseline editorial, hash SHA-256 del texto UTF-8 sin normalización, validación DEMO y frontera de importación de producción. `createProductionExport` produce un objeto validado, no un pipeline editorial conectado al sitio.
- `scripts/validate-content.ts` valida DEMO al compilar. `scripts/validate-import.ts` lee dos JSON externos (lote/allowlist), rechaza rutas internas y destinos symlink internos; no escribe, publica ni imprime manuscritos.
- `astro.config.mjs`: salida estática, trailingSlash always, devToolbar desactivada. No adaptador Cloudflare ni integración remota. Desarrollo/preview limitados a 127.0.0.1.
- `tests/unit/{content,import-cli,search}.test.ts`, `tests/e2e/{reader,accessibility,zoom}.spec.ts`: frontera de datos/hash, búsqueda, lector, navegación, axe y zoom. Extensión local de test para zoom real Chromium. No pruebas Windows/AT reales.
- `.github/workflows/ci.yml`: CI Ubuntu de instalación bloqueada, tipos, validación, unitarias, build, Chromium/Playwright y artefactos; Actions fijadas por SHA, permisos contents:read. No despliega. El nombre exacto se comprueba en el manifiesto de archivos.
- `.gitignore`: excluye dependencias, builds, secretos, imports, respaldos, ZIP/bundle/patch y evidencia generada. Es defensa auxiliar, no control suficiente de privacidad; revisar siempre diff y artefactos.

### Dependencias fijadas

| Clase | Paquete / versión |
| --- | --- |
| Runtime de referencia | Node `.nvmrc` 24.19.0; engines >=22.23.4 <25; npm 11.9.0, engines >=11 <12 |
| Producción/build | astro 7.4.2 |
| Desarrollo | @astrojs/check 0.9.12; @axe-core/playwright 4.14.0; @playwright/test 1.64.1; @types/node 24.19.2; tsx 4.23.15; typescript 6.0.3 |
| Reproducibilidad | package-lock.json versionado, npm ci y acciones CI por SHA |

Sin cambios de versión propuestos para A. No se ejecutó un análisis de vulnerabilidades actualizado; fijación de versiones no demuestra ausencia de vulnerabilidades. Las descargas de desarrollo/CI son distintas de las dependencias del navegador: el sitio y la revisión funcionan con recursos locales, sin cuentas, analítica o telemetría. No añadir servicios o dependencias remotas de producto sin aprobación.

## WEB-004: inventario externo y reutilización

No está integrado en el repositorio y debe permanecer congelado mientras se revisa en Windows. Se inspeccionaron el ZIP, MANIFEST, SHA256SUMS, informe y resultados guardados. La documentación registra pruebas anteriores; no se presentan como nuevas ejecuciones.

| Pieza externa | Función | Decisión |
| --- | --- | --- |
| `sitio/` | Build exacto de b922bc9: 10 HTML y recursos, 13 archivos | Conservar intacto como baseline, no sustituir con DESIGN |
| `ABRIR_REVISION.cmd`, `CERRAR_REVISION.cmd`, `VERIFICAR_ARCHIVOS.cmd` | Entrada/cierre/integridad previstos Windows | Reutilización futura condicionada a prueba Windows real; no modificar ahora |
| `runtime/` | Node portable oficial win-x64, LICENSE, hashes y procedencia | Mantener fuera de Git; revisar política de redistribución/versiones para cada futura entrega |
| `servidor/server.cjs` | Loopback, puerto asignado por SO, control de archivos/sesión, CSP de hashes, cierre propio | Candidato a tooling separado después de revisión, no nuevo backend ni servicio público |
| `revision/REVISION_MANUAL.html`, JS/CSS | 8 casos generales + dos series M01–M12; exportación/importación JSON/TXT, borrador opcional | Reutilizar contrato de evaluación; preservar SHA de paquete, no migrar respuestas al prototipo automáticamente |
| `evidencia/`, MANIFEST, SHA256SUMS | Capturas, logs, trazabilidad | Referenciar como evidencia histórica; no meter capturas/runtime en este PR |

Informe histórico: 34 unitarias y 47 Playwright aprobadas, una omisión intencional; 36 auditorías axe de fuente; 8 pruebas del servidor y 18 comprobaciones agrupadas del paquete aislado Linux/Chromium, 16 axe adicionales. Zoom desktop real 200/400 y pinch móvil emulado son modalidades distintas. Los resultados están documentados en WEB-003/WEB-004 y no equivalen a WCAG certificada, Windows probado ni aprobación humana. Hoja de usuario comienza en No probado/No evaluada, sin aprobación automática. Mantener WEB-004 abierta hasta su aceptación explícita.

## Matriz de decisión

Decisiones de diseño, no cambios ejecutados. ADAPTAR significa conservar la lógica válida y modificarla con pruebas en B o C.

| Elemento del contrato | Decisión | Base y justificación / fase |
| --- | --- | --- |
| Astro estático + TS | REUTILIZAR | Adecuado para lectura local, mínimo JS y export reproducible; B |
| GlobalHeader / ResponsiveNavigation | ADAPTAR | Extraer Layout, conservar foco/Escape/sin JS, nueva IA sin romper rutas; B |
| SearchPanel | ADAPTAR | Motor local válido; render multirresultado, contadores y filtros aún 0/1; B |
| ContentCard | ADAPTAR | ArticleCard parametrizada; nivel h2/h3 según contexto, etiquetas DEMO y estados distintos; B |
| ArticleReader / ArticleOutline | ADAPTAR | Extraer shell de página DEMO, foco en h2 y anclas estables; texto original no pasa por reescritura; B/C |
| QuickFieldCard | ADAPTAR | Estructura hoy items[]; nuevos campos situación/decisión/error/dos señales/salida/fuente, solo DEMO en B |
| CrossReferencePanel | ADAPTAR | Enlaces actuales estáticos; resolver IDs con índice validado, informar destinos no autorizados sin inventar texto; B/C |
| ReadingPreferences | ADAPTAR | Mantener cuatro niveles y anuncios; preferencia persistente opcional/local y compatibilidad zoom; B |
| DemoNotice | REUTILIZAR | Marcación inequívoca; DEMO no se transforma en estado aprobado; B |
| EvidenceLabel / GameVersionPanel | CREAR | Editorial y técnico como ejes separados; build/mapa/canal/fuente/fecha/límites; B con DEMO |
| TopicIndex / Aprender / Herramientas | CREAR | No existen rutas/taxonomías completas; índices derivados, sin alterar corpus; B incremental |
| AtlasLanding | CREAR | Entrada común por mapa; sin mezclar IDs ni cupos; B |
| AtlasPlacePage / RegionalOverview | CREAR | Plantillas DEMO territoriales, sin coordenadas/localidades reales supuestas; B posterior |
| MapPlaceholder | ADAPTAR | AtlasPage conserva aviso; Terrain no es cartografía; B |
| Cartografía georreferenciada y calculadoras | DESCARTAR | Del alcance de prototipo: faltan autorización, licencia, precisión y datos verificados; reconsiderar solo con evidencia |
| RevisionFeedbackExport | ADAPTAR | A partir de hoja externa WEB-004, nueva copia y schema/versionado propios; no tocar la entrega congelada; B/D |
| Validación de importación actual | ADAPTAR | Preservar fail-closed; revisar autorización editorial vs técnica y hashes de originales/export; C |
| Pruebas Playwright/axe/zoom | REUTILIZAR | Ampliar con múltiples fixtures/rutas; automática != lector de pantalla; B/D |
| ART-001, iconos SVG, tipografía local | REUTILIZAR | Procedencia y sin recursos remotos; revisar iconos nuevos en contexto; B |
| Paleta Field Intelligence | ADAPTAR | Propuesta pendiente, no reemplaza aprobación humana de WEB-004; ratios por uso; B |
| UI dependiente de un único DEMO fijo | DESCARTAR | Como modelo de catálogo: no escalar su lógica 0/1 ni IDs hardcodeados; reemplazo gradual probado, B |
| Arte IA final, mapas inventados, integración remota por defecto | DESCARTAR | Incompatible con ART-001, privacidad y contrato; todas las fases |

## Arquitectura propuesta: separar fuente, derivaciones y presentación

Flujo futuro: originales privados de solo lectura → export autorizado reproducible → validación integral y manifiesto → modelo público mínimo → índices/rutas estáticos → vistas rápida/manual/atlas. B usa solo fixtures DEMO y no accede a originales. C requiere datos y permiso específicos; no se activa por aprobar esta auditoría.

1. **Registro privado de originales**: IDs auténticos inmutables, versión, bytes/hash del archivo original, autorización editorial y de publicación separadas. No materializar lista imaginaria de 84 IDs. Nunca añadir original_file_pointer privado al bundle cliente, HTML, logs, CI o manifiesto público. Los hashes prueban integridad, no autoría o autorización.
2. **Export fiel**: distinguir `original_file_sha256` (contenedor original) de `source_hash` (bytes exactos del export autorizado) y su especificación de extracción. El hash actual solo cubre rawText codificado UTF-8; no demuestra preservación byte a byte del DOCX/ZIP original. Rechazar bytes/UTF-8 inválidos o conversión no aprobada; no normalizar Unicode, BOM, saltos o espacios. Mantener originales byte a byte fuera de Git y registrar transformación/versionado cuando exista autorización.
3. **Metadatos separados**: content_id, canonical_title y provisional_title diferenciados; map_scope, content_type y taxonomía derivados; editorial_status independiente de technical_status; evidence_refs[] como registros con build/canal/mapa/plataforma/fecha/revisor/límites. No reducir varias evidencias incompatibles a un único verified_game_build sin contexto.
4. **Derivaciones revocables**: summary_derived y quick_card_derived en registros independientes con derived_from_id/hash, versión de regla, fecha, responsable, aprobación y estado de revocación. No reemplazan párrafos ni título original. Una revocación quita índices/vistas derivados en la siguiente exportación; no escribe sobre el original. Cuatro matrices con tipo derivado, sin contabilizar plazas históricas.
5. **Autorización explícita**: editorial approved no implica publicación permitida ni técnico verified. EvidenceLabel puede mostrar APROBADO_EDITORIAL y PENDIENTE_VERIFICACION juntos; VERIFICADO_VERSION solo con alcance/evidencia concretos. DEMO excluye aprobación real. Sin color verde o icono de verificado por aprobación editorial. D26 bloqueado para cifras oficiales; C29/E30/CE26/D30DOC permanecen registros distintos, sin inferir Stable 1.30.164078.
6. **Namespaces y acceso**: core histórico 294/42, CHR r02, LIV y AUD-130 separados por política. LIV no entra en el límite de 84 del núcleo ni comparte asignador de IDs. CHR r02 no autorizado para publicar, aunque esté aprobado editorialmente. Índices públicos solo incluyen registros expresamente autorizados; ninguna integración Drive/Cloudflare implícita.
7. **Render fiel**: shell y anotaciones separados del cuerpo original, sin inyectar enlaces o encabezados editando manuscritos. Un adaptador puede asignar anclas externas a bloques de export aprobado con offsets/hash verificables. Si no se dispone de segmentación fiel autorizada, mostrar texto preservado y limitar índice antes que inventar estructura. Comparar bytes de fuente; comparar semántica/orden de presentación por separado, pues HTML serializado no es el archivo original.

### Diferencias del contrato actual que requieren decisión C

`ImportEnvelope` y `ImportAuthorization` actuales exigen evidencia verified para que un registro approved atraviese la frontera, permiten solo core/chernarus-plus, bloquean prefijos CHR/LIV/AUD/DEMO y requieren que relatedIds resuelva dentro del mismo lote. Son límites de seguridad vigentes, NO se levantan en A ni B. El documento IMPORT-CONTRACT también conserva una referencia antigua a CHR r01: debe reconciliarse con r02 antes de C, sin convertir aprobación editorial en permiso de publicación.

Para permitir eventualmente una lectura autorizada con verificación técnica pendiente haría falta una política nueva aprobada, schema versionado y tests negativos; no eliminar simplemente la exigencia verified. Proponer un registro de autorizaciones de publicación por ID/hash separado de los registros técnicos y del estado editorial. RelatedIds hacia material no publicado puede conservarse en el registro privado, pero nunca generar enlaces rotos o revelar títulos privados en el índice público. Decidir enlaces parciales y lotes incrementales antes de activar C.

### Estructura sugerida, no creada

```text
src/
  layouts/Layout.astro                   # conservar shell y metadatos
  components/
    navigation/{GlobalHeader,ResponsiveNavigation}.astro
    search/SearchPanel.astro
    content/{ContentCard,TopicIndex,EvidenceLabel,GameVersionPanel}.astro
    reader/{ArticleReader,QuickFieldCard,ArticleOutline,CrossReferencePanel,ReadingPreferences}.astro
    atlas/{AtlasLanding,AtlasPlacePage,RegionalOverview,MapPlaceholder}.astro
    review/RevisionFeedbackExport.astro
  lib/
    search.ts                           # motor local existente
    content.ts                          # frontera actual conservada hasta migración aprobada
    content/{schema,provenance,authorization,derivations}.ts
  data/demo/                            # fixtures explícitos, namespaces DEMO; B
  generated/public/                     # solo export mínimo autorizado; C, no originales
  pages/                                # conservar enlaces actuales durante transición
    aprender/index.astro
    herramientas/index.astro
    atlas/index.astro
    atlas/[map]/[slug].astro             # solo si hay fixture/publicación autorizada
    manual/[slug].astro                  # reemplazo controlado de ruta fija
  styles/{global,accessibility,tokens}.css
scripts/editorial/                      # validar/exportar sin escribir en originales; C
schemas/                                # JSON schema export/derivaciones/revisión versionados
tests/{unit,e2e,fixtures}/               # ampliar pruebas actuales, solo sintéticos
docs/design/                            # decisiones futuras, autorización y límites
```

`tests/` y `docs/` son directorios de raíz. Tooling de un futuro paquete Windows puede vivir en `tools/review-package/` tras revisión propia, conservando binarios/runtime/capturas/ZIP fuera de Git. Los datos privados y sus backups permanecen fuera del checkout, también fuera de directorios generados y artefactos CI. No se crean los directorios propuestos en A.

## Diseño, accesibilidad y verificación pendiente

Field Intelligence es propuesta, no cambio aprobado de WEB-004. Conservar bosque oscuro, papel cálido y lectura protagonista; sans legible sin fuentes militares para párrafos. Probar tokens propuestos #171E1B/#252C28/#25312B, texto #F3F0E7, secundario #CFD4C9, oliva #A7B49B y borde #48554C por pareja y estado real: texto normal >=4.5:1; texto grande y elementos no textuales aplicables >=3:1. No se han calculado aquí esos ratios ni aprobado paleta o conformidad WCAG 2.2 AA. Un borde decorativo y un borde que identifica un control tienen requisitos distintos.

B/D deben conservar landmarks, jerarquía, labels, teclado, foco, escape, avisos de búsqueda sin mover foco, reduced motion, colores forzados y controles táctiles. Pruebas a 320 CSS px y zoom real 200/400 con múltiples resultados, títulos largos y A+; tablet, escritorio y móvil. Hacer explícita la diferencia entre zoom desktop, viewport estrecho y pinch emulado. Solo Windows real con NVDA/Firefox y Narrador/Edge permite registrar esos resultados; seguir M01–M12 con versiones, operador, fecha, palabras realmente escuchadas e incidencias. Axe/DOM/capturas no sustituyen esa revisión.

SEO básico futuro: títulos/descripciones/rutas únicos, enlaces válidos y política noindex en DEMO; no generar catálogo/sitemap público ni datos estructurados que aparenten artículos reales. Rendimiento: medir tamaño/JS local y latencia de búsqueda con fixtures sintéticos representativos; no fijar cifras como resultados sin ejecutarlas. Seguridad: HTML/texto escapado, mínimo público sin pointers privados, dependencias/lockfiles revisados y ausencia de peticiones externas; servidor local solo en tooling de revisión, no exponerlo a red pública.

## Riesgos, decisiones pendientes y mitigación

| Riesgo / decisión | Mitigación y condición de avance |
| --- | --- |
| Confundir propuesta con interfaz aprobada | A documental; B requiere autorización nueva; WEB-004 permanece congelado y pendiente Windows |
| PR documental arrastra aplicación no fusionada | Base feature para diff de solo docs; revisar dependencias antes de retarget/merge; nunca fusionar #2 por esta tarea |
| Hash del texto presentado como preservación de original | Manifiestos separados contenedor/export, bytes exactos, formato aprobado y revisión de representación; C |
| Estados editorial/técnico/publicación mezclados | Tres ejes, políticas versionadas, pruebas negativas, sin verificación 1.30 por inferencia |
| Catálogo multirresultado falla por lógica 0/1 | Parametrizar render y estados, fixtures DEMO múltiples, teclado/contador/filtros/vacío; B |
| Conteos históricos alterados por LIV/matrices | Registros y pruebas de invariantes separados, sin reconstruir IDs desconocidos |
| Fuga por Git, HTML, logs, artefactos o exportación | Allowlist pública, diff/escaneo y ausencia de originales/pointers; no confiar solo en .gitignore |
| Mapas y cifras infundadas | Placeholders etiquetados; bloquear mapa real/calculadoras hasta derechos y evidencia específica |
| Necesidad de acceso editorial/cartográfico | Pendiente autorización y entrega específica; no buscar privados ni inventar disponibilidad |
| Evidencia Windows inexistente | Registrar NO EJECUTADO; aceptación humana del ZIP original antes de darlo por validado |
| Nueva paleta pierde contraste o legibilidad | Medir parejas/estados, revisión visual y AT en D; no alterar baseline |

## Secuencia propuesta de commits y aprobación

A: `docs: audit existing reader and frozen WEB-004 for DESIGN-001` — este informe y manifiesto. Sin cambios funcionales.

Solo tras autorización B, en otra rama y PR borrador independientes del PR documental, con base acordada tras comprobar el estado de PR #2:

1. `refactor: extract reader and navigation without changing behavior` — extraer componentes, conservar rutas/anclas y pruebas existentes; no modificar paquete WEB-004.
2. `feat: model isolated demo cards and evidence labels` — varios fixtures inequívocos, tres ejes de estado, FIELD CARD con campos del contrato y enlaces rápido/largo; sin datos reales.
3. `feat: add responsive information architecture and local search` — seis entradas principales, inicio/búsqueda, render multirresultado, filtros documentados; Aprender/Herramientas solo funciones DEMO autorizadas.
4. `feat: add independent demo atlas placeholders` — entrada mapas y fichas territoriales DEMO claramente sintéticas, sin mapa georreferenciado ni cifras reales; LIV independiente.
5. `style: apply reviewed field intelligence tokens` — si se aprueba el estilo, ratios y controles revisados sin perder papel cálido; ART-001 permanente.
6. `test: verify prototype interaction accessibility and local feedback` — regresión, evidencia automática y export de revisión propio; ningún resultado humano generado por automatización.

C: autorización expresa de datos/política de publicación, contrato/export versionados, manifiestos de originales/export, hashes y pruebas de rechazo; después conectar solo export mínimo autorizado. No programado ahora.

D: revisión de accesibilidad, rendimiento, SEO, seguridad y Windows real con evidencias; registrar pendientes y aprobación humana explícita. Sin despliegue automático en ninguna fase. Revisión por PR, checks aplicables y diff de datos antes de cualquier fusión; decisiones de publicación requieren autorización independiente.

Rollback A: cerrar el PR borrador y conservar o eliminar exclusivamente su rama documental según decisión del propietario. No hace falta restaurar la aplicación ni WEB-004 porque no cambian. Futuro B: rama separada y commits pequeños reversibles; conservar baseline y no ejecutar sustitución del ZIP original. Futuro C: revocar export/derivaciones por versión y reconstruir solo desde autorizaciones vigentes, sin tocar originales ni reescribir historial.

## Verificaciones de esta auditoría

Ejecutadas: lectura de AGENTS.md/ART-001, árbol Git y fuentes/configuraciones/pruebas; consulta de PR #2 por GitHub; comparación de los 60 archivos base con sus blobs Git y SHA-256; lectura/CRC del ZIP WEB-004, 73 hashes internos y 13 hashes de sitio; inventario y revisión de alcance documental. Los resultados repetibles están en `DESIGN-001-A-INVENTORY.json`.

No ejecutadas de nuevo en A: build de aplicación, Playwright, axe, zoom, tests de paquete ni pruebas Windows/AT. No hay cambios de aplicación que justifiquen repetir esas pruebas locales; la CI del nuevo PR, si se ejecuta, es una ejecución separada que debe consultarse antes de declararse aprobada. Los resultados históricos se distinguen arriba. No se fabrican comprobaciones técnicas para 1.30, derechos cartográficos ni aprobación del propietario.
