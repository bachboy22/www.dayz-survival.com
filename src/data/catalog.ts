import { demoArticle } from './demo';
import type { DemoArticle } from '../lib/content';

export type MapScope = 'general' | 'chernarus-plus' | 'livonia';
export interface PrototypeArticle extends DemoArticle {
  mapScope: MapScope;
  topic: 'Lectura' | 'Procedencia' | 'Atlas';
  level: 'Inicial' | 'Consulta';
  publicationStatus: 'demo-only';
  fieldCard: {
    situation: string; decision: string; avoid: string;
    signals: [string, string]; exit: string;
  };
  relatedDemoIds: string[];
}

/** All entries describe interface use, never gameplay. Map scope tests a filter, not geographic claims. */
export const catalog: readonly PrototypeArticle[] = [
  {
    ...demoArticle, tags: [...demoArticle.tags, 'Interfaz'], mapScope: 'general', topic: 'Lectura', level: 'Inicial', publicationStatus: 'demo-only',
    fieldCard: {
      situation: 'Quieres entender cómo está organizada esta demostración.',
      decision: 'Elige la lectura completa o consulta su resumen de interfaz.',
      avoid: 'Usar el texto sintético como consejo dentro de DayZ.',
      signals: ['La etiqueta DEMO permanece visible.', 'Cada vista enlaza con la otra.'],
      exit: 'Continúa con el índice del ejemplo o abre sus referencias.',
    }, relatedDemoIds: ['DEMO-002'],
  },
  {
    id: 'DEMO-002', slug: 'distinguir-los-estados', title: 'Cómo distinguir los estados de una lectura',
    summary: 'Ejemplo sintético para reconocer procedencia, revisión editorial y permiso de publicación en la interfaz.',
    tags: ['Procedencia', 'Demostración'], readingMinutes: 2,
    metadata: { ...demoArticle.metadata }, mapScope: 'general', topic: 'Procedencia', level: 'Consulta', publicationStatus: 'demo-only',
    sections: [
      { id: 'tres-preguntas', title: '01 · Tres preguntas diferentes', paragraphs: [
        '¿Se ha revisado el texto? ¿Hay evidencia de una versión concreta? ¿Está autorizado su uso en este destino? Son preguntas independientes. Este ejemplo no responde afirmativamente a ninguna de ellas para un artículo real.',
        'Las etiquetas de esta página describen una demostración de interfaz. No acreditan fuentes del juego ni una aprobación del catálogo editorial.',
      ] },
      { id: 'alcance-de-la-evidencia', title: '02 · El alcance de la evidencia', paragraphs: [
        'Una futura comprobación necesitará referencias, fecha, mapa, plataforma y versión evaluada. Un nombre de versión por sí solo no constituye evidencia.',
        'Aquí no hay una build evaluada. La interfaz explica esa ausencia sin sustituirla por una certificación inferida.',
      ] },
    ],
    quickCard: { id: 'DEMO-CARD-002', articleId: 'DEMO-002', title: 'Tres estados, tres preguntas', demonstration: true,
      items: ['Lee el estado editorial.', 'Consulta el alcance técnico.', 'Revisa el permiso de publicación.'] },
    fieldCard: { situation: 'Necesitas interpretar las etiquetas del prototipo.', decision: 'Lee cada estado por separado.', avoid: 'Confundir un texto revisado con una mecánica verificada.', signals: ['Editorial: demostración.', 'Técnico: pendiente, sin build evaluada.'], exit: 'Consulta el panel de versión y las notas del proyecto.' },
    references: [{ label: 'Fuentes y notas de versión', href: '/fuentes/' }], relatedDemoIds: ['DEMO-001', 'DEMO-003'],
  },
  {
    id: 'DEMO-003', slug: 'explorar-un-atlas-pendiente', title: 'Cómo explorar un atlas pendiente',
    summary: 'Una prueba de navegación entre ámbitos independientes; no contiene localidades, coordenadas ni cartografía.',
    tags: ['Atlas', 'Demostración'], readingMinutes: 1,
    metadata: { ...demoArticle.metadata }, mapScope: 'livonia', topic: 'Atlas', level: 'Inicial', publicationStatus: 'demo-only',
    sections: [
      { id: 'elegir-un-ambito', title: '01 · Elegir un ámbito', paragraphs: [
        'La entrada común permite abrir Chernarus Plus o Livonia. El selector elige un espacio de interfaz; no confirma información territorial ni disponibilidad de materiales.',
        'Este registro tiene ámbito de prueba Livonia para comprobar los filtros. Su ID es DEMO-003: no es un identificador LIV y no ocupa una plaza del catálogo histórico.',
      ] },
      { id: 'reconocer-un-limite', title: '02 · Reconocer un límite', paragraphs: [
        'Los espacios de atlas indican qué falta antes de incorporar cartografía: procedencia, derechos, autorización y precisión revisada. No contienen un mapa georreferenciado.',
        'Puedes volver a la entrada de atlas sin interpretar este ejemplo como una descripción del terreno del juego.',
      ] },
    ],
    quickCard: { id: 'DEMO-CARD-003', articleId: 'DEMO-003', title: 'Consultar un espacio de atlas', demonstration: true,
      items: ['Elige un ámbito.', 'Lee sus límites.', 'Vuelve al índice de atlas.'] },
    fieldCard: { situation: 'Quieres recorrer los espacios del atlas.', decision: 'Elige un mapa y lee el aviso de disponibilidad.', avoid: 'Orientarte con un placeholder o deducir coordenadas.', signals: ['No hay mapa georreferenciado.', 'Los ámbitos conservan su separación.'], exit: 'Vuelve a la entrada común del atlas.' },
    references: [{ label: 'Entrada del atlas', href: '/atlas/' }, { label: 'Espacio Livonia', href: '/atlas/livonia/' }], relatedDemoIds: ['DEMO-002'],
  },
];
export const topics = ['Lectura', 'Procedencia', 'Atlas'] as const;
export const mapLabels: Record<MapScope, string> = { general: 'General · interfaz', 'chernarus-plus': 'Chernarus Plus · ámbito de prueba', livonia: 'Livonia · ámbito de prueba' };
export const findDemo = (id: string) => catalog.find(article => article.id === id);
