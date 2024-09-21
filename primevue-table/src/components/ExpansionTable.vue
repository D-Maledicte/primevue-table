<script setup>
import { ref, onMounted, watch, toRaw, computed, onBeforeUnmount } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { fetchData, formatDateString, formatDateForDisplay, filters_distinction, getSeveritySecondary, areObjectsEqual } from "./services/formatFunctions.mjs";
const props = defineProps({
  id_record: {
    type: String, // o el tipo de dato correcto
    required: true,
  },
  produ: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['showLogsTable']);
const emitShowLogsTable = (data) => {
  emit('showLogsTable', data); // Emitimos el evento con los datos que queremos pasar al padre
};

const Loader = ref(true);
const initialized = ref(false);
const secondaryFormatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fecha_bloqueo: formatDateString(item.fecha_bloqueo),
      fecha_cot_esp: formatDateString(item.fecha_cot_esp),
      aviso: item.estado == "A la espera de informacion" ? true : false
    };
  });
  secondaryRepresentatives.value = updateSecondaryRepresentatives(newData);
  return newData
};
const applyFilterMultiSelect = (field) => {
  setTimeout(() => {
    // Asegurarse de que la referencia existe antes de llamar a .hide()
    MultiSelectReferences.value[field].hide(); // Oculta el popover después de un pequeño retraso
  }, 100);
};

const filterByCotizacion = (id_cotizacion, data) => {
  const secondaryRows = toRaw(data);
  var filteredSecondaryTableRows = secondaryRows.filter(row => row.id_cotizacion == id_cotizacion);

  return secondaryFormatData(filteredSecondaryTableRows)
};
const filters = ref();
const secondaryfilteredProducts = ref();
watch(secondaryfilteredProducts, (newValue, oldValue) => {
  if (initialized.value) {
    if (areObjectsEqual(newValue, oldValue) == false) {
      animateNumber();
    }
  }
});
const initSecondaryFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    aseguradora: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    estado: { value: null, matchMode: FilterMatchMode.IN },
    fecha_bloqueo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    fecha_cot_esp: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    aviso: { value: null, matchMode: FilterMatchMode.EQUALS }
  };
};

const clearSecondaryFilter = () => {
  initSecondaryFilters();
  localFilterValue.value = null;
  dt.value.d_sortField = null;
  dt.value.d_sortOrder = null;
};
initSecondaryFilters();
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
const onFilter = (event) => {
  secondaryfilteredProducts.value = toRaw(event.filteredValue);
}
const localFilterValue = ref(filters.value.global.value);
const updateFilter = debounce((value) => {
  filters.value.global.value = value;
}, 1000);
watch(localFilterValue, (newValue) => {
  updateFilter(newValue);
});


const procesarSecondaryOperacion = (target) => {
  let aseguradora = target.aseguradora;
  let estado = target.estado;
  let fecha_bloqueo = formatDateForDisplay(target.fecha_bloqueo);
  let fecha_cot_esp = formatDateForDisplay(target.fecha_cot_esp);
  //let aviso = target.aviso;
  let query = "Aseguradora: " + aseguradora + ", " + "Estado: " + estado + ", " + "Fecha de bloqueo: " + fecha_bloqueo + ", " + "Cierre Estimado: " + fecha_cot_esp
  window.open('https://search.brave.com/search?q=' + query + '&source=desktop', '_blank');
};
const products = ref(new Array(1));
const SecondaryTableRows = ref();
const MultiSelectReferences = ref({});
const secondaryColumns = [
  { field: 'aseguradora', header: 'Aseguradora' },
  { field: 'estado', header: 'Estado' },
  { field: 'fecha_bloqueo', header: 'Fecha de Bloqueo' },
  { field: 'fecha_cot_esp', header: 'Cierre Estimado' },
  { field: 'aviso', header: 'Aviso' },
  { field: 'acciones', header: 'Acciones' }
];
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

//const finalAmount = ref(0); // Valor final al que deseas llegar
const startingNumber = ref(0); // Valor inicial
//const formattedAmount = ref(formatCurrency(startingNumber.value)); // Número formateado

