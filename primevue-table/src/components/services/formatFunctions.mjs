import { toRaw } from 'vue';
const fetchData = async (endpoint) => {
  try {
    const response = await fetch(endpoint)
    return await response.json();
  }
  catch (error) {
      console.error('Error al obtener datos:', error);
  }
}

const formatDateString = (value) => {
  if (value != null) {
    value = value.replace("  ", "T");
    const date = new Date(value);
    /*
    // Obtén el año, mes y día en formato numérico
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const day = String(date.getDate()).padStart(2, '0');

    // Devuelve la fecha en formato YYYY-MM-DD
    //return `${year}-${month}-${day}`;
    */
    return date
  } else {
    return value;
  }
};

const formatDateForDisplay = (value) => {
  if (value != null) {
    const date = new Date(value);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } else {
    return value;
  }
};

const formatCurrency = (value) => {
    const valor = parseFloat(value)
    return valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
};

const formatBoolean = (value) => {
  if (value == "true") {
    return true;
  }
  else {
    return false;
  }
};

const filters_distinction = (field) => {
  let expectedFilter = { showFilterMatchModes: false, filterMenuStyle: "{ width: '14rem' }" };
  if (field.includes("fecha")) {
    return expectedFilter = { filterField: field, dataType: 'date' }
  }
  if (field === "aviso") {
    return expectedFilter = { dataType: "boolean" };
  }
  if (field === "balance") {
    return expectedFilter = { filterField: field, dataType:"numeric" };
  }
  if (field === "titulo" || field === "tomador" || field === "aseguradora") {
    return expectedFilter = { filterMenuStyle: "{ width: '14rem' }" }
  }
  if (field == "estado") {
    return expectedFilter = { filterField: field, showFilterMatchModes: false, filterMenuStyle: "{ width: '14rem'; max-width: '14rem' }" }
  }
  return expectedFilter
};

const filters_distinction_clients = (field) => {
  let expectedFilter = { showFilterMatchModes: false, filterMenuStyle: "{ width: '14rem' }" };
  if (field.includes("fecha")) {
    return expectedFilter = { filterField: field, dataType: 'date' }
  }
  if (field === "nombre" || field === "apellido" || field === "email") {
    return expectedFilter = { filterMenuStyle: "{ width: '14rem' }" }
  }
  return expectedFilter
};

const getSeverityMain = (option) => {
    if (option == 'Sin contactar' || option == 'Esperando respuesta') {
      return 'info';
    }
    else if (option == 'Recibimos respuesta' || option == 'Cerrado perdido') {
      return 'danger';
    }
    else if (option == 'Negociacion Avanzada') {
      return 'warn';
    }
    else if (option == 'Cerrado ganado') {
      return 'success';
    }
    else {
      return null;
    }
}

const getSeveritySecondary = (option) => {
  if (option == 'Sin contactar' || option == 'Esperando respuesta') {
    return 'info';
  }
  else if (option == 'Recibimos respuesta' || option == 'Cerrado perdido' || option == 'Respuesta recibida') {
    return 'danger';
  }
  else if (option == 'Negociacion Avanzada') {
    return 'warn';
  }
  else if (option == 'Cerrado ganado') {
    return 'success';
  }
  else {
    return null;
  }
}


const getSeverityLogs = (product) => {
  switch (product.direccion) {
      case 'Saliente':
          return 'success';

      case 'Entrante':
          return 'warn';
      default:
          return null;
  }
};



const getPrimaAsegurada = (data) => {
  data = toRaw(data);
  const total = data.reduce((acc, obj) => {
    // Convertir balance a número, si es una cadena
    const balance = parseFloat(obj.balance) || 0;
    return acc + balance;
  }, 0);
  // Redondear a dos decimales
  return formatCurrency(Math.round(total * 100) / 100);
}

const getPrimaAseguradaNonCurrency = (data) => {
  data = toRaw(data);
  const total = data.reduce((acc, obj) => {
    // Convertir balance a número, si es una cadena
    const balance = parseFloat(obj.balance) || 0;
    return acc + balance;
  }, 0);
  // Redondear a dos decimales
  return total;
}

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const areObjectsEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export {fetchData, formatDateString, formatDateForDisplay, formatCurrency, filters_distinction, filters_distinction_clients, getSeverityMain, getSeveritySecondary, getSeverityLogs, getPrimaAsegurada, getPrimaAseguradaNonCurrency, debounce, areObjectsEqual }