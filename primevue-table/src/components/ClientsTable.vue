<script setup>
import { ref, onMounted, watch, toRaw, computed } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import {fetchData, formatDateString, formatDateForDisplay, filters_distinction_clients, areObjectsEqual } from "./services/formatFunctions.mjs";
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
  { field: 'acciones', header: 'Acciones'}
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
    dni: { value: null, matchMode: FilterMatchMode.CONTAINS },
    telefono: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  };
};

const clearClientsFilter = () => {
  initClientsFilters();
  localFilterValue.value = null
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

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
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
});
</script>
<template>
  <div class="md:p-16 w-full">
    <DataTable v-model:filters="filters" :globalFilterFields="['nombre', 'apellido', 'dni', 'telefono', 'email' ]" filterDisplay="menu" :value="products" @filter="onFilter" tableStyle="min-width: 50rem" ref="dt" stripedRows paginator :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]">
              <template #header>
              <div class="flex justify-between">
                <div class="flex justify-start gap-4">
                  <Button icon="pi pi-file-excel" label="Exportar a CSV" :pt="{ root: { class: 'my-custom-button-clients' } }" @click="exportCSV($event)" v-tooltip.bottom="'Exportar tabla como CSV'"/>
                </div>
                <div class="flex gap-2">
                  <Button type="button" icon="pi pi-trash" label="Limpiar" :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" outlined @click="clearClientsFilter()" v-tooltip.bottom="'Limpiar filtro'"/>
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="filters['global'].value" :pt="{ root: { class: 'my-custom-button-clients-no-background' } }" placeholder="Busqueda general" />
                </IconField>
                </div>
              </div>
              </template>
              <template #empty> No hay registros que coincidan con la busqueda </template>
              <Column v-for="col of ClientsColumns"
              :sortable="col.field != 'acciones' ? true : false" :key="col.id_cliente"
                :field="col.field" :header="col.header" v-bind="filters_distinction_clients(col.field)">
                <template #filtericon>
                <i class="pi pi-filter" v-tooltip.bottom="'Opciones de filtrado'"/>
                </template>
                <template #sorticon="{ sorted, sortOrder }">
                      <i :class="sortIcons(sorted, sortOrder)" v-tooltip.bottom="'Ordenar resultados'"/>
                </template>
                <template #body="{ data }">
                  <template v-if="Loader">
                    <Skeleton></Skeleton>
                  </template>
                  <template v-else>
                    <template v-if="col.field == 'acciones'">
                      <div class="flex justify-center align-center w-full h-4/5">
                        <Button icon="pi pi-search"  aria-label="Lookup" size="small" :pt="{ root: { class: 'my-custom-button-clients' } }" v-tooltip.bottom="'Ver mas info'" @click="showDetailedInfo(data)"/>
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
                  <InputText v-model="filterModel.value" type="text" :placeholder="`Buscar por ${col.header}`" />
                </template>
              </Column>
              <template #footer> 
                <div class="flex flex-start gap-2">
                  <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-clients' } }"></Tag>
                </div>
              </template>
  </DataTable>
  </div>
  
  <Dialog v-model:visible="visible" maximizable modal dismissableMask pt:root:class="!border-0 ">
        <template #container="{ closeCallback}">
            <Card style="width: 28rem; overflow: hidden">
                <template #title>
                  <p>{{ detailedInfo.nombre }} {{ detailedInfo.apellido }}</p>
                </template>
                <template #subtitle>
                  <div>
                    <p>Dni: {{ detailedInfo.dni }}</p>
                    <p>Telefono: {{ detailedInfo.telefono }}</p>
                    <p>Correo Electrónico: {{ detailedInfo.email }}</p>
                  </div>
                </template>
                <template #content>
                  <div class="flex justify-around">
                    <p class="m-0">
                        Provincia: 
                    </p>
                    <p>
                      {{ detailedInfo.provincia }}
                    </p>
                  </div>
                    <p class="m-0">
                        Localidad: {{ detailedInfo.localidad }}
                    </p>
                    <p class="m-0">
                        Calle: {{ detailedInfo.calle }}
                    </p>
                    <p class="m-0">
                        Numero de calle: {{ detailedInfo.nroCalle }}
                    </p>
                    <p class="m-0">
                        Grupo Económico: {{ detailedInfo.grupoEconomico }}
                    </p>
                    <p class="m-0">
                        Fecha de nacimiento: {{ formatDateForDisplay(detailedInfo.fechaDeNacimiento) }}
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Editar" severity="secondary" outlined class="w-full" />
                        <Button label="Cerrar" class="w-full" @click="closeCallback()" v-tooltip.bottom="'Cerrar vista detallada'"/>
                    </div>
                </template>
            </Card>
        </template>
  </Dialog>
</template>
<style scoped>
.my-custom-button-clients {
  background-color: #2563eb !important; /* Green background */
  border: 1px solid #2563eb !important; /* Tomato border */
  color: #e2e8f0 !important; /* White text */
}

.my-custom-button-clients-no-background {
  /* background-color: #2563eb !important;  Green background */
  border: 1px solid #2563eb !important; /* Tomato border */
  color: #1d4ed8 !important; /* White text */
}

.severity-null {
  background-color : #f1f5f9 !important;
  color: #334155 !important;
}
</style>