const animateNumber = () => {
  const duration = 2000; // Duración total de la animación en milisegundos
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
    return secondaryfilteredProducts.value ? secondaryfilteredProducts.value.length : 0;
  } else {
    return 0;
  }
});

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

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const showLabel = ref(false);
const checkWindowSize = () => {
  showLabel.value = window.innerWidth >= 1024; // Mostrar el label solo si el ancho es mayor o igual a 768px (md)
};

const items = [
    {
        label: 'Responder pedido',
        icon: 'pi pi-send',
        command: (data) => {
          procesarSecondaryOperacion(data);
        }
    },
    {
        label: 'Dar de alta',
        icon: 'pi pi-check',
        command: (data) => {
          procesarSecondaryOperacion(data);
        }
    }
];


onMounted(async () => {
  if (props.produ) {
    SecondaryTableRows.value = await fetchData("http://localhost:3000/api/secondaryTable/" + props.id_record);
    SecondaryTableRows.value = secondaryFormatData(SecondaryTableRows.value);
  } else {
    const { secondaryTable } = await import('@/assets/dataset.mjs');
    SecondaryTableRows.value = filterByCotizacion(props.id_record, secondaryTable);
  }
  animateNumber();
  setTimeout(() => {
    products.value = SecondaryTableRows.value;
    Loader.value = false;

    animateNumber(); // Ajusta el tiempo según sea necesario
  }, 1000);
  initialized.value = true;
  checkWindowSize(); // Ejecutar en montaje para inicializar
  window.addEventListener('resize', checkWindowSize); // Escuchar cambios de tamaño de pantalla
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWindowSize); // Limpiar el listener en caso de desmontar
});
/*
<div class="flex md:flex-row lg:justify-between lg:gap-4 gap-2 w-full">
        <div class="flex flex-row md:justify-end justify-center md:gap-4 gap-2">
          <div class="flex justify-center">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value"
                :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" placeholder="Busqueda general" />
            </IconField>
          </div>
          <Button type="button" icon="pi pi-trash" label="Limpiar"
            :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" outlined
            @click="clearSecondaryFilter()" v-tooltip.bottom="'Limpiar filtro'" />

        </div>
        <div class="flex flex-row gap-2 md:justify-normal justify-center md:m-0 mx-4">
          <Button icon="pi pi-file-excel" label="Exportar a CSV" :pt="{ root: { class: 'my-custom-button-secondary' } }"
            @click="exportCSV($event)" v-tooltip.bottom="'Exportar tabla como CSV'" />
        </div>
      </div>
      // Botonera original
      <ButtonGroup class="flex gap-px">
              <Button icon="pi pi-info-circle" :pt="{ root: { class: 'my-custom-button-secondary' } }"
                size="small" v-tooltip.bottom="'Mas info'" @click="emitShowLogsTable(data)" />
              <Button icon="pi pi-send" :pt="{ root: { class: 'my-custom-button-secondary' } }"
                size="small" v-tooltip.bottom="'Responder pedido'" @click="procesarSecondaryOperacion(data)" />
              <Button icon="pi pi-check" :pt="{ root: { class: 'my-custom-button-secondary' } }"
                size="small" v-tooltip.bottom="'Dar de alta'" @click="procesarSecondaryOperacion(data)" />
      </ButtonGroup>
*/
</script>

