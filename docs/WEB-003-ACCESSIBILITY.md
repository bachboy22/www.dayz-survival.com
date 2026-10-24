# WEB-003 · Accesibilidad, zoom y legibilidad

24/10/2026 · PR #2 · Cambios incrementales sobre WEB-002. La aplicación no se regenera y los commits originales permanecen en el historial. Sin fusión ni despliegue.

## Qué demuestra esta entrega

Las comprobaciones ejecutables se realizan en Linux con Chromium y Playwright. **NVDA + Firefox y Narrador + Edge no se han ejecutado.** Requieren Windows y esos productos, no disponibles en este entorno. Su protocolo reproducible figura más abajo; sus resultados siguen pendientes. Las comprobaciones del DOM, axe, foco y capturas no equivalen a escuchar un lector de pantalla ni certifican conformidad WCAG completa.

## Correcciones

- Tipografía secundaria de 13 px como base para metadatos, notas, etiquetas y pies; leyendas de sección de 12 px, navegación de 14 px y marca con etiqueta legible. Se usan unidades relativas, sin bloquear el zoom del navegador.
- Nueva hoja `src/styles/accessibility.css`: redistribución a anchos pequeños, herramientas y cabeceras con salto de línea, controles de al menos 44 × 44 px, tablas con celdas que ajustan texto. No se ocultan desbordamientos del documento para pasar pruebas.
- Menú como disclosure de navegación, no como diálogo: Enter/Espacio, Tab/Mayús+Tab y Escape; se recupera el foco al cruzar el breakpoint de 64 rem. La navegación sigue disponible sin JavaScript y el botón del menú no se muestra si no puede funcionar.
- Índice como landmark de navegación. Sus anclas apuntan a encabezados h2 que admiten foco programático/nativo (`tabindex=-1`), sin añadir tabulaciones positivas. Activar un enlace lleva lectura y foco a la sección.
- Buscador con h2 de resultados, región nombrada y filtros agrupados. El estado es `role=status`, `aria-live=polite`, `aria-atomic=true`; anuncia consulta y etiqueta incluso si el número de resultados no cambia. Espera 250 ms al escribir y no mueve el foco. Solo se inserta texto, nunca HTML procedente de la consulta.
- A−/A+ conservan el foco en los extremos mediante `aria-disabled`, con activación bloqueada en el límite. Anuncian nivel y porcentaje relativo; también escalan el texto de las listas y referencias del lector. Sus cuatro niveles son aproximadamente 100%, 112%, 124% y 135% del texto base. Este ajuste es independiente del zoom del navegador.
- Foco visible reforzado y adaptación a colores forzados. Se conserva el enlace para saltar al contenido, el orden de lectura y las referencias cruzadas.
- El esquema topográfico permanece identificado como conceptual, sin cartografía verificable. ART-001 fija las reglas permanentes de los recursos visuales.

## Resultado ejecutado · 24/10/2026

Comando completo: `CI=1 npm test`, terminado con código 0 sobre la versión final del código. Dependencias sin cambios respecto al lockfile; Chromium 156, Playwright 1.64.1, Astro 7.4.2 y TypeScript 6.0.3.

| Etapa | Resultado local |
| --- | --- |
| Astro / TypeScript | 0 errores, 0 advertencias, 0 hints |
| Unitarias y contrato de importación | 34 aprobadas, 0 fallos |
| Validación de datos | 1 artículo y 1 ficha sintéticos, 0 manuscritos |
| Compilación | 10 páginas estáticas |
| Playwright, incluidos teclado y zoom | 47 aprobadas, 1 omisión intencional, 0 fallos y 0 pruebas inestables |
| axe | 0 infracciones detectadas en 36 auditorías de vistas: 18 base + 18 con zoom de escritorio |
| Matriz de zoom | 4 escenarios aprobados; nueve rutas por escenario, métricas y 18 PNG de zoom |
| Lector de pantalla Windows | NVDA/Firefox y Narrador/Edge: no ejecutados, pendientes |

