"""Export an already verified WEB-005 Astro build; never alter source manuscripts."""
import argparse,hashlib,html,json,re,shutil,zipfile
from pathlib import Path
import sys
from importlib import import_module
sys.path.insert(0,str(Path(__file__).parents[1]/'web-005'))
visible=import_module('import-corpus').text

def sha(b):return hashlib.sha256(b).hexdigest()

def export(source,corpus,output):
    assert not output.exists(),'Never overwrite a prior delivery'
    assert sha(corpus.read_bytes())=='4738c473c7da77a9e6d3ae47c1fbf0024ad5c35041e907dfcdaa1e1cfbad86bc'
    z=zipfile.ZipFile(corpus);original_report=json.loads((source/'INTEGRITY.json').read_text())
    index=json.loads(z.read('entrega_integral/INDICE_EDITORIAL_308.json'));assert len(index)==308 and len({r['id'] for r in index})==308
    output.mkdir(parents=True)
    # No source code, original downloads, preparation registries, runtime or ZIPs.
    for p in source.rglob('*'):
        if not p.is_file():continue
        rel=p.relative_to(source)
        if rel.parts[0] in ('originales','auxiliares') or rel.as_posix() in ('INTEGRITY.json','ILLUSTRATIONS.json'):continue
        assert p.suffix in ('.html','.css','.js','.json','.svg','.woff2'),str(rel)
        target=output/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
    references={}
    template=(source/'proyecto/index.html').read_text()
    for p in sorted((source/'auxiliares').rglob('*')):
        if not p.is_file():continue
        relative=p.relative_to(source/'auxiliares');route='/referencias/'+relative.with_suffix('').as_posix()+'/'
        references['/auxiliares/'+relative.as_posix()]=route
        main='<nav class="breadcrumb" aria-label="Ruta de navegación"><a href="/">Inicio</a> / <a href="/enciclopedia/">Enciclopedia</a> / Referencia</nav><article class="reader"><h1>Documento auxiliar citado</h1><p>'+html.escape(relative.name)+'</p><p>Referencia histórica enlazada desde el corpus. No cuenta como artículo ni certifica mecánicas actuales. Se conserva el texto completo; no es un archivo de configuración ejecutable.</p><div class="manuscript"><pre tabindex="0" aria-label="Texto completo de la referencia">'+html.escape(p.read_text())+'</pre></div></article>'
        page=re.sub(r'<main\b[^>]*>.*?</main>',lambda _: '<main id="main-content" tabindex="-1">'+main+'</main>',template,flags=re.S)
        page=re.sub(r'<title>.*?</title>','<title>Referencia histórica · DAYZ-SURVIVAL</title>',page,flags=re.S)
        target=output/route.strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(page)
    for p in output.rglob('*.html'):
        s=p.read_text()
        for old,new in references.items():s=s.replace('href="'+old+'"','href="'+new+'"')
        s=re.sub(r'<a\b[^>]*href="/originales/[^\"]+"[^>]*>Descargar manuscrito original sin modificaciones</a>','<p>Integridad del manuscrito registrada mediante SHA-256 en esta ficha.</p>',s)
        # Distribution label only; never replace any text inside manuscript bodies.
        s=s.replace('WEB-005 · REVISIÓN PRIVADA','WEB-006 · REVISIÓN PREVIA A PUBLICACIÓN')
        s=s.replace('Los originales se conservan byte a byte y se pueden descargar desde cada artículo.','Los originales históricos se conservan sin modificaciones fuera de este paquete. Cada artículo registra el SHA-256 del manuscrito.')
        s=re.sub(r'<script\b[^>]*>.*?</script>',lambda m:m[0].replace('WEB-005','WEB-006'),s,flags=re.S)
        if p.relative_to(output).as_posix()=='articulos/EQP-02-02/index.html':
            # A legacy smart-typography conversion changed an interface literal.
            # Restore the two source tokens in presentation; never write the MD.
            raw=z.read('entrega_integral/manuscritos/EQP-02-02.md').decode('utf-8')
            assert raw.count('«---»')==2
            match=re.search(r'<div class="manuscript">(.*?)</div>',s,re.S)
            assert match and match[1].count('«—»')==2
            s=s[:match.start(1)]+match[1].replace('«—»','«---»')+s[match.end(1):]
        p.write_text(s)
    articles=[]
    originals_by_id={r['id']:r for r in original_report['articles']}
    for row in index:
        raw=z.read('entrega_integral/'+row['file']);r=originals_by_id[row['id']]
        assert sha(raw)==r['source_hash'] and raw.strip()
        articles.append({'id':row['id'],'source_hash':r['source_hash'],'source_bytes':len(raw),'rendered_text_hash':r['rendered_text_hash'],'editorial_status_origin':row['status'],'technical_status':'PENDIENTE_DE_REVISION_ATOMICA','client_test_status':'NO_PROBADO','private_review_authorized':True,'public_publication_authorized':False})
        if row['id']=='EQP-02-02':
            body=re.search(r'<div class="manuscript">(.*?)</div>',(output/'articulos/EQP-02-02/index.html').read_text(),re.S)[1]
            articles[-1].update({'prior_rendered_text_hash':r['rendered_text_hash'],'rendered_text_hash':sha(visible(body).encode()),'presentation_repairs':[{'source_literal':'«---»','legacy_rendered_literal':'«—»','restored_occurrences':2,'original_modified':False}]})
    manifest={'contract':'WEB-006','source_commit':'1fa920c92f8f02faa78d65cfde669810bd95bdc6','corpus_archive_sha256':sha(corpus.read_bytes()),'count':308,'historical_ids':294,'livonia_ids':14,'source_bytes_preserved':True,'game_mechanics_certified':False,'articles':articles}
    (output/'INTEGRITY.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    (output/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
    assert len(list((output/'articulos').glob('*/index.html')))==308
    assert not (output/'_redirects').exists() and not (output/'_headers').exists()
    return {'articles':308,'reference_pages':len(references),'files':len([p for p in output.rglob('*') if p.is_file()]),'references':references}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--corpus',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args();print(json.dumps(export(a.source,a.corpus,a.output),indent=2))
