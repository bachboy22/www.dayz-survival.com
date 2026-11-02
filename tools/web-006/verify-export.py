import hashlib,html,json,re,sys,zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote,urlsplit
sys.path.insert(0,str(Path(__file__).parents[1]/'web-005'))
from importlib import import_module
visible=import_module('import-corpus').text

class Links(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.ids=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        for key in ('href','src','action'):
            if a.get(key):self.refs.append((tag,key,a[key]))

root=Path(sys.argv[1]);standalone=Path(sys.argv[2]);corpus=Path(sys.argv[3]);report=json.loads((root/'INTEGRITY.json').read_text())
assert hashlib.sha256(corpus.read_bytes()).hexdigest()==report['corpus_archive_sha256']
z=zipfile.ZipFile(corpus);source_index=json.loads(z.read('entrega_integral/INDICE_EDITORIAL_308.json'));assert len(source_index)==308
byid={r['id']:r for r in source_index};assert set(byid)=={r['id'] for r in report['articles']}
payload=json.loads(re.search(r'<script type="application/json" id="offline-pages">(.*?)</script>',standalone.read_text(),re.S)[1]);assert len([p for p in payload['pages'] if p.startswith('/articulos/')])==308
text_hashes=0
for r in report['articles']:
    raw=z.read('entrega_integral/'+byid[r['id']]['file']);assert hashlib.sha256(raw).hexdigest()==r['source_hash']
    for s in [(root/'articulos'/r['id']/'index.html').read_text(),payload['pages']['/articulos/'+r['id']+'/']['main']]:
        body=re.search(r'<div class="manuscript">(.*?)</div>',s,re.S)[1]
        assert hashlib.sha256(visible(body).encode()).hexdigest()==r['rendered_text_hash'],r['id']
        text_hashes+=1
    assert r['editorial_status_origin']==byid[r['id']]['status']
    assert r['technical_status']=='PENDIENTE_DE_REVISION_ATOMICA' and not r['public_publication_authorized']
assert (root/'index.html').is_file() and (root/'404.html').is_file()
assert len(list((root/'articulos').glob('*/index.html')))==308
documents={p:Links() for p in root.rglob('*.html')}
for p,doc in documents.items():doc.feed(p.read_text());assert len(doc.ids)==len(set(doc.ids)),str(p)
checked=0;external=[];broken=[]
for p,doc in documents.items():
    for tag,key,ref in doc.refs:
        u=urlsplit(html.unescape(ref))
        if u.scheme or ref.startswith('//'):
            assert tag=='a' and u.scheme in ('https','http'),(p,tag,key)
            external.append(ref);continue
        target=root/unquote(u.path).lstrip('/') if u.path.startswith('/') else (p.parent/unquote(u.path) if u.path else p)
        if target.is_dir():target=target/'index.html'
        if not target.is_file():broken.append((str(p.relative_to(root)),ref));continue
        if u.fragment and target.suffix=='.html' and unquote(u.fragment) not in documents[target].ids:broken.append((str(p.relative_to(root)),ref))
        checked+=1
for p in root.rglob('*.css'):
    for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)',p.read_text()):
        assert not re.match(r'https?:|//',ref)
        if ref.startswith('data:'):continue
        target=root/ref.lstrip('/') if ref.startswith('/') else p.parent/ref
        assert target.is_file(),(p,ref)
assert not broken,broken[:10]
files=[p for p in root.rglob('*') if p.is_file()]
for p in files:
    assert p.suffix in ('.html','.css','.js','.json','.svg','.woff2','.txt'),str(p)
    assert not any(part in ('node_modules','runtime','.git','originales','auxiliares','functions','src') for part in p.relative_to(root).parts)
    assert p.name not in ('package.json','package-lock.json','_worker.js','wrangler.json','wrangler.toml')
patterns={'private_key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----','access_token':r'\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})\b','email':r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}','private_path':r'/workspace/|/home/agent/|C:\\\\Users\\\\','international_phone':r'(?<!\w)\+\d{1,3}[ -](?:\d[ -]?){8,12}\b','dni':r'\b\d{8}[A-HJ-NP-TV-Z]\b','iban':r'\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b'}
scan={key:sum(bool(re.search(pattern,p.read_text())) for p in files if p.suffix in ('.html','.css','.js','.json','.txt')) for key,pattern in patterns.items()}
assert all(n==0 for n in scan.values()),scan
assert len(files)<1000 and max(p.stat().st_size for p in files)<25*1024*1024
print(json.dumps({'article_pages':308,'unique_ids':len(byid),'source_hashes_compared':308,'rendered_text_hashes_compared':text_hashes,'internal_links_and_resources':checked,'broken':len(broken),'files':len(files),'html_pages':len(documents),'external_hyperlinks_not_dependencies':len(set(external)),'largest_asset_bytes':max(p.stat().st_size for p in files),'scan_pattern_matches':scan,'no_runtime_or_source':True,'headers_and_redirects_omitted':True},indent=2))
