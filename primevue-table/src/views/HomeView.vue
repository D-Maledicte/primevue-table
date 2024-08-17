<script setup>
import { ref, onMounted, watch, toRaw, toValue} from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
//import { MainTableRows, SecondaryTableRows, InfoTableRows } from '@/assets/Seeds.mjs';
import { mainTable, secondaryTable, infoTable } from '@/assets/data2.mjs';
//import { generateData } from '@/assets/Seeds2.mjs';
/// Visual effects
const screenMode = ref("pi pi-moon");
const toggleColorScheme = () => {
    const element = document.querySelector('html');
    element.classList.toggle('my-app-dark');
    screenMode.value = screenMode.value == "pi pi-sun"? "pi pi-moon" : "pi pi-sun";
}
/*
const element = document.querySelector('html');
element.classList.toggle('my-app-dark');
*/
const mainTableLoader = ref(true);

const getSeverity = (product) => {
    switch (product.direccion) {
        case 'Entrante':
            return 'success';

        case 'Saliente':
            return 'warn';
        default:
            return null;
    }
};
/// Data Format

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
    return valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};
/*
const formatBoolean = (value) => {
  if (value == "true") {
    return true;
  }
  else {
    return false;
  }
};
*/
const formatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fecha_creacion: formatDateString(item.fecha_creacion),
      fecha_cierre: formatDateString(item.fecha_cierre)
    };
  });
  representatives.value = updateRepresentatives(newData);
  return newData
};

const secondaryFormatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fecha_bloqueo: formatDateString(item.fecha_bloqueo),
      fecha_cot_esp: formatDateString(item.fecha_cot_esp),
      aviso: item.estado == "A la espera de informacion"? true : false
    };
  });
  secondaryRepresentatives.value = updateSecondaryRepresentatives(newData);
  return newData
};

const logFormatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fecha_de_movimiento: formatDateString(item.fecha_de_movimiento)
    };
  });
  return newData
};

/// Filter Spectrum
const filterByCotizacion = (id_cotizacion) => { 
  const secondaryRows = toValue(SecondaryTableRows);
  var filteredSecondaryTableRows = secondaryRows.filter(row => row.id_cotizacion == id_cotizacion);
  return secondaryFormatData(filteredSecondaryTableRows)
};

const filterByPedido = (id_pedido) => { 
  const infoRows = toValue(InfoTableRows);
  var filteredInfoRows = infoRows.filter(row => row.id_pedido == id_pedido);

  filteredInfoRows.sort((a, b) => {
    const dateA = new Date(a.fecha_de_movimiento);
    const dateB = new Date(b.fecha_de_movimiento);

    return dateB - dateA;  // Ordena de más reciente a más antiguo
  });
  return logFormatData(filteredInfoRows)
};
//Seteeamos la dinamica de los distintos filtros
//Global corresponde corresponde al filtro del buscador superior y podriamos dinamizarlo en base a un array de titulos de columnas
//El resto cada uno tiene un modo que se le puede establecer y a su podemos predefinir un prefiltro en caso de ser necesario
const filters = ref();
const secondaryFilters = ref();
const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    titulo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    estado: { value: null, matchMode: FilterMatchMode.IN },
    balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    riesgo: { value: null, matchMode: FilterMatchMode.IN },
    tomador: { value: null, matchMode: FilterMatchMode.IN },
    fecha_creacion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    fecha_cierre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    aseguradora: { value: null, matchMode: FilterMatchMode.IN },
    aviso: { value: null, matchMode: FilterMatchMode.EQUALS }
  };
};
const initSecondaryFilters = () => {
  secondaryFilters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    aseguradora: { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null, matchMode: FilterMatchMode.IN },
    fecha_bloqueo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    fecha_cot_esp: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    aviso: { value: null, matchMode: FilterMatchMode.EQUALS }
  };
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
  if (field === "titulo") {
    return expectedFilter = {}
  }
  if (field === "estado") {
    return expectedFilter = { filterField: field, showFilterMatchModes: false, filterMenuStyle: "{ width: '14rem' }" }
  }
  return expectedFilter
};
const clearFilter = () => {
  initFilters();
  localFilterValue.value = null
};
const clearSecondaryFilter = () => {
  initSecondaryFilters();
};

initFilters();
initSecondaryFilters();
const onFilter = (event) => {
  filteredProducts.value = toRaw(event.filteredValue);
}

const debounce = (func, wait) => {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };
const localFilterValue = ref(filters.value.global.value);
const updateFilter = debounce((value) => {
      filters.value.global.value = value;
    }, 300);
