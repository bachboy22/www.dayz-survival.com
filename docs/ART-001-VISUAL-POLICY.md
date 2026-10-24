# ART-001 · Norma permanente de dirección artística

Vigente desde el 24/10/2026. Ámbito: toda pieza DAYZ-SURVIVAL, incluida la web, el manual, atlas, diagramas y materiales derivados. Esta norma se aplica a nuevos recursos y a la revisión de los existentes.

## Principio y prohibiciones

Los materiales deben ser originales, auténticos, funcionales y trazables. **No se admiten imágenes finales generadas por IA**, ni su uso como base de una imagen final mediante retoque, calco, composición, relleno generativo o transferencia de estilo. No se busca disimular procedencias. Tampoco se admite una estética de arte generativo como sustituto de información editorial verificable.

No utilizar supervivientes sintéticos, escenas conceptuales genéricas, mapas inventados, fondos decorativos injustificados, proporciones incoherentes o detalles técnicos sin respaldo. Un acabado atractivo no convierte una imagen en evidencia. No utilizar CHERNO++, contenido modificado o imágenes de otra build/mapa como si fueran DayZ vanilla PC.

La asistencia con código no convierte un SVG o render del prototipo en un recurso editorial final autorizado. Se declara la procedencia y se somete al mismo control; la revisión humana no borra una procedencia generativa prohibida.

## Identidad que se conserva

- Verde bosque oscuro, papel cálido y acentos sobrios con contraste suficiente.
- Composición editorial: el texto y la consulta tienen prioridad sobre la imagen.
- Iconografía coherente en retícula, grosor, proporciones y significado. Un icono funcional acompaña a una etiqueta o tiene nombre accesible; no exige interpretar una forma ambigua.
- Tipografía legible y escalable, sin leyendas minúsculas para simular precisión técnica. Los datos nunca dependen solo del color.

## Recursos preferentes y condiciones

| Tipo | Propósito admisible | Procedencia y validación necesarias |
| --- | --- | --- |
| Captura de DayZ vanilla PC | Mostrar una observación real que el texto necesita explicar | Original de captura, autor, fecha, plataforma, mapa, build/canal exactos y condiciones de captura. Confirmar vanilla y documentar qué se observa. Revisar titularidad, términos del juego, permiso/licencia de uso, atribución y transformaciones autorizadas antes de incorporar. No asumir permiso por ser una captura propia. |
| Diagrama propio editable | Explicar una relación, secuencia o estructura con más claridad que el texto | Fuente editable (SVG u otro formato revisable), autoría, referencias técnicas, unidades/escala cuando proceda, proceso de revisión. No inventar magnitudes, rutas o mecánicas para completar un gráfico. |
| Cartografía documentada | Orientación o consulta espacial sustentada en datos autorizados | Fuente y versión del conjunto de datos, mapa/build, licencia de datos y de la representación, permisos de derivación y distribución, método de transformación y revisión cartográfica. Las capas y sus incertidumbres permanecen identificadas. |
| Iconografía | Una función de interfaz inequívoca y consistente | Fuente/autor, licencia o permiso revisado, retícula y reglas de uso; nombre accesible o tratamiento decorativo justificado. |
| Ilustración técnica | Aportar conocimiento real que requiere una representación | Fuente editable, autor, referencias y revisión de proporciones, unidades, etiquetas, procedencia técnica y derechos. La ausencia de medición se indica; no se suple con detalle inventado. |

La normativa, licencia o permiso se revisa para el uso concreto (web pública, impresión, transformación, redistribución). No se inventan autorizaciones, derechos o licencias. Los contratos privados se conservan fuera del repositorio; el registro público puede apuntar a un identificador de revisión sin revelar documentos privados.

## Registro obligatorio de cada recurso futuro

Antes de incorporarlo, crear una ficha de recurso revisable con estos campos. No se incluye todavía ninguna nueva imagen editorial en esta entrega.

| Campo | Contenido exigido |
| --- | --- |
| Identidad y propósito | ID estable, título, tipo, artículo/vista de destino, pregunta que ayuda a responder y por qué no basta el texto |
| Autoría y procedencia | Autor/captor, fecha, método de creación, fuente original y referencias. Declaración explícita del proceso; sin procedencias ocultas |
| Integridad y edición | SHA-256 del original y de la versión usada, fuente editable, recorte/anotaciones/cambios documentados y responsable |
| Derechos | Titular, licencia o permiso revisado, enlace/identificador documental, alcance, atribución requerida, restricciones y revisor/fecha. `Pendiente` impide aprobar un recurso final |
| Contexto técnico | Plataforma vanilla PC, mapa, build/canal, fecha y referencias de comprobación cuando aplique; `no aplica` requiere motivo |
| Estado editorial | Propuesto, en revisión, aprobado o retirado; aprobador y fecha. No equivale a verificación técnica ni a autorización de publicación |
| Accesibilidad | Función informativa o decorativa, alternativa textual, pie, descripción larga si procede, contraste, etiquetas, uso de color, legibilidad al ampliar y estrategia móvil |
| Publicación | Autorización concreta del destino y versión; una aprobación de contenido no autoriza por sí sola un despliegue |

Los diagramas y mapas informativos necesitan un equivalente textual suficiente. Las imágenes puramente decorativas usan alternativa vacía o `aria-hidden`, sin repetir información ornamental en el lector de pantalla. Un mapa complejo necesita leyenda accesible y una alternativa de consulta; no basta `alt="mapa"`. Los textos incrustados deben evitarse o entregarse también como texto real escalable.

## Tratamiento del prototipo actual

`src/components/Terrain.astro` es un SVG de interfaz del MVP, elaborado con asistencia de Codex y conservado desde la entrega v0.1 (`af657ed`). **No deriva de datos cartográficos, no representa Chernarus o Livonia y no tiene verificación geográfica.** No se presenta como ilustración técnica validada ni como material editorial final. Su permanencia actual es la maqueta conceptual que el usuario ha permitido conservar identificada como tal; no establece una excepción para futuras imágenes generadas.

Se mantiene `aria-hidden="true"` porque no comunica información geográfica; el pie visible explica su carácter conceptual. No se empleará como fuente de posiciones, distancias, rutas o apariciones de botín. Se sustituirá por material documentado y autorizado cuando exista un propósito editorial real. Se han retirado los anillos decorativos de las tarjetas de atlas para evitar pseudo-cartografía sin función.

La iconografía geométrica existente está centralizada en `src/components/Icon.astro`; conserva retícula de 24 unidades y trazo común. Sigue siendo un componente de interfaz, no evidencia técnica del juego. No se incorporan fotos, mapas o recursos finales nuevos, ni se afirma que se haya obtenido licencia de material externo.

## Flujo de aprobación

1. Proponer propósito y tipo de recurso; si no aporta información, omitirlo.
2. Documentar original, proceso, fuentes, derechos y accesibilidad antes de añadir el archivo al repositorio.
3. Revisar por separado contenido editorial, evidencia técnica, derechos y accesibilidad. Corregir en el original editable, manteniendo trazabilidad.
4. Registrar la aprobación y sus límites. No publicar material restringido o pendiente; retirar versiones invalidadas sin perder el registro histórico.
5. Verificar el recurso en las vistas de destino, móvil, zoom 200%/400%, contraste y alternativa textual antes de solicitar publicación.

La Fuente Maestra permanece privada e inmutable. **CHR r02 está aprobada editorialmente, pero no certificada para 1.30.164078 ni autorizada para publicación.** LIV y AUD-130 conservan su separación. Esta norma y este PR no autorizan importar manuscritos, publicar atlas, fusionar código o desplegar Cloudflare.
