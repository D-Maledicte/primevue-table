<script setup>
import MainTable from '@/components/MainTable.vue'
import ClientsTable from '@/components/ClientsTable.vue';
///Main deploy segmentation
const produ = false;
</script>

<template>
  <main class="main_selector">
    <div class="flex mt-6 card border-2 border-blue-800 w-full justify-center" >
      <div class="flex flex-col gap-20 p-8 w-full justify-center">
        <Panel header="Modelo: Tabla de cotizaciones" toggleable collapsed class="w-full">
          <MainTable :produ="produ"></MainTable>
        </Panel>
        <Panel header="Modelo: Tabla de clientes" toggleable collapsed class="w-full">
          <ClientsTable :produ="produ"></ClientsTable>
        </Panel>
      </div>
    </div>
  </main>

</template>

<style scoped>

</style>