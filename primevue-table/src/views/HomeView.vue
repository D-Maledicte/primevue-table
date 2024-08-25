<script setup>
import { ref, onMounted, watch, toRaw, computed} from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import {fetchData, formatDateString, formatDateForDisplay, formatCurrency, filters_distinction,getPrimaAsegurada, getPrimaAseguradaNonCurrency } from "../components/services/formatFunctions.mjs"
import ExpansionTable from '@/components/ExpansionTable.vue';
//import { mainTable, secondaryTable, infoTable } from '@/assets/data2.mjs';
import InfoTable from '@/components/InfoTable.vue';
///Main deploy segmentation
const produ = false;
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
  animateCurrency();
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
  const duration = 1000; // Duración total de la animación en milisegundos
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

const startingCurrency = ref(0);
const totalBalanceAmount = computed(() => {
  if (Loader.value != true) {
    return filteredProducts.value != undefined ? getPrimaAseguradaNonCurrency(filteredProducts.value) : 0;
  } else {
    return 0;
  }
});

// Computed property para actualizar el formato de moneda automáticamente
const formattedCurrency = computed(() => {
  return startingCurrency.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
});

const animateCurrency = () => {
  startingCurrency.value = 0; // Reinicia el valor inicial
  const duration = 1000; // Duración total de la animación en milisegundos
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Progreso entre 0 y 1
    startingCurrency.value = Math.floor(progress * totalBalanceAmount.value); // Actualiza el valor de `startingCurrency`

    if (progress < 1) {
      requestAnimationFrame(update); // Continua la animación
    }
  };

  requestAnimationFrame(update); // Inicia la animación
};

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

const getSortIcon = (sorted, sortOrder) => {
  if (sorted == null) {
    return 'pi pi-sort-alt';
  } else {
    if (sortOrder == -1) {
      return 'pi pi-sort-amount-up';
    } else if (sortOrder == 0) {
      return 'pi pi-sort-alt';
    } 
    else {
      return 'pi pi-sort-amount-down';
    }
  }
};

const getExpandIcon = (id) => {
  const checkProp = id in expandedRows.value;
  if (checkProp) {
    return 'pi pi-minus';
  } else {
      return 'pi pi-plus';
  }
};

const onExpandRow = (id) => {
  const checkProp = id in expandedRows.value;
  if (checkProp) {
    delete expandedRows.value[id];
  } else {
    expandedRows.value[id] = true;
  }
  expandedRows.value = { ...expandedRows.value }; // Esto asegura la reactividad
}

/*
const totalBalanceAmount = computed(() =>{
  if (Loader.value != true) {
    return filteredProducts.value != undefined ? getPrimaAsegurada(filteredProducts.value) : 0;
  } else {
    return parseFloat(0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }
});
*/
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
    animateCurrency()
  }, 1000);
});
</script>

<template>
  <main class="main_selector">
    <div class="mt-6 card border-2 border-blue-800">
        <DataTable v-model:filters="filters"
        :globalFilterFields="['titulo', 'riesgo', 'estado', 'tomador']" filterDisplay="menu"
        :value="products" stripedRows paginator :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" ref="dt" :expandedRows="expandedRows"
        @filter="onFilter" scrollable scrollHeight="400px" dataKey="id_cotizacion" stateStorage="session" stateKey="dt-state-demo-session">
        <template #header>
          <div class="flex justify-between">
            <div class="flex gap-2">
              <Button type="button" :icon="screenMode" :pt="{ root: { class: 'my-custom-button-main' } }" @click="toggleColorScheme()" />
              <Button icon="pi pi-file-excel" label="Exportar a CSV" v-tooltip.bottom="'Exportar tabla como CSV'" :pt="{ root: { class: 'my-custom-button-main' } }" @click="exportCSV($event)" />
            </div>
            <div class="flex justify-end gap-4">
            <Button type="button" icon="pi pi-trash" label="Limpiar" v-tooltip.bottom="'Limpiar filtro'" :pt="{ root: { class: 'my-custom-button-main-no-background' } }" outlined @click="clearFilter()" />
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
        <Column v-if="Loader == false" style="width: 5rem">
          <template #body="slotProps">
                <div class="flex flex-center items-center justify-center w-full">
                  <Button :icon="getExpandIcon(slotProps.data.id_cotizacion)" :pt="{ root: { class: 'my-custom-button-main-no-background-no-border' } }" text rounded aria-label="Expand" @click.stop="onExpandRow(slotProps.data.id_cotizacion)"/>
                </div>
          </template>
        </Column>
        <Column v-for="col of mainColumns" :sortable="col.field != 'acciones' ? true : false"
          :key="col.id_cotizacion" :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)" >
          <template #filtericon>
                <i class="pi pi-filter" v-tooltip.bottom="'Opciones de filtrado'"/>
          </template>
          <template #sorticon="{ sorted, sortOrder }">
                <i :class="getSortIcon(sorted, sortOrder)" v-tooltip.bottom="'Ordenar resultados'"/>
          </template>
          
          <template #body="{ data }">
            <div class="flex justify-center align-center">
            <template v-if="Loader">
              <Skeleton></Skeleton>
            </template>
            <template v-else>
              <template v-if="col.field == 'acciones'">
              <ButtonGroup>
                <Button icon="pi pi-times"  aria-label="Cancel" size="small" :pt="{ root: { class: 'my-custom-button-main' } }" v-tooltip.bottom="'Cerrar cotizacion'" @click="procesarOperacion(data)"/>
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
            #filter="{ filterModel }" >
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
        <template #footer>
          <div class="flex flex-start gap-2">
          <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-main' } }"></Tag>
          <Tag :value="`Prima asegurada por: ${formattedCurrency}`" :pt="{ root: { class: 'my-custom-button-main' } }"></Tag>
          </div>
        </template>
      </DataTable>
      <Dialog v-model:visible="visible" maximizable modal :style="{ width: '50rem' }" dismissableMask pt:root:class="!border-0 ">
        <template #container="{ closeCallback, maximizeCallback}">
          <div class="flex flex-col px-8 py-8 gap-6 rounded-2xl overflow-auto">
            <InfoTable v-if="visible" :id_record="logs" :produ="produ" @closeCallbackDialog="closeCallback" @maximizeCallbackDialog="maximizeCallback"/>
          </div>
        </template>
      </Dialog>
    </div>
  </main>

</template>

<style>
.my-custom-button-main {
  background-color: #1e40af !important; /* Green background */
  border: 1px solid #1e40af !important; /* Tomato border */
  color: #e2e8f0 !important; /* White text */
}

.my-custom-button-main-no-background {
  /* background-color: #1e40af !important;  Green background */
  border: 1px solid #1e40af !important; /* Tomato border */
  color: #1e40af !important; /* White text */
}

.my-custom-button-main-no-background-no-color {
  /* background-color: #1e40af !important;  Green background */
  /* border: 1px solid #1e40af !important;  Tomato border */
  color: #1e40af !important; /* White text */
}

.my-custom-button-main-no-background-no-border {
  /* background-color: #1e40af !important;  Green background */
  /* border: 1px solid #1e40af !important;  Tomato border */
  color: #1e40af !important; /* White text */
}
</style>