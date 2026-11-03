"""Extend the existing offline packager, preserving navigation and reading controls."""
import base64,json,re,subprocess,sys
from pathlib import Path
root=Path(sys.argv[1]);out=Path(sys.argv[2]);assert not out.exists()
subprocess.run([sys.executable,'tools/web-007/build-standalone.py',str(root),str(out)],check=True)
s=out.read_text()
# Add only local selected raster files; originals and reference concepts stay outside.
for p in (root/'media/art').glob('*'):
    if not p.is_file():continue
    uri='data:'+{'.png':'image/png','.webp':'image/webp','.avif':'image/avif'}[p.suffix]+';base64,'+base64.b64encode(p.read_bytes()).decode()
    # JSON text URLs in all stored pages and normal HTML attributes use the same prefix.
    s=s.replace('/media/art/'+p.name,uri)
needle='<script>// Offline bridge';assert needle in s
prefix,bridge=s.split(needle,1)
bridge=bridge.replace('window.initWeb007?.();','window.initWeb007?.();window.initArt003?.();')
ambient=Path('tools/art-003/ambient.js').read_text()
out.write_text(prefix+'<script>'+ambient+'</script>'+needle+bridge)
print(json.dumps({'contract':'ART-003','offline_bytes':out.stat().st_size,'embedded_selected_images':len(list((root/'media/art').glob('*')))}))