watch(localFilterValue, (newValue) => {
      updateFilter(newValue);
});
/// Navigation process
const procesarOperacion = (target) => {
  let titulo = target.titulo;
  let estado = target.estado;
  let riesgo = target.riesgo;
  let tomador = target.tomador;
  let prima_asegurada = target.balance;
  let fecha_creacion = target.fecha_creacion;
  let fecha_cierre = target.fecha_cierre;
  let query = "Titulo: " + titulo + ", " + "Estado: " + estado + ", " + "Riesgo: " + riesgo + ", " + "Tomador: " + tomador + ", " + "Prima Asegurada: " + prima_asegurada + ", " + "Fecha de creacion: " + fecha_creacion + ", " + "Fecha de cierre: " + fecha_cierre;
  window.open('https://search.brave.com/search?q=' + query + '&source=desktop', '_blank');
  console.log(target)
};

const procesarSecondaryOperacion = (target) => {
  let aseguradora = target.aseguradora;
  let estado = target.estado;
  let fecha_bloqueo = formatDateForDisplay(target.fecha_bloqueo);
  let fecha_cot_esp = formatDateForDisplay(target.fecha_cot_esp);
  //let aviso = target.aviso;
  let query = "Aseguradora: " + aseguradora + ", " + "Estado: " + estado + ", " + "Fecha de bloqueo: " + fecha_bloqueo + ", " + "Cierre Estimado: " + fecha_cot_esp  
  window.open('https://search.brave.com/search?q=' + query + '&source=desktop', '_blank');
  console.log(target)
};

const showLogsTable = (data) => {
  logs.value = filterByPedido(data.id_pedido);
  visible.value = true;
};

/// Data Gathering
const MainTableRows = ref();
const SecondaryTableRows = ref();
const InfoTableRows = ref();
const products = ref();
const filteredProducts = ref();
const logs = ref();
const visible = ref(false);
const expandedRows = ref({});
/// Data definition
//Columnas correspondientes a la data table, esto podriamos dinamizarlo en un paso previo si es que vamos por la idea de un plugin para todas la sections
const mainColumns = [
  { field: 'titulo', header: 'Titulo' },
  { field: 'estado', header: 'Estado' },
  { field: 'riesgo', header: 'Riesgo' },
  { field: 'tomador', header: 'Tomador' },
  { field: 'balance', header: 'Prima Asegurada' },
  { field: 'fecha_creacion', header: 'Creado' },
  { field: 'fecha_cierre', header: 'Cierre estimado' },
  { field: 'acciones', header: 'Acciones' }
];
const secondaryColumns = [
  { field: 'aseguradora', header: 'Aseguradora' },
  { field: 'estado', header: 'Estado' },
  { field: 'fecha_bloqueo', header: 'Fecha de Bloqueo' },
  { field: 'fecha_cot_esp', header: 'Cierre Estimado' },
  { field: 'aviso', header: 'Aviso' },
  { field: 'acciones', header: 'Acciones' }
];
const logsColumns = [
  { field: 'tipo', header: 'Tipo' },
  { field: 'fecha_de_movimiento', header: 'Fecha de Movimiento' },
  { field: 'direccion', header: 'Dirección' },
  { field: 'resumen', header: 'Resumen' }
];
const representatives = ref();

const updateRepresentatives = (data) => {
  const newRepresentatives = {
    estado: [],
    riesgo: [], // Assuming 'riesgo' is in your objects, you can adjust if necessary
    tomador: [], // Assuming 'tomador' is in your objects, you can adjust if necessary
    aseguradora: []
  };

  data.forEach(item => {
    if (!newRepresentatives.estado.includes(item.estado)) {
      newRepresentatives.estado.push(item.estado);
    }
    if (!newRepresentatives.aseguradora.includes(item.aseguradora)) {
      newRepresentatives.aseguradora.push(item.aseguradora);
    }
    // Add other properties if they exist in your objects
    if (!newRepresentatives.riesgo.includes(item.riesgo)) {
      newRepresentatives.riesgo.push(item.riesgo);
    }
    if (!newRepresentatives.tomador.includes(item.tomador)) {
      newRepresentatives.tomador.push(item.tomador);
    }
  });

  // Sorting the arrays (optional)
  newRepresentatives.estado.sort();
  newRepresentatives.aseguradora.sort();
  newRepresentatives.riesgo.sort();
  newRepresentatives.tomador.sort();
  console.log(newRepresentatives);
  return newRepresentatives;
};

