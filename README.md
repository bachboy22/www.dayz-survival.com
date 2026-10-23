# DAYZ-SURVIVAL | The Chernarus Field Manual · web v0.1

Lector estático funcional en **Astro 7.4.2 + TypeScript 6.0.3**, preparado para revisión local. Identidad visual original, sin código CHERNO++. **No está publicado y no incluye configuración de Cloudflare ni comandos de despliegue.**

## Ejecutar

Requiere Node **24.19.0** y npm **11.9.0** (versiones de esta entrega). Las dependencias directas están fijadas y `package-lock.json` conserva el árbol resuelto.

```sh
npm ci
npm run dev
```

Abre la dirección local que indica Astro. Para revisar el resultado compilado:

```sh
npm run build
npm run preview -- --ignore-lock --port 4321
```

Abre `http://127.0.0.1:4321/`. `--ignore-lock` mantiene el servidor en primer plano incluso cuando Astro detecta un agente; se detiene con Ctrl+C. La compilación no publica la web.

## Recorrido funcional

- Inicio y navegación responsive, con menú móvil y enlace para saltar al contenido.
- Manual y artículo de ejemplo con índice, enlaces a secciones, ajuste del tamaño de texto, tiempo de lectura y referencias cruzadas.
- Ficha rápida enlazada con su artículo.
- Buscador local por texto completo, acentos y etiquetas, estado vacío y consultas enlazables mediante URL.
- Atlas de Chernarus y Livonia como páginas separadas pendientes de aprobación.
- Fuentes, notas de versión, acerca del proyecto y página 404.

Solo hay **un artículo sintético `DEMO-001` y una ficha `DEMO-CARD-001`**, identificados como demostración. La lectura estática y los enlaces funcionan sin JavaScript; la búsqueda, el filtro, el ajuste de texto y el menú plegable usan pequeños scripts locales. Sin JavaScript, la navegación permanece desplegada y el buscador muestra el enlace al ejemplo.

## Verificar

```sh
npx playwright install --with-deps chromium
npm test
```

`npm test` ejecuta tipos, unitarias, validación de datos, compilación y pruebas de navegador. La suite recorre las nueve vistas principales en escritorio y móvil, usa axe para detectar problemas de accesibilidad y genera cuatro capturas en `artifacts/screenshots/`. Los informes se generan en `artifacts/` y no se versionan. Para usar un Chromium ya instalado, se admite `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con su ruta absoluta; la opción normal utiliza el navegador instalado por Playwright.

## Límites editoriales

Fuente Maestra de referencia: **v0.16.1, 84 artículos aprobados, 294 identificadores y 42 paquetes**. Son datos del control editorial proporcionado; no se han importado ni auditado los manuscritos. Los originales permanecen fuera del repositorio.

CHR, LIV y AUD-130 están aislados. D26 está bloqueado; C29, E30, CE26 y D30DOC son vías distintas. Aprobación editorial y verificación técnica son estados diferentes. La web no afirma certificación DayZ 1.30 Stable ni ofrece estadísticas, rutas, botín o datos cartográficos inventados.

El contrato de importación valida en memoria una exportación autorizada y su lista exacta de IDs/hashes. No descarga la Fuente Maestra, no convierte manuscritos, no guarda entradas privadas y no conecta automáticamente contenido real al lector. El build actual genera una **demo**, no una exportación editorial aprobada.

## Documentación y revisión

- [Reglas del proyecto](AGENTS.md) y [plan suministrado](docs/PLAN_MVP.md).
- [Contrato de importación](docs/IMPORT-CONTRACT.md), [arquitectura](docs/ADR-001.md), [desarrollo y revisión](docs/DEVELOPMENT.md).
- [Informe de entrega y pruebas](docs/ENTREGA-v0.1.md), [pendientes](docs/PENDING.md) y [descripción preparada de PR](docs/PR-v0.1.md).
- [Respuesta exacta del intento de escritura GitHub](docs/GITHUB-WRITE-RESULT.json).

La rama local es `feat/web-v0.1`, sobre `bootstrap/local-base`. GitHub rechazó la escritura con HTTP 403; no se creó un commit remoto ni un PR. El ZIP de entrega incluye el código, el build estático, evidencias y un bundle Git con el historial local. El README original suministrado se conserva en `docs/BOOTSTRAP-README.md`.
