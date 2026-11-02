"""Private, offline import. Originals are read, never written. No editorial data in Git."""
import argparse, csv, hashlib, html, io, json, re, zipfile
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

def sha(data): return hashlib.sha256(data).hexdigest()
def text(value):
    class Extract(HTMLParser):
        def __init__(self): super().__init__(); self.parts = []
        def handle_data(self, d): self.parts.append(d)
    p = Extract(); p.feed(value); return ' '.join(' '.join(p.parts).split())

class Presentation(HTMLParser):
    """Allowlist imported HTML; change only heading IDs and link destinations."""
    tags = set('p strong a h1 h2 h3 h4 li br ul ol hr code em table thead tbody tr th td colgroup col blockquote pre del'.split())
    def __init__(self, ids, own, auxiliary):
        super().__init__(convert_charrefs=False); self.ids=ids; self.own=own; self.auxiliary=auxiliary; self.out=[]; self.outline=[]; self.heading=0; self.current=None; self.refs=set(); self.external=set(); self.unresolved=[]
    def handle_starttag(self, tag, attrs):
        if tag not in self.tags: raise ValueError('Unsupported HTML tag: '+tag)
        attrs=dict(attrs); safe=[]
        if tag=='table':
            safe.extend([('tabindex','0'),('aria-label','Tabla del manuscrito · desplazamiento con teclado')])
        if re.fullmatch('h[1-4]',tag):
            self.heading+=1; self.current={'id':f'section-{self.heading}','title':'','level':int(tag[1])}; self.outline.append(self.current);safe.append(('id',self.current['id']))
        if tag=='a':
            href=attrs.get('href','')
            if href.startswith('#') and href[1:] in self.ids:
                self.refs.add(href[1:]); href='/articulos/'+href[1:]+'/'
            elif re.fullmatch(r'(?:[.A-Za-z0-9_-]+/)*[A-Z0-9-]+\.md',href) and Path(href).stem in self.ids:
                self.refs.add(Path(href).stem); href='/articulos/'+Path(href).stem+'/'
            elif href in self.auxiliary: href=self.auxiliary[href]
            elif re.match(r'https?://',href): self.external.add(href)
            elif href.startswith('#'):
                # Internal headings are linked after the complete heading inventory exists.
                href='__LOCAL__'+href[1:]
            else: raise ValueError('Unsafe or unsupported link: '+href)
            safe.append(('href',href)); safe.append(('rel','noreferrer'))
        for key in ('colspan','rowspan'):
            if key in attrs:
                if not attrs[key].isdigit(): raise ValueError('Bad table span')
                safe.append((key,attrs[key]))
        if any(k.startswith('on') for k in attrs): raise ValueError('Event attribute')
        self.out.append('<'+tag+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in safe)+'>')
    def handle_endtag(self,tag):
        if tag not in self.tags: raise ValueError('Unsupported closing tag')
        self.out.append('</'+tag+'>')
        if re.fullmatch('h[1-4]',tag): self.current=None
    def handle_data(self,d):
        self.out.append(html.escape(d))
        if self.current is not None: self.current['title']+=d
    def handle_entityref(self,n): self.handle_data(html.unescape('&'+n+';'))
    def handle_charref(self,n): self.handle_data(html.unescape('&#'+n+';'))

