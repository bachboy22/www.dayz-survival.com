# DAYZ-SURVIVAL · DESIGN-001-C0
## Contrato editorial y arquitectura de procedencia, integridad y publicación

**Fecha:** 2026-10-25  
**Estado:** diseño documental propuesto para revisión. No es una política de publicación aprobada ni una implementación de importación.  
**Base de código:** `6091b56667b9042c3da72e42fd1dc7e206b56b8f` (DESIGN-001-B, PR #6).  
**Referencias:** DESIGN-001-A, PR #5; DESIGN-001-D, PR #7; `docs/IMPORT-CONTRACT.md`; `src/lib/content.ts`; `docs/ART-001-VISUAL-POLICY.md` (ART-001); tarea correctiva CODEX-PERF-001 #8.

## 0. Alcance y límites de esta autorización

El propietario autoriza **definir el contrato y arquitectura** de DESIGN-001-C y preparar por separado la optimización técnica, no activar un importador, transformar documentos privados, corregir manuscritos, publicar artículos, fusionar PR, desplegar Cloudflare ni cambiar DNS. La revisión Windows real del prototipo y de lectores de pantalla queda pendiente; su aceptación no se deduce de CI. Todo el contenido actualmente servido sigue siendo DEMO.

Este documento se crea en una rama solo documental desde el SHA de #6. No modifica #2, #5, #6, #7, WEB-004 ni el ZIP Windows DESIGN-001-D. No solicita originales a GitHub, no crea un catálogo de producción ni reabre la Fuente Maestra.

**Invariantes editoriales aportadas por el propietario, no verificadas mediante lectura de originales:**

- Fuente Maestra v0.16.1, 84 manuscritos editorialmente aprobados, 294 IDs históricos y 42 paquetes históricos.
- Los originales aprobados se preservan **byte a byte**. Ninguna extracción ni render sustituye al original.
- Cuatro matrices compartidas son derivaciones, no artículos históricos ni plazas adicionales.
- Chernarus Plus (PC oficial vanilla) es el núcleo; CHR r02 conserva su estado editorial separado y no tiene autorización de publicación ni certificación técnica 1.30.164078.
- Livonia utiliza namespace e índice propios, sin alterar los 294/42 históricos. AUD-130 es una línea de auditoría separada.
- C29, E30, CE26 y D30DOC son clases de evidencia distintas. D26 sigue bloqueado para cifras oficiales. No se deduce equivalencia ni verificación PC Stable 1.30.164078.
- Aprobación editorial, comprobación técnica, revisión de derechos, autorización para un destino y **despliegue efectivo** son decisiones diferentes.

## 1. Diagnóstico del contrato v1: válido como barrera, incompleto como gobierno editorial

`src/lib/content.ts` expone `ImportEnvelope` schemaVersion 1, `ImportAuthorization` schemaVersion 1, `validateProductionImport` y `createProductionExport`. El validador actual:
- exige `approved`, namespace `core`, mapa `chernarus-plus`, evidencia técnica `verified` y coincidencia exacta de `gameBuild/buildChannel` con allowlist;
- calcula SHA-256 del texto `rawText` en UTF-8 sin normalizar;
- prohíbe D26, bloquea IDs CHR/LIV/AUD/DEMO, impide referencias no resueltas dentro del lote y falla el lote entero ante un registro incorrecto;
- comprueba rutas externas y no escribe ni publica, y la web DEMO no lo invoca.

Estas protecciones **permanecen intactas**. El nombre `ImportAuthorization` v1 combina permiso de entrada con versión técnica y **no representa aún un permiso de publicación por destino**. El hash de `rawText` no certifica el hash ni la fidelidad binaria de un DOCX/PDF/ZIP original. Su validación de referencias exige que todos los destinos estén dentro del mismo lote, limitando entregas parciales.

**Propuesta:** desarrollar posteriormente un contrato privado/publicable **v2 en paralelo**, con adaptadores explícitos de compatibilidad y pruebas; jamás relajar el v1 en el mismo paso ni migrar registros sin permiso.

## 2. Entidades separadas y procedencia

El diseño establece **seis registros** con clave estable, origen y custodio; son esquemas de propuesta, no objetos instanciados en Git:

| Registro | Identidad / campos mínimos | Custodia / condiciones |
| --- | --- | --- |
| **CanonicalSource** | authentic_content_id, namespace, master_version, canonical_title, bytes_sha256, byte_length, mime_type, original_format, custody_ref, revision_id | **Privado**; el fichero fuente permanece inmutable y fuera del checkout. No se inventan IDs auténticos |
| **ExtractedText** | source_id, source_bytes_sha256, extraction_spec_version, encoding, exact_text_bytes_sha256, byte_length, extraction_log_ref, segment_map_version | **Privado**; extracción determinista aprobada y revisada, sin sustituir ni reescribir el original |
| **EditorialRecord** | source_id, editorial_status, decision_ref, approver, approved_at, title_status (canónico/provisional), content_type, historic_slot_ref | **Privado**; aprobación editorial independiente de verificación y publicación |
| **TechnicalEvidence** | evidence_id, source_id, claim_id, evidence_lane, platform, map, game_build, channel, checked_at, reviewer, method, citation_refs, limitations, verification_status | **Privado** hasta decidir qué metadatos son públicos. Afirmaciones acotadas; no certificación global por un test aislado |
| **DerivedAsset** | derived_id, parent_source_id, parent_exact_text_sha256, derivative_kind, derivation_rule_version, derivative_sha256, editorial_review, rights_review, revoked_at | Independiente del original. Ficha rápida, resumen, glosario, matriz, ancla o índice revocables; nunca ocupan plazas históricas automáticamente |
| **PublicationGrant** | grant_id, exact_content_id, exact_source_hash, exact_derived_hashes, destination, allowed_views, policy_version, granted_by, granted_at, expires_at, revoked_at | **Privado**, explícito y por destino. Autorización de publicar no equivale a haber desplegado. Requiere revisión de derechos y gate técnico según política aprobada |

*Diseño de campos, no registros reales.* Los identificadores internos, rutas de custodia, títulos no publicados, hashes de originales privados y notas de revisión confidenciales no forman parte del export del navegador.

### Tres estados siempre visibles y separados

1. **Editorial:** propuesta / borrador / aprobada / retirada. Identifica si el texto fue revisado, nunca si la mecánica del juego se confirmó.
2. **Técnico:** sin comprobar / documental / verificada **para una afirmación, plataforma, mapa, build y canal concretos** / contradicha / no aplicable con motivo auditado. La etiqueta `verificada` no es global.
3. **Publicación:** no autorizada / autorizada para un destino y vistas exactos / revocada / expirada. El estado `desplegado` es un evento operativo adicional, no sinónimo de autorización.

*La UI actual de DEMO solo muestra estados sintéticos.* No introducir estados reales en `EvidenceLabel.astro` hasta ratificar el esquema, sus mensajes accesibles y las reglas de autorización.

## 3. Integridad byte a byte y cadena de transformaciones

**Dos hashes no intercambiables:**
- `original_bytes_sha256`: SHA-256 de los bytes del contenedor original (DOCX/PDF/Markdown/otro), antes de abrirlo o extraer texto. El original se conserva en almacén privado de solo lectura con copia verificable.
- `exact_text_bytes_sha256`: SHA-256 de los bytes de **una exportación textual aprobada**, con encoding, BOM, saltos de línea, Unicode y caracteres de control especificados. No atribuir identidad binaria con el fichero original.

El proceso futuro deberá registrar formato/herramienta/versión/parámetros de extracción, límites conocidos y revisión humana de orden, encabezados, tablas, citas y notas. Prohibidas normalizaciones automáticas silenciosas de espacios, líneas, Unicode, títulos, puntuación o párrafos. Para DOCX/PDF no se promete una igualdad imposible entre binario original y HTML resultante: se preserva el fichero y se verifica equivalencia textual/estructural de la derivación autorizada contra una referencia revisada. Si no puede acreditarse, bloquear exportación de ese registro.

La derivación de fichas rápidas (situación, decisión, error, dos señales, salida), glosario y referencias cruzadas debe ser **opt-in, versionada y revisada**, con vínculo al hash exacto de texto origen y posibilidad de revocación. Ninguna ficha rápida modifica el original o hereda permiso de publicación automáticamente. Un cambio en el origen invalida la derivación hasta nueva revisión.

## 4. Fases de un pipeline futuro: siempre fail-closed

```text
FUERA DE GIT / PRIVADO                           ZONA PÚBLICA CONSTRUIDA (FUTURA)
Original inmutable + hash
        |
        v
Extracción reproducible + revisión humana
        |
        v
Registros independientes: editorial / técnico / derechos / derivaciones
        |
        v
PublicationGrant exacto por ID + hash + destino + vistas
        |
        v
Validador estricto v2: inventario autorizado y política versionada
        |
        +---- RECHAZO TOTAL / INFORME PRIVADO (por cualquier inconsistencia)
        |
        v
Export público mínimo sin secretos, pointers, originales ni títulos privados
        |
        v
Índice estático por ámbito + buscador eficiente + rutas visibles
        |
        v
QA, accesibilidad, control de cambios y aprobación de publicación
        |
        v
Despliegue manual autorizado (FUERA DE DESIGN-001-C)
```

**Condiciones del validador futuro:** entradas por allowlist explícita de ID+hash+namespace, procedencia individual, autorizaciones vigentes, estado de derechos, colisiones ID/slug, URL segura, límites de tamaños, encoding válido, esquema estricto sin campos extra, referencias públicas existentes, evidencia técnica requerida según política de publicación aprobada, revocaciones y caducidades. Si falla un solo requisito, ninguna parte del lote nuevo debe activarse; conservar el build público anterior si existiera. No registrar texto completo ni rutas privadas en errores, acciones CI o artefactos.

Las autorizaciones no deben emitirse automáticamente leyendo el lote que ellas mismas autorizan. Una allowlist JSON sin firma **no demuestra identidad de quien aprueba**; exigir control de permisos y registro auditable de la decisión. Evaluar firma verificable o canal de aprobación independiente antes de producción; no fingir criptografía no implementada.

### Relaciones con documentos no publicados

Mantener enlaces lógicos privados por ID. El **export público** construye solo vínculos a destinos autorizados presentes en ese build. Si un destino no puede exponerse, omitir ese enlace y señalar de forma genérica el límite cuando corresponda; no filtrar ID/título/slug privado por HTML, JSON, búsqueda, logs, sitemap o errores. Mantener aliases/redirecciones de slugs públicos solamente cuando conste autorización.

### Revocación y rollback

Revocar un `PublicationGrant` retira el contenido y derivados relacionados del **siguiente build y de sus índices**, reconstruye enlaces y deja trazabilidad privada. La publicación retirada debe desaparecer también de cachés/artefactos/CDN cuando se autorice el despliegue: esto exige un protocolo operativo independiente con comprobación de invalidación. Ningún rollback reescribe o borra originales; no aplicar force-push a ramas auditadas.

## 5. Namespaces, conteos y restricciones de DayZ

- Registro histórico Chernarus: 294 IDs y 42 paquetes **fijados por el inventario auténtico**, que aún no se importó. No completar hasta 294 creando títulos o IDs ficticios.
- 84 manuscritos aprobados son una propiedad editorial de la Fuente Maestra v0.16.1, **no equivalen** a 84 contenidos técnicamente certificados, públicos o cargados en Git.
- CHR r02 permanece independiente; su aprobación editorial no permite export ni afirma verificación para Stable PC 1.30.164078.
- LIV es atlas territorial independiente con namespace y autorizaciones propias; no consume ID o paquete histórico. No reutilizar comprobaciones de Chernarus como prueba automática de Livonia.
- AUD-130 es auditoría técnica, no contenido automáticamente publicable.
- Las cuatro matrices compartidas se registran como `DerivedAsset`; su conteo no modifica las 294 plazas.
- Mantener C29/E30/CE26/D30DOC distinguibles, cada resultado con método, contexto y límites; D26 bloqueado para **cifras oficiales**. No inferir estadísticas, spawn, compatibilidades, balística, duraciones o comportamiento de juego sin evidencia específica.
- La versión de una fuente (`v0.16.1`), build comprobada de DayZ, versión del contrato y versión del producto web son conceptos distintos.

## 6. Export público mínimo y diseño del modelo

**Vista pública futura (campos de propuesta):** `id`, `public_slug`, `display_title`, `map_scope`, `content_type`, `public_body` derivado fiel aprobado, `public_summary` autorizado, `quick_card` si está autorizada, `public_refs` resueltas, `displayable_editorial_status`, `technical_claims_with_scope`, `public_provenance`, `source_revision_label`, `publication_revision`.

No incluir: `custody_ref`, `original_file_pointer`, nombres o paths privados, lista de manuscritos no autorizados, contenidos retirados, aprobadores identificables sin consentimiento, claves/tokens, notas de auditoría privadas o permisos internos. El manifiesto público puede incluir hash del propio **export público** para reproducibilidad; no necesita revelar hashes privados de originales.

Los metadatos por página, SEO y sitemap **no** se generan para contenidos sin autorización de publicación. Durante DEMO continuar `noindex,nofollow`; activar indexación únicamente en una autorización de despliegue futura y auditar canonical/sitemap/derechos por destino. ART-001 rige imágenes reales, mapas y capturas; no incorporar gráficos geográficos inventados ni arte final IA.

## 7. Decisiones pendientes que requieren aprobación específica

| ID | Decisión | Propuesta conservadora mientras no se ratifique |
| --- | --- | --- |
| C-DEC-01 | ¿Permitir artículos aprobados con parte de mecánicas pendientes de verificar y etiqueta precisa? | **No cambiar la exigencia verified del importador v1**; diseñar una política por afirmación/versiones separada. No publicar por defecto |
| C-DEC-02 | Formato fuente exacto, reglas y herramientas de extracción para los originales | Pendiente inventario autorizado y prueba fiel. No tocar originales |
| C-DEC-03 | Fuente auténtica de IDs y asignación de títulos provisionales/canónicos | Custodia privada + verificación humana. No inferir IDs |
| C-DEC-04 | ¿Cómo se aprueban grants por destino y cómo se demuestra identidad del aprobador? | Registro separado, control de permisos y revisión independiente |
| C-DEC-05 | ¿Cómo exponer referencias cruzadas a materiales no publicados? | No publicar IDs/títulos; solo enlaces a destinos autorizados |
| C-DEC-06 | Política de CHR, LIV, matrices y alegaciones de versiones | Permisos separados; bloquear material no verificado/no autorizado |
| C-DEC-07 | Tipos de export y revisión de fidelidad para fichas, tablas, gráficos y citas | Cada derivación aprobada y versionada por separado |
| C-DEC-08 | Selección de primera muestra real para un futuro piloto | **Ninguna seleccionada**. Requiere ID auténtico, acceso privado y autorización posterior |

Aprobar **el diseño** de esta fase no ratifica ninguna opción pendiente como política definitiva y no habilita un importador real.

## 8. Hoja de ruta y criterios de aceptación

**C0 · Este documento.** Arquitectura, modelo de custodia, límites, decisiones y plan de pruebas; únicamente Git documental. **Estado: propuesta para revisión.**

**C1 · Contratos y tests sintéticos, requieren autorización nueva:** schema v2 versionado para entidades, pruebas de importador sobre fixtures DEMO privados de prueba, validación negativa, listado de diferencias con v1; cero datos reales y sin conectar el cliente. No sustituir v1.

**C2 · Piloto privado con datos reales, requiere autorización distinta e identificación exacta:** usar solo ID auténtico expresamente elegido, export textual verificado fuera del repositorio, declaración de formato/bytes y autorizaciones verificables. Test de fidelidad y derechos; sin indexación ni publicación.

**C3 · Export mínimo y conexión a web, requiere autorización distinta:** crear build local/noindex; inspeccionar leaks, índices, variantes del lector, ficha y referencias, benchmark con escala autorizada, accesibilidad, Windows/NVDA/Narrador y rollback. No publicación.

**C4 · Publicación, requiere aprobación explícita de propietario y destino:** auditoría de versión, seguridad, permisos, DNS/Cloudflare, cache/invalidation y revisión visual humana previa. Fuera del permiso actual.

**Tests negativos obligatorios al llegar C1/C2:** hash de original/export discrepante, codificación inválida y normalización tácita, ID ausente/repetido/inventado, approvals caducadas o revocadas, estado editorial no aprobado, falta de rights review, evidencia D26/canal incorrecto, mezcla C29/E30/CE26/D30DOC, verificación 1.30 inferida, destino LIV/CHR no autorizado, crossref privado, path traversal/symlink, slug duplicado, campo privado extra, lote parcial, grants no emitidos independientemente, deriva no aprobada, secretos/paths en HTML, búsqueda y CI. Cada caso debe rechazar sin imprimir contenido privado.

## 9. Trazabilidad, dependencias y rollback documental

- Baseline: `6091b56`, con PR #6 aún sin fusionar. Esta rama documental se dirige a `feat/design-001-b` para mostrar únicamente cambios DESIGN-001-C0. No retargetear a main, ya que arrastraría otros PR pendientes.
- PR #7 (DESIGN-001-D) audita el mismo baseline y no debe modificarse; Windows real queda pendiente.
- Issue #8 (CODEX-PERF-001) gestiona mejoras de búsqueda/SEO/microtexto **en otra rama**; evitar mezclar C con esos commits. Resolver el orden de integración explícitamente antes de cada merge futuro.
- PR #2, #5, #6, #7, WEB-004 y el ZIP Windows D se conservan intactos. No modificar Cloudflare/DNS ni publicar.
- Rollback de C0: cerrar el PR documental y eliminar, si se autoriza, solo la rama C0. Ningún manuscrito, app, build o archivo de Windows necesita restaurarse.
