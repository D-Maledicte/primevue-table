<script setup>
import { ref, onMounted, toRaw, computed } from 'vue';
//import { useConfirm } from "primevue/useconfirm";
import { fetchData,formatDateForDisplay,formatDateString, getSeverityLogs } from "./services/formatFunctions.mjs";
const props = defineProps({
  id_record: {
    type: String,
    required: true,
  },
  produ: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['closeCallbackDialog', 'maximizeCallbackDialog']);
const closeCallbackDialog = () => {
  emit('closeCallbackDialog'); // Emitimos el evento con los datos que queremos pasar al padre
};
const maximizeCallbackDialog = () => {
  emit('maximizeCallbackDialog'); // Emitimos el evento con los datos que queremos pasar al padre
};
//const confirm = useConfirm();
const popover = ref();
const multiselect = ref();
const Loader = ref(true);
const filtered = ref(false);
const InfoTableRows = ref();
const products = ref(new Array(1));
const filteredLogsProducts = ref();
const infoTableDateSelector = ref();
const infoTableTypeSelector = ref();
const logsRepresentatives = ref();
const sortKey = ref();
const sortOrder = ref();
const sortField = ref();
const sortOptions = ref([
    {label: 'Mas reciente', value: '!fecha_de_movimiento'},
    {label: 'Mas antiguo', value: 'fecha_de_movimiento'},
]);

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    }
    else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};

const logFormatData = (data) => {
  var newData = data.map(item => {
    return {
      ...item,
      fecha_de_movimiento: formatDateString(item.fecha_de_movimiento)
    };
  });
  logsRepresentatives.value = updateLogsRepresentatives(data);
  return newData
};
const filterByPedido = (id_pedido, data) => { 
  const infoRows = data;
  var filteredInfoRows = infoRows.filter(row => row.id_pedido == id_pedido);

  filteredInfoRows.sort((a, b) => {
    const dateA = new Date(a.fecha_de_movimiento);
    const dateB = new Date(b.fecha_de_movimiento);

    return dateB - dateA;  // Ordena de más reciente a más antiguo
  });
  return logFormatData(filteredInfoRows)
};

const toggle = (event) => {
  popover.value.toggle(event);
};

const applyFilterPopover = () => {
  filteredLogsProducts.value = applyFilter(products.value, infoTableTypeSelector.value, infoTableDateSelector.value)
  filtered.value = true;
  setTimeout(() => {
    popover.value.hide(); // Oculta el popover después de un pequeño retraso
  }, 100);
};

const applyFilterMultiSelect = () => {
  
  setTimeout(() => {
    multiselect.value.hide(); // Oculta el popover después de un pequeño retraso
  }, 100);
};
const deleteFilterMultiSelect = () => {
  infoTableTypeSelector.value = [];
}

const deleteFilterPopover = () => {
  filtered.value = false;
  infoTableDateSelector.value = null;
  infoTableTypeSelector.value = [];
  setTimeout(() => {
    popover.value.hide(); // Oculta el popover después de un pequeño retraso
  }, 100);
};