def run(args):
    dest=Path(args.output)
    if dest.exists(): raise ValueError('Output exists; use a new directory, never overwrite originals')
    assert sha(Path(args.corpus).read_bytes())==args.corpus_sha256, 'Corpus archive differs from the authorized delivery checksum'
    z=zipfile.ZipFile(args.corpus); base='entrega_integral/'
    index_bytes=Path(args.index).read_bytes(); index=json.loads(index_bytes)
    assert index_bytes==z.read(base+'INDICE_EDITORIAL_308.json'), 'Index differs from integral package'
    ids=[r['id'] for r in index]; assert len(ids)==308 and len(set(ids))==308
    assert len([i for i in ids if i.startswith('LIV-')])==14
    assert len([i for i in ids if not i.startswith('LIV-')])==294
    for r in index: assert re.fullmatch(r'(MAN|COM|EQP|CHR|MEC|GUI|ARC|LIV)-[A-Z0-9-]+',r['id']) and r['file']=='manuscritos/'+r['id']+'.md'
    static=zipfile.ZipFile(args.static); html_bytes=static.read('DAYZ-SURVIVAL_MANUAL_COMPLETO_308_ABRIR.html')
    assert html_bytes==z.read(base+'DAYZ-SURVIVAL_MANUAL_COMPLETO_308_ABRIR.html'), 'Static and integral HTML differ'
    source=html_bytes.decode('utf-8')
    entries={m[0]:m[1] for m in re.findall(r'<article\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</article>',source,re.S)}
    assert set(entries)==set(ids)
    evidence={r['id']:r for r in csv.DictReader(io.StringIO(Path(args.evidence).read_text(encoding='utf-8-sig')))};assert set(evidence)==set(ids)
    illustrations=list(csv.DictReader(io.StringIO(Path(args.illustrations).read_text(encoding='utf-8-sig')),delimiter=';'))
    assert len(illustrations)==308 and {r['ID'] for r in illustrations}==set(ids), 'Illustration manifest IDs differ'
    expected={line.split('  ',1)[1]:line.split('  ',1)[0] for line in z.read(base+'SHA256_ORIGINALES_V0161.txt').decode().splitlines() if line.strip()}; assert expected
    originals=zipfile.ZipFile(io.BytesIO(z.read(base+'originales/DAYZ_SURVIVAL_FUENTE_MAESTRA_v0161.zip')))
    branch_originals={state:zipfile.ZipFile(io.BytesIO(z.read(base+'originales/'+name))) for state,name in [('aprobado_chr_r02','CHR_r02.zip'),('piloto_liv_original','LIV_v01.zip')]}
    auxiliary={}
    for href in set(re.findall(r'href="([^"]+)"', source)):
        if not href.startswith(('../../cam_01/','../../com_01/','../../eqp_02/')): continue
        rel=href.split('#')[0].removeprefix('../../')
        name='DAYZ_SURVIVAL_FUENTE_MAESTRA_v0.16.1/'+rel
        raw=originals.read(name)
        target=dest/'public'/'auxiliares'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        auxiliary[href]='/auxiliares/'+rel
    records=[]; manifest=[]
    for r in index:
        raw=z.read(base+r['file']); assert raw.strip(),r['id']
        digest=sha(raw)
        if r['status'] in branch_originals:
            branch=branch_originals[r['status']]
            assert any(branch.read(n)==raw for n in branch.namelist() if n==r['id']+'.md' or n.endswith('/'+r['id']+'.md')), 'Branch original differs: '+r['id']
        if r['status']=='aprobado_v0161':
            if r['id']+'.md' in expected: assert digest==expected[r['id']+'.md'],r['id']
            candidates=[n for n in originals.namelist() if n.endswith('/'+r['id']+'.md') and sha(originals.read(n))==digest]
            assert candidates, 'Historical original missing: '+r['id']
        body=re.sub(r'^<div class="entry-top">.*?</div>','',entries[r['id']],count=1,flags=re.S)
        p=Presentation(set(ids),r['id'],auxiliary);p.feed(body);rendered=''.join(p.out)
        # Resolve source fragment identifiers without changing visible text.
        old_headings=re.findall(r'<h[1-4]\b[^>]*id="([^"]+)"',body)
        mapping=dict(zip(old_headings,[h['id'] for h in p.outline]))
        for frag in re.findall(r'__LOCAL__([^"<>]+)',rendered):
            assert html.unescape(frag) in mapping, 'Broken local fragment: '+r['id']+' '+frag
            rendered=rendered.replace('__LOCAL__'+frag,'#'+mapping[html.unescape(frag)])
        assert text(rendered)==text(body), 'Presentation text changed'
        assert len([h for h in p.outline if h['level']==1])==1
        records.append({**r,'source_hash':digest,'html':rendered,'body_text':text(body),'outline':p.outline,'related_ids':sorted(p.refs-{r['id']}),'evidence':evidence[r['id']],'publication_status':'REVISION_PRIVADA_AUTORIZADA','verified_game_build':None,'illustration_status':'PENDIENTE'})
        manifest.append({'id':r['id'],'source_hash':digest,'source_bytes':len(raw),'rendered_text_hash':sha(text(body).encode()),'html_hash':sha(rendered.encode())})
        target=dest/'public'/'originales'/f"{r['id']}.md";target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
    assert sum(r['status']=='aprobado_v0161' for r in index)==84
    (dest/'catalog.json').write_text(json.dumps(records,ensure_ascii=False),encoding='utf-8')
    (dest/'illustrations-source.json').write_text(json.dumps(illustrations,ensure_ascii=False),encoding='utf-8')
    slots=[{'asset_id':r['ID'],'content_id':r['ID'],'purpose':r['Concepto'],'alt_draft':r['AltES'],'source_registry_state':r['Estado']} for r in illustrations]
    slots += [{'asset_id':'COVER','content_id':None,'purpose':'Portada editorial','alt_draft':None}]
    slots += [{'asset_id':'DIVIDER-'+family,'content_id':None,'purpose':'Separador de familia '+family,'alt_draft':None} for family in ('MAN','COM','EQP','CHR','MEC','GUI','ARC','LIV')]
    for slot in slots: slot.update({'asset_path':None,'provenance':None,'license':None,'rights_reviewed':False,'accessibility_reviewed':False,'approved_for_use':False})
    (dest/'public'/'ILLUSTRATIONS.json').write_text(json.dumps({'article_slots':308,'cover_slots':1,'divider_slots':8,'slots':slots},ensure_ascii=False,indent=2),encoding='utf-8')
    sources={key:sha(Path(getattr(args,key)).read_bytes()) for key in ('corpus','index','static','evidence','illustrations')}
    report={'contract':'WEB-005','count':308,'historical_ids':294,'livonia_ids':14,'historical_packages_reference':42,'derived_matrices_outside_slots':4,'originals_v0161_verified':84,'originals_chr_r02_verified':11,'original_liv_pilots_verified':4,'editorial_states':dict(Counter(r['status'] for r in records)),'source_hashes':sources,'articles':manifest,'certification_performed':False,'public_publication_authorized':False}
    (dest/'public'/'INTEGRITY.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('articles','source_hashes')}))

if __name__=='__main__':
    a=argparse.ArgumentParser()
    for name in ('corpus','index','static','evidence','illustrations','output'): a.add_argument('--'+name,required=True)
    a.add_argument('--corpus-sha256',default='4738c473c7da77a9e6d3ae47c1fbf0024ad5c35041e907dfcdaa1e1cfbad86bc',help='Expected checksum supplied separately by the owner delivery, not derived from the input')
    run(a.parse_args())
