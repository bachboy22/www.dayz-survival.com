"""Render only selected, traceable final assets. Reference concepts never enter HTML."""
import hashlib,html,json,re,struct
from pathlib import Path
IDS={'cover','man-01-01','chernarus','livonia'}
ORIGINS={'human-original','verified-game-capture','licensed-original'}

def validate(manifest,asset_root,require_final=False,allow_test_fixtures=False):
    if manifest.get('schema_version')!=1 or manifest.get('contract')!='ART-003':raise ValueError('Unsupported manifest')
    entries=manifest.get('assets',[])
    if len(entries)!=4 or {e.get('id') for e in entries}!=IDS:raise ValueError('Exactly four distinct ART-003 slots required')
    selected={};budget=0
    for e in entries:
        if type(e.get('final_selected')) is not bool:raise ValueError('Final selection must be an explicit boolean')
        if e.get('publication_authorized') is not False:raise ValueError('This preparation does not authorize public publication')
        if not e.get('final_selected'):
            if e.get('variants'):raise ValueError('Unselected concept cannot provide rendering variants')
            continue
        fixture=e.get('origin')=='synthetic-qa-fixture' and allow_test_fixtures
        if e.get('origin') not in ORIGINS and not fixture:raise ValueError('Concept or generative origin is not an approved final original under ART-001')
        for key in ('creator','source_ref','rights_ref','selection_ref','alt','caption'):
            if not isinstance(e.get(key),str) or not e[key].strip():raise ValueError('Missing provenance/accessibility: '+key)
        if e.get('origin')=='verified-game-capture' and (e.get('vanilla_pc') is not True or not all(e.get(k) for k in ('capture_build','capture_map','capture_date'))):raise ValueError('A game capture requires specific vanilla PC/map/build/date evidence')
        if e['map_scope']!=({'cover':'general','man-01-01':'Chernarus','chernarus':'Chernarus','livonia':'Livonia'}[e['id']]):raise ValueError('Map scope mismatch')
        if not e.get('variants'):raise ValueError('Selected asset requires local optimized files')
        checked=[]
        for v in e['variants']:
            relative=v.get('file','')
            if not re.fullmatch(r'[A-Za-z0-9_-]+\.(png|webp|avif)',relative):raise ValueError('Unsafe/local-only raster asset path')
            file=asset_root/relative
            if file.is_symlink() or file.resolve().parent!=asset_root.resolve():raise ValueError('Asset must stay inside asset root')
            data=file.read_bytes();digest=hashlib.sha256(data).hexdigest()
            if digest!=v.get('sha256'):raise ValueError('Original/derivative digest differs')
            if not isinstance(v.get('width'),int) or not isinstance(v.get('height'),int) or not 1<=v['width']<=4096 or not 1<=v['height']<=4096:raise ValueError('Explicit bounded dimensions required')
            suffix=file.suffix
            if suffix=='.png' and (not data.startswith(b'\x89PNG\r\n\x1a\n') or struct.unpack('>II',data[16:24])!=(v['width'],v['height'])):raise ValueError('PNG dimensions do not match bytes')
            if suffix=='.webp' and not (data[:4]==b'RIFF' and data[8:12]==b'WEBP'):raise ValueError('Invalid WebP signature')
            if suffix=='.avif' and not (data[4:8]==b'ftyp' and b'avif' in data[8:32]):raise ValueError('Invalid AVIF signature')
            if len(data)>450_000:raise ValueError('Variant exceeds 450 kB preparation budget; optimize before selection')
            budget+=len(data);checked.append({**v,'bytes':len(data),'mime':{'.png':'image/png','.webp':'image/webp','.avif':'image/avif'}[suffix]})
        selected[e['id']]={**e,'variants':checked}
    if budget>1_800_000:raise ValueError('Total derivative budget exceeds 1.8 MB')
    if 'chernarus' in selected and 'livonia' in selected and {v['sha256'] for v in selected['chernarus']['variants']} & {v['sha256'] for v in selected['livonia']['variants']}:raise ValueError('Atlas art must use distinct resources')
    if require_final and set(selected)!=IDS:raise ValueError('Final illustrated delivery requires all four selected originals; currently preparation only')
    return selected

def figure(slot,selected):
    if slot not in selected:return '<figure class="art003-media" data-art-slot="'+slot+'" hidden></figure>'
    e=selected[slot];bytype={}
    for v in e['variants']:bytype.setdefault(v['mime'],[]).append(v)
    sources=[]
    for mime in ('image/avif','image/webp'):
        variants=bytype.get(mime,[])
        if variants:sources.append('<source type="'+mime+'" srcset="'+', '.join('/media/art/'+v['file']+' '+str(v['width'])+'w' for v in sorted(variants,key=lambda v:v['width']))+'" sizes="(max-width: 800px) 100vw, 50vw">')
    fallback=min(e['variants'],key=lambda v:v['width']);url='/media/art/'+fallback['file']
    attributes=' loading="eager" fetchpriority="high"' if slot=='cover' else ' loading="lazy"'
    note=' Interpretación artística, no cartografía verificada.' if slot in ('chernarus','livonia') else ''
    return '<figure class="art003-media" data-art-slot="'+slot+'"><picture>'+''.join(sources)+'<img src="'+url+'" width="'+str(fallback['width'])+'" height="'+str(fallback['height'])+'" alt="'+html.escape(e['alt'],quote=True)+'" decoding="async"'+attributes+'></picture><figcaption>'+html.escape(e['caption'])+note+'</figcaption></figure>'
