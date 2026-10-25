# CODEX-PERF-001 · Benchmark reproducible

Requiere clon Git completo con `6091b56667b9042c3da72e42fd1dc7e206b56b8f`, Node 24.19.0, npm 11.9.0 y Chromium de Playwright. Solo fixtures DEMO, sin originales ni red externa del navegador. Las dependencias son las fijadas en package-lock; no hay dependencias de producto nuevas.

```sh
npm ci
npx playwright install chromium
CI=1 npm test
# Después de terminar tests y cerrar otros navegadores/tareas CPU intensivas:
node tools/codex-perf-001/benchmark.mjs artifacts/codex-perf-001/comparison both
```

`baseline` y `candidate` permiten pasadas aisladas; `both` alterna baseline/candidato dentro de cada tamaño 3/100/500/900. Cada uno se compila desde una copia temporal, con el mismo catálogo artificial, CSS/servidor de prueba, viewport 1280×900, red loopback sin throttling de red, cache no-store y CPU normal/4× emulada. Se enlaza node_modules del entorno QA, no del producto distribuido. Las copias se eliminan al terminar.

Baseline: todos los blobs Git de 6091b56, cambiando solo el catálogo de carga. Candidate: mismos blobs y overlay de `src/` del árbol actual; los hashes de entradas se registran para asociar resultados con el código probado. No tocar esas entradas mientras se ejecuta el benchmark. El generador conserva los tres DEMO y añade registros con IDs DEMO, títulos de interfaz y seis párrafos de frases sintéticas repetidas; no son artículos del corpus ni cantidades del catálogo editorial.

Por celda: cuatro consultas, cinco despachos input idénticos por consulta (20 muestras), normal y CPU 4×. Se guardan todas las muestras, p50/p95 nearest-rank, min/max, desviación, IQR y estadísticas por consulta. Se comprueban conteos, AND/vacío/filtros y cantidad visible (baseline todo, candidate máximo 12). El candidato también recorre la página estática 2 sin JavaScript en los conjuntos ampliados.

`syncHandlerMs` mide el tiempo síncrono del evento. `inputToFrameMs` espera dos requestAnimationFrame: no es INP/LCP ni interacción humana. DOMContentLoaded/load/long tasks y recursos registran coste inicial; JS y JSON se contabilizan por separado y sumados. `transferBytes` es ResourceTiming con overhead HTTP, sin compresión del servidor de prueba; `bytes` es cuerpo decodificado. Las repeticiones iguales pueden reutilizar el DOM candidato; esa optimización es intencional y se muestra por consulta y con máximos, no se disimula como una mejora universal de cada gesto.

Los datos artificiales contienen repetición: deduplicar términos ahorra más que en un corpus con vocabulario completamente distinto. No extrapolar a manuscritos desconocidos, redes móviles, PCs Windows, NVDA o Narrador. Las métricas cloud varían; comparar la pasada emparejada, no la cifra histórica de otro turno. No hay benchmark Lighthouse/CrUX ni pruebas físicas implícitas.

Las salidas grandes permanecen en artifacts/, fuera de Git. Informe y resumen verificable en docs/. Este tooling no abre ni reempaqueta WEB-004 o DESIGN-001-D Windows; no despliega ni modifica PR previos.
