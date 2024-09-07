<script setup>
import { ref, onMounted, watch, toRaw, computed, onBeforeUnmount } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { fetchData, formatDateString, formatDateForDisplay, filters_distinction_clients, areObjectsEqual } from "./services/formatFunctions.mjs";
const props = defineProps({
  produ: {
    type: Boolean,
    required: true
  }
});
const Loader = ref(true);
const initialized = ref(false);
const visible = ref(false);
const detailedInfo = ref();
const showDetailedInfo = (data) => {
  console.log(data);

  detailedInfo.value = data;
  visible.value = true;
};

const clientsFormatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fechaDeNacimiento: formatDateString(item.fechaDeNacimiento),
      telefono: item.telefono.replace("+", "")
    };
  });
  return newData
};

const ClientsTableRows = ref();
const ClientsColumns = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'apellido', header: 'Apellido' },
  { field: 'dni', header: 'DNI / Cuil' },
  { field: 'telefono', header: 'Telefono' },
  { field: 'email', header: 'Email' },
  { field: 'acciones', header: 'Acciones' }
];

const filters = ref();
const clientsfilteredProducts = ref();
watch(clientsfilteredProducts, (newValue, oldValue) => {
  if (initialized.value) {
    if (areObjectsEqual(newValue, oldValue) == false) {
      animateNumber();
    }
  }
});
const initClientsFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    apellido: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    dni: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    telefono: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  };
};

const clearClientsFilter = () => {
  initClientsFilters();
  localFilterValue.value = null
  dt.value.d_sortField = null
  dt.value.d_sortOrder = null
};
initClientsFilters();
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
const onFilter = (event) => {
  clientsfilteredProducts.value = toRaw(event.filteredValue);
}
const localFilterValue = ref(filters.value.global.value);
const updateFilter = debounce((value) => {
  filters.value.global.value = value;
}, 1000);
watch(localFilterValue, (newValue) => {
  updateFilter(newValue);
});
const products = ref(new Array(10));
const startingNumber = ref(0);
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
    return clientsfilteredProducts.value ? clientsfilteredProducts.value.length : 0;
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

