# WEB-002 · Revisión visual y preparación del PR #2
Fecha: 2026-10-24. Referencia: https://github.com/bachboy22/www.dayz-survival.com/pull/2

## Alcance y evidencia
Revisión independiente de la web v0.1 de **demostración**, sin contenido editorial real. Se inspeccionaron las cuatro capturas de entrega (`desktop-home.png`, `mobile-home.png`, `desktop-article.png`, `mobile-article.png`) y el código de portada, lector, estilos, navegación y búsqueda. El PR solo incorpora un artículo sintético `DEMO-001` y una ficha `DEMO-CARD-001`.

Los dos workflows originales, **push** y **pull_request**, acabaron en `success` el 24-10-2026; el nuevo commit documental de WEB-002 requiere comprobar de nuevo sus checks. La suite declara 34 unitarias y 33 pruebas Playwright superadas, una omitida intencionalmente. Axe no detectó infracciones en las vistas cubiertas, pero **esto no certifica WCAG**.

Se intentó una comprobación interactiva independiente del build estático mediante Chromium y servidor `127.0.0.1`, pero el entorno devolvió `ERR_BLOCKED_BY_ADMINISTRATOR`. No se contabiliza esa ejecución como prueba superada. La inspección visual humana aquí está limitada a las capturas entregadas; faltará una prueba manual con lector de pantalla y zoom real.

## Inspección visual
| Área | Resultado | Observación |
| --- | --- | --- |
| Inicio, escritorio | Conforme para demo | Jerarquía clara, presentación de la maqueta topográfica como ilustración conceptual, CTA visibles, secciones diferenciadas. |
| Inicio, móvil | Conforme para demo | Columna única, cards apiladas, CTA reconocibles y menú plegable. Algunas leyendas y metadatos presentan cuerpo muy pequeño y merecen ajuste antes de la versión con artículos largos. |
| Lector, escritorio | Conforme para demo | Texto sobre fondo claro, índice lateral, referencia a aprobación editorial vs. verificación técnica, controles visibles y enlaces a ficha. |
| Lector, móvil | Conforme para demo | Lectura lineal, índice antes del cuerpo, ficha al final, sin recorte visible en la captura. Verificar manualmente enfoque de teclado, zoom 200-400% y textos secundarios. |
| Búsqueda/etiquetas | Comprobación de código + CI | Consulta local con normalización de acentos, filtros, estado vacío y actualización URL; no se obtuvo nueva captura interactiva. |
| Navegación/referencias | Comprobación de código + CI | Enlaces y anclas tratados en pruebas; enlace para saltar al contenido y cierre de menú con Escape. |

## Riesgos y decisiones
1. **Documentación histórica**: los informes originales `docs/ENTREGA-v0.1.md`, `docs/PR-v0.1.md`, `docs/CONTROL.md` y la respuesta `docs/GITHUB-WRITE-RESULT.json` documentan fielmente el fallo 403 anterior. Se conservan como evidencia de entonces; el README y esta acta reflejan el estado actual.
2. **No introducir contenido privado**: la Fuente Maestra permanece fuera de GitHub. CHR r02 tiene once entradas aprobadas editorialmente en rama separada el 24-10-2026, pero aún no certificadas para PC Stable 1.30.164078 ni autorizadas para publicación.
3. **Importador**: en fase posterior, separar **previsualización privada** de importación/publicación; el validador de producción exige evidencia técnica verificada y vínculos cerrados dentro del lote. No relajar el bloqueo de publicación en este PR.
4. **Producción**: `robots.txt` y `noindex` del demo son barreras para indexación, **no** seguridad de acceso. No publicar el sitio ni manuscritos privados por considerar suficiente esa configuración.

## Puertas de revisión antes de fusionar a main
- [x] Dos commits originales de Codex preservados al abrir el PR.
- [x] Se completó una primera inspección visual de escritorio y móvil basada en cuatro capturas.
- [x] Revisados menú, búsqueda, índice y referencias por código y resultados de CI.
- [x] El sitio incluye solo contenido sintético y no tiene workflow de despliegue.
- [ ] El nuevo commit de documentación WEB-002 debe superar la CI.
- [ ] Revisión humana adicional: foco, lector de pantalla, zoom elevado, y uso real en móvil.
- [ ] Aprobación final del PR por la dirección editorial antes de fusionar.

**Decisión**: dejar el PR preparado para revisión. No fusionar automáticamente, no desplegar Cloudflare y no alterar el dominio.
