# DESIGN-001-B · Prototipo de experiencia de usuario

Fecha: 2026-10-25. Implementación autorizada por el propietario en la conversación, posterior a la propuesta. Estado: prototipo DEMO para revisión; no aprobación de interfaz, publicación o despliegue. Base exacta: `b922bc9c0f4e0685b13f81f54228e1d07e4e62ba` (PR #2). Rama independiente: `feat/design-001-b`. [Auditoría DESIGN-001-A, PR #5](https://github.com/bachboy22/www.dayz-survival.com/pull/5).

## Qué cambia

Se reutiliza el proyecto Astro estático/TypeScript existente, sus dependencias fijadas, motor de búsqueda, estilos bosque/papel, patrones de foco, lector y tests. No hay scaffold nuevo, framework cliente adicional ni cambio del contrato de importación de producción. No se modifica la Fuente Maestra ni se incorpora un solo manuscrito real.

- Header extraído a `GlobalHeader.astro`: seis áreas Inicio, Aprender, Manual, Atlas, Herramientas y Acerca, además del acceso a Buscar. Conserva skip link, menú móvil, Escape, navegación sin JS y recuperación de foco al cambiar de ancho.
- Inicio con búsqueda local, tres velocidades de consulta, enlaces directos y cobertura explícita: tres DEMO, cero manuscritos publicados, cero mapas cartográficos. La nota de novedad es una nota fechada de desarrollo, no un cambio del corpus.
- Aprender ofrece dos recorridos opcionales de interfaz, no una formación de juego ni una modificación del manual editorial.
- Manual reutiliza tarjetas parametrizadas y un índice de temas DEMO. Las siete categorías editoriales futuras no se simulan como catálogo real.
- Atlas tiene entrada común y conserva las dos rutas antiguas separadas. No se implementan localidades, rutas, coordenadas, instalaciones, mapa interactivo ni cartografía inventada.
- Herramientas incluye glosario de la propia interfaz, preguntas con enlaces y estado de matrices/registros pendientes. Sin calculadoras ni datos de juego supuestos.
- Acerca conserva alcance vanilla PC, independencia del proyecto y acceso a Fuentes; añade límites y privacidad del prototipo.

## Modelo y componentes

`src/data/demo.ts` permanece byte a byte igual: el primer ejemplo original no se reescribe. `src/data/catalog.ts` lo envuelve con metadatos derivados y añade DEMO-002 (estados) y DEMO-003 (atlas pendiente). Los tres describen cómo usar la interfaz, nunca cómo sobrevivir en DayZ. El ámbito de prueba Livonia de DEMO-003 ejercita filtros; **no es un ID LIV ni un artículo de Livonia**. No se afirma que estos ejemplos sean parte del catálogo aprobado.

`PrototypeArticle` parametriza lectura extensa, ficha, ámbito, tema, nivel y referencias a otros DEMO. El validador `src/lib/prototype.ts` es una frontera sintética separada: rechaza IDs históricos, aprobación editorial real, certificación técnica, autorización real de publicación, referencias ausentes, fichas incompletas y rutas inseguras. Se ejecuta durante la compilación. No relaja ni conecta la importación editorial existente.

| Componente | Responsabilidad |
| --- | --- |
| `navigation/GlobalHeader.astro` | Navegación común y disclosure responsive conservado |
| `SearchPanel.astro` | Controles etiquetados y resultados estáticos de todos los DEMO |
| `ArticleCard.astro` | Entrada parametrizada; heading h2/h3 contextual y destino rápido/extenso |
| `content/TopicIndex.astro` | Índice derivado de temas de prueba con enlaces a búsqueda |
| `content/EvidenceLabel.astro` | Tres ejes visibles e independientes, restringidos a DEMO; no admite un verified simulado |
| `content/GameVersionPanel.astro` | ID sintético, build evaluada ninguna, alcance y límites |
| `reader/ArticleReader.astro` | Shell de lectura para cualquier registro del prototipo |
| `reader/ArticleOutline.astro` | Índice contextual con anclas y foco en los h2 |
| `reader/QuickFieldCard.astro` | Situación, decisión inmediata, error, dos señales, salida y fuente extensa |
| `reader/CrossReferencePanel.astro` | Relaciones resueltas por ID DEMO y enlaces de proyecto |
| `reader/ReadingPreferences.astro` | A−/A+ conservados, cuatro niveles 100–135%, foco y anuncio de límites |

La consulta rápida y la extensa son páginas distintas enlazadas en ambas direcciones; el lector conserva además la ficha inline. El objetivo 20–40 s se etiqueta como estimación de diseño, no como resultado medido con usuarios. La preferencia de tamaño no se guarda: se conserva el comportamiento previo sin introducir almacenamiento nuevo. No se añade una segunda hoja de revisión ni se reutilizan respuestas del usuario: WEB-004 permanece congelado.

## Rutas y compatibilidad

Se conservan `/`, `/manual/`, `/manual/leer-una-ficha/`, `/fichas/`, `/buscar/`, `/atlas/chernarus/`, `/atlas/livonia/`, `/fuentes/`, `/acerca/` y 404. Los fragmentos originales del lector permanecen (`antes-de-leer`, `seguir-el-hilo`, `comprobar-el-contexto`, `ficha-rapida`, `referencias`).

Nuevas rutas: `/aprender/`, `/herramientas/`, `/atlas/`, dos lecturas extensas bajo `/manual/` y tres fichas bajo `/fichas/{slug}/`. Total del build: 18 HTML contando 404, 17 rutas navegables.

La página fija del primer lector se conserva como wrapper del nuevo componente. Las rutas dinámicas generan solo los DEMO disponibles en build, sin recibir rutas arbitrarias ni exponer registros privados. La ficha original sigue accesible desde `/fichas/` y desde su nueva URL individual.

## Búsqueda multirresultado

Se conserva `src/lib/search.ts`: AND de tokens, normalización de acentos, búsqueda en título/resumen/tags/secciones. El nuevo controlador usa IDs para ocultar/mostrar cada tarjeta generada en build, cuenta resultados reales y conserva el orden. No inserta HTML de consultas ni devuelve un contador fijo 0/1.

Filtros combinables: tema/etiqueta, ámbito de prueba, nivel, estado presente (solo DEMO sin verificar) y vista de destino (extensa/ficha). Todos los registros tienen ambas vistas; el control de vista cambia el destino, no finge que sean tipos excluyentes de contenido. Chernarus puede dar cero resultados porque no se ha fabricado un ejemplo de cobertura territorial.

Los controles select usan etiquetas explícitas por ID. Query y filtros se guardan en URL para recarga/enlaces, con valores desconocidos descartados. El límite de consulta es 200 caracteres; el estado vacío permite limpiar todo con un botón. El contador y los filtros se anuncian con región polite/atomic y debounce de 250 ms, sin mover el foco. La limpieza conserva foco en su botón. Sin JS siguen disponibles las tres tarjetas y las lecturas; la búsqueda interactiva requiere JS, como antes.

## Límites editoriales, evidencia y arte

Fuente Maestra v0.16.1 solo lectura: **84 artículos, 294 IDs históricos, 42 paquetes**; cuatro matrices derivadas no son plazas. Son recuentos de control proporcionados por el propietario, no una inspección de los originales. LIV utiliza ámbito/IDs independientes; CHR r02 no se importa ni publica. Ningún contenido real se marca como disponible o técnicamente certificado.

Editorial, técnico y publicación son estados separados. Todas las tarjetas de contenido indican DEMO sin aprobación real, pendiente técnico y solo prototipo sin permiso para producción. La explicación de CHR r02 mantiene su aprobación editorial independiente, sin certificación para 1.30.164078 ni permiso de publicación. C29, E30, CE26 y D30DOC siguen separados; D26 permanece bloqueado por la frontera vigente. No se cambia `src/lib/content.ts` ni `validate-import.ts`.

Se conserva ART-001 y la paleta comprobada del MVP, sin adoptar silenciosamente la paleta alternativa de DESIGN-001-A. Verde bosque, papel cálido, sans local Arial/Helvetica y acentos sobrios. La portada sustituye el esquema decorativo por un directorio tipográfico funcional. No se añaden imágenes, fuentes, mapas ni recursos externos. `Icon.astro` se reutiliza sin cambios; `Terrain.astro` solo permanece en los placeholders heredados, explícitamente conceptual y sin validez cartográfica, según ART-001. No es un recurso final autorizado ni evidencia del terreno.

Mediciones de contraste de pares sólidos concretos (algoritmo de luminancia relativa WCAG; no acreditan toda la interfaz):

| Uso | Colores | Ratio |
| --- | --- | --- |
| Texto principal/base | #eeeede / #151c16 | 14,82:1 |
| Secundario/panel | #afb4a4 / #20281f | 7,14:1 |
| Texto/papel | #253027 / #ebe8db | 11,17:1 |
| Etiqueta del directorio/papel | #4e593f / #ebe8db | 6,05:1 |
| Foco/base | #e0ae80 / #151c16 | 8,71:1 |
| Foco/papel | #67421f / #ebe8db | 7,20:1 |
| Borde de control/panel | #859079 / #20281f | 4,52:1 |

Se conservan reflow, reduced motion, impresión, colores forzados y controles de tamaño táctil. Los ratios y axe no sustituyen una auditoría completa WCAG 2.2 AA ni revisión humana de legibilidad.

## Ejecución local

Requisitos de desarrollo: Node 24.19.0 (`.nvmrc`), npm 11.9.0. Las dependencias y package-lock no cambian.

```sh
npm ci
npm run check
npm run test:unit
npm run build
npm run preview -- --port 4321
```

Abrir `http://127.0.0.1:4321/`. Para desarrollar: `npm run dev`. Para verificar todo: instalar Chromium con `npx playwright install chromium` (en Linux CI, `--with-deps` requiere las bibliotecas del SO) y ejecutar `CI=1 npm test`; en PowerShell usar `$env:CI='1'; npm test`.

El preview escucha solo loopback. No abrir `dist/index.html` por file://: los enlaces raíz y módulos requieren el servidor local. Este prototipo no incluye un lanzador Windows portable ni modifica el de WEB-004. Detener preview con Ctrl+C. No ejecutar ningún comando de despliegue.

## Verificaciones y evidencias

Los resultados finales y los límites de ejecución se registran en `DESIGN-001-B-RESULTS.md`. Las capturas y JSON generados se conservan en `artifacts/`, excluidos de Git, y se entregan en el archivo de revisión separado. La CI existente conserva su artefacto de pruebas; no hay workflow de publicación.

Protocolo de revisión humana propuesto:

1. Inicio: buscar «interfaz» con teclado y comprobar tres resultados; usar las seis entradas principales en escritorio y el disclosure móvil con Enter/Espacio/Escape.
2. Buscar: combinar ámbito Livonia y nivel Consulta para obtener vacío; limpiar y conservar foco; cambiar a ficha rápida, recargar URL y abrir un resultado.
3. Manual: abrir los tres DEMO, recorrer índice con Tab/Enter y confirmar h2 enfocado; verificar enlaces de referencias y retorno a la lectura extensa desde cada ficha.
4. Probar A+ hasta 135% y A− hasta 100%, avisos y foco en los límites. No equivale al zoom del navegador.
5. Atlas: comprobar entrada común y dos ámbitos, ausencia de localidades, cartografía y consejos inventados; revisar avisos CHR/LIV.
6. Repetir a 320 CSS px, tablet y escritorio; zoom real 200% y 400% con A+ y filtros. Evaluar recortes, controles, lectura y orden, sin ocultar overflow para aparentar corrección.
7. Windows real: ejecutar M01–M12 de WEB-003 adaptando la búsqueda a tres resultados, NVDA/Firefox y Narrador/Edge; registrar versiones, operador, fecha, lo realmente escuchado y fallos. **No ejecutado aquí**. Mantener WEB-004 y sus resultados originales separados de esta nueva revisión.

## Riesgos, límites y siguientes pasos

- No hay datos reales ni export editorial conectado. DESIGN-001-C requiere autorización explícita, originales/export disponibles por canal revisado y políticas versionadas; no quitar barreras de importación para poblar el prototipo.
- Las etiquetas son DEMO-only; antes de soportar estados reales se necesita un modelo de autorización de publicación separado, evidencias por alcance y tests de políticas. Los componentes actuales no simulan aprobaciones reales para mostrar colores.
- Glosario, preguntas y rutas de aprendizaje se limitan al uso de la interfaz. No se han implementado matrices, ejercicios ni fichas territoriales con datos desconocidos.
- La colección pequeña prueba render y filtros, no rendimiento de un catálogo real completo. No se afirma un benchmark ni auditoría exhaustiva de seguridad/SEO.
- Las pruebas móviles son emulación Chromium, no dispositivo físico. Windows/Edge/Firefox, NVDA y Narrador no se pueden validar en este entorno Linux. Quedan pendientes revisión humana e interfaz definitiva.
- Sin cuentas, analítica, telemetría, APIs remotas ni almacenamiento nuevo. Consultas y preferencias no se envían. Los recursos del sitio son locales; desarrollo/CI descargan dependencias como antes.
- No se accede a manuscritos privados para compararlos: su ausencia se basa en el origen controlado DEMO, diff revisado y escaneo limitado de salida, no en un detector infalible. No hay credenciales añadidas ni lecturas de secretos.

## Rama, revisión y rollback

PR borrador independiente con base `feat/web-v0.1` para que el diff muestre solo DESIGN-001-B sobre b922bc9. No contiene los cambios documentales de PR #5; los referencia. No retargetear a main sin revisar el diff/dependencia, porque main sigue siendo bootstrap. No fusionar #2 ni #5 para probar este prototipo.

Rollback sin despliegue: detener preview, volver al checkout de b922bc9 y cerrar el PR nuevo si se decide descartar. La rama conserva el avance sin reescribir historial. Si más adelante se integra mediante aprobación específica, revertir los commits DESIGN-001-B por un PR nuevo; no usar push --force. WEB-004 no requiere rollback porque no se tocó.

El paquete Windows original conserva SHA-256 `fbc5dde13575856ae144df8cda4b3e36d95b567cea2eb248967a167e4290ec60` y 43.999.242 bytes. PR #2, PR #5, main, manuscritos, DNS y Cloudflare quedan intactos. La aprobación final de interfaz pertenece al propietario.
