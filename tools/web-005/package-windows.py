"""Produce a separate, private Windows review; never touch WEB-004."""
import argparse, hashlib, json, shutil, struct, zipfile
from pathlib import Path

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--runtime',required=True);p.add_argument('--checksums',required=True);p.add_argument('--output',required=True);p.add_argument('--commit',required=True);a=p.parse_args()
    archive=Path(a.runtime);expected=next(line.split()[0] for line in Path(a.checksums).read_text().splitlines() if line.endswith('  '+archive.name))
    assert digest(archive)==expected,'Runtime archive checksum mismatch'
    dest=Path(a.output);assert not dest.exists(),'Never overwrite an existing review package'
    (dest/'servidor').mkdir(parents=True);(dest/'runtime').mkdir()
    shutil.copytree('private/web005/dist',dest/'sitio')
    shutil.copyfile('tools/web-005/server.cjs',dest/'servidor/server.cjs')
    z=zipfile.ZipFile(archive)
    for name in ('node.exe','LICENSE'):
        (dest/'runtime'/name).write_bytes(z.read('node-v24.19.0-win-x64/'+name))
    exe=(dest/'runtime/node.exe').read_bytes();offset=struct.unpack_from('<I',exe,60)[0];assert exe[:2]==b'MZ' and exe[offset:offset+4]==b'PE\0\0' and struct.unpack_from('<H',exe,offset+4)[0]==0x8664
    shutil.copyfile(a.checksums,dest/'runtime/SHASUMS256.txt')
    for filename,flag in [('ABRIR_REVISION.cmd',''),('CERRAR_REVISION.cmd',' --stop'),('VERIFICAR_PAQUETE.cmd',' --verify')]:
        body='@echo off\r\nsetlocal\r\ncd /d "%~dp0"\r\n"%~dp0runtime\\node.exe" "%~dp0servidor\\server.cjs"'+flag+'\r\nif errorlevel 1 pause\r\n'
        if flag: body+='pause\r\n'
        (dest/filename).write_bytes(body.encode('ascii'))
    instructions='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>WEB-005 · Instrucciones Windows</title><body style="font:18px/1.6 system-ui;max-width:70ch;margin:2rem auto;padding:1rem"><h1>DAYZ-SURVIVAL · WEB-005</h1><p>Revisión privada de los 308 artículos completos. No publicar ni redistribuir sin autorización.</p><ol><li>Extrae todo el ZIP a una carpeta local, no ejecutes dentro del ZIP.</li><li>Doble clic en ABRIR_REVISION.cmd. Usa Node portable incluido, sin npm ni instalación.</li><li>Mantén la consola abierta. Cierra con Ctrl+C o CERRAR_REVISION.cmd.</li></ol><p><a href="/">Abrir el manual completo</a> · <a href="/revision/">Hoja de evaluación y exportación JSON/TXT</a> · <a href="/INTEGRITY.json">Integridad de los 308 originales</a></p><p>Servidor exclusivo de 127.0.0.1; no es acceso remoto desde un teléfono. Para móvil/tablet usa el HTML autónomo privado incluido en la entrega; el servidor Windows no se expone a la red.</p><p>Windows real, NVDA/Firefox y Narrador/Edge: pendientes. El runtime se verificó por SHA-256 oficial y formato PE x64; no se ejecutó node.exe en Linux. Aceptación del corpus ≠ certificación de mecánicas 1.30.</p></body></html>'''
    (dest/'INSTRUCCIONES_WINDOWS.html').write_text(instructions,encoding='utf-8')
    manifest={'contract':'WEB-005','source':{'commit':a.commit,'base':'5a06e6923b6814f31f558bd71ba5690a5594a195'},'corpus':308,'runtime':{'version':'24.19.0','platform':'win-x64','archive_sha256':expected,'executable_sha256':digest(dest/'runtime/node.exe'),'source_url':'https://nodejs.org/dist/v24.19.0/','verification':'official archive SHA-256 and PE x64; not executed on Windows'},'windows_human_tests':'NOT_EXECUTED','public_deployment':False}
    (dest/'MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    files=sorted(f for f in dest.rglob('*') if f.is_file());(dest/'SHA256SUMS.txt').write_text(''.join(digest(f)+'  '+f.relative_to(dest).as_posix()+'\n' for f in files))
    print(json.dumps({'files':len(files),'runtime_sha256':expected,'output':str(dest)}))
