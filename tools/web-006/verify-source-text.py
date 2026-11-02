"""Independent QA renderer; requires Markdown==3.10.2, not a site dependency."""
import hashlib,json,re,sys,zipfile
from html.parser import HTMLParser
from pathlib import Path
import markdown
assert markdown.__version__=='3.10.2'

class Text(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self,data):self.parts.append(data)

def text(source):
    parser=Text();parser.feed(source)
    # Comparison only: concatenate inline text correctly, collapse whitespace runs.
    # Neither Markdown nor delivered HTML is written or normalized by this tool.
    return ' '.join(''.join(parser.parts).split())

root,standalone,corpus=map(Path,sys.argv[1:4]);z=zipfile.ZipFile(corpus)
index=json.loads(z.read('entrega_integral/INDICE_EDITORIAL_308.json'))
payload=json.loads(re.search(r'<script type="application/json" id="offline-pages">(.*?)</script>',standalone.read_text(),re.S)[1])
records=[]
for entry in index:
    source=z.read('entrega_integral/'+entry['file']).decode('utf-8')
    expected=text(markdown.markdown(source,extensions=['extra','sane_lists','nl2br']))
    pages=[(root/'articulos'/entry['id']/'index.html').read_text(),payload['pages']['/articulos/'+entry['id']+'/']['main']]
    for variant,page in zip(('pages','standalone'),pages):
        actual=text(re.search(r'<div class="manuscript">(.*?)</div>',page,re.S)[1])
        assert actual==expected,entry['id']+' '+variant+' differs from canonical Markdown rendering'
    records.append({'id':entry['id'],'source_sha256':hashlib.sha256(source.encode()).hexdigest(),'independent_text_sha256':hashlib.sha256(expected.encode()).hexdigest(),'pages_equal':True,'standalone_equal':True})
assert len(records)==308
print(json.dumps({'renderer':'Python-Markdown 3.10.2 extra/sane_lists/nl2br','articles':308,'comparisons':616,'all_equal':True,'comparison_only_whitespace_collapse':True,'originals_modified':False,'records':records},indent=2))
