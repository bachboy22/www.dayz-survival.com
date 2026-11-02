# WEB-007 · Dos modelos para revisión artística

Estado: propuesta privada pendiente de revisión del propietario. No aplicar al conjunto de artículos, fusionar o desplegar. Base: WEB-006 `c9753ee7656b5e53023dc62766f6b2566ab77bf9` y su ZIP verificado. Rama independiente `feat/web-007-models`.

## Alcance concreto

Modelos principales: portada `/` y lector completo `/articulos/MAN-01-01/`. Se añaden dos páginas auxiliares de documentación/créditos para que la separación de información y las licencias sean comprobables. **Las otras 307 páginas de artículo y los índices/atlas mantienen WEB-006 byte a byte.** El prototipo conserva los 308 artículos y su búsqueda universal sin extender prematuramente el nuevo diseño.

La navegación nueva da acceso a Manual, Supervivencia, Equipo, Combate, Chernarus, Livonia y Guías. Archivo técnico no aparece en ella: sus cinco artículos siguen accesibles desde Documentación en el pie, además del buscador existente. Mecánicas conserva un acceso secundario de contenido para jugadores. No se borra ni renumera ningún ID. La navegación de las páginas heredadas continúa siendo WEB-006 hasta una aprobación posterior: no se presenta esta muestra como migración global terminada.

En el lector, la procedencia y los estados existentes quedan en un desplegable secundario. Sus datos se conservan literalmente, con aprobación editorial y evidencia técnica distintas. No hay sello de “verificado” ni certificación 1.30. El texto completo del artículo, incluido su título original, permanece intacto. La introducción y las tarjetas usan extractos literales separados como presentación, sin reescribir el manuscrito.

## Dirección visual propuesta

ARCHIVE-86: campo oscuro oliva, papel crema, tinta verde, ámbar mate, tipografía analógica limpia y señalética vectorial. Hero de escala editorial, marco de portada previsto, banda de búsqueda clara, tres entradas para jugadores, dos atlas independientes y un cierre de lecturas. Cambios de ritmo y superficie en lugar de una rejilla uniforme. El lector usa una cabecera propia, reserva de grafito, índice contextual y columna de papel moderada; el cuerpo comienza en 18 px y sus controles permiten 18/20/22/24 px.

Se toma CHERNO++ como referencia de intensidad y ritmo, no como fuente de código, mecánicas o recursos. La comparativa ART-002 disponible describe su estructura y también declara que las fotos/CSS originales no estaban adjuntos. No se afirma haber reconstruido su aspecto final píxel a píxel. No se incorpora contenido de servidor/mods.

Las reservas no representan paisajes, equipo o mapas: son marcos y papel de interfaz con un pie explícito de recurso pendiente. No se simula una captura ni un dibujo técnico. **Cero fotografías, mapas o ilustraciones finales incorporadas.** Las capturas/grafitos conceptuales encontrados no aportan una autorización de uso final; los recursos de mods se excluyen. La intensidad fotográfica final queda pendiente de una captura vanilla original/autorizada y revisada.

## Recursos y derechos

Cinco WOFF2 locales, extraídos sin modificación de paquetes Fontsource 5.3.0: IBM Plex Sans Condensed 400/600, IBM Plex Serif 400/600 e IBM Plex Mono 400. Licencia OFL-1.1, copyright IBM; textos de licencia incluidos en el ZIP y embebidos en el HTML autónomo. No hay conexión con Google Fonts ni otra dependencia remota. Fuentes de adquisición reproducibles: `@fontsource/ibm-plex-sans-condensed@5.3.0`, `@fontsource/ibm-plex-serif@5.3.0`, `@fontsource/ibm-plex-mono@5.3.0`; se conservan hashes de cada paquete y archivo en el registro privado de recursos. IBM Plex es una propuesta tipográfica que se prueba aquí, no una aprobación previa de todos sus usos.

