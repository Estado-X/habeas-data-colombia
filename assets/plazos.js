/* Días hábiles en Colombia: lunes a viernes sin festivos.
   Festivos: Ley 51 de 1983 (los que se corren al lunes) y los de Semana Santa. */
(function (raiz) {
  'use strict';

  function pascua(anio) {
    // Algoritmo de Meeus/Jones/Butcher (calendario gregoriano)
    var a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anio, mes - 1, dia);
  }

  function masDias(f, n) { var r = new Date(f.getFullYear(), f.getMonth(), f.getDate()); r.setDate(r.getDate() + n); return r; }
  function alLunes(f) { var dow = f.getDay(); return dow === 1 ? f : masDias(f, (8 - dow) % 7); }
  function clave(f) { return f.getFullYear() + '-' + (f.getMonth() + 1) + '-' + f.getDate(); }

  var cache = {};
  function festivos(anio) {
    if (cache[anio]) return cache[anio];
    var p = pascua(anio);
    var lista = [
      new Date(anio, 0, 1), new Date(anio, 4, 1), new Date(anio, 6, 20), new Date(anio, 7, 7),
      new Date(anio, 11, 8), new Date(anio, 11, 25),
      alLunes(new Date(anio, 0, 6)), alLunes(new Date(anio, 2, 19)), alLunes(new Date(anio, 5, 29)),
      alLunes(new Date(anio, 7, 15)), alLunes(new Date(anio, 9, 12)), alLunes(new Date(anio, 10, 1)),
      alLunes(new Date(anio, 10, 11)),
      masDias(p, -3), masDias(p, -2),
      alLunes(masDias(p, 39)), alLunes(masDias(p, 60)), alLunes(masDias(p, 68))
    ];
    var s = {};
    lista.forEach(function (f) { s[clave(f)] = true; });
    cache[anio] = s;
    return s;
  }

  function esHabil(f) {
    var dow = f.getDay();
    if (dow === 0 || dow === 6) return false;
    return !festivos(f.getFullYear())[clave(f)];
  }

  /* n días hábiles contados desde el día siguiente a la fecha dada. */
  function sumarHabiles(desde, n) {
    var f = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    var k = 0;
    while (k < n) { f = masDias(f, 1); if (esHabil(f)) k++; }
    return f;
  }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function dosDig(n) { return (n < 10 ? '0' : '') + n; }
  function corta(f) { return dosDig(f.getDate()) + '/' + dosDig(f.getMonth() + 1) + '/' + f.getFullYear(); }
  function larga(f) { return f.getDate() + ' de ' + MESES[f.getMonth()] + ' de ' + f.getFullYear(); }
  function conDia(f) { return DIAS[f.getDay()] + ' ' + larga(f); }

  var api = { pascua: pascua, festivos: festivos, esHabil: esHabil, sumarHabiles: sumarHabiles, corta: corta, larga: larga, conDia: conDia };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Plazos = api;
})(this);
