from pathlib import Path
import json, hashlib, shutil, zipfile, html, datetime, struct, re, argparse, subprocess
from zoneinfo import ZoneInfo

parser = argparse.ArgumentParser(description='Package the exact DESIGN-001-B build for offline Windows review; never edits source or WEB-004.')
parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parents[2])
parser.add_argument('--dest', type=Path, required=True)
parser.add_argument('--runtime-dir', type=Path, required=True)
args = parser.parse_args()
SOURCE = args.source.resolve()
BUILDER = Path(__file__).resolve().parent
DEST = args.dest.resolve()
DOWNLOAD = args.runtime_dir.resolve()
SHA = '6091b56667b9042c3da72e42fd1dc7e206b56b8f'
# Freeze all application inputs, allowing only audit docs/tooling on the audit branch.
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',SHA], cwd=SOURCE, text=True).splitlines():
    if name.startswith(('src/', 'public/', 'scripts/')) or name in {'astro.config.mjs','package.json','package-lock.json'}:
        assert (SOURCE/name).read_bytes() == subprocess.check_output(['git','show',SHA+':'+name],cwd=SOURCE), name
if DEST.exists():
    raise SystemExit('Destination already exists. Choose a new folder; no existing package is overwritten.')

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def write(relative, contents):
    target = DEST / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(contents, encoding='utf-8')
def esc(value): return html.escape(str(value), quote=True)

DEST.mkdir(parents=True, exist_ok=True)
shutil.copytree(SOURCE/'dist', DEST/'sitio', dirs_exist_ok=True)
shutil.copytree(SOURCE/'artifacts/screenshots', DEST/'evidencia/capturas-base')
shutil.copytree(SOURCE/'artifacts/design-001-b', DEST/'evidencia/responsive')
(DEST/'evidencia/capturas-zoom').mkdir(parents=True, exist_ok=True)
(DEST/'evidencia/metricas').mkdir(parents=True, exist_ok=True)
for file in (SOURCE/'artifacts/zoom').iterdir():
    if file.suffix == '.png': shutil.copy2(file, DEST/'evidencia/capturas-zoom'/file.name)
    elif file.suffix == '.json': shutil.copy2(file, DEST/'evidencia/metricas'/file.name)
for name in ['server.cjs','revision.js','review.css']:
    folder = 'servidor' if name == 'server.cjs' else 'revision'
    (DEST/folder).mkdir(exist_ok=True)
    shutil.copy2(BUILDER/name, DEST/folder/name)

archive = DOWNLOAD/'node-v24.19.0-win-x64.zip'
archive_hash = digest(archive)
expected_archive_hash = '57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73'
assert archive_hash == expected_archive_hash, 'Pinned runtime hash mismatch'
assert any(line.split() == [archive_hash, 'node-v24.19.0-win-x64.zip'] for line in (DOWNLOAD/'SHASUMS256.txt').read_text().splitlines()), 'Official checksum mismatch'
with zipfile.ZipFile(archive) as z:
    for name in ['node.exe','LICENSE','README.md']:
        target=DEST/'runtime'/name;target.parent.mkdir(exist_ok=True)
        target.write_bytes(z.read('node-v24.19.0-win-x64/'+name))