const secondaryRepresentatives = ref();
const updateSecondaryRepresentatives = (data) => {
  const newRepresentatives = {
    estado: [],
    //riesgo: [], // Assuming 'riesgo' is in your objects, you can adjust if necessary
    //tomador: [], // Assuming 'tomador' is in your objects, you can adjust if necessary
    aseguradora: []
  };

  data.forEach(item => {
    if (!newRepresentatives.estado.includes(item.estado)) {
      newRepresentatives.estado.push(item.estado);
    }
    if (!newRepresentatives.aseguradora.includes(item.aseguradora)) {
      newRepresentatives.aseguradora.push(item.aseguradora);
    }
    // Add other properties if they exist in your objects
    // if (!newRepresentatives.riesgo.includes(item.riesgo)) {
    //   newRepresentatives.riesgo.push(item.riesgo);
    // }
    // if (!newRepresentatives.tomador.includes(item.tomador)) {
    //   newRepresentatives.tomador.push(item.tomador);
    // }
  });

  // Sorting the arrays (optional)
  newRepresentatives.estado.sort();
  newRepresentatives.aseguradora.sort();
  // newRepresentatives.riesgo.sort();
  // newRepresentatives.tomador.sort();

  return newRepresentatives;
};
const getPrimaAsegurada = (data) => {
  console.log(toRaw(data));
  data = toRaw(data);
  const total = data.reduce((acc, obj) => {
    // Convertir balance a número, si es una cadena
    const balance = parseFloat(obj.balance) || 0;
    return acc + balance;
  }, 0);
  // Redondear a dos decimales
  return formatCurrency(Math.round(total * 100) / 100);
}
/// Starting functions
onMounted(() => {
  //const dataGenerated = generateData(100);
  //console.log(dataGenerated);
  //MainTableRows.value = dataGenerated.mainTable;
  MainTableRows.value = mainTable;
  //SecondaryTableRows.value = dataGenerated.secondaryTable;
  SecondaryTableRows.value = secondaryTable;
  //InfoTableRows.value = dataGenerated.infoTable;
  InfoTableRows.value = infoTable;
  setTimeout(() => {
    products.value = formatData(MainTableRows.value)
    mainTableLoader.value = false;
  }, 1000);
  ////for each maintablerows por cada una de las tablerows hagas esa llamada asincrona
});
</script>

