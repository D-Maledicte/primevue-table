<script setup>
import { ref, onMounted, watch, toRaw, computed } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import {fetchData, formatDateString, formatDateForDisplay, filters_distinction } from "./services/formatFunctions.mjs";
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


const filterByCotizacion = (id_cotizacion, data) => {
  const secondaryRows = toRaw(data);  
  var filteredSecondaryTableRows = secondaryRows.filter(row => row.id_cotizacion == id_cotizacion);

  return secondaryFormatData(filteredSecondaryTableRows)
};
const filters = ref();
const secondaryfilteredProducts = ref();
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
  localFilterValue.value = null
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
    }, 5000);
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

onMounted(async () => {
  if (props.produ) {
    SecondaryTableRows.value = await fetchData("http://localhost:3000/api/secondaryTable/" + props.id_record);
    SecondaryTableRows.value = secondaryFormatData(SecondaryTableRows.value);
  } else {
    const { secondaryTable } = await import('@/assets/data2.mjs');
    SecondaryTableRows.value = filterByCotizacion(props.id_record, secondaryTable);
  }
  animateNumber(); 
  setTimeout(() => {
    products.value = SecondaryTableRows.value;
    Loader.value = false;
    
      animateNumber(); // Ajusta el tiempo según sea necesario
  }, 1000);
});
</script>

<template>
  <DataTable v-model:filters="filters" :globalFilterFields="['estado', 'aseguradora']" filterDisplay="menu" :value="products" @filter="onFilter" tableStyle="min-width: 50rem" stripedRows paginator :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]">
              <template #header>
              <div class="flex justify-start gap-2">
                <Button type="button" icon="pi pi-trash" label="Limpiar" :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" outlined @click="clearSecondaryFilter()" />
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="filters['global'].value" :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" placeholder="Busqueda general" />
                </IconField>
              </div>
              </template>
              <template #empty> No hay registros que coincidan con la busqueda </template>
              <template #loading> Cargando Información </template>
              <Column v-for="col of secondaryColumns"
                :sortable="col.field != 'aviso' && col.field != 'acciones' ? true : false" :key="col.id_pedido"
                :field="col.field" :header="col.header" v-bind="filters_distinction(col.field)">
                <template #body="{ data }">
                  <template v-if="Loader">
                    <Skeleton></Skeleton>
                  </template>
                  <template v-else>
                    <template v-if="col.field == 'acciones'">
                    <ButtonGroup class="flex gap-px">
                      <Button icon="pi pi-info-circle" :pt="{ root: { class: 'my-custom-button-secondary' } }" aria-label="Cancel" size="small"
                        v-tooltip.bottom="'Mas info'" @click="emitShowLogsTable(data)" />
                      <Button icon="pi pi-send" :pt="{ root: { class: 'my-custom-button-secondary' } }" aria-label="Cancel" size="small"
                        v-tooltip.bottom="'Responder pedido'" @click="procesarSecondaryOperacion(data)" />
                      <Button icon="pi pi-check" :pt="{ root: { class: 'my-custom-button-secondary' } }" aria-label="Cancel" size="small"
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
                  <MultiSelect v-model="filterModel.value" :options="secondaryRepresentatives[col.field]" :selectedItemsLabel="'{0} opciones elegidas' " :maxSelectedLabels="2" class="w-60" placeholder="Todos">
                    <template #option="slotProps">
                      <div class="flex items-center gap-2">
                        <span>{{ slotProps.option }}</span>
                      </div>
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <template #footer> 
                <div class="flex flex-start gap-2">
                  <Tag :value="`Numero de registros: ${startingNumber}`" :pt="{ root: { class: 'my-custom-button-secondary' } }"></Tag>
                </div>
              </template>
  </DataTable>
</template>

<style>
.my-custom-button-secondary {
  background-color: #1e3a8a !important; /* Green background */
  border: 1px solid #1e3a8a !important; /* Tomato border */
  color: #cbd5e1 !important; /* White text */
}

.my-custom-button-secondary-no-background {
  /* background-color: #1e3a8a !important;  Green background */
  border: 1px solid #1e3a8a !important; /* Tomato border */
  color: #cbd5e1 !important; /* White text */
}
</style>