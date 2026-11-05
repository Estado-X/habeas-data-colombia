// Pruebas sin dependencias: node --test pruebas/
const test = require('node:test');
const assert = require('node:assert');
const P = require('../assets/plazos.js');
const C = require('../assets/cartas.js');

const f = (d, m, a) => new Date(a, m - 1, d);

test('festivos de Colombia en 2026 (calendario oficial)', () => {
  const esperados = ['1/1', '12/1', '23/3', '2/4', '3/4', '1/5', '18/5', '8/6', '15/6', '29/6', '20/7', '7/8', '17/8', '12/10', '2/11', '16/11', '8/12', '25/12'];
  const s = P.festivos(2026);
  const lista = Object.keys(s).map((k) => { const [, m, d] = k.split('-'); return d + '/' + m; });
  assert.deepStrictEqual(lista.sort(), esperados.slice().sort());
});

test('Pascua en años conocidos', () => {
  assert.strictEqual(P.corta(P.pascua(2026)), '05/04/2026');
  assert.strictEqual(P.corta(P.pascua(2027)), '28/03/2027');
});

test('festivos de 2027 que se mueven al lunes', () => {
  // 2027: Reyes cae miércoles → lun 11 ene; San José viernes → lun 22 mar
  assert.strictEqual(P.esHabil(f(11, 1, 2027)), false);
  assert.strictEqual(P.esHabil(f(22, 3, 2027)), false);
  assert.strictEqual(P.esHabil(f(19, 3, 2027)), true);
});

test('10 días hábiles saltan fines de semana y festivos', () => {
  // Envío el mar 24 nov 2026; el 8 dic es festivo
  assert.strictEqual(P.corta(P.sumarHabiles(f(24, 11, 2026), 10)), '09/12/2026');
});

test('15 días hábiles con el festivo del 8 de diciembre', () => {
  // mar 24 nov 2026 + 15 hábiles = mié 16 dic (el 8 dic es festivo)
  assert.strictEqual(P.corta(P.sumarHabiles(f(24, 11, 2026), 15)), '16/12/2026');
});

test('envío en viernes antes de un lunes festivo', () => {
  // vie 13 nov 2026; lun 16 nov es festivo → primer hábil mar 17
  assert.strictEqual(P.corta(P.sumarHabiles(f(13, 11, 2026), 1)), '17/11/2026');
});

const d = { nombre: 'Ana María Gómez', tipoDoc: 'cédula de ciudadanía', documento: '52123456', correo: 'ana@ejemplo.co', empresa: 'Ofertas S.A.S.', correoEmpresa: 'datos@ofertas.co', pruebaAutorizacion: true };

test('consulta: cita el art. 14 y el plazo de 10 días', () => {
  const c = C.generar('consulta', d, 'Bogotá, 24 de noviembre de 2026');
  assert.strictEqual(c.tipo, 'consulta');
  assert.match(c.texto, /artículo 14 de la Ley 1581/);
  assert.match(c.texto, /diez \(10\) días hábiles/);
  assert.match(c.texto, /Ana María Gómez/);
  assert.match(c.texto, /copia de la autorización/i);
});

test('borrar todo: supresión, revocatoria y el deber de permanecer', () => {
  const c = C.generar('borrar', Object.assign({ alcance: 'todo' }, d), 'Bogotá, 24 de noviembre de 2026');
  assert.strictEqual(c.tipo, 'reclamo');
  assert.match(c.texto, /supriman todos mis datos/);
  assert.match(c.texto, /2\.2\.2\.25\.2\.6/);
  assert.match(c.texto, /deber legal o contractual/);
  assert.match(c.texto, /reclamo en trámite/);
});

test('corregir no habla de supresión', () => {
  const c = C.generar('borrar', Object.assign({ alcance: 'corregir', correccion: 'mi correo es ana@ejemplo.co' }, d), 'x');
  assert.match(c.texto, /corrijan o actualicen/);
  assert.doesNotMatch(c.texto, /supriman/);
  assert.doesNotMatch(c.texto, /deber legal o contractual/);
});

test('dejar de llamar (publicidad) cita la Ley 2300 y los números', () => {
  const c = C.generar('nollamar', Object.assign({ motivo: 'publicidad', telefonos: '300 000 0000', rne: true }, d), 'x');
  assert.match(c.texto, /artículo 5 de la Ley 2300 de 2023/);
  assert.match(c.texto, /300 000 0000/);
  assert.match(c.texto, /Registro de Números Excluidos/);
});

test('cobranza: canales, faltas y aclaración sobre la deuda', () => {
  const c = C.generar('nollamar', Object.assign({ motivo: 'cobranza', canalesCobranza: ['correo electrónico'], referencias: true }, d), 'x');
  assert.match(c.texto, /Solo autorizo que me contacten por: correo electrónico/);
  assert.match(c.texto, /contactado a mis referencias/);
  assert.match(c.texto, /no desconoce la obligación/);
});

test('sin datos, deja corchetes en lugar de inventar', () => {
  const c = C.generar('consulta', {}, 'x');
  assert.match(c.texto, /\[tu nombre completo\]/);
  assert.match(c.texto, /\[Nombre de la empresa\]/);
});