nodebytes=(DEST/'runtime/node.exe').read_bytes()
pe=struct.unpack_from('<I', nodebytes, 0x3c)[0]
assert nodebytes[:2] == b'MZ' and nodebytes[pe:pe+4] == b'PE\x00\x00'
assert struct.unpack_from('<H', nodebytes, pe+4)[0] == 0x8664
provenance=dict(version='v24.19.0', platform='win-x64', official_archive_url='https://nodejs.org/dist/v24.19.0/node-v24.19.0-win-x64.zip', official_checksums_url='https://nodejs.org/dist/v24.19.0/SHASUMS256.txt', archive_sha256=archive_hash, archive_bytes=archive.stat().st_size, official_sha256_matches=True, provenance_note='Cached official archive rechecked against freshly fetched official checksums; Authenticode NOT checked; Windows EXE NOT executed.')
provenance.update(binary_sha256=digest(DEST/'runtime/node.exe'), binary_bytes=len(nodebytes), binary_format='PE32+ AMD64', license='Node.js MIT and bundled third-party notices; unmodified LICENSE included', license_sha256=digest(DEST/'runtime/LICENSE'), official_binary_executed_here=False)
shutil.copy2(DOWNLOAD/'SHASUMS256.txt',DEST/'runtime/SHASUMS256-OFICIAL.txt')
write('runtime/PROCEDENCIA.json',json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')

for mode,name,title in [('', 'ABRIR_REVISION.cmd','DAYZ-SURVIVAL DESIGN-001-D - DEMO LOCAL'),('--stop','CERRAR_REVISION.cmd','Cerrar DAYZ-SURVIVAL DESIGN-001-D'),('--verify','VERIFICAR_ARCHIVOS.cmd','Verificar DAYZ-SURVIVAL DESIGN-001-D')]:
    command='@echo off\r\nsetlocal\r\ntitle '+title+'\r\ncd /d "%~dp0"\r\nif not exist "%~dp0runtime\\node.exe" (\r\n  echo Extraiga todo el ZIP antes de abrir la revision.\r\n  pause\r\n  exit /b 1\r\n)\r\n"%~dp0runtime\\node.exe" "%~dp0servidor\\server.cjs" '+mode+'\r\nset "DESIGN001D_RESULT=%ERRORLEVEL%"\r\n'
    command+=('pause\r\n' if mode else 'if not "%DESIGN001D_RESULT%"=="0" pause\r\n')
    command+='exit /b %DESIGN001D_RESULT%\r\n'
    (DEST/name).write_bytes(command.encode('ascii'))

protocol=(SOURCE/'docs/WEB-003-ACCESSIBILITY.md').read_text()
manual=[]
for line in protocol.splitlines():
    if re.match(r'^\| M\d{2} ·',line):
        columns=[value.strip() for value in line.split('|')[1:-1]]
        identity,title=columns[0].split(' · ',1)
        manual.append(dict(id=identity,title=title,steps=columns[1],expected=columns[2]))
assert len(manual)==12 and [x['id'] for x in manual]==['M'+str(x).zfill(2) for x in range(1,13)]
manual[6]['steps'] = 'En /buscar/, escribe «cuaderno» y escucha un resultado; cambia a «interfaz» y espera tres. Confirma que consulta y contador se anuncian sin mover el foco.'
manual[6]['expected'] = 'Consulta anunciada con 1 y 3 resultados reales; campo mantiene el foco. No se simula lector de pantalla con axe.'
manual[7]['steps'] = 'Con «interfaz», selecciona ámbito Livonia y nivel Consulta para obtener vacío. Limpia búsqueda y filtros; cambia vista a ficha rápida y vuelve a filtrar. Recarga la URL.'
manual[7]['expected'] = 'Selectores nombrados y valores anunciados, vacío sin enlaces ocultos tabulables, limpieza conserva foco, URL recupera filtros.'
manual.extend([
 dict(id='M13',title='Estados independientes',steps='En cada lectura, recorre Editorial, Evidencia técnica, Publicación y Versión/procedencia.',expected='Se distinguen los tres ejes, DEMO sin aprobación real, ninguna build evaluada y sin permiso de producción; no hay verificación 1.30 inferida.'),
 dict(id='M14',title='Atlas independiente',steps='Abre Atlas, elige Chernarus Plus y luego Livonia; revisa avisos y vuelve al índice.',expected='Ámbitos y enlaces comprensibles; sin mapa operativo ni datos geográficos inventados; no confundir aprobación CHR con publicación.'),
 dict(id='M15',title='Hoja y exportación',steps='En esta hoja, abre un caso, escribe una incidencia y descarga JSON/TXT. Reimporta el JSON en otra apertura.',expected='Controles nombrados y foco usable; datos fieles y texto importado no ejecutable; ninguna aprobación automática.'),
 dict(id='M16',title='Nuevas áreas y contexto',steps='Recorre Aprender y Herramientas por encabezados y enlaces; regresa al Manual.',expected='Rutas y glosario son de interfaz DEMO, no recomendaciones de juego; el orden resulta comprensible al escucharlo.'),
])
manual_protocol = '# DESIGN-001-D · Protocolo humano independiente\n\nEstado: NO EJECUTADO en Windows por Codex. Completar por separado NVDA/Firefox y Narrador/Edge, sin activar ambos lectores a la vez. Registrar operador, fecha, versiones, idioma, escala Windows, tamaño de ventana y zoom. El SHA auditado es '+SHA+'.\n\n1. Extraer todo y ejecutar ABRIR_REVISION.cmd. Abrir la URL 127.0.0.1 que muestre la consola.\n2. Ctrl+0; probar solo teclado con Tab/Mayús+Tab, Enter/Espacio y Escape. NVDA+Espacio o Narrador+Espacio cambian navegación/foco según configuración. Anotar lo realmente escuchado.\n3. Seleccionar explícitamente 200% y 400% desde el menú del navegador; anotar el porcentaje. Probar lector con A+ y filtros; restablecer con Ctrl+0. El pinch o una ventana estrecha no equivalen a zoom de navegador.\n4. No registrar como Correcto un caso no ejecutado. Una prueba de accesibilidad automática no acredita experiencia con AT.\n\n'
for item in manual:
    manual_protocol += '## '+item['id']+' · '+item['title']+'\n\nPasos: '+item['steps']+'\n\nEsperado: '+item['expected']+'\n\nNVDA/Firefox: No probado. Narrador/Edge: No probado. Registrar resultado, palabras escuchadas, incidencias, URL y capturas por combinación.\n\n'
write('revision/PROTOCOLO_WINDOWS.md',manual_protocol)
shutil.copy2(SOURCE/'docs/ART-001-VISUAL-POLICY.md',DEST/'revision/ART-001-VISUAL-POLICY.md')
general=[
 dict(id='G01',title='Seis áreas y teclado',steps='Recorre Inicio, Aprender, Manual, Atlas, Herramientas y Acerca; prueba menú reducido, Tab/Mayús+Tab, Enter/Espacio y Escape.',expected='Orden coherente, foco visible, enlaces completos y regreso posible; no depende del ratón.'),
 dict(id='G02',title='Lectura extensa y ficha rápida',steps='Abre los tres DEMO, usa índice, cambia a ficha individual y vuelve a lectura extensa. Prueba A−/A+ en ambos límites.',expected='Se distinguen consulta breve y extensa; referencias y foco llegan al destino; 100–135% anunciado y alcanzable.'),
 dict(id='G03',title='Búsqueda múltiple y filtros',steps='Busca «interfaz»: tres resultados. Selecciona Livonia: uno. Selecciona nivel Consulta: vacío. Limpia filtros. Cambia vista a ficha rápida; recarga URL.',expected='Contador real, filtros combinados, vacío y limpieza sin robo de foco; enlaces corresponden a la vista.'),
 dict(id='G04',title='Tres estados y evidencia',steps='Lee Editorial, Evidencia técnica, Publicación y panel de versión.',expected='Todos los artículos son DEMO; ninguna build evaluada. Aprobación editorial, técnico y permiso de publicación son independientes.'),
 dict(id='G05',title='Atlas, CHR y LIV',steps='Entra en Atlas y abre cada ámbito. Busca avisos de derechos y límites.',expected='No hay cartografía operativa ni localidades inventadas. CHR r02 no publicado; LIV independiente y sin ocupar plazas históricas.'),
 dict(id='G06',title='Aprender y Herramientas',steps='Recorre ambas áreas, glosario, preguntas y notas de matrices.',expected='Todo describe la interfaz. No parece un curso de DayZ ni una calculadora con datos no verificados.'),
 dict(id='Z200',title='Zoom real 200%',steps='Selecciona 200% en el menú del navegador y registra ese valor. Recorre lector con A+, ficha, búsqueda/filtros y esta hoja.',expected='Sin pérdida de funcionalidad, recortes o superposiciones; foco y controles alcanzables.'),
 dict(id='Z400',title='Zoom real 400%',steps='Selecciona 400%, repite recorrido y exportación; restablece Ctrl+0.',expected='Reflow vertical usable y sin scroll horizontal del documento; no confundir con pinch.'),
 dict(id='G07',title='Responsive y legibilidad',steps='Prueba ventana estrecha, tablet si está disponible y escritorio; registra dispositivo real o emulado, ancho y resolución.',expected='Textos secundarios legibles, controles cómodos, coherencia bosque/papel; no atribuir prueba física a una emulación.'),
 dict(id='G08',title='Consistencia y arte',steps='Evalúa etiquetas, títulos, jerarquía, lectura, avisos y cualquier esquema.',expected='Sin imágenes finales IA ni mapas inventados. Esquema heredado conceptual explícito, nunca una cartografía verificable.'),
 dict(id='G09',title='Privacidad y exportación',steps='Escribe una incidencia con URL, pasos, esperado/observado, gravedad y captura. Exporta JSON/TXT, importa el JSON en otra sesión.',expected='Datos fieles y locales, sin envío ni aprobación automática; no añadir contraseñas o información privada innecesaria.'),
 dict(id='G10',title='Arranque, cierre y recuperación',steps='Abre dos veces; exporta antes de cerrar con CERRAR_REVISION.cmd. Comprueba que la URL deja de responder y vuelve a abrir.',expected='No hay instalación, servicio público o procesos propios huérfanos. Un bloqueo del sistema debe registrarse sin desactivar protecciones.'),
]

environment=[
 dict(id='operator',label='Persona revisora',group='general'),dict(id='date',label='Fecha de revisión',group='general',type='date'),
 dict(id='windows',label='Windows y versión/build',group='general'),dict(id='browser',label='Navegador principal y versión',group='general'),
 dict(id='screen',label='Resolución, escala de Windows y tamaño de ventana',group='general'),dict(id='device',label='Dispositivo real o emulado / ventana estrecha',group='general'),
 dict(id='evidenceFiles',label='Nombres de capturas o referencias de evidencia (no se adjuntan aquí)',group='general'),
 dict(id='nvdaOperator',label='Operador de NVDA + Firefox',group='nvda'),dict(id='nvdaDate',label='Fecha de prueba NVDA + Firefox',group='nvda',type='date'),
 dict(id='nvdaWindows',label='Windows/build y escala usados con NVDA',group='nvda'),dict(id='nvdaVersion',label='Versión y configuración de NVDA',group='nvda'),dict(id='firefoxVersion',label='Versión de Firefox',group='nvda'),
 dict(id='narradorOperator',label='Operador de Narrador + Edge',group='narrador'),dict(id='narradorDate',label='Fecha de prueba Narrador + Edge',group='narrador',type='date'),
 dict(id='narradorWindows',label='Windows/build y escala usados con Narrador',group='narrador'),dict(id='narradorVersion',label='Versión y configuración de Narrador',group='narrador'),dict(id='edgeVersion',label='Versión de Edge',group='narrador'),
]
config=dict(reviewRevision='DESIGN001D-R1',sourceSha=SHA,general=general,manual=manual,environment=environment)
def fields(group):
    return '<div class="grid">'+''.join('<div><label for="'+field['id']+'">'+esc(field['label'])+'</label><input id="'+field['id']+'" name="'+field['id']+'" type="'+field.get('type','text')+'" maxlength="2000"></div>' for field in environment if field['group']==group)+'</div>'
def case(item,prefix=''):
    identity=prefix+item['id']
    return '<fieldset><legend>'+esc(item['id']+' · '+item['title'])+'</legend><p><strong>Pasos:</strong> '+esc(item['steps'])+'</p><p><strong>Esperado:</strong> '+esc(item['expected'])+'</p><label for="'+identity+'-result">Resultado · '+esc(identity)+'</label><select id="'+identity+'-result" name="'+identity+'-result"><option>No probado</option><option>Correcto</option><option>Incidencia</option></select><label for="'+identity+'-notes">Observaciones, palabras realmente escuchadas y evidencia · '+esc(identity)+'</label><textarea id="'+identity+'-notes" name="'+identity+'-notes" maxlength="20000"></textarea></fieldset>'
def page(title,body,scripts=''):
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+esc(title)+' · DAYZ DESIGN-001-D</title><link rel="stylesheet" href="'+('review.css' if title=='Hoja de evaluación' else 'revision/review.css')+'"></head><body><a class="skip" href="#contenido">Saltar al contenido</a><header><p class="banner">DAYZ-SURVIVAL · DEMO LOCAL, SIN CONTENIDO EDITORIAL REAL</p><h1>'+esc(title)+'</h1><p>Paquete DESIGN-001-D · prototipo del PR #6, sin fusión ni despliegue. Fuente: <code>'+SHA+'</code>.</p></header><main id="contenido" tabindex="-1">'+body+'</main><footer><p>Sin telemetría ni envío de resultados. La aprobación final pertenece al revisor. CHR r02 no está certificada para 1.30.164078 ni autorizada para publicación.</p></footer>'+scripts+'</body></html>'

body='''<nav class="nav-links" aria-label="Recursos de revisión"><a href="/" target="_blank" rel="noopener" data-http-only>Abrir la web real de demostración (nueva pestaña)</a><a href="../INSTRUCCIONES_WINDOWS.html">Instrucciones</a><a href="PROTOCOLO_WINDOWS.md">Protocolo Windows M01–M16</a></nav><p class="notice">Esta hoja funciona sin Internet. Todos los casos empiezan en <strong>No probado</strong>. NVDA + Firefox y Narrador + Edge no han sido ejecutados por Codex en Windows. Marca solo lo que hayas comprobado; no se aprobará nada automáticamente.</p><noscript><p>Activa JavaScript para rellenar, guardar e importar/exportar esta hoja. Las instrucciones y el protocolo permanecen disponibles.</p></noscript><form id="review-form"><h2>1. Entorno y evidencia</h2>'''+fields('general')+'<h2>2. Experiencia, zoom y dirección visual actual</h2>'+''.join(case(item) for item in general)
for lane,title in [('nvda','NVDA + Firefox'),('narrador','Narrador + Edge')]:
    body+='<h2>'+('3' if lane=='nvda' else '4')+'. '+title+'</h2><p class="notice">Pendiente hasta que se pruebe realmente en Windows. Registra versiones, operador, fecha y lo que escuches. Usa una combinación de lector y navegador cada vez.</p>'+fields(lane)
    for item in manual:body+='<details><summary>'+esc(item['id']+' · '+item['title'])+'</summary>'+case(item,lane+'-')+'</details>'
body+='''<h2>5. Conclusiones del revisor</h2><label for="blockers">Problemas bloqueantes</label><textarea id="blockers" name="blockers" maxlength="20000"></textarea><label for="improvements">Mejoras no bloqueantes</label><textarea id="improvements" name="improvements" maxlength="20000"></textarea><label for="recommendation">Recomendación (elige tú; no se deduce de los resultados)</label><select id="recommendation" name="recommendation"><option>No evaluada</option><option>No aprobar todavía</option><option>Aprobar con ajustes</option><option>Aprobar interfaz</option></select><label for="conclusions">Conclusión y alcance de tu revisión</label><textarea id="conclusions" name="conclusions" maxlength="20000"></textarea></form><h2>6. Conservar y devolver la revisión</h2><p>Descarga JSON para conservar todos los campos y poder recuperarlos en otra apertura. TXT sirve para leer y compartir las conclusiones. Devuelve tú los archivos; esta hoja no los envía.</p><div class="actions"><button id="export-json" type="button">Descargar JSON</button><button id="export-txt" type="button">Descargar TXT</button><button id="save-draft" type="button" class="secondary">Guardar borrador en este navegador</button><button id="load-draft" type="button" class="secondary">Recuperar borrador</button></div><p class="hint">El borrador depende del navegador y del puerto de esta sesión. Para otra apertura, usa el JSON descargado.</p><label for="import-json">Importar un JSON exportado de este mismo paquete (máximo 4 MB; lectura local)</label><input id="import-json" type="file" accept="application/json,.json"><div class="actions"><button id="reset-review" type="button" class="secondary">Vaciar hoja</button></div><p id="review-status" role="status" aria-live="polite" aria-atomic="true">Ninguna evaluación humana aprobada automáticamente.</p><h2>Capturas y cierre</h2><p>En Windows, usa Win+Mayús+S para una captura consciente. Guarda el archivo y anota su nombre en el caso correspondiente. No se graba audio ni se adjuntan imágenes en secreto. Devuelve las capturas junto al TXT/JSON si lo deseas.</p><p>Exporta antes de cerrar. Para terminar el servicio, ejecuta CERRAR_REVISION.cmd o pulsa Ctrl+C en la ventana DEMO LOCAL. Cerrar una pestaña del navegador no cierra el servidor.</p>'''
scripts='<script id="review-config" type="application/json">'+json.dumps(config,ensure_ascii=False).replace('<','\\u003c')+'</script><script src="revision.js" defer></script>'
write('revision/REVISION_MANUAL.html',page('Hoja de evaluación',body,scripts))

guide='''<p class="lead">Copia local independiente del prototipo DESIGN-001-B, PR #6, commit 6091b56. Contiene tres ejemplos sintéticos y ninguna integración editorial. WEB-004 permanece intacto.</p><h2>Abrir en Windows 10/11 x64</h2><ol class="steps"><li>Usa <strong>Extraer todo</strong>; abre la carpeta DESIGN-001-D. No ejecutar dentro del visor del ZIP.</li><li>Doble clic en <strong>ABRIR_REVISION.cmd</strong>. Comprueba hashes y abre consola/navegador. Si no aparece el navegador, copia la URL 127.0.0.1 indicada.</li><li>Mantén la consola abierta y revisa el prototipo y la hoja independiente.</li><li>Descarga JSON/TXT antes de cerrar; conserva capturas voluntarias y sus nombres.</li><li>Cierra con <strong>CERRAR_REVISION.cmd</strong> o Ctrl+C en la consola.</li></ol><p>Runtime portable oficial Node v24.19.0 incluido con licencia y procedencia. No requiere instalar Node/npm/Python/Git, administrador o PowerShell. Si Windows bloquea un archivo, registra el mensaje; no se pide desactivar antivirus, SmartScreen, cortafuegos o políticas.</p><div class="actions"><a class="button" href="/" target="_blank" rel="noopener" data-http-only>Abrir prototipo DEMO (nueva pestaña)</a><a class="button" href="revision/REVISION_MANUAL.html">Abrir hoja de evaluación</a></div><p id="file-note" class="notice" hidden>Guía abierta como archivo. Ejecuta ABRIR_REVISION.cmd para navegar el sitio por HTTP local; sitio/index.html no conserva rutas y módulos. La hoja permite exportar JSON/TXT también como archivo.</p><h2>Qué evaluar</h2><ul><li>Las seis áreas, búsqueda múltiple/filtros, tres lecturas y fichas, referencias y estados independientes.</li><li>Teclado, foco, menú, índice y avisos. M01–M16 por separado con NVDA/Firefox y Narrador/Edge.</li><li>Zoom real de navegador 200% y 400%, A+ del lector, ventana estrecha y legibilidad.</li><li>Atlas por mapa sin cartografía georreferenciada ni datos inventados; aprobación CHR no implica publicación.</li></ul><h2>Evidencia y límites</h2><p>La auditoría automatizada usa Linux/Chromium; no acredita Windows real, doble clic CMD, ejecución de node.exe, NVDA, Narrador o móvil físico. La aprobación definitiva queda pendiente de tu revisión. El build de este paquete es exactamente el del commit 6091b56, sin ampliar su catálogo. La carga de rendimiento se mide en copias temporales independientes con datos sintéticos.</p><nav class="nav-links" aria-label="Documentación"><a href="DESIGN-001-D-REPORT.md">Informe priorizado y matriz</a><a href="revision/PROTOCOLO_WINDOWS.md">Protocolo humano completo</a><a href="revision/ART-001-VISUAL-POLICY.md">Norma ART-001</a><a href="MANIFEST.json">Procedencia y manifest</a><a href="SHA256SUMS.txt">Hashes</a></nav><h2>Comentarios privados y cierre</h2><p>No hay cuentas, analítica, telemetría, subida de comentarios ni capturas ocultas. La hoja no aprueba nada automáticamente. El borrador opcional depende de navegador y puerto; exporta JSON para otra sesión. Devuelve los archivos tú mismo, por el medio que decidas. Evita escribir credenciales o datos personales innecesarios.</p><p>VERIFICAR_ARCHIVOS.cmd repite la comprobación de integridad. SESION_DESIGN001D.json es temporal y no debe compartirse mientras el servicio está abierto. Cerrar una pestaña no cierra el servidor.</p>'''
guide_script='''<script src="revision/guide.js" defer></script>'''
write('INSTRUCCIONES_WINDOWS.html',page('Paquete Windows de revisión final',guide,guide_script))
write('revision/guide.js',"if (location.protocol === 'file:') { document.getElementById('file-note').hidden = false; document.querySelectorAll('[data-http-only]').forEach(link => { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); }); }\n")

manifest={
 'package':'DAYZ-SURVIVAL DESIGN-001-D','label':'DEMO LOCAL, SIN CONTENIDO EDITORIAL REAL',
 'created_at':datetime.datetime.now(ZoneInfo('Europe/Madrid')).isoformat(),
 'source':{'repository':'bachboy22/www.dayz-survival.com','pr':6,'commit':SHA,'site_source_modified':False},
 'build':{'mode':'Astro static','node':'24.19.0','astro':'7.4.2','typescript':'6.0.3','html_pages':18,'files':{str(p.relative_to(SOURCE/'dist')).replace('\\','/'):digest(p) for p in sorted((SOURCE/'dist').rglob('*')) if p.is_file()}},
 'runtime':provenance,'execution':{'target':'Windows 10/11 x64','installed_dependencies_required':False,'administrator_required':False,'powershell_used':False,'host':'127.0.0.1','port':'OS allocated (0)','external_requests_required':False,'entry':'ABRIR_REVISION.cmd','stop':'CERRAR_REVISION.cmd or Ctrl+C','volatile_files':['SESION_DESIGN001D.json']},
 'verification':{'windows_real':'NOT EXECUTED','windows_binary':'PE/AMD64 and official SHA-256 verified; NOT EXECUTED here','wine':'NOT EXECUTED','NVDA_Firefox':'NOT EXECUTED','Narrator_Edge':'NOT EXECUTED','approval':'Reserved for user PC review'},
 'editorial':{'real_manuscripts_included':0,'demo_articles':3,'demo_quick_cards':3,'CHR_LIV_AUD130_included':False,'ART002_included':False,'cloudflare_modified':False,'merged':False},
}
write('MANIFEST.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
shutil.copy2(SOURCE/'docs/DESIGN-001-D-REPORT.md',DEST/'DESIGN-001-D-REPORT.md')

def hashes():
    files=[p for p in sorted(DEST.rglob('*')) if p.is_file() and p.name not in {'SHA256SUMS.txt','SESION_DESIGN001D.json'}]
    write('SHA256SUMS.txt',''.join(digest(p)+'  '+p.relative_to(DEST).as_posix()+'\n' for p in files))
hashes()
print(json.dumps({'package':str(DEST),'runtime':provenance,'site_files':len(manifest['build']['files']),'review_general_cases':len(general),'screen_reader_cases_per_lane':len(manual)},ensure_ascii=False,indent=2))
