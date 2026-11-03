# ART-003 · Componentes preparados; selección final pendiente

Estado real: preparación técnica, **no entrega artística final ni ilustrada**. Base WEB-007 `e0b6e0c624b67069b9ce9e77a6e9120da5204627`; estructura aprobada por el propietario. Rama independiente `feat/art-003-integration`, PR borrador. No se fusiona ni despliega.

## Aclaración incorporada

El propietario declara tres conceptos producidos con OpenAI bajo su dirección creativa en la conversación principal de ChatGPT. Los PNG no están archivados en Drive ni se han recibido aquí. El permiso actual es utilizarlos como referencias creativas; no hay selección/aprobación individual para uso final. No son capturas de DayZ, cartografía o evidencia de mecánicas. No se inventan autores humanos, licencias o permisos a partir de esa declaración.

Se continúa sin bloquear el desarrollo. No se reconstruyen controles, menús, tipografía o textos desde píxeles. Se reutilizan la navegación y el lector reales de WEB-007. La norma ART-001 sobre arte final generado sigue sin modificarse. La portada final y el grafito independiente se incorporarán cuando sus archivos estén recibidos y seleccionados, con procedencia/derechos revisados.

## Preparado

Cuatro destinos parametrizados: portada, MAN-01-01, Chernarus y Livonia. Figura accesible con picture/srcset, alt, pie y dimensiones explícitas; portada eager/fetchpriority high, demás recursos lazy/async. Solo rutas locales permitidas; imágenes seleccionadas y derivadas quedan dentro del paquete estático y se embeben como data URI en el HTML autónomo. No hay servicios externos. Los originales de referencia y fuentes originales no se publican automáticamente.

Sin finales recibidos: los cuatro destinos existen ocultos, sin src vacío, iconos rotos o mensajes visibles de “imagen pendiente” en portada/lector. El diseño se redistribuye sin simular que una imagen exista. Esta compilación se etiqueta PREPARACIÓN, no portada ilustrada terminada.

El artículo mantiene exactamente su cuerpo. Las 307 páginas restantes de artículo conservan sus bytes; solo se preparan los destinos de portada, lector representativo y dos entradas de atlas. No se extiende su rediseño. Los 308 artículos, IDs, ocho familias, buscador e índices siguen disponibles.

Los dos ámbitos de atlas están separados por ID y map_scope; una misma imagen no sirve silenciosamente para ambos. Sus pies añaden siempre que se trata de interpretación artística y no cartografía verificada. No se insertan coordenadas, estadísticas o afirmaciones de juego en imágenes ni se certifican mecánicas.

## Registro y selección

`assets.example.json` separa reference_concepts y assets. Cada final requiere selección explícita, creador, origen, referencia de fuente, documento de derechos, decisión de selección, alt/pie y derivados con hash/dimensiones. La publicación pública permanece en falso. Los datos de fuentes IBM Plex/OFL quedan separados, íntegros y con sus licencias previas.

El registro no demuestra por sí mismo una licencia: sus referencias deben apuntar a documentos reales revisados. No se autoautoriza arte por rellenar campos ni por tener un archivo en Drive. Si se declara captura, exige plataforma vanilla PC, mapa, fecha y build específicos. Su comprobación visual y de derechos deberá realizarse al recibirla; no se declara ejecutada sin archivos.

Se rechazan conceptos como finales, metadatos incompletos, mapa incorrecto, recursos remotos/traversal, hash alterado, firma de formato incorrecta o dimensiones PNG distintas. Las pruebas usan únicamente PNG de color de 1×1 creados como fixtures de software no figurativos en directorios temporales, bajo origen synthetic-qa-fixture y flag explícito de QA. Se rechazan sin ese flag; no se incluyen en la entrega de preparación ni se presentan como arte.

Presupuesto previo: 450 kB por variante y 1,8 MB total de derivados, dimensiones hasta 4096. Son límites de preparación, no resultados de optimización. Los PNG/derivados finales no existen aún: no se afirma haberlos optimizado o medido. WebP/AVIF se comprueban por firma y parámetros; la verificación visual/intrínseca final deberá hacerse con los recursos reales.

## Ambiente accesible

Luz ambiental CSS no figurativa, sin capas de paisaje inventadas ni movimiento del texto. Pausa/reanudación con botón de 48 px y teclado, aria-pressed, sin almacenamiento o telemetría. Se detiene con movimiento reducido, pestaña oculta o hero fuera de pantalla. Sin JavaScript queda pausada. Al volver a una ruta se liberan observadores/listeners anteriores; la pausa del usuario se conserva durante esa sesión.

Si el sistema activa movimiento reducido con el control enfocado, se evita dejar foco en un elemento que CSS acaba de ocultar. Se conserva el destino de foco y se recupera en el acceso de lectura del hero. La preferencia no reconstruye el menú ni los controles existentes.

## Compilación de mantenimiento

`build.py` admite una compilación con cero finales para desarrollar el sistema. `--require-final` rechaza la entrega ilustrada si falta cualquiera de los cuatro recursos; lo hace antes de escribir la salida. Los destinos existentes se rechazan, el ZIP WEB-007 se verifica por SHA y no se modifica.

`build-standalone.py` reutiliza el empaquetador offline WEB-007 y añade solamente el inicializador ambiental y las imágenes seleccionadas. No cambia el puente de navegación, buscador o preferencias. El propietario recibe HTML/ZIP ya construidos; no necesita ejecutar herramientas.

## Verificación y límites

17 pruebas de contrato/seguridad/render con fixtures; suite unitaria previa conservada. Prueba de los 308 hashes y 616 textos en ambos formatos, más el cotejo independiente de Markdown. Recorridos HTTP y file:// real offline a 320/768/1440 CSS px con ambiente/pausa/movimiento reducido/foco/lector/búsqueda/atlas y axe. Los resultados concretos se entregan en informe privado y no se atribuyen a CI pública, que solo dispone de DEMO y fixtures.

No hay pruebas físicas Windows, NVDA/Narrador o móvil/tablet. No se atribuye contraste de una composición final a estas pruebas, porque no contiene arte. Al recibir los finales habrá que comprobar alt, encuadre, legibilidad sobre imagen, contraste, zoom, tamaño, carga y rendimiento reales.

Rollback: cerrar la preparación y volver al HTML/ZIP WEB-007, que se conserva intacto. No hay despliegue, migración, dominio o manuscrito que revertir. Los tres conceptos, cuando se reciban, seguirán separados de los recursos finales; no se incorporarán por defecto.
