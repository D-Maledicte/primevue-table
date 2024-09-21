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
                display: true,
                labels: {
                    boxWidth: 10, // Ajusta el ancho de las cajas de color
                    padding: 3,  // Ajusta el padding entre los elementos de la leyenda
                    color: textColor
                },
                position: 'bottom',
                maxHeight: 200, // Ajusta el máximo alto disponible para la leyenda
            }
        },
        scales: {
            r: {
                grid: {
                    color: surfaceBorder
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };
}
const filteredByWonLoseData = ref();
const filteredByWonLoseChartOptions = ref();
const setfilteredByWonLoseChartOptions = () => {
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
                },
                position: 'bottom',
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
const setfilteredPrimaByRiesgoChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                display: true,
                labels: {
                    usePointStyle: true,
                    boxWidth: 10, // Ajusta el ancho de las cajas de color
                    padding: 6,  // Ajusta el padding entre los elementos de la leyenda
                    color: textColor
                },
                position: 'bottom',
                maxHeight: 200, // Ajusta el máximo alto disponible para la leyenda
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = ' ';  // Toma el label del tooltip
                        if (context.parsed !== null) {
                            // Formatear el valor con Intl.NumberFormat a moneda
                            label += new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                            }).format(context.parsed);
                        }
                        return label;  // Devuelve el texto formateado como tooltip
                    }
                }
            }
        },

    };
};

const filteredCreadosVsGanadosData = ref();
const filteredCreadosVsGanadosChartOptions = ref();
const setfilteredCreadosVsGanadosChartOptions = () => {
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
                },
                position: 'bottom',
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
    <div class="w-full grid md:grid-cols-2 grid-cols-1 gap-4 justify-center">
        <Panel class="flex flex-col justify-center" :pt="{ root: { class: mainTableDataStore.darkMode == false? 'panel-component-light' : 'panel-component-dark' } }">
            <template #header>
                <div class="flex flex-col w-full">
                    <h2 class="font-semibold text-left">Cotizaciones por riesgos</h2>
                    <div class="flex w-full">
                        <p class="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et sit dolores, aliquid nisi suscipit odit illum quaerat. Labore totam, distinctio reiciendis ullam deleniti quas expedita repudiandae repellat rerum libero architecto?</p>
                    </div>
                </div>
            </template>
            <div class="w-full flex flex-col">
                <div class="card flex justify-center">
                    <div class="w-full md:w-[30rem] h-[30rem]">
                        <Chart type="polarArea" :data="filteredByRiskChartData" :options="filteredByRiskChartOptions"
                            class="w-full h-full" />
                    </div>
                </div>
            </div>
        </Panel>
        <Panel class="flex flex-col justify-center" :pt="{ root: { class: mainTableDataStore.darkMode == false? 'panel-component-light' : 'panel-component-dark' } }">
            <template #header>
                <div class="flex flex-col w-full">
                    <h2 class="font-semibold text-left">Cerrados ganados y perdidos por fecha de creación</h2>
                    <div class="flex w-full">
                        <p class="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et sit dolores, aliquid nisi suscipit odit illum quaerat. Labore totam, distinctio reiciendis ullam deleniti quas expedita repudiandae repellat rerum libero architecto?</p>
                    </div>
                </div>
            </template>
            <div class="w-full flex flex-col">
                <div class="card flex justify-center">
                    <div class="w-full md:w-[30rem] md:h-[30rem] h-[25rem]">
                        <Chart type="bar" :data="filteredByWonLoseData" :options="filteredByWonLoseChartOptions"
                            class="md:h-[30rem] h-[25rem]" />
                    </div>
                </div>
            </div>
        </Panel>
        <Panel class="flex flex-col justify-center" :pt="{ root: { class: mainTableDataStore.darkMode == false? 'panel-component-light' : 'panel-component-dark' } }">
            <template #header>
                <div class="flex flex-col w-full">
                    <h2 class="font-semibold text-left">Prima por riesgo</h2>
                    <div class="flex w-full">
                        <p class="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et sit dolores, aliquid nisi suscipit odit illum quaerat. Labore totam, distinctio reiciendis ullam deleniti quas expedita repudiandae repellat rerum libero architecto?</p>
                    </div>
                </div>
            </template>
            <div class="w-full flex flex-col">
                <div class="card flex justify-center">
                    <div class="w-full md:w-[30rem] md:h-[30rem] h-[25rem]">
                        <Chart type="pie" :data="filteredPrimaByRiesgoData" :options="filteredPrimaByRiesgoChartOptions"
                            class="w-full h-full" />
                    </div>
                </div>
            </div>
        </Panel>
        <Panel class="flex flex-col justify-center" :pt="{ root: { class: mainTableDataStore.darkMode == false? 'panel-component-light' : 'panel-component-dark' } }">
            <template #header>
                <div class="flex flex-col w-full">
                    <h2 class="font-semibold text-left">Creados vs Ganados por fecha de creación</h2>
                    <div class="flex w-full">
                        <p class="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et sit dolores, aliquid nisi suscipit odit illum quaerat. Labore totam, distinctio reiciendis ullam deleniti quas expedita repudiandae repellat rerum libero architecto?</p>
                    </div>
                </div>
            </template>
            <div class="w-full flex flex-col">
                <div class="card flex justify-center">
                    <div class="w-full md:w-[30rem] md:h-[30rem] h-[25rem]">
                        <Chart type="bar" :data="filteredCreadosVsGanadosData"
                            :options="filteredCreadosVsGanadosChartOptions" class="md:h-[30rem] h-[25rem]" />
                    </div>
                </div>
            </div>
        </Panel>
    </div>
</template>
<style scoped>
.panel-component-light {
    background-color: var(--p-gray-100);
}
.panel-component-dark {
    background-color: var(--p-blue-900);
}
</style>