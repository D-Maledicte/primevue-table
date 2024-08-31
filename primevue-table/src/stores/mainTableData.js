import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMainTableDataStore = defineStore('mainTableData', () => {
  // Estado
  const mainTableDataArray = ref([]);
  const initialized = ref(false);
  // Acciones
  const setMainTableDataArray = (data) => {
    mainTableDataArray.value = data;
  };

  const setInitialized = (bool) => {
    initialized.value = bool;
  };
  // Getters
  const filteredByRisk = computed(() => {
    const riskCounts = {};
    const riskLabels = [];
    const colors = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FFCD56", "#36A2EB", "#FF6384"
      // Puedes agregar más colores según sea necesario
    ];

    // Contar la cantidad de registros por tipo de riesgo solo si el registro es del año 2024
    mainTableDataArray.value.forEach(item => {
      const risk = item.riesgo;
      const fechaCreacion = new Date(item.fecha_creacion);
      const year = fechaCreacion.getFullYear();

      // Solo contabilizar si el año es 2024
      if (year === 2024) {
        if (riskCounts[risk]) {
          riskCounts[risk]++;
        } else {
          riskCounts[risk] = 1;
          riskLabels.push(risk); // Mantén un array de riesgos para usarlos como labels
        }
      }
    });

    // Convertir los resultados en el formato necesario
    const chartData = {
      datasets: [
        {
          data: riskLabels.map(label => riskCounts[label]),
          backgroundColor: riskLabels.map((_, index) => colors[index % colors.length]),
          label: 'Riesgo por cantidad de registros'
        }
      ],
      labels: riskLabels
    };

    return chartData;
  });
  const filteredByWonLose = computed(() => {
    const labels = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Inicializar contadores para los meses
    const ganadoCounts = Array(12).fill(0);
    const perdidoCounts = Array(12).fill(0);
    
    mainTableDataArray.value.forEach(item => {
        const fechaCreacion = new Date(item.fecha_creacion);
        const year = fechaCreacion.getFullYear();
        const month = fechaCreacion.getMonth(); // Devuelve el mes de 0 (Enero) a 11 (Diciembre)
        
        if (year === 2024) {
            if (item.estado === 'Cerrado ganado') {
                ganadoCounts[month]++;
            } else if (item.estado === 'Cerrado Perdido') {
                perdidoCounts[month]++;
            }
        }
    });
    
    return {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'Cerrado ganado',
                backgroundColor: '#4caf50', // Verde para 'Cerrado ganado'
                data: ganadoCounts
            },
            {
                type: 'bar',
                label: 'Cerrado perdido',
                backgroundColor: '#f44336', // Rojo para 'Cerrado Perdido'
                data: perdidoCounts
            }
        ]
    };
  })

  const filteredPrimaByRiesgo = computed(() => {
    const riskSums = {};
    const riskLabels = [];
    const colors = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
        "#FF9F40", "#FFCD56", "#36A2EB", "#FF6384"
        // Puedes agregar más colores según sea necesario
    ];

    // Sumar la prima asegurada por tipo de riesgo solo si el registro es del año 2024
    mainTableDataArray.value.forEach(item => {
        const risk = item.riesgo;
        const prima = parseInt(item.balance);
        const fechaCreacion = new Date(item.fecha_creacion);
        const year = fechaCreacion.getFullYear();

        // Solo contabilizar si el año es 2024
        if (year === 2024) {
            if (riskSums[risk]) {
                riskSums[risk] += prima;
            } else {
                riskSums[risk] = prima;
                riskLabels.push(risk); // Mantén un array de riesgos para usarlos como labels
            }
        }
    });

    // Retornar el objeto formateado
    return {
        labels: riskLabels,
        datasets: [
            {
                data: riskLabels.map(label => riskSums[label]),
                backgroundColor: riskLabels.map((_, index) => colors[index % colors.length]),
                hoverBackgroundColor: riskLabels.map((_, index) => colors[index % colors.length])
            }
        ]
    };
});

const filteredCreadosVsGanados = computed(() => {
  // Inicialización de arrays para contar registros por mes (12 meses)
  const ganadoCounts = Array(12).fill(0);
  const otrosCounts = Array(12).fill(0);

  // Iterar sobre los registros
  mainTableDataArray.value.forEach(item => {
      const fechaCreacion = new Date(item.fecha_creacion);
      const year = fechaCreacion.getFullYear();
      const month = fechaCreacion.getMonth(); // Devuelve el mes (0 = Enero, 11 = Diciembre)

      // Solo considerar registros del año 2024
      if (year === 2024) {
          if (item.estado === 'Cerrado ganado') {
              ganadoCounts[month]++;
              otrosCounts[month]++;
          } else {
              otrosCounts[month]++;
          }
      }
  });

  // Construcción del objeto del gráfico
  const chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
          {
              label: 'Cerrado ganado',
              backgroundColor: '#4caf50', // Verde para "Cerrado ganado"
              borderColor: '#4caf50',
              data: ganadoCounts
          },
          {
              label: 'Creados',
              backgroundColor: '#f44336', // Rojo para otros estados
              borderColor: '#f44336',
              data: otrosCounts
          }
      ]
  };

  return chartData;
})
  // Retornamos el estado, las acciones y los getters
  return {
    mainTableDataArray,
    initialized,
    setMainTableDataArray,
    setInitialized,
    filteredByRisk,
    filteredByWonLose,
    filteredPrimaByRiesgo,
    filteredCreadosVsGanados
  };
});
