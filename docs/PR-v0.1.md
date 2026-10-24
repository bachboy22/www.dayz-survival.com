# feat: lector local DAYZ-SURVIVAL v0.1 en Astro y TypeScript

Descripción preparada para un PR; **no se ha abierto un PR remoto** por el rechazo HTTP 403 de GitHub.

El repositorio de destino está vacío. Esta entrega introduce un lector estático navegable con un único artículo sintético y su ficha, para revisar la experiencia antes de incorporar los manuscritos aprobados. El usuario puede pasar del manual al artículo, consultar su ficha y encontrar el mismo ejemplo mediante búsqueda por texto completo o etiquetas, en escritorio y móvil.

Incluye identidad visual original, índice de lectura, ajuste del tamaño de texto, referencias cruzadas, fuentes y versiones, y páginas separadas pendientes para los atlas CHR/LIV. El contrato de importación de solo lectura rechaza contenido fuera de la lista exacta de IDs/hashes y preserva la separación entre aprobación editorial y verificación técnica. CHR, LIV, AUD-130 y D26 siguen bloqueados para la exportación principal.

Validación local: `npm ci`, Astro/TypeScript sin diagnósticos, 34 unitarias aprobadas, build de 10 páginas y 33 pruebas Playwright aprobadas con una omisión intencional del menú móvil en escritorio. Axe no detectó infracciones en las nueve vistas de ambos dispositivos. El informe y las capturas acompañan al ZIP; CI preparada solo para comprobaciones.

Revisión solicitada: navegación, legibilidad, límites editoriales y contrato futuro de importación. No contiene manuscritos privados ni integra Cloudflare. No habilitar despliegue ni fusionar contenido real como parte de este PR.
