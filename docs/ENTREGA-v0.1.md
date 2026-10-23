# Entrega DAYZ-SURVIVAL web v0.1

23 de octubre de 2026 · Desarrollo local · Rama `feat/web-v0.1`.

## Resultado

MVP estático funcional en Astro 7.4.2 y TypeScript 6.0.3. Incluye inicio, manual, lector por secciones, ficha rápida, buscador por texto completo y etiquetas, referencias cruzadas, fuentes/versiones, acerca, dos atlas separados y página 404. No se ha desplegado ni conectado al dominio, Cloudflare o la Fuente Maestra.

El diseño es original: fondo verde oscuro, acentos cálidos, páginas de lectura claras, tipografía de sistema y una ilustración SVG topográfica conceptual. No utiliza fuentes remotas, imágenes del juego, datos cartográficos reales ni código CHERNO++.

El paquete de arranque se inspeccionó antes de implementar. `AGENTS.md`, `docs/PLAN_MVP.md` y `docs/CONTROL.md` conservan exactamente sus bytes. El README original está en `docs/BOOTSTRAP-README.md`. Los dos adjuntos del paquete recibidos en esta conversación tienen idénticos contenidos.

## Funciones comprobables

- Navegación responsive y menú móvil, con estados accesibles y cierre mediante Escape.
- Artículo `DEMO-001`: índice con anclas, tiempo de lectura, controles acotados de tamaño de texto, ficha y referencias.
- Ficha `DEMO-CARD-001`, con enlace al artículo completo.
- Búsqueda en título, resumen, etiquetas, títulos de secciones y párrafos. Normaliza mayúsculas y acentos; combina términos y filtro; conserva la consulta en la URL y muestra un estado vacío.
- Lectura y enlaces estáticos sin JavaScript. Sin JavaScript, el menú queda desplegado y el buscador ofrece el ejemplo para lectura directa.
- Espacios separados para CHR y LIV, sin publicar borradores, pilotos o datos del atlas.
- Tipos y validadores de artículos, fichas demo, citas, estados editoriales, evidencias y autorizaciones futuras.
- Contrato y CLI de importación de solo lectura: entradas fuera del repositorio, IDs exactos autorizados, SHA-256 del texto UTF-8, procedencia de build/mapa/plataforma, citas y referencias resueltas. No convierte ni incorpora contenido real al lector.
- CI de comprobaciones y plantilla de PR. El workflow no contiene despliegue ni credenciales de producción. No se ejecutó en GitHub por el bloqueo de escritura.

## Contenido y límites

Solo se presenta un artículo sintético de interfaz y una ficha, identificados como demostración. Las cifras v0.16.1 / 84 artículos / 294 IDs / 42 paquetes provienen del control editorial suministrado; no son un corpus importado o auditado.

CHR, LIV y AUD-130 permanecen aislados. D26 está bloqueado y C29, E30, CE26 y D30DOC siguen siendo vías distintas. La aprobación editorial no se transforma en certificación técnica. El exportador editorial rechaza demos, borradores y evidencia no verificada; el build actual es expresamente una demo local.

La lista de IDs y hashes del contrato requiere revisión independiente. Su validación no autentica por sí sola a una persona ni sustituye la aprobación editorial. No se proporcionan IDs reales, hashes inventados de manuscritos ni autorización para publicar.

## Pruebas ejecutadas

Entorno: Node 24.19.0, npm 11.9.0, Playwright 1.64.1, Chromium 156 instalado por Playwright. Dependencias fijadas con lockfile.

| Comando ejecutado | Resultado final |
| --- | --- |
| `npm ci --no-fund --no-audit` | Correcto; instalación reproducida desde el lockfile |
| `npm run check` | 0 errores, 0 advertencias, 0 hints |
| `npm run test:unit` | 34 aprobadas; 0 fallos |
| `npm run build` | Validación correcta y 10 páginas estáticas generadas |
| `CI=1 npm run test:e2e` | 33 aprobadas, 1 omitida, 0 fallos, 0 pruebas inestables |

La prueba omitida es la del menú móvil dentro del proyecto de escritorio; la misma prueba sí pasa en móvil. La suite final termina en unos 23 segundos en este entorno, sin reintentos necesarios.

