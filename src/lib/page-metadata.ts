/** Derived DEMO presentation metadata; never edits editorial sources or enables indexing. */
const descriptions: Record<string, string> = {
  '/': 'Inicio DEMO de DAYZ-SURVIVAL: busca ejemplos de interfaz y elige lectura extensa, ficha rápida o atlas pendiente. Sin manuscritos publicados.',
  '/aprender/': 'Recorridos opcionales DEMO para aprender a usar el lector y sus estados. No son cursos ni consejos de supervivencia en DayZ.',
  '/manual/': 'Índice de lecturas sintéticas DEMO: texto extenso, referencias y fichas enlazadas. La Fuente Maestra no está importada.',
  '/buscar/': 'Buscador local DEMO con temas, ámbitos, niveles y páginas de resultados. Solo ejemplos sintéticos, sin consultas a servicios externos.',
  '/fichas/': 'Entrada a las fichas rápidas DEMO: situación, decisión y señales de interfaz enlazadas con su lectura extensa. Sin datos del juego.',
  '/atlas/': 'Entrada DEMO a los ámbitos independientes Chernarus Plus y Livonia. Placeholders sin mapa georreferenciado ni localidades publicadas.',
  '/atlas/chernarus/': 'Estado del espacio Chernarus Plus: CHR r02 aprobado editorialmente, sin certificación técnica ni permiso de publicación. No hay cartografía real.',
  '/atlas/livonia/': 'Estado del atlas independiente Livonia: identificadores separados y contenido no importado. Sin posiciones ni rutas verificadas.',
  '/herramientas/': 'Glosario de interfaz y preguntas del prototipo DEMO; matrices y registros pendientes. No incluye calculadoras de juego ni datos supuestos.',
  '/fuentes/': 'Método y límites de DAYZ-SURVIVAL: Fuente Maestra v0.16.1, estados editoriales y técnicos independientes, versiones del producto y prototipo.',
  '/acerca/': 'Alcance independiente de DAYZ-SURVIVAL para DayZ vanilla PC, política visual, privacidad y límites del prototipo DEMO sin despliegue.',
  '/404.html': 'Página no encontrada en el prototipo DEMO de DAYZ-SURVIVAL. Regresa al inicio, manual o buscador local.',
  '/404/': 'Página no encontrada en el prototipo DEMO de DAYZ-SURVIVAL. Regresa al inicio, manual o buscador local.',
};
export function pageDescription(path: string, title: string): string {
  return descriptions[path] ?? `${title}: vista sintética del prototipo DEMO DAYZ-SURVIVAL, sin manuscritos publicados ni certificación técnica del juego.`;
}