Iconos SVG de interfaz editables con retícula 24 y trazo común, reutilizados/ampliados con asistencia de Codex. No son ilustración editorial final ni evidencia del juego. Los adornos puramente de interfaz quedan ocultos al lector de pantalla; los controles tienen nombre y los recursos pendientes tienen pie textual. La ayuda con código no se atribuye como autoría humana de un dibujo final.

Registro separado con **317 plazas**: 308 por artículo, una portada y ocho separadores. Incluye propósito, identidad del artículo, mapa de origen, proporción prevista, autor/original/hash pendientes, licencia, alt/pie, derivados y aprobaciones. Todas las imágenes siguen con derechos/accesibilidad/aprobación/publicación en falso. No se autoaprueba un recurso por existir ni se mezclan CHR/LIV. El registro de trabajo no domina la experiencia pública ni se publica en el ZIP del sitio.

## Interacción y accesibilidad

Contenido visible sin JavaScript; mejoras progresivas para el menú, preferencias y aparición de secciones. Transiciones cortas por CSS y IntersectionObserver, sin esperas artificiales, música, partículas, efectos de servidor o bucles ambientales. Las superficies son CSS no figurativo. `prefers-reduced-motion` elimina animación/transformación de aparición y mantiene visibles todas las secciones. Un elemento con foco no queda oculto por una aparición pendiente.

La muestra se comprueba a 320/768/1440 CSS px, en HTTP y con `file://` real offline; teclado, foco, menú, búsqueda, filtros/páginas, índice, lectura y documentación secundaria. Zoom real Chromium 200% y 400% en ambos modelos, con A+ máximo en el lector. Axe automatizado no sustituye Windows/NVDA/Narrador ni aprobación WCAG; no se afirman pruebas físicas no ejecutadas.

El HTML autónomo incorpora CSS, fuentes y licencias. Cambia el marco de navegación/estilo según la ruta: solo los modelos y sus páginas auxiliares reciben WEB-007; el resto conserva la presentación anterior. Se reutiliza el puente offline WEB-006, sin servidor ni telemetría. El ZIP incluye el catálogo completo para revisar enlaces y búsqueda, no indica autorización para desplegarlo.

## Construcción para mantenedor

`tools/web-007/build-models.py` recibe el ZIP WEB-006, los tres paquetes de fuentes y destinos nuevos para sitio/registro. Comprueba el SHA fijo de WEB-006; rechaza destinos existentes; compara todas las páginas no incluidas en los dos modelos con el ZIP de entrada. `build-standalone.py` empaqueta las mismas páginas, fuentes y licencias. Los originales y artefactos anteriores no se escriben.

La validación reutiliza `verify-export.py` y el renderizador independiente `verify-source-text.py` de WEB-006 para los 308 textos en ambos formatos. Las pruebas visuales/funcionales reproducibles son `audit-models.mjs` y `audit-zoom.mjs`. Instalar dependencias de prueba y Python-Markdown es solo una necesidad del mantenedor; el propietario recibe HTML/ZIP ya construidos y no necesita herramientas de desarrollo.

La entrega privada contiene informe, capturas, registro de recursos, hashes y resultados. No se sube el corpus, sus extractos o capturas a GitHub público. La CI pública sigue probando exclusivamente el modo DEMO y fixtures sintéticos.

## Secuencia posterior y rollback

1. Revisar composición de portada y lector en escritorio/móvil y el tratamiento de reservas.
2. Ajustar estos dos modelos según observaciones, sin migrar las otras 307 páginas.
3. Obtener originales visuales trazables, revisar derechos/alt y validar imágenes en estos modelos.
4. Solo tras aprobación del propietario: aplicar componentes al catálogo, cabeceras de familia y atlas, y comprobar otra vez todos los contenidos.

Rollback ahora: cerrar la revisión y volver al HTML/ZIP WEB-006 original, que conserva su hash. No hay despliegue, migración o cambio de dominio que deshacer. Ningún PR previo se fusiona ni modifica.
