"""Reuse WEB-005's offline renderer; version only its UI feedback exporter."""
import json,re,subprocess,sys
from pathlib import Path
source=Path(sys.argv[1]);output=Path(sys.argv[2]);assert not output.exists()
subprocess.run([sys.executable,str(Path(__file__).parents[1]/'web-005/build-portable.py'),str(source),str(output)],check=True)
s=output.read_text();needle='<script>// Offline bridge'
assert needle in s
prefix,bridge=s.split(needle,1)
# The corpus JSON precedes this marker and is never replaced or normalized.
output.write_text(prefix+needle+bridge.replace('WEB-005','WEB-006'))
print(json.dumps({'version':'WEB-006','bytes':output.stat().st_size}))
