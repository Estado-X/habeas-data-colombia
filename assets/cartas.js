/* Las cartas. Texto plano, listo para copiar, pegar en un correo o imprimir.
   Normas: Constitución, art. 15; Ley 1581 de 2012, arts. 8, 14, 15 y 16;
   Decreto 1074 de 2015, art. 2.2.2.25.2.6; Ley 2300 de 2023, arts. 2 a 7. */
(function (raiz) {
  'use strict';

  var TIPOS = {
    consulta: { dias: 10, prorroga: 5, norma: 'artículo 14 de la Ley 1581 de 2012', desde: 'desde el recibo' },
    reclamo: { dias: 15, prorroga: 8, norma: 'artículo 15 de la Ley 1581 de 2012', desde: 'desde el día siguiente al recibo' }
  };

  function v(x, alterno) { x = (x || '').trim(); return x || alterno; }
  function lista(items) { return items.filter(Boolean).map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n'); }

  function encabezado(d, ciudadFecha, asunto) {
    return [
      ciudadFecha,
      '',
      'Señores',
      v(d.empresa, '[Nombre de la empresa]') + (d.nit ? '\nNIT ' + d.nit.trim() : ''),
      'Área de protección de datos personales' + (d.correoEmpresa ? '\n' + d.correoEmpresa.trim() : ''),
      '',
      'Asunto: ' + asunto,
      '',
      ''
    ].join('\n');
  }

  function identificacion(d) {
    return 'Yo, ' + v(d.nombre, '[tu nombre completo]') + ', identificado(a) con ' + v(d.tipoDoc, 'cédula de ciudadanía') + ' n.º ' + v(d.documento, '[número]');
  }

  function cierre(d, plazo) {
    var t = [];
    if (plazo) t.push(plazo, '');
    t.push('Recibo la respuesta en: ' + v(d.correo, v(d.direccion, '[tu correo o dirección]')) + '.');
    if (d.anexoCedula) t.push('', 'Anexo: copia de mi documento de identidad.');
    t.push('', 'Atentamente,', '', '', v(d.nombre, '[tu nombre completo]'), v(d.tipoDoc, 'Cédula de ciudadanía') + ' n.º ' + v(d.documento, '[número]'));
    if (d.correo) t.push(d.correo.trim());
    if (d.telefonoContacto) t.push(d.telefonoContacto.trim());
    return t.join('\n');
  }

  function hechos(d) {
    var h = (d.hechos || '').trim();
    return h ? ['Hechos:', h, ''] : [];
  }

  var PLAZO_RECLAMO = 'De acuerdo con el artículo 15 de la Ley 1581 de 2012, dentro de los dos (2) días hábiles siguientes al recibo deben incluir en su base de datos la leyenda «reclamo en trámite», y tienen máximo quince (15) días hábiles, contados desde el día siguiente al recibo, para responder. Si no fuera posible, deben informarme los motivos y la nueva fecha, que no puede pasar de ocho (8) días hábiles más.';

  function consulta(d, ciudadFecha) {
    var pide = lista([
      'Qué datos personales míos tienen en sus bases de datos, incluidos los que estén vinculados con mi identificación.',
      'Para qué los usan (las finalidades del tratamiento) y desde cuándo.',
      'De dónde los obtuvieron.',
      'Si los han compartido, transmitido o transferido a otras personas o empresas, y a cuáles.',
      d.pruebaAutorizacion ? 'Copia de la autorización que les di para tratar mis datos (artículo 8, literal b, de la Ley 1581 de 2012).' : ''
    ]);
    return {
      asunto: 'Consulta sobre mis datos personales (Ley 1581 de 2012, artículo 14)',
      tipo: 'consulta',
      texto: encabezado(d, ciudadFecha, 'Consulta sobre mis datos personales (Ley 1581 de 2012, artículo 14)') + [
        identificacion(d) + ', en ejercicio de mi derecho de hábeas data (artículo 15 de la Constitución y artículos 8 y 14 de la Ley 1581 de 2012), les solicito que me informen:',
        '',
        pide,
        ''
      ].concat(hechos(d)).join('\n') + '\n' + cierre(d, 'De acuerdo con el artículo 14 de la Ley 1581 de 2012, tienen máximo diez (10) días hábiles, desde el recibo de esta consulta, para responderla. Si no fuera posible, deben informarme los motivos y la nueva fecha, que no puede pasar de cinco (5) días hábiles más. El acceso a mis datos es gratuito (artículo 8, literal f).')
    };
  }

  function borrar(d, ciudadFecha) {
    var que, asunto;
    if (d.alcance === 'publicidad') {
      asunto = 'Reclamo: revocatoria de la autorización para fines comerciales (Ley 1581 de 2012)';
      que = 'revoquen la autorización que les haya dado para usar mis datos personales con fines comerciales, publicitarios o de mercadeo, y dejen de contactarme con esos fines por cualquier canal (llamadas, SMS, WhatsApp, otras aplicaciones de mensajería y correo electrónico).';
    } else if (d.alcance === 'corregir') {
      asunto = 'Reclamo: corrección y actualización de mis datos personales (Ley 1581 de 2012)';
      que = 'corrijan o actualicen mis datos personales así: ' + v(d.correccion, '[qué dato está mal y cuál es el correcto]');
    } else {
      asunto = 'Reclamo: supresión de mis datos personales y revocatoria de la autorización (Ley 1581 de 2012)';
      que = 'supriman todos mis datos personales de sus bases de datos y revoquen la autorización que les haya dado para tratarlos.';
    }
    var base = d.alcance === 'corregir'
      ? '(artículo 8, literal a, y artículo 15 de la Ley 1581 de 2012)'
      : '(artículo 8, literal e, y artículo 15 de la Ley 1581 de 2012, y artículo 2.2.2.25.2.6 del Decreto 1074 de 2015)';
    var parrafos = [
      identificacion(d) + ', presento este reclamo para que ' + que,
      '',
      'Lo hago en ejercicio de mi derecho de hábeas data ' + base + '.',
      ''
    ].concat(hechos(d));
    if (d.alcance !== 'corregir') {
      parrafos.push('Si consideran que tengo un deber legal o contractual de permanecer en su base de datos, les pido que me indiquen cuál es y que, mientras tanto, usen mis datos solo para cumplir ese deber y nunca con fines comerciales o publicitarios.', '');
    }
    parrafos.push('Les pido también que me confirmen por escrito lo que hagan e informen de este reclamo a los encargados y terceros a quienes hayan entregado mis datos.', '');
    if (d.pruebaAutorizacion) parrafos.push('Les solicito además copia de la autorización que les di para tratar mis datos (artículo 8, literal b, de la Ley 1581 de 2012).', '');
    return { asunto: asunto, tipo: 'reclamo', texto: encabezado(d, ciudadFecha, asunto) + parrafos.join('\n') + '\n' + cierre(d, PLAZO_RECLAMO) };
  }

  function canalesTexto(d) {
    var t = [];
    if (d.telefonos) t.push('los números ' + d.telefonos.trim());
    if (d.correosAfectados) t.push('los correos ' + d.correosAfectados.trim());
    return t.length ? ' a ' + t.join(' y ') : '';
  }

  function noLlamar(d, ciudadFecha) {
    if (d.motivo === 'cobranza') return cobranza(d, ciudadFecha);
    var asunto = 'Solicitud para dejar de recibir llamadas y mensajes comerciales (Ley 2300 de 2023 y Ley 1581 de 2012)';
    var p = [
      identificacion(d) + ', les solicito que dejen de enviarme mensajes comerciales o publicitarios y de hacerme llamadas con esos fines, por cualquier canal (llamadas, SMS, WhatsApp, otras aplicaciones de mensajería y correo electrónico)' + canalesTexto(d) + '.',
      '',
      'Con este reclamo revoco la autorización que les haya dado para usar mis datos con fines comerciales, publicitarios o de mercadeo (artículo 8, literal e, y artículo 15 de la Ley 1581 de 2012).',
      '',
      'Les recuerdo que el artículo 5 de la Ley 2300 de 2023 obliga a quien envía mensajes comerciales a tener un mecanismo ágil, sencillo y eficiente para cancelar su recepción en cualquier momento, y a contactar solo dentro de los horarios del artículo 3: de lunes a viernes de 7:00 a. m. a 7:00 p. m. y los sábados de 8:00 a. m. a 3:00 p. m., nunca domingos ni festivos.',
      ''
    ].concat(hechos(d));
    if (d.rne) p.push('Además, inscribí mis números en el Registro de Números Excluidos de la Comisión de Regulación de Comunicaciones.', '');
    p.push('Les pido que me confirmen por escrito que retiraron mis datos de sus listas de contacto comercial y que informen de esta solicitud a los terceros que hagan llamadas o envíen mensajes por ustedes.', '');
    return { asunto: asunto, tipo: 'reclamo', texto: encabezado(d, ciudadFecha, asunto) + p.join('\n') + '\n' + cierre(d, PLAZO_RECLAMO) };
  }

  function cobranza(d, ciudadFecha) {
    var asunto = 'Reclamo: canales y horarios de la gestión de cobranza (Ley 2300 de 2023)';
    var canales = (d.canalesCobranza || []).join(', ');
    var p = [
      identificacion(d) + ', les solicito que la gestión de cobranza que adelantan conmigo se ajuste a la Ley 2300 de 2023.',
      '',
      canales
        ? 'Solo autorizo que me contacten por: ' + canales + '. Les pido que no usen ningún otro canal (artículo 2 de la Ley 2300 de 2023: solo se puede contactar por los canales que el consumidor autorice).'
        : 'Les pido que me informen por qué canales me están contactando y que me permitan escoger los que autorizo (artículo 2 de la Ley 2300 de 2023).',
      '',
      'Les recuerdo que, una vez establecido el contacto directo, no pueden contactarme por varios canales dentro de una misma semana ni más de una vez en el mismo día, y solo de lunes a viernes de 7:00 a. m. a 7:00 p. m. y los sábados de 8:00 a. m. a 3:00 p. m., nunca domingos ni festivos (artículo 3). Tampoco pueden contactar a mis referencias personales o de otra índole (artículo 4), hacer visitas a mi casa o a mi trabajo (artículo 6) ni preguntarme el motivo del no pago (artículo 7).',
      ''
    ];
    var faltas = [];
    if (d.fueraHorario) faltas.push('me han contactado fuera de los horarios permitidos o más de una vez en el mismo día');
    if (d.referencias) faltas.push('han contactado a mis referencias, familiares o conocidos');
    if (d.visitas) faltas.push('han hecho visitas a mi casa o a mi lugar de trabajo');
    if (faltas.length) p.push('Les informo que ' + faltas.join('; ') + '. Les pido que lo suspendan de inmediato.', '');
    p = p.concat(hechos(d));
    p.push('Esta solicitud no desconoce la obligación, si existe; se refiere solo a la forma en que me contactan. Les pido que me confirmen por escrito los ajustes y que informen de ella a las empresas que hagan la cobranza por ustedes.', '');
    return { asunto: asunto, tipo: 'reclamo', texto: encabezado(d, ciudadFecha, asunto) + p.join('\n') + '\n' + cierre(d, PLAZO_RECLAMO) };
  }

  function generar(tipo, d, ciudadFecha) {
    d = d || {};
    if (tipo === 'consulta') return consulta(d, ciudadFecha);
    if (tipo === 'nollamar') return noLlamar(d, ciudadFecha);
    return borrar(d, ciudadFecha);
  }

  var api = { TIPOS: TIPOS, generar: generar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Cartas = api;
})(this);
