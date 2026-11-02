import {entries} from '../catalog';
export function GET(){return new Response(JSON.stringify(entries.map(e=>({id:e.id,title:e.title,category:e.category,map:e.map,state:e.status,technical:e.evidence.estado_tecnico,normalized:[e.id,e.title,e.body_text].join(' ').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