Se inspeccionaron visualmente capturas de inicio al 200%, lector al 400% y ampliación móvil al 400%. La pasada completa detectó y permitió corregir la pérdida de foco cuando CSS ocultaba un control antes del evento de cambio de ancho; la suite completa se repitió después de esa corrección. Los controles no atenúan su indicador de foco al alcanzar un límite.

La ejecución nueva de GitHub Actions se verifica por el SHA de este commit en [los checks del PR #2](https://github.com/bachboy22/www.dayz-survival.com/pull/2/checks); su resultado y enlace permanente se incorporan a la descripción del PR y al paquete externo de evidencias después del push, sin autorreferencias en el commit. No se presenta aquí como ejecutada una CI que aún no ha terminado.

## Comprobaciones automáticas y evidencia

La ejecución final de tipos, unitarias, compilación y Playwright se registra en el informe de entrega y en GitHub Actions del PR. La suite conserva las pruebas originales y añade `accessibility.spec.ts` y `zoom.spec.ts`.

| Comprobación | Evidencia que se recoge | Límite |
| --- | --- | --- |
| Teclado y foco | Salto al main, índice → h2, Tab al enlace siguiente, referencias, menú/Escape y cambios de ancho | Interacción automatizada de navegador; no prueba la experiencia de un AT |
| Estructura | Un h1, niveles sin saltos, landmarks nombrados y ausencia de tabindex positivo en nueve vistas | No decide si todos los textos o nombres son óptimos para usuarios reales |
| Buscador | Estado vivo atómico, consulta/filtro y contador, ausencia de cambio de foco y salida vacía | Se verifica el DOM; el habla real de NVDA/Narrador está pendiente |
| A−/A+ | Límites, foco conservado, anuncio 100–135%, texto ampliado sin desbordamiento | No sustituye zoom de navegador ni prueba de lectura humana |
| axe | Nueve vistas en escritorio/móvil y nueve vistas al 200%/400% de zoom de escritorio | No es certificación WCAG ni prueba completa de contraste en todos los estados |
| Zoom y redistribución | Ancho del documento, cajas de texto/controles, métricas reales y capturas | Se distingue zoom de navegador, pinch emulado y dispositivo físico |

Las pruebas de lector sin JavaScript, enlaces artículo/ficha, búsqueda con acentos y entrada HTML siguen en la suite. La única omisión intencional original es la prueba del menú móvil dentro del proyecto de escritorio; el menú se comprueba en móvil y también con teclado a ancho reducido.

## Zoom: método y tamaños comprobados

| Modo | Superficie inicial | Factor | Ancho de layout | Ancho visual | Comportamiento esperado |
| --- | --- | --- | --- | --- | --- |
| Chromium, zoom real del navegador | 1280 × 960 | 200% | 640 CSS px | 640 CSS px | Redistribución; sin scroll horizontal del documento |
| Chromium, zoom real del navegador | 1280 × 960 | 400% | 320 CSS px | 320 CSS px | Redistribución a columna estrecha; sin navegación o controles superpuestos |
| Pixel 7 emulado, pinch | 412 × 839, DPR 1 para las capturas de esta matriz | 200% | 412 CSS px | 206 CSS px | Ampliación visual; el usuario debe poder desplazar la vista |
| Pixel 7 emulado, pinch | 412 × 839, DPR 1 para las capturas de esta matriz | 400% | 412 CSS px | 103 CSS px | Ampliación visual y desplazamiento; no se exige redistribución a 103 px |

El zoom de escritorio utiliza **`chrome.tabs.setZoom`** en un perfil efímero aislado con la extensión local `tests/fixtures/zoom-extension/`. Se comprueba `getZoom`, `innerWidth` y `devicePixelRatio`: no se simula aumentando CSS, modificando solo el viewport o multiplicando la densidad de píxeles. Chrome restablece el zoom por pestaña al navegar; la prueba lo vuelve a aplicar y verifica en cada vista.

El modo móvil utiliza `Emulation.setPageScaleFactor`; se verifica `visualViewport.scale` y su ancho. **Es emulación de pinch de Chromium, no zoom de navegador con reflow, no Safari/Firefox móvil ni prueba de un teléfono físico.** El recorte visible propio de una lupa/pinch se distingue del truncamiento del layout: el documento mantiene sus 412 px y puede recorrerse mediante desplazamiento. La prueba de A−/A+ dentro de ese modo usa teclado externo emulado, no certifica precisión táctil con un dispositivo real.

Las capturas de escritorio usan `Page.captureScreenshot` con las dimensiones DIP de `Page.getLayoutMetrics`. La captura CSS estándar de Playwright recortaba incorrectamente el área al combinarla con zoom real; el helper evita presentar ese recorte como defecto de la web. Se comprueba una anchura PNG de 1280 px. No hay escalado, relleno ni retoque posterior de imágenes.

### Reproducir

```sh
npm ci
npx playwright install --with-deps chromium
npm run check
npm run test:unit
npm run build
npm run test:e2e
```

El último comando ejecuta los proyectos `desktop`, `mobile` y `zoom`, con un servidor local gestionado por Playwright. Para aislar la matriz: `npm run test:e2e -- --project=zoom`. No ejecutar dos instancias contra el mismo directorio de artefactos simultáneamente.

Evidencias en `artifacts/zoom/`: cuatro JSON de métricas (dos factores por modo), capturas de inicio/lector/buscador. En escritorio se entrega vista visible y página completa; en móvil, la vista ampliada visible. El lector se captura con A+ al máximo. Los JSON indican el estado y el método exacto. El resto de informes y las capturas habituales están en `artifacts/` y se conservan en el artefacto de Actions `reader-test-evidence`.

## Protocolo manual pendiente: NVDA + Firefox / Narrador + Edge

**Estado de ambos: NO EJECUTADO.** No marcar ninguna fila como aprobada hasta realizarla y registrar operador, versiones y evidencia. Ejecutar cada caso en las dos combinaciones, por separado.

### Preparación

1. Windows 11 con Firefox estable + NVDA instalado; después repetir con Edge estable + Narrador. Anotar versiones exactas de Windows, navegador y lector, idioma, escala de pantalla, resolución, zoom y SHA de `git rev-parse HEAD`.
2. Servir el mismo checkout local con `npm run build` y `npm run preview -- --ignore-lock --port 4321`. Abrir `http://127.0.0.1:4321/`. No usar el dominio de producción.
3. Iniciar NVDA desde su aplicación para la primera pasada. Para Narrador, usar Win+Ctrl+Enter y comprobar que está activo. Desactivar el otro lector durante cada pasada.
4. Restablecer zoom con Ctrl+0. Trabajar solo con teclado; conservar historial de voz o notas de los anuncios realmente escuchados. En NVDA se puede alternar navegación/foco con NVDA+Espacio (tecla NVDA según configuración). En Narrador, alternar modo de examen con Narrador+Espacio. No inferir un fallo por usar accidentalmente otro modo.
5. En la pasada visual adicional, repetir a 200% y 400% **leyendo el porcentaje indicado por el menú del navegador**, sin deducirlo del número de pulsaciones de Ctrl++. Anotar el tamaño inicial del área de contenido. Restablecer Ctrl+0 al terminar.

| Caso | Acciones reproducibles | Resultado esperado | NVDA + Firefox | Narrador + Edge |
| --- | --- | --- | --- | --- |
| M01 · Entrada | Recargar inicio; Tab; escuchar y activar «Saltar al contenido» con Enter | Enlace visible al enfocar; main enfocado; lectura comienza en contenido, sin perderse en cabecera | Pendiente | Pendiente |
| M02 · Encabezados | En modo navegación/examen, Ctrl+Inicio y H para recorrer encabezados; inspeccionar lista de encabezados de la versión instalada | Un h1 por vista; secciones h2 y tarjetas h3; nombres y orden comprensibles | Pendiente | Pendiente |
| M03 · Teclado completo | Tab y Mayús+Tab por navegación, CTA, enlaces y pie; Enter para activar | Orden visual y lógico coinciden; foco siempre perceptible; sin trampas ni saltos inesperados | Pendiente | Pendiente |
| M04 · Menú reducido | Reducir ventana hasta mostrar «Abrir menú»; Tab al botón; Espacio; Tab a Inicio; Escape | Se anuncian botón y expandido/contraído; enlaces cerrados no se tabulan; Escape devuelve foco al botón; Tab puede salir, no es diálogo modal | Pendiente | Pendiente |
| M05 · Índice | Abrir el artículo; localizar navegación «En este artículo»; Tab a «Sigue el hilo»; Enter; continuar lectura/Tab | Foco y lectura llegan al h2 correcto, con foco visible; siguiente Tab avanza en el artículo, sin volver al inicio del índice | Pendiente | Pendiente |
| M06 · Referencias | Abrir ficha desde el lector, regresar al artículo y seguir «Fuentes y notas de versión» | Propósito de cada enlace comprensible; destinos y ruta correctos; no hay enlaces vacíos o anclas rotas | Pendiente | Pendiente |
| M07 · Consulta | Abrir /buscar/; enfocar campo; escribir «cuaderno», esperar un segundo; cambiar a «ficha» | Campo nombrado y consulta mantenida; se anuncia resultado y nueva consulta aunque el contador siga en uno; el foco no salta | Pendiente | Pendiente |
| M08 · Filtros y vacío | Tab al filtro Lectura; Espacio; volver al campo y escribir «sin-coincidencias»; esperar; borrar | Filtro pulsado comunicado; anuncio de etiqueta y cero resultados; enlaces ocultos no entran en Tab; recuperación del resultado sin perder foco | Pendiente | Pendiente |
| M09 · A−/A+ | Enfocar A+; Enter tres veces; otra vez en el límite; volver con A− tres veces | Cambia texto y listas; se escucha nivel/porcentaje; control no pierde foco al quedar no disponible; no supera límites | Pendiente | Pendiente |
| M10 · Zoom | Repetir M03–M09 a 200% y 400%; recorrer verticalmente inicio, artículo, ficha, búsqueda y fuentes | Sin truncamiento de texto, scroll horizontal del documento, solapamientos o controles inalcanzables; lectura y foco conservados | Pendiente | Pendiente |
| M11 · Colores y texto | Activar contraste de Windows y revisar foco, botones y enlaces; ampliar texto con el navegador y A+ | Controles distinguibles, información no depende solo del color, foco visible, sin texto cortado | Pendiente | Pendiente |
| M12 · Sin JS | Desactivar JavaScript para este origen local, recargar manual y artículo | Lectura y navegación estática utilizables; no depender de búsqueda o controles dinámicos para acceder al ejemplo | Pendiente | Pendiente |

Para cada caso registrar: resultado observado y palabras realmente anunciadas, aprobado/fallo/no ejecutado, pasos del fallo, captura o referencia de grabación autorizada y responsable/fecha. Diferencias de formulación del lector no son por sí mismas un fallo si se comunica la información y el foco correctos.

## Pendientes para la aprobación humana

- Ejecutar y registrar las dos matrices Windows anteriores; no se sustituyen con los resultados de Chromium/axe.
- Repetir zoom y lectura en Firefox y Edge reales; comprobar uso físico de móvil, pinch y tamaño táctil. La emulación móvil no los acredita.
- Revisar ergonomía con textos largos, tablas y recursos reales cuando exista una exportación editorial autorizada. Solo se ha comprobado el ejemplo sintético.
- Aprobación final del PR por la persona responsable. No se fusiona automáticamente ni se autoriza publicación.

La Fuente Maestra no se modifica. CHR r02 tiene aprobación editorial independiente, **no certificación técnica para 1.30.164078 ni autorización de publicación**; no se incorpora contenido CHR/LIV/AUD-130.
