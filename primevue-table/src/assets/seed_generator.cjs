const { faker } = require("@faker-js/faker");
var fs = require("fs");

function generateMainTableRow() {
  return {
    id_cotizacion: faker.string.numeric({ length: { min: 19, max: 19 } }),
    titulo: faker.company.name(),
    estado: faker.helpers.arrayElement(['Sin contactar','Esperando respuesta','Recibimos respuesta','Cotizando el riesgo','Propuesta Presentada','Propuesta Recibida','Negociacion Avanzada','Cerrado ganado', "Cerrado Perdido"]),
    riesgo: faker.helpers.arrayElement([
      'Aeronavegacion',
      'AP',
      'ART',
      'Asistencia al viajero',
      'Automotores',
      'Caucion',
      'Combinado Familiar',
      'Consorcio',
      'Cristales',
      'Embarcaciones',
      'Flota',
      'Granizo',
      'ICO / TRO',
      'Incendio',
      'Moto',
      'Prepaga',
      'Responsabilidad Civil',
      'Salud',
      'Sepelio',
      'Técnico',
      'Transporte',
      'TRCM',
      'Vida Colectivo',
      'Vida Individual'
    ]),
    tomador: faker.person.fullName(),
    fecha_creacion: faker.date.past().toISOString().split('T')[0] + ' 00:00:00',
    fecha_cierre: faker.date.future().toISOString().split('T')[0] + ' 00:00:00',
    balance: faker.finance.amount({ min: 10000, max: 100000, dec: 2 })
  };
}

function generateSecondaryTableRow(idCotizacion) {
  return {
    id_cotizacion: idCotizacion,
    id_pedido: faker.string.numeric({ length: { min: 19, max: 19 } }),
    aseguradora: faker.helpers.arrayElement([
      'Afianzadora',
      'Alba',
      'Allianz',
      'Asociart',
      'Berkley',
      'Boston',
      'Chubb',
      'Credito y Caucion',
      'Cruz Suiza',
      'Experta ART',
      'Federacion Patronal',
      'Fianzas y Credito',
      'FOMS',
      'Galeno',
      'Gestion',
      'Integrity',
      'La Holando',
      'La Segunda',
      'Libra',
      'Mapfre',
      'Mercantil Andina',
      'Meridional',
      'Nacion Seguros',
      'Omint',
      'Origenes',
      'Parana',
      'Premiar',
      'Provincia',
      'San Cristobal',
      'San Patricio',
      'Sancor',
      'SMG',
      'Sura',
      'TPC',
      'Tu Seguro de Viaje'
    ]),
    estado: faker.helpers.arrayElement([
      'Sin contactar',
      'Esperando respuesta',
      'Recibimos respuesta',
      'Cotizando el riesgo',
      'Propuesta Presentada',
      'Propuesta Recibida',
      'Negociacion Avanzada',
      'A la espera de informacion',
      'Respuesta recibida',
      'Cerrado perdido',
      'Cerrado ganado'
    ]),
    fecha_bloqueo: faker.date.past().toISOString().split('T')[0] + ' 00:00:00',
    fecha_cot_esp: faker.date.future().toISOString().split('T')[0] + ' 00:00:00'
  };
}

function generateInfoTableRow(id_pedido) {
  return {
    id_pedido: id_pedido,
    fecha_de_movimiento: faker.date.past().toISOString().split('T')[0] + ' 00:00:00',
    tipo: faker.helpers.arrayElement([
      'Creacion de pedido de cotizacion',
      'Solicitud de información',
      'Respuesta recibida',
      'Actualización'
    ]),
    direccion: faker.helpers.arrayElement(['Entrante', 'Saliente']),
    resumen: faker.lorem.paragraphs(2)
  };
}

function generateData(samples) {
  const mainTable = [];
  const secondaryTable = [];
  const infoTable = [];

  for (let i = 0; i < samples; i++) {
    const mainRow = generateMainTableRow();
    mainTable.push(mainRow);

    const numSecondaryRows = faker.number.int({ min: 3, max: 10 });
    for (let j = 0; j < numSecondaryRows; j++) {
      const secondaryRow = generateSecondaryTableRow(mainRow.id_cotizacion);
      secondaryTable.push(secondaryRow);

      // Generar entre 1 y 50 logs por cada id_pedido
      const numInfoRows = faker.number.int({ min: 3, max: 15 });
      for (let k = 0; k < numInfoRows; k++) {
        infoTable.push(generateInfoTableRow(secondaryRow.id_pedido));
      }
    }
  }

  return { mainTable, secondaryTable, infoTable };
}

const data = generateData(1000);


//fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');

const mjsContent = `
const mainTable = ${JSON.stringify(data.mainTable, null, 2)};
const secondaryTable = ${JSON.stringify(data.secondaryTable, null, 2)};
const infoTable = ${JSON.stringify(data.infoTable, null, 2)};

export { mainTable, secondaryTable, infoTable };
`;

// Escribir el archivo .mjs
fs.writeFileSync('dataset2.mjs', mjsContent, 'utf8');

console.log('Datos generados y guardados en data.json');