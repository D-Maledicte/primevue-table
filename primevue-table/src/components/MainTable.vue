<script setup>
import { ref, onMounted, watch, toRaw, computed, onBeforeUnmount } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { formatDateForDisplay, formatCurrency, filters_distinction, getSeverityMain, getPrimaAseguradaNonCurrency, areObjectsEqual } from "../components/services/formatFunctions.mjs"
import { useMainTableDataStore } from '@/stores/mainTableData';
import ExpansionTable from '@/components/ExpansionTable.vue';
import InfoTable from '@/components/InfoTable.vue';
const props = defineProps({
  produ: {
    type: Boolean,
    required: true
  }
});
const mainTableDataStore = useMainTableDataStore();
const MultiSelectReferences = ref({});
/// Visual effects
const Loader = ref(true);
const dialogState = ref();
const dialogMaximize = (event) => {
  dialogState.value.maximize(event);
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
  dt.value.d_sortField = null
  dt.value.d_sortOrder = null
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

}
const localFilterValue = ref(filters.value.global.value);
const updateFilter = debounce((value) => {
  filters.value.global.value = value;
}, 1000);
watch(localFilterValue, (newValue) => {
  updateFilter(newValue);
});

const applyFilterMultiSelect = (field) => {
  setTimeout(() => {
    // Asegurarse de que la referencia existe antes de llamar a .hide()
    MultiSelectReferences.value[field].hide(); // Oculta el popover después de un pequeño retraso
  }, 100);
};
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
  const screenWidth = ref(window.innerWidth);
  if (screenWidth.value <= 1081) {
    dialogMaximize();
  }
};

/// Data Gathering
const initialized = ref(false);

const products = ref(new Array(5));
const filteredProducts = ref();
watch(filteredProducts, (newValue, oldValue) => {
  if (initialized.value) {
    if (areObjectsEqual(newValue, oldValue) == false) {
      animateNumber();
      animateCurrency();
    }
  }
});
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
  const duration = 2000; // Duración total de la animación en milisegundos
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Progreso entre 0 y 1
    startingCurrency.value = progress * totalBalanceAmount.value; // Actualiza el valor de `startingCurrency`

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

const sortIcons = computed(() => {
  return (sorted, sortOrder) => {
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
  }
})
const expandIcons = computed(() => {
  return (id) => expandedRows.value[id] ? 'pi pi-minus' : 'pi pi-plus';
});

const expandTooltip = computed(() => {
  return (id) => expandedRows.value[id] ? 'Contraer' : 'Desplegar';
});

const onExpandRow = (id) => {
  const checkProp = id in expandedRows.value;
  if (checkProp) {
    delete expandedRows.value[id];
  } else {
    expandedRows.value[id] = true;
  }
  expandedRows.value = { ...expandedRows.value }; // Esto asegura la reactividad
};

