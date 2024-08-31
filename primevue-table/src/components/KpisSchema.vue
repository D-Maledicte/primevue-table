<script setup>
import { useMainTableDataStore } from '@/stores/mainTableData';
import { ref, onMounted } from "vue";

const mainTableDataStore = useMainTableDataStore();
const filteredByRiskChartData = ref();
const filteredByRiskChartOptions = ref();
const setfilteredByRiskChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
const filteredByWonLoseData = ref();
const filteredByWonLoseChartOptions = ref();
const setfilteredByWonLoseChartOptions = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
const filteredPrimaByRiesgoData = ref();
const filteredPrimaByRiesgoChartOptions = ref();
const setfilteredPrimaByRiesgoChartOptions = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
};

const filteredCreadosVsGanadosData = ref();
const filteredCreadosVsGanadosChartOptions = ref();
const setfilteredCreadosVsGanadosChartOptions = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}
onMounted(() => {
    filteredByRiskChartData.value = mainTableDataStore.filteredByRisk;
    filteredByRiskChartOptions.value = setfilteredByRiskChartOptions();
    filteredByWonLoseData.value = mainTableDataStore.filteredByWonLose;
    filteredByWonLoseChartOptions.value = setfilteredByWonLoseChartOptions();
    filteredPrimaByRiesgoData.value = mainTableDataStore.filteredPrimaByRiesgo;
    filteredPrimaByRiesgoChartOptions.value = setfilteredPrimaByRiesgoChartOptions();
    filteredCreadosVsGanadosData.value = mainTableDataStore.filteredCreadosVsGanados;
    filteredCreadosVsGanadosChartOptions.value = setfilteredCreadosVsGanadosChartOptions();
});
</script>
<template>
    <div class="w-full grid grid-cols-2 gap-4 justify-center">
        <div class="grid justify-items-center">
          <p class="text-center font-semibold">Cotizaciones por riesgos</p>
          <div class="w-full">
            <Chart type="polarArea" :data="filteredByRiskChartData" :options="filteredByRiskChartOptions" class="flex justify-center w-full h-full" />
          </div>
        </div>
        <div class="grid justify-items-center">
          <p class="text-center font-semibold">Cerrados ganados y perdidos por fecha de creación</p>
          <div class="w-full">
            <Chart type="bar" :data="filteredByWonLoseData" :options="filteredByWonLoseChartOptions" class="h-[30rem]" />
          </div>
        </div>
        <div class="grid justify-items-center">
          <p class="text-center font-semibold">Prima por riesgo</p>
          <div class="w-full">
            <Chart type="pie" :data="filteredPrimaByRiesgoData" :options="filteredPrimaByRiesgoChartOptions" class="flex justify-center" />
          </div>
        </div>
        <div class="grid justify-items-center">
          <p class="text-center font-semibold">Creados vs Ganados por fecha de creación</p>
          <div class="w-full">
            <Chart type="bar" :data="filteredCreadosVsGanadosData" :options="filteredCreadosVsGanadosChartOptions" class="h-[30rem]"  />
          </div>
        </div>
    </div>
</template>
<style></style>