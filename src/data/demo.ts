import type { DemoArticle } from '../lib/content';

/** Synthetic interface copy only. No manuscript, game mechanic, route or real atlas data. */
export const demoArticle: DemoArticle = {
  id: 'DEMO-001', slug: 'leer-una-ficha', title: 'Cómo leer una ficha de campo',
  summary: 'Un recorrido de demostración por el lector: contexto, ficha rápida y referencias, sin contenido del manual aprobado.',
  tags: ['Lectura', 'Demostración', 'Fichas'], readingMinutes: 2,
  metadata: {
    mode: 'demo', editorialStatus: 'demo', technicalStatus: 'unverified', sourceVersion: null, map: 'none', lane: 'demo',
    notice: 'Demostración de interfaz. Texto sintético: no es un artículo aprobado ni una guía de juego.',
  },
  sections: [
    { id: 'antes-de-leer', title: '01 · Antes de leer', paragraphs: [
      'Imagina un cuaderno de campo todavía en blanco. Esta página sirve para probar cómo se organiza una lectura, sin describir lugares, objetos o mecánicas reales de DayZ.',
      'La etiqueta de demostración acompaña al texto para que siempre sepas qué estás consultando. Los artículos de la Fuente Maestra se incorporarán únicamente mediante una importación autorizada.',
    ] },
    { id: 'seguir-el-hilo', title: '02 · Sigue el hilo', paragraphs: [
      'El índice te lleva a cada sección. Puedes recorrer el artículo con el teclado, compartir un enlace a un apartado o consultar la ficha rápida al final de la lectura.',
      'Las referencias cruzadas conectan las piezas del lector. En este ejemplo llevan a información sobre el proyecto y sus estados editoriales; no constituyen evidencia técnica del juego.',
    ] },
    { id: 'comprobar-el-contexto', title: '03 · Comprueba el contexto', paragraphs: [
      'Aprobación editorial y verificación técnica son estados diferentes. La primera identifica una revisión del texto; la segunda requiere evidencias concretas de versión, mapa y plataforma.',
      'Aquí ambos límites son visibles: estás leyendo una demostración sin certificación técnica. Ningún dato de este ejemplo debe utilizarse para tomar decisiones dentro del juego.',
    ] },
  ],
  quickCard: {
    id: 'DEMO-CARD-001', articleId: 'DEMO-001', title: 'La lectura, de un vistazo', demonstration: true,
    items: ['Reconoce la etiqueta de demostración.', 'Usa el índice para recorrer el ejemplo.', 'Distingue el estado editorial de la evidencia técnica.', 'Abre las referencias para conocer el contexto.'],
  },
  references: [{ label: 'Fuentes y notas de versión', href: '/fuentes/' }, { label: 'Acerca del proyecto', href: '/acerca/' }],
};
export const demoArticles = [demoArticle] as const;