<template>
  <DataTable v-model:filters="filters" :globalFilterFields="['estado', 'aseguradora']" filterDisplay="menu"
    :value="products" @filter="onFilter" tableStyle="min-width: 50rem" ref="dt" stripedRows paginator :rows="5"
    :rowsPerPageOptions="[5, 10, 20, 50]">
    <template #header>
      <div class="grid grid-cols-8 gap-2 md:gap-2 w-full">
        <div class="col-start-1 justify-self-center sm:justify-self-start lg:col-span-2 md:col-span-3 sm:col-span-3 col-span-2 flex justify-center lg:justify-start">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value"
                :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" placeholder="Busqueda general" />
            </IconField>
        </div>
        <div class="col-start-1 justify-self-center xl:justify-self-end sm:justify-self-start 2xl:col-start-7 xl:col-start-6 lg:col-start-5 md:col-start-4 sm:col-start-4 lg:col-span-2 md:col-span-1 sm:col-span-1 col-span-2 sm:gap-2 gap-4 sm:order-none -order-1 flex md:justify-end justify-center">
          <Button icon="pi pi-file-excel" :label="showLabel ? 'Exportar a CSV' : ''" :pt="{ root: { class: 'my-custom-button-secondary' } }"
            @click="exportCSV($event)" v-tooltip.bottom="'Exportar tabla como CSV'" />
          <Button type="button" icon="pi pi-trash" :label="showLabel ? 'Limpiar' : ''"
            :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" outlined
            @click="clearSecondaryFilter()" v-tooltip.bottom="'Limpiar filtro'" />
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
    <template #loading> Cargando Información </template>
    <Column v-for="col of secondaryColumns" :sortable="col.field != 'aviso' && col.field != 'acciones' ? true : false"
      :key="col.id_pedido" :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)">
      <template #filtericon>
        <i class="pi pi-filter" v-tooltip.bottom="'Opciones de filtrado'" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <i :class="sortIcons(sorted, sortOrder)" v-tooltip.bottom="'Ordenar resultados'" />
      </template>
      <template #body="{ data }">
        <template v-if="Loader">
          <Skeleton></Skeleton>
        </template>
        <template v-else>
          <template v-if="col.field == 'acciones'">
            <SplitButton :pt="{ root: { class: 'my-custom-button-secondary' } }" label="Mas info" icon="pi pi-info-circle" @click="emitShowLogsTable(data)" :model="items" size="small" v-tooltip.bottom="'Mas info'"/>
          </template>
          <template v-else-if="col.field == 'aviso'">
            <div class="flex justify-center align-center w-full h-4/5">
              <i class="pi"
                :class="{ 'pi-check-circle text-red-500 ': data[col.field], 'pi-circle': !data[col.field] }"></i>
            </div>
          </template>
          <template v-else-if="col.field == 'estado'">
            <div class="flex justify-center align-center w-full h-4/5">
              <Tag :value="data[col.field]" class="2xl:w-8/12 w-full h-1/5 text-nowrap"
                v-bind="getSeveritySecondary(data[col.field]) == null ? { class: 'severity-null' } : { severity: getSeveritySecondary(data[col.field]) }">
              </Tag>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-center align-center w-full h-4/5">
              <p class="w-full h-1/5 font-semibold text-center">
                {{ col.field == "fecha_bloqueo" || col.field == 'fecha_cot_esp' ? formatDateForDisplay(data[col.field])
                  :
                  data[col.field] }}
              </p>
            </div>
          </template>
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
          <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary />
        </div>
      </template>
      <template v-else-if="col.field != 'acciones'" #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :ref="(el) => MultiSelectReferences[col.field] = el" :options="secondaryRepresentatives[col.field]"
          :selectedItemsLabel="'{0} opciones elegidas'" :maxSelectedLabels="2" class="w-60" placeholder="Todos">
          <template #option="slotProps">
            <template v-if="col.field == 'estado'">
              <div class="flex items-center gap-2">
                <Tag :value="slotProps.option"
                  v-bind="getSeveritySecondary(slotProps.option) == null ? { class: 'severity-null' } : { severity: getSeveritySecondary(slotProps.option) }">
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
    <template #footer>
      <div class="flex flex-start gap-2">
        <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-secondary' } }">
        </Tag>
      </div>
    </template>
  </DataTable>
</template>

<style scoped>
.my-custom-button-secondary {
  background-color: #2563eb !important;
  /* Green background */
  border: 1px solid #2563eb !important;
  /* Tomato border */
  color: #e2e8f0 !important;
  /* White text */
}

.my-custom-button-secondary-no-background {
  /* background-color: #2563eb !important;  Green background */
  border: 1px solid #2563eb !important;
  /* Tomato border */
  color: #1d4ed8 !important;
  /* White text */
}

.severity-null {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}
</style>