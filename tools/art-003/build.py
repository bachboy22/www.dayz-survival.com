"""Prepare ART-003 with zero finals, or integrate only independently selected originals."""
import argparse,hashlib,html,json,re,shutil,zipfile
from pathlib import Path
from media import validate,figure

def build(a):
    assert not a.output.exists() and not a.report.exists(),'Use new output/report paths'
    assert hashlib.sha256(a.base.read_bytes()).hexdigest()=='c30cceb9a659c0fa0f270c7c5ed1e42d3bfe1433aaa7b41038ab6883470e812e'
    manifest=json.loads(a.manifest.read_text());selected=validate(manifest,a.assets,a.require_final,a.allow_test_fixtures)
    z=zipfile.ZipFile(a.base)
    assert all(not n.startswith('/') and '..' not in Path(n).parts for n in z.namelist())
    a.output.mkdir(parents=True);z.extractall(a.output)
    media=a.output/'media';(media/'art').mkdir()
    for e in selected.values():
        for v in e['variants']:shutil.copyfile(a.assets/v['file'],media/'art'/v['file'])
    css=Path('tools/art-003/ambient.css').read_text();js=Path('tools/art-003/ambient.js').read_text()
    (media/'art003.css').write_text(css);(media/'art003.js').write_text(js)
    home=(a.output/'index.html').read_text()
    home,count=re.subn(r'<figure class="w7-frame".*?</figure>',lambda _:figure('cover',selected),home,count=1,flags=re.S);assert count==1
    home=home.replace('<section class="w7-hero">','<section class="w7-hero'+(' art003-layout-empty' if 'cover' not in selected else '')+'" data-art003-hero><div class="art003-ambient" aria-hidden="true"></div>',1)
    home=home.replace('<div class="w7-hero-tail">','<div class="w7-hero-tail"><button class="art003-motion-toggle" type="button" data-art003-motion aria-pressed="false" hidden>Pausar ambiente</button>',1)
    slots=iter(('chernarus','livonia'))
    home,count=re.subn(r'<div class="w7-atlas-reserve".*?</div>',lambda _:figure(next(slots),selected),home,flags=re.S);assert count==2
    if not any(s in selected for s in ('chernarus','livonia')):home=home.replace('class="w7-atlas-card"','class="w7-atlas-card art003-layout-empty"')
    targets={'index.html':home}
    relative='articulos/MAN-01-01/index.html';s=(a.output/relative).read_text()
    s,count=re.subn(r'<figure class="w7-graphite-reserve".*?</figure>',lambda _:figure('man-01-01',selected),s,count=1,flags=re.S);assert count==1
    if 'man-01-01' not in selected:s=s.replace('class="w7-article-cover"','class="w7-article-cover art003-layout-empty"')
    targets[relative]=s
    for slot in ('chernarus','livonia'):
        relative='atlas/'+slot+'/index.html';s=(a.output/relative).read_text();s=re.sub(r'(<h1\b[^>]*>.*?</h1>)',lambda m:m[0]+figure(slot,selected),s,count=1,flags=re.S);targets[relative]=s
    for relative,s in targets.items():
        s=s.replace('</head>','<link rel="stylesheet" href="/media/art003.css"></head>')
        if relative=='index.html':s=s.replace('</body>','<script src="/media/art003.js" defer></script></body>')
        (a.output/relative).write_text(s)
    credits=(a.output/'licencias/index.html').read_text()
    if selected:credits=credits.replace('No incorpora fotografías, cartografía ni ilustraciones finales. Las reservas se identifican como pendientes y no aportan evidencia de DayZ.','ART-003 incorpora únicamente recursos seleccionados para esta revisión privada; no aportan por sí solos evidencia técnica de DayZ.')
    listing=''.join('<li><strong>'+html.escape(e['id'])+'</strong>: '+html.escape(e['creator'])+' · '+html.escape(e.get('credit_line','Procedencia y alcance de uso registrados en el expediente privado.'))+'</li>' for e in selected.values())
    received='Los PNG de referencia están registrados por separado; no se integran como recursos finales.' if manifest['reference_concepts'].get('files_received') else 'Los PNG de referencia aún no se han recibido; no se integran como recursos finales.'
    addition='<section><h2>Procedencia ART-003</h2><p>Los tres conceptos declarados por el propietario proceden de OpenAI bajo su dirección creativa y solo están autorizados como referencia. '+received+'</p><p>Recursos finales incorporados en esta compilación: '+str(len(selected))+'. Las licencias tipográficas IBM Plex permanecen independientes de las imágenes.</p><ul>'+listing+'</ul></section>'
    credits=credits.replace('</main>',addition+'</main>');(a.output/'licencias/index.html').write_text(credits)
    # Neither body text nor metadata of any article is regenerated.
    for n in z.namelist():
        if n.startswith('articulos/') and n.endswith('/index.html') and n!='articulos/MAN-01-01/index.html':assert (a.output/n).read_bytes()==z.read(n)
    a.report.write_text(json.dumps({'contract':'ART-003','state':'ILLUSTRATED_REVIEW' if len(selected)==4 else 'PREPARATION_NOT_FINAL_ART','selected_final_assets':len(selected),'artificial_qa_fixture_mode':a.allow_test_fixtures,'reference_concepts':manifest['reference_concepts'],'assets':list(selected.values()),'unmodified_other_article_pages':307,'public_deployment':False},ensure_ascii=False,indent=2))
    print(json.dumps({'state':'prepared' if not selected else 'selected private review','final_assets':len(selected),'other_articles_unchanged':307}))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for name in ('base','manifest','assets','output','report'):p.add_argument('--'+name,type=Path,required=True)
    p.add_argument('--require-final',action='store_true');p.add_argument('--allow-test-fixtures',action='store_true',help='QA only. Never distribute a fixture build as editorial artwork.')
    build(p.parse_args())
