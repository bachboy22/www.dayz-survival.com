"""Reuse WEB-006 offline navigation with route-scoped model chrome and local fonts."""
import base64,json,re,sys
from pathlib import Path
root=Path(sys.argv[1]);out=Path(sys.argv[2]);assert not out.exists()
pages={};shells={}
for p in root.rglob('*.html'):
    rel=p.relative_to(root).as_posix();route='/'+rel.removesuffix('index.html') if rel.endswith('index.html') else '/'+rel
    s=p.read_text();model='body class="web007"' in s
    pages[route]={'title':re.search('<title>(.*?)</title>',s,re.S)[1],'main':re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1],'model':model}
    key='models' if model else 'legacy'
    if key not in shells:shells[key]={'header':re.search(r'<header\b.*?</header>',s,re.S)[0],'footer':re.search(r'<footer\b.*?</footer>',s,re.S)[0]}
files={'/'+p.relative_to(root).as_posix():base64.b64encode(p.read_bytes()).decode() for p in (root/'media/licenses').glob('*.txt')}
files['/INTEGRITY.json']=base64.b64encode((root/'INTEGRITY.json').read_bytes()).decode()
payload={'pages':pages,'files':files,'shells':shells,'index':json.loads((root/'search-index.json').read_text())}
home=re.sub(r'<script\b.*?</script>','',(root/'index.html').read_text(),flags=re.S)
def stylesheet(match):
    css=(root/re.search(r'href="([^"]+)"',match[0])[1].lstrip('/')).read_text()
    css=re.sub(r'url\([\'"](/media/fonts/[^\'\"]+)[\'"]\)',lambda m:'url("data:font/woff2;base64,'+base64.b64encode((root/m[1].lstrip('/')).read_bytes()).decode()+'")',css)
    return '<style>'+css+'</style>'
home=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>',stylesheet,home)
bridge=Path('tools/web-005/portable.mjs').read_text().replace('WEB-005','WEB-007')
needle="const record=data.pages[pathname]??data.pages['/404.html'];main.innerHTML=record.main;"
assert needle in bridge
bridge=bridge.replace(needle,"const record=data.pages[pathname]??data.pages['/404.html'];const shell=data.shells[record.model?'models':'legacy'];document.body.classList.toggle('web007',!!record.model);document.querySelector('header').outerHTML=shell.header;document.querySelector('footer').outerHTML=shell.footer;main.innerHTML=record.main;")
bridge=bridge.replace("if(target.id==='text-larger'||target.id==='text-smaller'){","if((target.id==='text-larger'||target.id==='text-smaller')&&!document.body.classList.contains('web007')){")
bridge=bridge.replace('main.focus();window.scrollTo(0,0);','window.initWeb007?.();main.focus();window.scrollTo(0,0);')
encoded=json.dumps(payload,ensure_ascii=False).replace('<','\\u003c')
home=home.replace('</body>','<script type="application/json" id="offline-pages">'+encoded+'</script><script>'+Path('tools/web-007/models.js').read_text()+'</script><script>'+bridge+'</script></body>')
out.write_text(home)
print(json.dumps({'pages':len(pages),'articles':sum(k.startswith('/articulos/') for k in pages),'bytes':out.stat().st_size,'fonts_embedded':True,'model_scope':'home + MAN-01-01 + secondary document/license utilities'}))
