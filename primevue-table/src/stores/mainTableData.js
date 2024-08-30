import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMainTableDataStore = defineStore('mainTableData', () => {
  // Estado
  const mainTableDataArray = ref([]);

  // Acciones
  const setMainTableDataArray = (data) => {
    mainTableDataArray.value = data;
  };
  /*
  const fetchData = async () => {
    try {
      const response = await fetch('/path/to/your/data'); // Reemplaza con la URL de tu API
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };
  */
  // Getters
  /*
  const filteredData = computed(() => {
    return dataArray.value.filter(item => item.someProperty === 'someValue');
  });
  */
  // Retornamos el estado, las acciones y los getters
  return {
    mainTableDataArray,
    setMainTableDataArray,
  };
});
