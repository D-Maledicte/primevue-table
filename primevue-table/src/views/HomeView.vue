<script setup>
import KpisSchema from '@/components/KpisSchema.vue';
import MainTable from '@/components/MainTable.vue';
import ClientsTable from '@/components/ClientsTable.vue';
import { ref, onMounted, computed } from 'vue';

import { useMainTableDataStore } from '@/stores/mainTableData';
import { fetchData, formatDateString } from "../components/services/formatFunctions.mjs"
///Main deploy segmentation
const produ = false;

//////////////////////////////////
const screenMode = ref("pi pi-moon");
const toggleColorScheme = () => {
  const element = document.querySelector('html');
  element.classList.toggle('my-app-dark');
  screenMode.value = screenMode.value == "pi pi-sun" ? "pi pi-moon" : "pi pi-sun";
  mainTableDataStore.darkMode == false ? mainTableDataStore.setdarkMode(true) : mainTableDataStore.setdarkMode(false);
};
const getTooltipNightMode = () => {
  return screenMode.value == "pi pi-sun"? 'Modo nocturno' : "Modo Claro"
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
  return newData
};
const MainTableRows = ref();
const mainTableDataStore = useMainTableDataStore();
const kpisPanel = ref();
const kpisPanelFlag = ref(false);
const kpisToggle = (event) => {
  kpisPanel.value.toggle(event);
  kpisPanelFlag.value = !kpisPanelFlag.value;

};
const kpisPanelState = computed(() => {
  return kpisPanelFlag.value ? 'pi pi-minus' : 'pi pi-plus';
})
const kpisPanelTooltip = computed(() => {
  return kpisPanelFlag.value ? 'Contraer' : 'Desplegar';
})
const MainTablePanel = ref();
const MainTablePanelFlag = ref(false);
const mainTablePanelToggle = (event) => {
  MainTablePanel.value.toggle(event);
  MainTablePanelFlag.value = !MainTablePanelFlag.value;

};
const MainTablePanelState = computed(() => {
  return MainTablePanelFlag.value ? 'pi pi-minus' : 'pi pi-plus';
})
const MainTablePanelTooltip = computed(() => {
  return MainTablePanelFlag.value ? 'Contraer' : 'Desplegar';
})
const ClientsPanel = ref();
const ClientsPanelFlag = ref(false);
const clientsPanelToggle = (event) => {
  ClientsPanel.value.toggle(event);
  ClientsPanelFlag.value = !ClientsPanelFlag.value;

};
const ClientsPanelState = computed(() => {
  return ClientsPanelFlag.value ? 'pi pi-minus' : 'pi pi-plus';
})
const ClientsPanelTooltip = computed(() => {
  return ClientsPanelFlag.value ? 'Contraer' : 'Desplegar';
})

onMounted(async () => {
  if (produ) {
    MainTableRows.value = await fetchData("http://localhost:3000/api/mainTable/");
  } else {
    const { mainTable } = await import('@/assets/dataset.mjs');
    MainTableRows.value = mainTable;
  }
  mainTableDataStore.setMainTableDataArray(formatData(MainTableRows.value));
  mainTableDataStore.setInitialized(true);
  Loader.value = false;
});
/*@click="kpisToggle(event)" */
</script>

<template>
  <main class="main_selector">
    <div class="flex w-full justify-between align-center md:px-8 md:py-4 px-2 py-1">
      <Button type="button" :icon="screenMode" class="w-14" :pt="{ root: { class: 'my-custom-button-home' } }"
              @click="toggleColorScheme()" v-tooltip.right="getTooltipNightMode()" />
              <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="35" font-family="Roboto" font-size="32" fill="#333">
    NATALIA
  </text>
</svg>
    </div>
    <Divider :pt="{ root: { class: 'my-custom-divider-home' } }"></Divider>
    <div class="flex card w-full justify-center">
      <div class="flex flex-col gap-20 md:p-8 w-full min-h-[30rem] justify-center">
        <template v-if="Loader">
          <div class="flex w-full justify-center">
            <ProgressBar mode="indeterminate" style="height: 15px" class="w-6/12"></ProgressBar>
          </div>
        </template>
        <template v-else>
          <Panel collapsed class="w-full" ref="kpisPanel">
            <template #header>
              <div class="flex justify-center align-center items-center gap-2">
                <Button :icon="kpisPanelState" rounded text
                  v-tooltip.bottom="kpisPanelTooltip" />
                <span class="font-bold">Modelo: KPI´s (en construcción)</span>
              </div>
            </template>
            <template v-if="kpisPanelFlag">
              <KpisSchema />
            </template>

          </Panel>
          <Panel collapsed class="w-full" ref="MainTablePanel">
            <template #header>
              <div class="flex justify-center align-center items-center gap-2">
                <Button :icon="MainTablePanelState" rounded text @click="mainTablePanelToggle(event)"
                  v-tooltip.bottom="MainTablePanelTooltip" />
                <span class="font-bold">Modelo: Tabla anidada</span>
              </div>
            </template>
            <template v-if="MainTablePanelFlag && mainTableDataStore.initialized">
              <MainTable :produ="produ"></MainTable>
            </template>
          </Panel>
          <Panel collapsed class="w-full" ref="ClientsPanel">
            <template #header>
              <div class="flex justify-center align-center items-center gap-2">
                <Button :icon="ClientsPanelState" rounded text @click="clientsPanelToggle(event)"
                  v-tooltip.bottom="ClientsPanelTooltip" />
                <span class="font-bold">Modelo: Tabla de clientes</span>
              </div>
            </template>
            <template v-if="ClientsPanelFlag">
              <ClientsTable :produ="produ"></ClientsTable>
            </template>
          </Panel>
        </template>
      </div>

    </div>
  </main>

</template>

<style scoped>
.my-custom-button-home {
  background-color: #1e40af !important;
  /* Green background */
  border: 1px solid #1e40af !important;
  /* Tomato border */
  color: #e2e8f0 !important;
  /* White text */
  width: 3rem;
  height: 3rem; 
}
.my-custom-divider-home {
  margin: 0;
}
</style>