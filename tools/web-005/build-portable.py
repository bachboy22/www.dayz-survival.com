import base64,json,re,sys
from pathlib import Path
root=Path(sys.argv[1]);out=Path(sys.argv[2]);assert not out.exists()
pages={}
for file in root.rglob('*.html'):
    rel=file.relative_to(root).as_posix();route='/'+rel.removesuffix('index.html') if rel.endswith('index.html') else '/'+rel
    s=file.read_text();pages[route]={'title':re.search(r'<title>(.*?)</title>',s,re.S)[1],'main':re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1]}
files={'/'+p.relative_to(root).as_posix():base64.b64encode(p.read_bytes()).decode() for directory in ('originales','auxiliares') for p in (root/directory).rglob('*') if p.is_file()}
files['/INTEGRITY.json']=base64.b64encode((root/'INTEGRITY.json').read_bytes()).decode()
payload={'pages':pages,'files':files,'index':json.loads((root/'search-index.json').read_text())}
home=(root/'index.html').read_text();home=re.sub(r'<script\b.*?</script>','',home,flags=re.S)
home=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>',lambda m:'<style>'+ (root/re.search(r'href="([^"]+)"',m[0])[1].lstrip('/')).read_text()+'</style>',home)
encoded=json.dumps(payload,ensure_ascii=False).replace('<','\\u003c')
bridge=Path('tools/web-005/portable.mjs').read_text()
home=home.replace('</body>','<script type="application/json" id="offline-pages">'+encoded+'</script><script>'+bridge+'</script></body>')
out.write_text(home,encoding='utf-8');print(json.dumps({'offline_pages':len(pages),'articles':sum(k.startswith('/articulos/') for k in pages),'bytes':out.stat().st_size}))
