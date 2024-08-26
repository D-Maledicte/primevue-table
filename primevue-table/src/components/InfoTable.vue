<script setup>
import { ref, onMounted } from 'vue';
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

const Loader = ref(true);
const InfoTableRows = ref();
const products = ref(new Array(1));
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
  <DataView :value="products" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
              <div class="flex justify-between">
                <div>
                  <Select v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Ordenar por fecha" @change="onSortChange($event)" />
                </div>
                <div>
                  <Button icon="pi pi-times" text rounded aria-label="Close" @click="closeCallbackDialog()"/>
                  <Button icon="pi pi-window-maximize" text rounded aria-label="Close" @click="maximizeCallbackDialog()"/>
                </div>
              </div>
            </template>
            <template #list="slotProps">
                <div class="flex flex-col">
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

/* 

*/ 
</style>