Las unitarias prueban búsqueda, inmutabilidad, rechazo de contenido demo/borrador, aislamiento de ramas, D26, procedencia, IDs duplicados/desconocidos, hashes, rutas inseguras, citas, fechas y referencias. La CLI se prueba con archivos sintéticos externos, sin modificar sus bytes ni revelar el contenido en errores.

Las pruebas de navegador verifican nueve rutas en escritorio y móvil, enlaces artículo/ficha, búsqueda con acentos y texto del cuerpo, etiquetas, resultados vacíos, entrada HTML tratada como texto, salto de teclado al contenido, tamaño de texto, menú móvil y lectura sin JavaScript. También comprueban desbordamiento horizontal y axe con etiquetas WCAG 2 A/AA y 2.1 AA: **sin infracciones detectadas en las 18 comprobaciones de páginas**.

Se corrigió un contraste insuficiente en la etiqueta de la ficha rápida detectado durante la primera pasada. La compilación y la suite completas se repitieron después de la corrección. Se revisaron visualmente las capturas de inicio en escritorio/móvil y el artículo en escritorio. Las comprobaciones automáticas no certifican conformidad WCAG completa ni sustituyen revisión humana con lectores de pantalla.

Los logs de la ejecución final, el resultado JSON de Playwright y las capturas se entregan en `evidence/` dentro del ZIP. Se reproducen en `artifacts/` al ejecutar las pruebas en el proyecto. Los avisos de terminal `NO_COLOR`/`FORCE_COLOR` son del entorno de ejecución y no representan fallos de pruebas.

## Capturas

- `desktop-home.png`: inicio, 1440 píxeles de ancho.
- `desktop-article.png`: lector, 1440 píxeles de ancho.
- `mobile-home.png`: inicio con emulación Pixel 7.
- `mobile-article.png`: lector con emulación Pixel 7.

Las capturas son de página completa, creadas desde la compilación local final. Las de móvil conservan la densidad de píxeles del dispositivo emulado.

## GitHub y conservación

Se creó un commit local de base con los cinco archivos del paquete (`7dbc4d3`) en `bootstrap/local-base` y se desarrolló en `feat/web-v0.1`. El SHA completo del commit final figura en `DELIVERY.json` dentro del ZIP y en el bundle Git, evitando una autorreferencia en este documento.

Para inicializar el repositorio remoto vacío y permitir después un PR de la rama de desarrollo, se intentó crear únicamente el README de arranque por la API de contenidos de GitHub. La respuesta fue:

```text
GitHub API error 403: {"message":"Resource not accessible by integration","documentation_url":"https://docs.github.com/rest/repos/contents#create-or-update-file-contents","status":"403"}
```

No se ejecutó `git push`, no se creó ningún commit remoto ni se abrió un PR. No se forzaron referencias ni se sobrescribieron ramas. La respuesta estructurada está en `docs/GITHUB-WRITE-RESULT.json`.

Para enviar el código posteriormente, la instalación de la GitHub App necesita acceso al repositorio seleccionado y **Contents: read and write**; para abrir el PR, **Pull requests: read and write**. La incorporación del workflow puede requerir además **Workflows: read and write**. Los permisos declarados de la cuenta no sustituyen los permisos efectivos de la integración.

La entrega incluye código, lockfile, build estático local, evidencias, un parche del cambio respecto a la base y un bundle con el historial local completo. No incluye `node_modules`, credenciales, manuscritos ni ZIP editoriales privados. `SHA256SUMS` permite comprobar los miembros del paquete.

## Pendientes

1. Habilitar la escritura de la integración GitHub y abrir el PR usando la descripción preparada, sin fusionar automáticamente.
2. Revisar visualmente la propuesta y la experiencia con lectores de pantalla, zoom elevado y usuarios reales.
3. Autorizar una exportación editorial saneada y la lista exacta de IDs/hashes; adaptar el contrato al formato real sin tocar originales.
4. Validar búsqueda, enlaces, lectura y rendimiento con el corpus aprobado de 84 artículos. Esta entrega solo verifica el ejemplo sintético.
5. Aprobar por separado CHR, LIV y AUD-130 y definir los recursos cartográficos con licencia antes de poblar los atlas.
6. Decidir hosting, dominio y procedimiento de publicación en otra fase con autorización expresa. El build local y la CI actual no despliegan.
