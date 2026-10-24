# Contrato de importación futura · v0.1

La Fuente Maestra **v0.16.1** permanece fuera del repositorio e inmutable. Los recuentos de referencia son 84 artículos aprobados, 294 identificadores y 42 paquetes históricos; no son el número de artículos presentes en esta web. El MVP incluye exactamente un artículo sintético y una ficha de demostración. No incluye una lista inventada de los 84 IDs.

## Límites implementados

`src/lib/content.ts` define estructuras para artículos, fichas, referencias, estado editorial y evidencia técnica por versión, canal, mapa y plataforma. `validateDemoArticle` exige la etiqueta de demostración, sin aprobación editorial ni certificación técnica.

`validateProductionImport` y `createProductionExport` constituyen una frontera independiente: rechazan el lote completo si cualquier registro es inválido. No convierten el contenido demo en contenido aprobado ni omiten silenciosamente los registros rechazados. La compilación del sitio de demostración usa solo `src/data/demo.ts`; no llama al exportador de producción. Este exportador no publica nada y todavía no está conectado al lector.

## Entrada futura, revisada por separado

Se necesitan dos JSON externos al repositorio:

1. Un lote `ImportEnvelope` con `schemaVersion: 1`, `sourceVersion: "v0.16.1"` y `articles`. Se aceptan subconjuntos revisados de 1 a 84 artículos; no se inventan los faltantes.
2. Una autorización `ImportAuthorization`, revisada de forma independiente, con versión, responsable, fecha UTC y una lista exacta de entradas `{id, sha256, map, gameBuild, buildChannel}`. No admite patrones, comodines ni IDs deducidos. Esta lista no viene de un ZIP privado ni se genera a partir del lote que pretende autorizar.

La autorización es un control de proceso, no una firma criptográfica. Quien pueda modificar ambos JSON puede falsificar una aprobación: el operador deberá recibir la lista por un canal revisado, controlar sus permisos y mantener trazabilidad. Un hash demuestra identidad de bytes, no autoría ni aprobación editorial. Este MVP no acredita ninguna revisión real.

Cada artículo contiene `id`, `slug`, `title`, `summary`, `tags`, `lane`, `editorialStatus`, `sourceVersion`, `demonstration`, `rawText`, `sourceSha256`, `map`, `citations`, `technicalEvidence` y `relatedIds`. Los campos desconocidos se rechazan para evitar incorporar metadatos privados inadvertidamente.

`rawText` conserva exactamente el texto UTF-8 del export autorizado. `sourceSha256` se calcula sobre esos bytes, sin normalizar Unicode, saltos de línea ni espacios. Debe coincidir con el valor de la autorización independiente. No es el hash de un DOCX/ZIP contenedor: la obtención del export exacto tendrá que aprobarse antes de implementarla. No hay conversor de manuscritos ni proceso de escritura sobre la Fuente Maestra.

## Separación editorial y técnica

- Solo `editorialStatus: "approved"`, `demonstration: false` y `lane: "core"` pueden atravesar la validación de producción.
- Aun con aprobación editorial, se exige evidencia `verified`, con build y canal exactamente autorizados, mapa `chernarus-plus`, plataforma `vanilla-pc`, fecha UTC, revisor y citas HTTPS resolubles dentro del artículo.
- `C29`, `E30`, `CE26` y `D30DOC` se conservan como registros separados. El validador no deduce equivalencias ni una certificación DayZ 1.30 Stable. `D26` siempre se rechaza.
- CHR r01 (13 borradores), LIV v0.1 (4 pilotos) y AUD-130 siguen separados y bloqueados. La política actual también bloquea los namespaces reservados `CHR-`, `LIV-`, `AUD-` y `DEMO-`; cualquier reconciliación futura con IDs históricos debe revisar la política y los IDs exactos antes de importar.
- Livonia requiere su propia política y aprobación. No ocupa ni reasigna IDs históricos del núcleo.
- Se rechazan IDs, slugs o citas duplicados, rutas inseguras, referencias cruzadas ausentes y autorreferencias. Todas las referencias de un lote deben resolver dentro del mismo export.

## Ejecución de solo lectura

```sh
npm run validate
npm run validate:import -- /ruta/externa/export-autorizado.json /ruta/externa/allowlist-revisada.json
```

El comando de importación resuelve rutas reales y rechaza archivos dentro del repositorio, incluidos enlaces simbólicos que apunten hacia dentro. Lee y valida; no escribe archivos, no imprime manuscritos y no publica. Deben mantenerse también fuera de los ZIP de entrega, artefactos CI y registros. No ejecutar este comando con la Fuente Maestra completa: acepta únicamente el contrato de export revisado.

## Pendiente antes de incorporar contenido real

- Entregar y revisar la lista auténtica de IDs y hashes, sin añadir respaldos privados a GitHub.
- Acordar un export autorizado, legible y fiel a los manuscritos; comprobar byte a byte y revisar la representación final.
- Revisar la evidencia por build/mapa y los permisos de publicación de cada artículo; la aprobación editorial por sí sola no basta.
- Implementar un adaptador de solo lectura para ese formato y un export público mínimo; no activar importación automática de Drive ni otra integración no confirmada.
- Revisar por separado CHR, LIV y AUD-130. Mantener D26 bloqueado.
- Vincular el export validado al lector y al índice estático con pruebas de exclusión, trazabilidad y revisión humana antes de cualquier despliegue.