<template>
  <main class="main_selector">
    <div class="card">
      <DataTable v-model:filters="filters"
        :globalFilterFields="['titulo', 'riesgo', 'estado', 'tomador', 'aseguradora']" filterDisplay="menu"
        :value="products" sortField="estado" :sortOrder="1" stripedRows paginator :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" :expandedRows="expandedRows"
        dataKey="id_cotizacion" @filter="onFilter" scrollable scrollHeight="400px" :loading="mainTableLoader" stateStorage="session" stateKey="dt-state-demo-session">
        <template #header>
          
          <div class="flex justify-between">
            <Button type="button" :icon="screenMode" @click="toggleColorScheme()" />
            <div class="flex justify-end gap-4">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="localFilterValue" placeholder="Busqueda general" />
            </IconField>
          </div>
          </div>
          
        </template>
        <template #empty> No hay registros que coincidan con la busqueda </template>
        <!-- <template #loading> Cargando Información </template> -->
        <Column expander style="width: 5rem" />
        <Column v-for="col of mainColumns" :sortable="col.field != 'acciones' ? true : false"
          :key="col.id_cotizacion" :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)">
          <template #body="{ data }">
            <div class="flex justify-center align-center">
            <template v-if="col.field == 'acciones'">
              <ButtonGroup>
                <Button icon="pi pi-times" severity="danger" aria-label="Cancel" size="small"
                  v-tooltip.bottom="'Cerrar cotizacion'" @click="procesarOperacion(data)"/>
              </ButtonGroup>
            </template>
            <template v-else-if="col.field == 'balance'">
              
              {{ formatCurrency(data.balance) }}
            
            </template>
            <template v-else-if="col.field == 'aviso'">
              
                <i class="pi"
                :class="{ 'pi-check-circle text-red-500 ': data[col.field], 'pi-circle': !data[col.field] }"></i>
              
            </template>
            <template v-else>
              {{
                col.field == "fecha_creacion" || col.field == 'fecha_cierre' ? formatDateForDisplay(data[col.field]) :
                  data[col.field]
              }}
            </template>
          </div>
          </template>
          <!-- Podriamos reversionar la primer columna de todas las tablas para hacer universal este setup de filters -->
          <template v-if="col.field == 'titulo'" #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" :placeholder="`Buscar por ${col.header}`" />
          </template>
          <template v-else-if="(col.field).includes('fecha')" #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
          <template v-else-if="col.field == 'balance'" #filter="{ filterModel }">
            <InputNumber v-model="filterModel.value" mode="currency" currency="ARS" locale="es-AR" />
          </template>
          <template
            v-else-if="col.field != 'acciones'" 
            #filter="{ filterModel }">
            <MultiSelect v-model="filterModel.value" :options="representatives[col.field]" placeholder="Any">
              <template #option="slotProps">
                <div class="flex items-center gap-2">
                  <span>{{ slotProps.option }}</span>
                </div>
              </template>
            </MultiSelect>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-2">
            <DataTable v-model:filters="secondaryFilters" :globalFilterFields="['estado', 'aseguradora']" filterDisplay="menu" :value="filterByCotizacion(slotProps.data.id_cotizacion)" tableStyle="min-width: 50rem" stripedRows paginator :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]">
              <template #header>
              <div class="flex justify-start gap-2">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearSecondaryFilter()" />
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="secondaryFilters['global'].value" placeholder="Busqueda general" />
                </IconField>
              </div>
              </template>
              <template #empty> No hay registros que coincidan con la busqueda </template>
              <template #loading> Cargando Información </template>
              <Column v-for="col of secondaryColumns"
                :sortable="col.field != 'aviso' && col.field != 'acciones' ? true : false" :key="col.id_pedido"
                :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)">
                <template #body="{ data }">
                  <template v-if="col.field == 'acciones'">
                    <ButtonGroup>
                      <Button icon="pi pi-bell" severity="info" aria-label="Cancel" size="small"
                        v-tooltip.bottom="'Mas info'" @click="showLogsTable(data)" />
                      <Button icon="pi pi-check" severity="success" aria-label="Cancel" size="small"
                        v-tooltip.bottom="'Responder pedido'" @click="procesarSecondaryOperacion(data)" />
                      <Button icon="pi pi-times" severity="danger" aria-label="Cancel" size="small"
                        v-tooltip.bottom="'Dar de alta'" @click="procesarSecondaryOperacion(data)"/>
                    </ButtonGroup>
                  </template>
                  <template v-else-if="col.field == 'aviso'">
                    <i class="pi"
                      :class="{ 'pi-check-circle text-red-500 ': data[col.field], 'pi-circle': !data[col.field] }"></i>
                  </template>
                  <template v-else>
                    {{
                      col.field == "fecha_bloqueo" || col.field == 'fecha_cot_esp' ? formatDateForDisplay(data[col.field])
                        : data[col.field]
                    }}
                  </template>
                </template>
                <!-- Podriamos reversionar la primer columna de todas las tablas para hacer universal este setup de filters -->
                <template v-if="col.field == 'aseguradora'" #filter="{ filterModel }">
                  <InputText v-model="filterModel.value" type="text" :placeholder="`Buscar por ${col.header}`" />
                </template>
                <template v-else-if="(col.field).includes('fecha')" #filter="{ filterModel }">
                  <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
                </template>
                <template v-else-if="col.field == 'aviso'" #filter="{ filterModel }">
                <div class="flex justify-between items-center">
                  <span>Activo / Inactivo</span>
                  <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary/>
                </div>
                </template>
                <template
                  v-else-if="col.field != 'acciones'" 
                  #filter="{ filterModel }">
                  <MultiSelect v-model="filterModel.value" :options="secondaryRepresentatives[col.field]" placeholder="Any">
                    <template #option="slotProps">
                      <div class="flex items-center gap-2">
                        <span>{{ slotProps.option }}</span>
                      </div>
                    </template>
                  </MultiSelect>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
        <template #footer> Numero de registros: {{ filteredProducts ? filteredProducts.length : 0 }}. Prima asegurada por {{ filteredProducts != undefined ? getPrimaAsegurada(filteredProducts) : 0 }} </template>
      </DataTable>
      <Dialog v-model:visible="visible" maximizable modal header="Logs Table" :style="{ width: '50rem' }" dismissableMask>
        <DataView :value="logs">
            <template #list="slotProps">
                <div class="flex flex-col">
                    <div v-for="(item, index) in slotProps.items" :key="index">
                        <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                    <Fieldset>
                                        <template #legend>
                                            <div class="flex items-center">
                                              <Tag :value="item.direccion" :severity="getSeverity(item)"></Tag>
                                            </div>
                                        </template>
                                        <p class="text-lg font-medium mt-2">
                                          {{item.resumen}}
                                        </p>
                                    </Fieldset>
                                </div>
                                <div class="flex flex-col md:items-end gap-8">
                                  <Tag icon="pi pi-calendar" :value="formatDateForDisplay(item.fecha_de_movimiento)" class="text-xl font-semibold"></Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
      </Dialog>
    </div>
  </main>

</template>

<style></style>