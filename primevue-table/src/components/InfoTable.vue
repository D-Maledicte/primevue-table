<script setup>
import { ref, onMounted } from 'vue';
import { fetchData,formatDateForDisplay,formatDateString, getSeverity } from "./services/formatFunctions.mjs";
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
const Loader = ref(true);
const InfoTableRows = ref();
const products = ref(new Array(1));
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
    const { infoTable } = await import('@/assets/data2.mjs');
    InfoTableRows.value = filterByPedido(props.id_record, infoTable);
  }
  setTimeout(() => {
    products.value = InfoTableRows.value;
    Loader.value = false;
  }, 1000);
});
</script>
<template>
  <DataView :value="products">
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
                        </template>
                    </div>
                </div>
            </template>
        </DataView>
</template>