const showLabel = ref(false);
const checkWindowSize = () => {
  showLabel.value = window.innerWidth >= 768; // Mostrar el label solo si el ancho es mayor o igual a 768px (md)
};
/// Starting functions
onMounted(async () => {
  setTimeout(() => {
    products.value = mainTableDataStore.mainTableDataArray;
    representatives.value = updateRepresentatives(mainTableDataStore.mainTableDataArray);
    //products.value = formatData(MainTableRows.value)
    Loader.value = false;
    animateNumber()
    animateCurrency()
  }, 1000);
  initialized.value = true;
  checkWindowSize(); // Ejecutar en montaje para inicializar
  window.addEventListener('resize', checkWindowSize); // Escuchar cambios de tamaño de pantalla
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWindowSize); // Limpiar el listener en caso de desmontar
});
/*
<div class="grid grid-cols-8 md:gap-1 gap-4 w-full">
          <div class="sm:col-start-1 sm:col-end-3 sm:justify-self-start sm:justify-start col-start-5 col-end-9 justify-self-center w-full flex justify-center text-xs">
            <Button icon="pi pi-file-excel" label="Exportar a CSV" v-tooltip.right="'Exportar tabla como CSV'"
              :pt="{ root: { class: 'my-custom-button-main' } }" @click="exportCSV($event)" class="w-40 h-11"/>
          </div>
          <div class="2xl:col-start-7 2xl:col-end-7 xl:col-start-6 xl:col-end-6 lg:col-start-5 lg:col-end-5 md:col-start-4 md:col-end-6 sm:col-start-3 sm:col-end-5 sm:justify-self-start sm:order-none col-start-1 col-end-5 justify-self-start w-full flex justify-center text-xs -order-1">
            <Button type="button" icon="pi pi-trash" label="Limpiar" v-tooltip.bottom="'Limpiar filtro'"
              :pt="{ root: { class: 'my-custom-button-main-no-background' } }" outlined @click="clearFilter()" class="w-30 h-11"/>
            
          </div>
          <div class="2xl:col-start-8 2xl:col-end-8 xl:col-start-8 xl:col-end-8 lg:col-start-8 lg:col-end-8 md:col-start-8 sm:col-start-5 sm:col-end-8 md:justify-self-end sm:justify-self-start col-start-2 justify-self-start">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="localFilterValue" placeholder="Busqueda general" class="h-11" />
              </IconField>
            </div>
        </div>
*/
</script>
<template>
  <div class="w-full flex justify-center">
    <DataTable v-model:filters="filters" :globalFilterFields="['titulo', 'riesgo', 'estado', 'tomador']"
      filterDisplay="menu" :value="products" stripedRows paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
      size="small" class="w-11/12" ref="dt" :expandedRows="expandedRows" @filter="onFilter" scrollable
      scrollHeight="590px" dataKey="id_cotizacion" stateStorage="session" stateKey="dt-state-mainTable-session">
      <template #header>
        <div class="grid grid-cols-8 gap-2 md:gap-2 w-full">
          <!-- Primera fila: Exportar a CSV y Limpiar en pantallas pequeñas y medianas -->
          <div
            class="xl:col-span-2 lg:col-span-3 md:col-span-5 sm:col-span-2 col-span-8 flex sm:gap-2 gap-4 md:justify-start justify-center">
            <Button icon="pi pi-file-excel" :label="showLabel ? 'Exportar a CSV' : ''"
              v-tooltip.right="'Exportar tabla como CSV'" :pt="{ root: { class: 'my-custom-button-main' } }"
              @click="exportCSV($event)" class="md:w-40 w-full h-11" />
            <Button type="button" icon="pi pi-trash" :label="showLabel ? 'Limpiar' : ''"
              v-tooltip.bottom="'Limpiar filtro'" :pt="{ root: { class: 'my-custom-button-main-no-background' } }"
              outlined @click="clearFilter()" class="md:w-24 w-full h-11" />
          </div>
          <!-- Input de Búsqueda General (se pone en la segunda fila en pantallas pequeñas) -->
          <div
            class="lg:col-start-7 lg:col-span-2 md:col-start-6 md:col-span-3 md:justify-self-end sm:col-start-6 sm:col-span-3 col-span-8 justify-self-center flex justify-center lg:justify-end">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="localFilterValue" placeholder="Busqueda general" class="h-11 w-full lg:w-64" />
            </IconField>
          </div>
        </div>

      </template>
      <template #empty>
        <div class="flex flex-col justify-center content-center items-center w-full">

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="140" height="140" fill="#8FA3AD">
            <!-- Fondo -->
            <rect x="8" y="12" width="48" height="40" rx="4" ry="4" fill="#DAE3E7" stroke="#8FA3AD" stroke-width="2" />
            <!-- Cara triste -->
            <circle cx="24" cy="30" r="2" fill="#8FA3AD" />
            <circle cx="40" cy="30" r="2" fill="#8FA3AD" />
            <path d="M28,38 C28,36 36,36 36,38" stroke="#8FA3AD" stroke-width="2" fill="none" />
            <!-- Lupa -->
            <circle cx="44" cy="44" r="10" stroke="#8FA3AD" stroke-width="2" fill="none" />
            <line x1="50" y1="50" x2="60" y2="60" stroke="#8FA3AD" stroke-width="2" />
            <!-- Papel doblado -->
            <path d="M40 12 H48 V20" fill="#FFF" stroke="#8FA3AD" stroke-width="2" />
          </svg>
          <p class="font-normal text-gray-500">No hay registros que coincidan con la búsqueda</p>
        </div>

      </template>
      <!-- <template #loading> Cargando Información </template> -->
      <Column style="width: 4rem">
        <template #body="slotProps">
          <template v-if="Loader">
            <Skeleton></Skeleton>
          </template>
          <template v-else>
            <div class="flex flex-center items-center justify-center w-full">
              <Button :icon="expandIcons(slotProps.data.id_cotizacion)"
                :pt="{ root: { class: 'my-custom-button-main-no-background-no-border' } }" text rounded
                aria-label="Expand" @click.stop="onExpandRow(slotProps.data.id_cotizacion)"
                v-tooltip.right="expandTooltip(slotProps.data.id_cotizacion)" />
            </div>
          </template>
        </template>
      </Column>
      <Column v-for="col of mainColumns" :sortable="col.field != 'acciones' ? true : false" :key="col.id_cotizacion"
        :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)" style="max-width: 15rem;">
        <template #filtericon>
          <i class="pi pi-filter" v-tooltip.bottom="'Opciones de filtrado'" />
        </template>
        <template #sorticon="{ sorted, sortOrder }">
          <i :class="sortIcons(sorted, sortOrder)" v-tooltip.bottom="'Ordenar resultados'" />
        </template>

        <template #body="{ data }">
          <div class="flex justify-center align-center">
            <template v-if="Loader">
              <Skeleton></Skeleton>
            </template>
            <template v-else>
              <template v-if="col.field == 'acciones'">
                <ButtonGroup>
                  <Button icon="pi pi-times" aria-label="Cancel" size="small"
                    :pt="{ root: { class: 'my-custom-button-main' } }" v-tooltip.bottom="'Cerrar cotizacion'"
                    @click="procesarOperacion(data)" />
                </ButtonGroup>
              </template>
              <template v-else-if="col.field == 'balance'">
                <div class="flex justify-center align-center w-full h-4/5">
                  <p class="w-11/12 h-1/5 text-md font-semibold text-left">
                    {{ formatCurrency(data.balance) }}
                  </p>
                </div>
              </template>
              <template v-else-if="col.field == 'estado'">
                <div class="flex justify-center align-center w-full h-4/5">
                  <Tag :value="data[col.field]" class="w-11/12 h-1/5 text-nowrap"
                    v-bind="getSeverityMain(data[col.field]) == null ? { class: 'severity-null' } : { severity: getSeverityMain(data[col.field]) }">
                  </Tag>
                </div>
              </template>
              <template v-else>
                <div class="flex justify-center align-center w-full h-4/5">
                  <p class="w-11/12 h-1/5 text-md font-semibold text-left">
                    {{ col.field.includes('fecha') ? formatDateForDisplay(data[col.field]) :
                      data[col.field] }}
                  </p>
                </div>
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
          <InputNumber v-model="filterModel.value" mode="currency" currency="ARS" locale="es-AR"
            placeholder="$9.999,99" />
        </template>
        <template v-else-if="col.field != 'acciones'" #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :ref="(el) => MultiSelectReferences[col.field] = el"
            :options="representatives[col.field]" :selectedItemsLabel="'{0} opciones elegidas'" :maxSelectedLabels="2"
            class="w-60" placeholder="Todos">
            <template #option="slotProps">
              <template v-if="col.field == 'estado'">
                <div class="flex items-center gap-2">
                  <Tag :value="slotProps.option"
                    v-bind="getSeverityMain(slotProps.option) == null ? { class: 'severity-null' } : { severity: getSeverityMain(slotProps.option) }">
                  </Tag>
                </div>
              </template>
              <template v-else>
                <span>{{ slotProps.option }}</span>
              </template>
            </template>
            <template #footer>
              <div class="flex items-end justify-end gap-6">
                <Button icon="pi pi-trash" text rounded aria-label="Confirm" @click="filterModel.value = null"
                  v-tooltip.bottom="'Borrar selección'"></Button>
                <Button icon="pi pi-check-square" text rounded aria-label="Confirm"
                  @click="applyFilterMultiSelect(col.field)" v-tooltip.bottom="'Confirmar selección'"></Button>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-2">
          <ExpansionTable :id_record="slotProps.data.id_cotizacion" :produ="props.produ" @showLogsTable="showLogsTable">
          </ExpansionTable>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-start gap-2">
          <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-main' } }">
          </Tag>
          <Tag :value="`Prima asegurada por: ${formattedCurrency}`" :pt="{ root: { class: 'my-custom-button-main' } }">
          </Tag>
        </div>
      </template>
    </DataTable>
  </div>
  <Dialog v-model:visible="visible" ref="dialogState" maximizable modal class="w-2/5 h-4/5" dismissableMask
    pt:root:class="!border-0 ">
    <template #container="{ closeCallback, maximizeCallback }">
      <div class="flex flex-col px-4 py-4 gap-6 rounded-lg info-table-container">
        <InfoTable v-if="visible" :id_record="logs" :produ="props.produ" @closeCallbackDialog="closeCallback"
          @maximizeCallbackDialog="maximizeCallback" />
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.my-custom-button-main {
  background-color: #1e40af !important;
  /* Green background */
  border: 1px solid #1e40af !important;
  /* Tomato border */
  color: #e2e8f0 !important;
  /* White text */
}

.my-custom-button-main-no-background {
  /* background-color: #1e40af !important;  Green background */
  border: 1px solid #1e40af !important;
  /* Tomato border */
  color: #1e40af !important;
  /* White text */
}

.my-custom-button-main-no-background-no-color {
  /* background-color: #1e40af !important;  Green background */
  /* border: 1px solid #1e40af !important;  Tomato border */
  color: #1e40af !important;
  /* White text */
}

.my-custom-button-main-no-background-no-border {
  /* background-color: #1e40af !important;  Green background */
  /* border: 1px solid #1e40af !important;  Tomato border */
  color: #1e40af !important;
  /* White text */
}

.severity-null {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}

.info-table-container {
  scrollbar-gutter: stable both-edges;
  overflow: overlay;
}

/* Estilos para navegadores basados en WebKit/Blink (Chrome, Brave, Edge, Safari) */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
</style>