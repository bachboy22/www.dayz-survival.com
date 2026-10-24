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
- [Informe histórico de entrega](docs/ENTREGA-v0.1.md), [pendientes vigentes](docs/PENDING.md), [revisión WEB-002](docs/WEB-002-REVIEW.md) y [descripción original del PR](docs/PR-v0.1.md).
- [Respuesta histórica del intento de escritura GitHub](docs/GITHUB-WRITE-RESULT.json).

## Estado actual de GitHub · 24 de octubre de 2026

El bloqueo inicial de escritura HTTP 403 **está resuelto**. El repositorio remoto `bachboy22/www.dayz-survival.com` ya contiene los commits originales, conservados sin reescritura:

- `main`: `7dbc4d3c761e31ffc3666f6e0f7a7e35c9e7f34f` (base original).
- `feat/web-v0.1`: `af657ed3cc5f8fe85204f53e529ce10dfdc232be` (MVP de Codex) más los ajustes documentales de revisión WEB-002.
- [PR #2](https://github.com/bachboy22/www.dayz-survival.com/pull/2): abierto para revisión, **sin fusionar**.
- [WEB-001](https://github.com/bachboy22/www.dayz-survival.com/issues/1): integración cerrada.
- Las comprobaciones de CI originales [del PR](https://github.com/bachboy22/www.dayz-survival.com/actions/runs/40054967601) y [del push](https://github.com/bachboy22/www.dayz-survival.com/actions/runs/40054875547) terminaron correctamente.

Los archivos `docs/ENTREGA-v0.1.md`, `docs/PR-v0.1.md`, `docs/CONTROL.md` y `docs/GITHUB-WRITE-RESULT.json` se mantienen como **registro histórico de la etapa local**, por lo que allí figura todavía el antiguo error 403. No describen el estado actual de GitHub. El ZIP original sigue respaldado fuera del repositorio.

**Sin fusión ni despliegue autorizado.** El PR no publica la web ni lleva contenido privado a Cloudflare. La previsualización editorial privada se desarrolla en una fase separada.
