"""Check every article, original byte hash, visible body and internal link offline."""
import hashlib,json,re,sys
from pathlib import Path
from urllib.parse import unquote,urlsplit
sys.path.insert(0,str(Path(__file__).parent))
from importlib import import_module
text=import_module('import-corpus').text

root=Path(sys.argv[1]);report=json.loads((root/'INTEGRITY.json').read_text());assert report['count']==308
checks=0;broken=[]
for row in report['articles']:
    raw=(root/'originales'/f"{row['id']}.md").read_bytes();assert hashlib.sha256(raw).hexdigest()==row['source_hash']
    page=(root/'articulos'/row['id']/'index.html').read_text()
    body=re.search(r'<div class="manuscript">(.*?)</div>',page,re.S).group(1)
    assert hashlib.sha256(text(body).encode()).hexdigest()==row['rendered_text_hash'],row['id']
    assert len(re.findall('<h1(?: |>)',page))==1,row['id']
    checks+=1
links=0
for path in root.rglob('*.html'):
    s=path.read_text()
    for href in re.findall(r'href="([^"]+)"',s):
        parsed=urlsplit(href)
        if parsed.scheme or href.startswith('//'): continue
        target=(root/unquote(parsed.path).lstrip('/')) if parsed.path else path
        if target.is_dir(): target=target/'index.html'
        if not target.is_file(): broken.append((str(path.relative_to(root)),href));continue
        if parsed.fragment and target.suffix=='.html' and not re.search(r'id="'+re.escape(unquote(parsed.fragment))+'"',target.read_text()):broken.append((str(path.relative_to(root)),href))
        links+=1
assert not broken,broken[:20]
assert len(list((root/'articulos').glob('*/index.html')))==308
print(json.dumps({'articles_complete':checks,'source_hashes_verified':checks,'historical_originals_verified':report['originals_v0161_verified'],'internal_links_checked':links,'broken_links':len(broken)}))