const getClientsPlaceholder = (header) => {
    console.log(header);
    return header == 'DNI / Cuil' || header == 'Telefono' ? `${header} comienza en` : `Buscar por ${header}`;
}
const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};
const showLabel = ref(false);
const checkWindowSize = () => {
  showLabel.value = window.innerWidth >= 768; // Mostrar el label solo si el ancho es mayor o igual a 768px (md)
};
onMounted(async () => {
  if (props.produ) {
    ClientsTableRows.value = await fetchData("http://localhost:3000/api/clientsTable/");
    ClientsTableRows.value = clientsFormatData(ClientsTableRows.value);
  } else {
    const { clientsTable } = await import('@/assets/client-dataset.mjs');
    ClientsTableRows.value = clientsFormatData(clientsTable);
  }
  animateNumber();
  setTimeout(() => {
    products.value = ClientsTableRows.value;
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
<div class="grid grid-cols-8 md:gap-1 gap-4 w-full">
            <div class="sm:col-start-1 sm:col-end-3 sm:justify-self-start sm:justify-start col-start-5 col-end-9 justify-self-center w-full flex justify-center text-xs">
              <Button icon="pi pi-file-excel" label="Exportar a CSV" :pt="{ root: { class: 'my-custom-button-clients' } }"
                @click="exportCSV($event)" v-tooltip.right="'Exportar tabla como CSV'" class="w-40 h-11"/>
            </div>
            <div class="lg:col-start-7 lg:col-end-7 md:col-start-4 md:col-end-6 sm:col-start-3 sm:col-end-5 sm:justify-self-start sm:order-none col-start-1 col-end-5 justify-self-start w-full flex justify-center text-xs -order-1">
              <Button type="button" icon="pi pi-trash" label="Limpiar"
                :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" outlined @click="clearClientsFilter()"
                v-tooltip.bottom="'Limpiar filtro'" class="w-30 h-11"/>
            </div>
            <div class="lg:col-start-8 lg:col-end-8 md:col-start-8 sm:col-start-5 sm:col-end-8 md:justify-self-end sm:justify-self-start col-start-2 justify-self-start">
              <IconField >
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText  v-model="filters['global'].value"
                  :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" placeholder="Busqueda general" class="h-11"/>
              </IconField>
            </div>
        </div>
*/
</script>
<template>
  <div class="lg:p-8 w-full flex justify-center">
    <DataTable v-model:filters="filters" :globalFilterFields="['nombre', 'apellido', 'dni', 'telefono', 'email']"
      filterDisplay="menu" :value="products" @filter="onFilter" class="w-11/12" ref="dt" stripedRows paginator
      :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" scrollable scrollHeight="590px" stateStorage="session"
      stateKey="dt-state-client-session">
      <template #header>
        <div class="grid grid-cols-8 gap-2 md:gap-2 w-full">
            <div class="xl:col-span-2 lg:col-span-3 md:col-span-5 sm:col-span-2 col-span-8 flex sm:gap-2 gap-4 md:justify-start justify-center">
              <Button icon="pi pi-file-excel" :label="showLabel ? 'Exportar a CSV' : ''" :pt="{ root: { class: 'my-custom-button-clients' } }"
                @click="exportCSV($event)" v-tooltip.right="'Exportar tabla como CSV'" class="w-40 h-11"/>
              <Button type="button" icon="pi pi-trash" :label="showLabel ? 'Limpiar' : ''"
                :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" outlined @click="clearClientsFilter()"
                v-tooltip.bottom="'Limpiar filtro'" class="w-30 h-11"/>
            </div>
            <div class="lg:col-start-7 lg:col-span-2 md:col-start-6 md:col-span-3 md:justify-self-end sm:col-start-6 sm:col-span-3 col-span-8 justify-self-center flex justify-center lg:justify-end">
              <IconField >
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText  v-model="filters['global'].value"
                  :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" placeholder="Busqueda general" class="h-11"/>
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
      <Column v-for="col of ClientsColumns" :sortable="col.field != 'acciones' ? true : false" :key="col.id_cliente"
        :field="col.field" :header="col.header" v-bind="filters_distinction_clients(col.field)">
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
              <div class="flex justify-center align-center w-full h-4/5">
                <Button icon="pi pi-search" aria-label="Lookup" size="small"
                  :pt="{ root: { class: 'my-custom-button-clients' } }" v-tooltip.bottom="'Ver mas info'"
                  @click="showDetailedInfo(data)" />
              </div>
            </template>
            <template v-else>
              <div class="flex justify-center align-center w-full h-4/5">
                <p class="w-full h-1/5 font-semibold">
                  {{ col.field.includes('fecha') ? formatDateForDisplay(data[col.field]) :
                    data[col.field] }}
                </p>
              </div>
            </template>
          </template>
        </template>
        <!-- Podriamos reversionar la primer columna de todas las tablas para hacer universal este setup de filters -->
        <template v-if="(col.field).includes('fecha')" #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
        </template>
        <template v-else-if="col.field != 'acciones'" #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" :placeholder="getClientsPlaceholder(col.header)" />
        </template>
      </Column>
      <template #footer>
        <div class="flex flex-start gap-2">
          <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-clients' } }">
          </Tag>
        </div>
      </template>
    </DataTable>
  </div>

  <Dialog v-model:visible="visible" maximizable modal dismissableMask pt:root:class="!border-0" :breakpoints="{ '1199px': '75vw', '575px': '100vw' }">
    <template #container="{ closeCallback, maximizeCallback }">
      <Card class="md:w-[28rem] w-full" style="overflow: hidden">
        <template #title>
          <div class="flex flex-col w-full px-4 pb-1 ">
            <p>{{ detailedInfo.nombre }} {{ detailedInfo.apellido }}</p>
          </div>

        </template>
        <template #subtitle>
          <div class="flex flex-col content-center items-center w-full">
            <div class="text-gray-400 w-11/12 text-xs px-2 py-1">
              <p>DNI/CUIT: {{ detailedInfo.dni }}</p>
              <p>Telefono: {{ detailedInfo.telefono }}</p>
              <p>Correo Electrónico: {{ detailedInfo.email }}</p>
            </div>
          </div>

        </template>
        <template #content>
          <div class="flex flex-col content-center items-center w-full">
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 font-normal text-left">
                Provincia:
              </p>
              <p class="font-medium text-right ">
                {{ detailedInfo.provincia }}
              </p>
            </div>
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 text-left">
                Localidad:
              </p>
              <p class="font-medium text-right">
                {{ detailedInfo.localidad }}
              </p>
            </div>
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 text-left">
                Calle:
              </p>
              <p class="font-medium text-right">
                {{ detailedInfo.calle }}
              </p>
            </div>
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 text-left">
                Numero de calle:
              </p>
              <p class="font-medium text-right">
                {{ detailedInfo.nroCalle }}
              </p>
            </div>
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 text-left text-nowrap">
                Grupo Económico:
              </p>
              <p class="font-medium text-right">
                {{ detailedInfo.grupoEconomico }}
              </p>
            </div>
            <div class="grid grid-cols-2 px-2 w-11/12 xl:text-base text-sm">
              <p class="text-gray-500 text-left text-nowrap">
                Fecha de nacimiento:
              </p>
              <p class="font-medium text-right">
                {{ formatDateForDisplay(detailedInfo.fechaDeNacimiento) }}
              </p>
            </div>
          </div>


        </template>
        <template #footer>
          <div class="flex gap-4 mt-1 justify-center">
            <Button label="Editar" class="w-40 h-9" v-tooltip.bottom="'Editar información'" @click="maximizeCallback()" />
            <Button label="Cerrar" severity="secondary" outlined class="w-40 h-9" @click="closeCallback()"
              v-tooltip.bottom="'Cerrar vista detallada'" />
          </div>
        </template>
      </Card>
    </template>
  </Dialog>
</template>
<style scoped>
.my-custom-button-clients {
  background-color: #1e40af !important;
  /* Green background */
  border: 1px solid #1e40af !important;
  /* Tomato border */
  color: #e2e8f0 !important;
  /* White text */
}

.my-custom-button-clients-no-background {
  /* background-color: #1e40af !important;  Green background */
  border: 1px solid #1e40af !important;
  /* Tomato border */
  color: #1e40af !important;
  /* White text */
}

.severity-null {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}
</style>