const applyFilter = (data, typeFilterArray, dateRangeArray) => {

  const hasTypeFilterArray = typeFilterArray !== undefined && typeFilterArray !== null && typeFilterArray.length > 0;
  const hasDateRangeArray = dateRangeArray !== undefined && dateRangeArray !== null && dateRangeArray.length > 0;
  
  // Verifica que los filtros no estén vacíos
  if (hasTypeFilterArray) {
    // Filtra por tipo
    data = data.filter(item => typeFilterArray.includes(item.tipo));
  }

  if (hasDateRangeArray) {
    const [startDate, endDate] = dateRangeArray.map(date => new Date(date).getTime());

    // Filtra por rango de fechas
    data = data.filter(item => {
      const itemDate = new Date(item.fecha_de_movimiento).getTime();
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  return data;
};


const updateLogsRepresentatives = (data) => {
  const newRepresentatives = {
    tipo: [],
  };

  data.forEach(item => {
    if (!newRepresentatives.tipo.includes(item.tipo)) {
      newRepresentatives.tipo.push(item.tipo);
    }
  });

  // Sorting the arrays (optional)
  newRepresentatives.tipo.sort();
  // newRepresentatives.riesgo.sort();
  // newRepresentatives.tomador.sort();

  return newRepresentatives;
};

const getProducts = computed(() => {
  if (filtered.value == true) {
    return filteredLogsProducts.value;
  } else {
    return products.value;
  }
});
/*
const showTemplate = (event) => {
    confirm.require({
        target: event.currentTarget,
        group: 'headless',
        message: 'Please confirm to proceed moving forward.',
        accept: () => {
            console.log("Success");
        },
        reject: () => {
            console.log("Failure");
        }
    });
}
*/
onMounted(async () => {
  if (props.produ) {
    InfoTableRows.value = await fetchData("http://localhost:3000/api/infoTable/" + props.id_record);
    InfoTableRows.value = logFormatData(InfoTableRows.value);
  } else {
    const { infoTable } = await import('@/assets/dataset.mjs');
    InfoTableRows.value = filterByPedido(props.id_record, infoTable);
  }
  setTimeout(() => {
    products.value = InfoTableRows.value;
    Loader.value = false;
  }, 1000);
});
</script>
<template>
  <DataView :value="getProducts" :sortOrder="sortOrder" :sortField="sortField" id="info-table">
            <template #header>
              <div class="flex justify-between">
                <div class="flex flex-row justify-between gap-4">
                  <Select v-model="sortKey" :options="sortOptions" class="w-52" optionLabel="label" placeholder="Ordenar por fecha" @change="onSortChange($event)" />
                  <Button type="button" icon="pi pi-filter" :pt="{ root: { class: 'my-custom-button-secondary-no-background' } }" outlined @click="toggle" v-tooltip.bottom="'Opciones de filtrado'"/>
                  <Popover ref="popover">
                        <div class="flex flex-col justify-between rounded p-0.5 gap-6 mt-6">
                          <FloatLabel>
                            <MultiSelect id="type_selector" ref="multiselect" v-model="infoTableTypeSelector" :options="logsRepresentatives.tipo" :selectedItemsLabel="'{0} opciones elegidas' " showToggleAll filterPlaceholder="Buscar" :maxSelectedLabels="2" class="w-56">
                                <template #option="slotProps">
                                  <div class="flex items-center gap-2">
                                      <Tag :value="slotProps.option" v-bind="getSeverityLogs(slotProps.option) == null? { class: 'severity-null'} : { severity: getSeverityLogs(slotProps.option)}"></Tag>
                                  </div>
                                </template>
                                <template #footer>
                                  <div class="flex items-end justify-end gap-6">
                                    <Button icon="pi pi-trash" text rounded aria-label="Confirm" @click="deleteFilterMultiSelect()" v-tooltip.bottom="'Borrar selección'"></Button>
                                    <Button icon="pi pi-check-square" text rounded aria-label="Confirm" @click="applyFilterMultiSelect()" v-tooltip.bottom="'Confirmar selección'"></Button>
                                  </div>
                                </template>
                            </MultiSelect>
                            <label for="type_selector">Filtrar por tipo</label>
                          </FloatLabel>
                          <FloatLabel>
                            <DatePicker v-model="infoTableDateSelector"  selectionMode="range" showButtonBar :hideOnRangeSelection="true" :manualInput="false" inputId="date_selector" class="w-56" placeholder="Desde - Hasta">
                            </DatePicker>
                            <label for="date_selector">Filtrar por fecha</label>
                          </FloatLabel>
                          <div class="flex items-end justify-end gap-6">
                            <Button icon="pi pi-trash" text rounded aria-label="Close" @click="deleteFilterPopover" v-tooltip.bottom="'Borrar filtros'"></Button>
                            <Button icon="pi pi-check-square" text rounded aria-label="Confirm" @click="applyFilterPopover" v-tooltip.bottom="'Aplicar filtros'"></Button>
                          </div>
                        </div>
                  </Popover>
                </div>
                <div>
                  <Button icon="pi pi-times" text rounded aria-label="Close" @click="closeCallbackDialog()" v-tooltip.bottom="'Cerrar logs'"/>
                  <Button icon="pi pi-window-maximize" text rounded aria-label="Close" @click="maximizeCallbackDialog()" v-tooltip.bottom="'Maximizar'"/>
                </div>
              </div>
            </template>
            <template #list="slotProps">
                <div class="flex flex-col" >
                    <div v-for="(item, index) in slotProps.items" :key="index">
                        <template v-if="Loader">
                          <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                  <Skeleton width="30rem" height="8rem" borderRadius="16px"></Skeleton>
                                </div>
                                <div class="flex flex-col md:items-end gap-8">
                                  <Skeleton width="8rem" class="mb-2" borderRadius="16px"></Skeleton>
                                </div>
                            </div>
                        </div>
                        </template>
                        <template v-else>
                          <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                    <Fieldset>
                                        <template #legend>
                                            <div class="flex flex-row items-center gap-2">
                                              <Tag :value="item.direccion" :severity="getSeverityLogs(item)"></Tag>
                                              <Tag :value="item.tipo" class="font-semibold severity-null"></Tag>
                                            </div>
                                        </template>
                                        <p class="text-lg font-medium mt-2">
                                          {{item.resumen}}
                                        </p>
                                    </Fieldset>
                                </div>
                                <div class="flex flex-col md:items-end gap-4 max-w-24">
                                  <div class="w-full flex justify-center">
                                    <Tag icon="pi pi-calendar" :value="formatDateForDisplay(item.fecha_de_movimiento)" class="text-xl font-semibold"></Tag>
                                  </div>
                                </div>
                            </div>
                        </div>
                        </template>
                    </div>
                </div>
            </template>
  </DataView>
</template>

<style scoped>
.severity-null {
  background-color : #f1f5f9;
  color: #334155;
}

.my-custom-button-secondary-no-background {
  /* background-color: #2563eb !important;  Green background */
  border: 1px solid #2563eb !important; /* Tomato border */
  color: #1d4ed8 !important; /* White text */
}
/* 

*/ 
</style>