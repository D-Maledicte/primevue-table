const { faker } = require("@faker-js/faker/locale/es");
var fs = require("fs");
const fileName = 'client-dataset.mjs';

function generateClientsTableRow() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const dniLength = faker.helpers.arrayElement([8, 11]);
  const domicilio = faker.location.streetAddress();
  const [streetName] = domicilio.split(',');
  return {
    id_cliente: faker.string.numeric({ length: 19 }),
    nombre: firstName,
    apellido: lastName,
    dni: faker.string.numeric({ length: dniLength }),
    telefono: "+549115" + faker.string.numeric({ length: 7 }),
    email: faker.internet.email({ firstName }),
    provincia: faker.location.state(),
    localidad: faker.location.city(),
    calle: streetName.replace(/\d+/g, '').trim(),
    nroCalle: faker.string.numeric({ length: { min: 3, max: 5 } }),
    grupoEconomico: faker.company.name(),
    fechaDeNacimiento: faker.date.birthdate({ min: 18, max: 65, mode: 'age' })
  };
}
function generateData(samples) {
  const clientsTable = [];
  for (let i = 0; i < samples; i++) {
    const clientRow = generateClientsTableRow();
    clientsTable.push(clientRow);
  }

  return { clientsTable };
}

const data = generateData(500);


//fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');

const mjsContent = `
const clientsTable = ${JSON.stringify(data.clientsTable, null, 2)};

export { clientsTable };
`;

// Escribir el archivo .mjs
fs.writeFileSync(fileName, mjsContent, 'utf8');

console.log(`Datos generados y guardados en ${fileName}`);