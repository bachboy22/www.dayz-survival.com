'use strict';
(() => {
  const config = JSON.parse(document.querySelector('#review-config').textContent);
  const form = document.querySelector('#review-form');
  const status = document.querySelector('#review-status');
  const key = 'DAYZ-DESIGN001D-' + config.sourceSha;
  const announce = message => { status.textContent = message; };
  function collect() {
    const values = Object.fromEntries(new FormData(form));
    return {
      schemaVersion:1, reviewRevision:config.reviewRevision, packageId:'DESIGN-001-D', sourceSha:config.sourceSha,
      exportedAt:new Date().toISOString(), automaticApproval:false,
      environment:Object.fromEntries(config.environment.map(field => [field.id, values[field.id] || ''])),
      general:config.general.map(item => ({ id:item.id, title:item.title, result:values[item.id + '-result'], observations:values[item.id + '-notes'] || '' })),
      screenReaders:Object.fromEntries(['nvda','narrador'].map(lane => [lane, config.manual.map(item => ({
        id:item.id, title:item.title, result:values[lane + '-' + item.id + '-result'],
        observations:values[lane + '-' + item.id + '-notes'] || '',
      }))])),
      summary:{ blockers:values.blockers || '', improvements:values.improvements || '', recommendation:values.recommendation, conclusions:values.conclusions || '' },
    };
  }
  function download(contents, extension, type) {
    const blob = new Blob([contents], { type }); const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = 'DAYZ-DESIGN001D-REVISION-' + new Date().toISOString().slice(0,10) + '.' + extension;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    announce('Se ha solicitado la descarga local del archivo ' + extension.toUpperCase() + '. No se ha enviado información.');
  }
  document.querySelector('#export-json').addEventListener('click', () => download(JSON.stringify(collect(), null, 2) + '\n', 'json', 'application/json;charset=utf-8'));
  document.querySelector('#export-txt').addEventListener('click', () => {
    const report = collect();
    const lines = ['DAYZ-SURVIVAL · DESIGN-001-D · REVISIÓN HUMANA', 'DEMO LOCAL, SIN CONTENIDO EDITORIAL REAL', 'SHA: ' + report.sourceSha, 'Hoja: ' + report.reviewRevision, 'Exportado: ' + report.exportedAt, 'Aprobación automática: NO', '', 'ENTORNO'];
    for (const field of config.environment) lines.push(field.label + ': ' + report.environment[field.id]);
    function cases(title, rows) { lines.push('', title); for (const row of rows) lines.push(row.id + ' · ' + row.title + ': ' + row.result, 'Observaciones / palabras escuchadas: ' + row.observations); }
    cases('EXPERIENCIA, ZOOM Y DIRECCIÓN VISUAL ACTUAL', report.general);
    cases('NVDA + FIREFOX', report.screenReaders.nvda); cases('NARRADOR + EDGE', report.screenReaders.narrador);
    lines.push('', 'BLOQUEANTES', report.summary.blockers, '', 'MEJORAS NO BLOQUEANTES', report.summary.improvements,
      '', 'RECOMENDACIÓN ELEGIDA POR EL REVISOR', report.summary.recommendation, '', 'CONCLUSIONES', report.summary.conclusions);
    download('\uFEFF' + lines.join('\r\n'), 'txt', 'text/plain;charset=utf-8');
  });
  document.querySelector('#save-draft').addEventListener('click', () => {
    try { localStorage.setItem(key, JSON.stringify(collect())); announce('Borrador guardado en este navegador y dirección local. Exporta JSON para conservarlo entre sesiones o puertos.'); }
    catch { announce('No se pudo guardar en este navegador. Descarga el JSON para conservar la revisión.'); }
  });
  function restore(report) {
    if (!report || report.schemaVersion !== 1 || report.packageId !== 'DESIGN-001-D' || report.sourceSha !== config.sourceSha || report.reviewRevision !== config.reviewRevision) throw new Error('El archivo no corresponde a esta versión de DESIGN-001-D.');
    const allowedResults = ['No probado','Correcto','Incidencia'];
    const changes = [];
    function set(name, value) {
      const control = form.elements.namedItem(name);
      if (!control || typeof value !== 'string' || value.length > (control?.maxLength > 0 ? control.maxLength : 20000)) throw new Error('Formato de revisión no válido.');
      if (control instanceof HTMLSelectElement && !Array.from(control.options).some(option => option.value === value)) throw new Error('Resultado no reconocido.');
      if (control instanceof HTMLInputElement && control.type === 'date' && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value + 'T00:00:00.000Z').toISOString().slice(0,10) !== value)) throw new Error('Fecha no válida en la revisión.');
      changes.push([control, value]);
    }
    for (const field of config.environment) set(field.id, report.environment?.[field.id]);
    function rows(expected, actual, prefix = '') {
      if (!Array.isArray(actual) || actual.length !== expected.length) throw new Error('Faltan casos de revisión.');
      for (const item of expected) {
        const match = actual.find(row => row.id === item.id);
        if (!match || !allowedResults.includes(match.result)) throw new Error('Resultado de caso no reconocido.');
        set(prefix + item.id + '-result', match.result); set(prefix + item.id + '-notes', match.observations);
      }
    }
    rows(config.general, report.general);
    for (const lane of ['nvda','narrador']) rows(config.manual, report.screenReaders?.[lane], lane + '-');
    for (const name of ['blockers','improvements','recommendation','conclusions']) set(name, report.summary?.[name]);
    // Validate the entire report before replacing any field. Imported strings never become HTML.
    for (const [control, value] of changes) control.value = value;
    announce('Revisión recuperada. Los resultados son los del archivo; no se han aprobado casos automáticamente.');
  }
  document.querySelector('#load-draft').addEventListener('click', () => {
    try { const saved = localStorage.getItem(key); if (!saved) return announce('No hay un borrador en esta dirección local. Puedes importar un JSON exportado.'); restore(JSON.parse(saved)); }
    catch (error) { announce(error.message || 'No se pudo recuperar el borrador.'); }
  });
  document.querySelector('#import-json').addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try { if (file.size > 4 * 1024 * 1024) throw new Error('Archivo demasiado grande: el límite es 4 MB.'); restore(JSON.parse(await file.text())); }
    catch (error) { announce(error instanceof SyntaxError ? 'El archivo no es un JSON válido.' : error.message); }
    event.target.value = '';
  });
  form.addEventListener('submit', event => event.preventDefault());
  const reset = document.querySelector('#reset-review');
  reset.addEventListener('click', () => {
    if (window.confirm('¿Vaciar los campos de esta hoja? Exporta antes si quieres conservarlos.')) { form.reset(); announce('Hoja vacía. Todos los casos vuelven a No probado y la recomendación a No evaluada.'); }
  });
  if (location.protocol === 'file:') document.querySelectorAll('[data-http-only]').forEach(link => {
    link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); link.textContent = 'Para abrir la web, ejecuta primero ABRIR_REVISION.cmd.';
  });
})();
