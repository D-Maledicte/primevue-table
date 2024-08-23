<script setup>
import { ref, onMounted, watch, toRaw, computed} from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import {fetchData, formatDateString, formatDateForDisplay, formatCurrency, filters_distinction,getPrimaAsegurada } from "../components/services/formatFunctions.mjs"
import ExpansionTable from '@/components/ExpansionTable.vue';
//import { mainTable, secondaryTable, infoTable } from '@/assets/data2.mjs';
import InfoTable from '@/components/InfoTable.vue';
///Main deploy segmentation
const produ = true;
/// Visual effects
const screenMode = ref("pi pi-moon");
const toggleColorScheme = () => {
    const element = document.querySelector('html');
    element.classList.toggle('my-app-dark');
    screenMode.value = screenMode.value == "pi pi-sun"? "pi pi-moon" : "pi pi-sun";
}
const Loader = ref(true);

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
/// Filter Spectrum
//Seteeamos la dinamica de los distintos filtros
//Global corresponde corresponde al filtro del buscador superior y podriamos dinamizarlo en base a un array de titulos de columnas
//El resto cada uno tiene un modo que se le puede establecer y a su podemos predefinir un prefiltro en caso de ser necesario
const filters = ref();
const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    titulo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    estado: { value: null, matchMode: FilterMatchMode.IN },
    balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    riesgo: { value: null, matchMode: FilterMatchMode.IN },
    tomador: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    fecha_creacion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    fecha_cierre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    aseguradora: { value: null, matchMode: FilterMatchMode.IN },
    aviso: { value: null, matchMode: FilterMatchMode.EQUALS }
  };
};
const clearFilter = () => {
  initFilters();
  localFilterValue.value = null
};

initFilters();
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
const onFilter = (event) => {
  filteredProducts.value = toRaw(event.filteredValue);
  animateNumber();
}
const localFilterValue = ref(filters.value.global.value);
const updateFilter = debounce((value) => {
      filters.value.global.value = value;
    }, 5000);
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
};

const showLogsTable = (data) => {
  logs.value = data.id_pedido;
  visible.value = true;
};

/// Data Gathering
const MainTableRows = ref();
const products = ref(new Array(5));
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
const representatives = ref();

const updateRepresentatives = (data) => {
  const newRepresentatives = {
    estado: [],
    riesgo: [], // Assuming 'riesgo' is in your objects, you can adjust if necessary
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
  });

  // Sorting the arrays (optional)
  newRepresentatives.estado.sort();
  newRepresentatives.aseguradora.sort();
  newRepresentatives.riesgo.sort();
  return newRepresentatives;
};

const startingNumber = ref(0); // Valor inicial
//const formattedAmount = ref(formatCurrency(startingNumber.value)); // Número formateado

const animateNumber = () => {
  startingNumber.value = 0;
  const duration = 4000; // Duración total de la animación en milisegundos
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Progreso entre 0 y 1
    startingNumber.value = Math.floor(progress * filteredProductsCount.value);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const filteredProductsCount = computed(() => {
  if (Loader.value != true) {
    return filteredProducts.value ? filteredProducts.value.length : 0;
  } else {
    return 0;
  }
});
const totalBalanceAmount = computed(() =>{
  if (Loader.value != true) {
    return filteredProducts.value != undefined ? getPrimaAsegurada(filteredProducts.value) : 0;
  } else {
    return parseFloat(0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }
});

/// Starting functions
onMounted(async () => {
  if (produ) {
    MainTableRows.value = await fetchData("http://localhost:3000/api/mainTable/");
  } else {
    const { mainTable } = await import('@/assets/data2.mjs');
    MainTableRows.value = mainTable;
  }
  setTimeout(() => {
    products.value = formatData(MainTableRows.value)
    Loader.value = false;
    animateNumber()
  }, 1000);
});
</script>

<template>
  <main class="main_selector">
    <div class="card">
        <DataTable v-model:filters="filters"
        :globalFilterFields="['titulo', 'riesgo', 'estado', 'tomador']" filterDisplay="menu"
        :value="products" sortField="estado" :sortOrder="1" stripedRows paginator :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" :expandedRows="expandedRows"
        dataKey="id_cotizacion" @filter="onFilter" scrollable scrollHeight="400px" stateStorage="session" stateKey="dt-state-demo-session">
        <template #header>
          
          <div class="flex justify-between">
            <Button type="button" :icon="screenMode" @click="toggleColorScheme()" />
            <div class="flex justify-end gap-4">
            <Button type="button" icon="pi pi-trash" label="Limpiar" pt:root:class="border border-solid" outlined @click="clearFilter()" />
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
            <template v-if="Loader">
              <Skeleton></Skeleton>
            </template>
            <template v-else>
              <template v-if="col.field == 'acciones'">
              <ButtonGroup>
                <Button icon="pi pi-times" :pt="{ root: { class: 'my-custom-button' } }" aria-label="Cancel" size="small"
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
            </template>
          </div>
          </template>
          <!-- Podriamos reversionar la primer columna de todas las tablas para hacer universal este setup de filters -->
          <template v-if="col.field == 'titulo'" #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" :placeholder="`Buscar por ${col.header}`" />
          </template>
          <template v-if="col.field == 'tomador'" #filter="{ filterModel }">
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
            <MultiSelect v-model="filterModel.value" :options="representatives[col.field]" :selectedItemsLabel="'{0} opciones elegidas' " :maxSelectedLabels="2" class="w-60" placeholder="Todos">
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
            <ExpansionTable :id_record="slotProps.data.id_cotizacion" :produ="produ" @showLogsTable="showLogsTable"></ExpansionTable>
          </div>
        </template>
        <template #footer> Numero de registros: {{ startingNumber }}. Prima asegurada por {{ totalBalanceAmount }} </template>
      </DataTable>
      <Dialog v-model:visible="visible" maximizable modal header="Historial de logs asociados" :style="{ width: '50rem' }" dismissableMask>
        <InfoTable v-if="visible" :id_record="logs" :produ="produ"</InfoTable>
      </Dialog>
    </div>
  </main>

</template>

<style>
.my-custom-button {
  background-color: #1e3a8a; /* Green background */
  border: 1px solid #1e3a8a; /* Tomato border */
  color: #cbd5e1; /* White text */
}
</style>