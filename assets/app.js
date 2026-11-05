/* Interfaz: arma la carta, calcula el plazo y deja copiar, abrir en el correo o imprimir.
   No guarda nada: al cerrar la página, se borra. */
(function () {
  'use strict';

  var C = window.Cartas, P = window.Plazos;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  function valor(name) { var r = document.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function texto(id) { var n = document.getElementById(id); return n ? n.value : ''; }
  function marcado(id) { var n = document.getElementById(id); return !!(n && n.checked); }

  function leerFecha() {
    var t = texto('fecha');
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  }

  function datos() {
    return {
      nombre: texto('nombre'), tipoDoc: texto('tipoDoc'), documento: texto('documento'),
      correo: texto('correo'), direccion: texto('direccion'), telefonoContacto: texto('telefonoContacto'),
      empresa: texto('empresa'), nit: texto('nit'), correoEmpresa: texto('correoEmpresa'),
      hechos: texto('hechos'), pruebaAutorizacion: marcado('pruebaAutorizacion'), anexoCedula: marcado('anexoCedula'),
      alcance: valor('alcance'), correccion: texto('correccion'),
      motivo: valor('motivo'), telefonos: texto('telefonos'), correosAfectados: texto('correosAfectados'), rne: marcado('rne'),
      canalesCobranza: $$('input[name="canal"]:checked').map(function (c) { return c.value; }),
      fueraHorario: marcado('fueraHorario'), referencias: marcado('referencias'), visitas: marcado('visitas')
    };
  }

  var actual = null;

  function mostrarOcultar() {
    var tipo = valor('tipo');
    $$('[data-para]').forEach(function (n) { n.hidden = n.getAttribute('data-para') !== tipo; });
    var alcance = valor('alcance');
    $$('[data-para-alcance]').forEach(function (n) { n.hidden = n.getAttribute('data-para-alcance') !== alcance; });
    var motivo = valor('motivo');
    $$('[data-para-motivo]').forEach(function (n) { n.hidden = n.getAttribute('data-para-motivo') !== motivo; });
    $$('.opcion').forEach(function (o) { o.classList.toggle('activa', o.querySelector('input').checked); });
    $$('.chip').forEach(function (o) { o.classList.toggle('activa', o.querySelector('input').checked); });
  }

  function linea(items) {
    var ol = $('#linea');
    ol.textContent = '';
    items.forEach(function (it) {
      var li = document.createElement('li');
      var b = document.createElement('strong'); b.textContent = it[0];
      var s = document.createElement('span'); s.textContent = it[1];
      li.appendChild(b); li.appendChild(s);
      ol.appendChild(li);
    });
  }

  function actualizar() {
    mostrarOcultar();
    var d = datos();
    var envio = leerFecha();
    var ciudad = texto('ciudad').trim() || '[Ciudad]';
    actual = C.generar(valor('tipo'), d, ciudad + ', ' + P.larga(envio));
    $('#carta').textContent = actual.texto;

    var t = C.TIPOS[actual.tipo];
    if (actual.tipo === 'cobranza') {
      $('#plazo-norma').textContent = 'Ley 2300 de 2023, arts. 2 y 3';
      $('#plazo-fecha').textContent = 'Desde que la reciben';
      $('#plazo-prorroga').textContent = 'La ley no fija un plazo de respuesta: desde que reciben tu carta, solo pueden contactarte por los canales que autorizaste, en los horarios de la ley.';
      linea([
        ['Envías la carta', P.corta(envio)],
        ['Desde ese día', 'solo los canales que autorizaste, una vez al día como máximo y sin llamar a tus referencias'],
        ['Si siguen', 'queja ante la Superintendencia Financiera (bancos y entidades vigiladas) o ante la SIC (las demás empresas), con tu carta y la prueba del envío']
      ]);
      ponerCorreo(d);
      return;
    }
    var limite = P.sumarHabiles(envio, t.dias);
    var conProrroga = P.sumarHabiles(limite, t.prorroga);
    $('#plazo-norma').textContent = t.dias + ' días hábiles · ' + t.norma;
    $('#plazo-fecha').textContent = P.conDia(limite);
    $('#plazo-prorroga').textContent = 'Si avisan una demora, máximo ' + P.corta(conProrroga) + ' (' + t.prorroga + ' días hábiles más).';
    var pasos = [['Envías la carta', P.corta(envio)]];
    if (actual.tipo === 'reclamo') pasos.push(['Deben marcar «reclamo en trámite»', 'a más tardar ' + P.corta(P.sumarHabiles(envio, 2))]);
    pasos.push(['Deben responder', 'a más tardar ' + P.corta(limite)]);
    pasos.push(['Si no responden', 'desde el ' + P.corta(P.sumarHabiles(limite, 1)) + ' puedes quejarte ante la SIC (desde el ' + P.corta(P.sumarHabiles(conProrroga, 1)) + ' si te avisaron una demora)']);
    linea(pasos);

    ponerCorreo(d);
  }

  function ponerCorreo(d) {
    var cuerpo = actual.texto;
    var href = 'mailto:' + encodeURIComponent((d.correoEmpresa || '').trim()) +
      '?subject=' + encodeURIComponent(actual.asunto) + '&body=' + encodeURIComponent(cuerpo);
    $('#correo-btn').setAttribute('href', href);
  }

  function copiar(textoCopiar, boton) {
    var hecho = function () {
      var antes = boton.textContent;
      boton.textContent = 'Copiada'; boton.classList.add('ok');
      setTimeout(function () { boton.textContent = antes; boton.classList.remove('ok'); }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textoCopiar).then(hecho, function () { viejo(textoCopiar); hecho(); });
    } else { viejo(textoCopiar); hecho(); }
  }
  function viejo(t) {
    var a = document.createElement('textarea');
    a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(a);
  }

  function iniciar() {
    var hoy = new Date();
    var dd = function (n) { return (n < 10 ? '0' : '') + n; };
    $('#fecha').value = hoy.getFullYear() + '-' + dd(hoy.getMonth() + 1) + '-' + dd(hoy.getDate());
    document.addEventListener('input', actualizar);
    document.addEventListener('change', actualizar);
    $('#copiar').addEventListener('click', function (e) { copiar(actual.texto, e.currentTarget); });
    $('#imprimir').addEventListener('click', function () { window.print(); });
    actualizar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
