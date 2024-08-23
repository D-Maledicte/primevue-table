import './style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// Addons base de Primevue
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
// Addons de campos base
import Button from "primevue/button";
import ButtonGroup from 'primevue/buttongroup';
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import InputIcon from "primevue/inputicon";
import Checkbox from 'primevue/checkbox';
import MultiSelect from 'primevue/multiselect';
import IconField from "primevue/iconfield";
import DatePicker from "primevue/datepicker";
import Tag from "primevue/tag";
import Fieldset from 'primevue/fieldset';
// Addons de tabla
import DataView from 'primevue/dataview';
import DataTable from 'primevue/datatable';
import ColumnGroup from 'primevue/columngroup';
import Column from 'primevue/column';
import Row from 'primevue/row';
// Addons visuales
import Tooltip from 'primevue/tooltip';
import Dialog from 'primevue/dialog';
import Skeleton from 'primevue/skeleton';

import 'primeicons/primeicons.css';


const Blue = definePreset(Aura, {
  semantic: {
      primary: {
          50: '{blue.50}',
          100: '{blue.100}',
          200: '{blue.200}',
          300: '{blue.300}',
          400: '{blue.400}',
          500: '{blue.500}',
          600: '{blue.600}',
          700: '{blue.700}',
          800: '{blue.800}',
          900: '{blue.900}',
          950: '{blue.950}'
      },
      colorScheme: {
        light: {
            surface: {
              0: '#ffffff',
              50: '{slate.50}',
              100: '{slate.100}',
              200: '{slate.200}',
              300: '{slate.300}',
              400: '{slate.400}',
              500: '{slate.500}',
              600: '{slate.600}',
              700: '{slate.700}',
              800: '{slate.800}',
              900: '{slate.900}',
              950: '{slate.950}'
          }
        },
        dark: {
            surface: {
                0: '#ffffff',
                50: '{slate.50}',
                100: '{slate.100}',
                200: '{slate.200}',
                300: '{slate.300}',
                400: '{slate.400}',
                500: '{slate.500}',
                600: '{slate.600}',
                700: '{slate.700}',
                800: '{slate.800}',
                900: '{slate.900}',
                950: '{slate.950}'
            }
        }
      }
  }
});







const app = createApp(App);
app.use(PrimeVue, {
    locale:{
        "accept": "Sí",
        "addRule": "Agregar regla",
        "am": "AM",
        "apply": "Aplicar",
        "cancel": "Cancelar",
        "choose": "Escoger",
        "chooseDate": "Elige fecha",
        "chooseMonth": "Elige el mes",
        "chooseYear": "Elige Año",
        "clear": "Limpiar",
        "completed": "Terminado",
        "contains": "Contenga",
        "custom": "Personalizar",
        "dateAfter": "Fecha después de",
        "dateBefore": "Fecha antes de",
        "dateFormat": "dd/mm/yy",
        "dateIs": "Fecha igual a",
        "dateIsNot": "Fecha diferente a",
        "dayNames": [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado"
        ],
        "dayNamesMin": [
          "D",
          "L",
          "M",
          "M",
          "J",
          "V",
          "S"
        ],
        "dayNamesShort": [
          "Dom",
          "Lun",
          "Mar",
          "Mié",
          "Jue",
          "Vie",
          "Sáb"
        ],
        "emptyFilterMessage": "Sin opciones disponibles",
        "emptyMessage": "No se han encontrado resultados",
        "emptySearchMessage": "Sin opciones disponibles",
        "emptySelectionMessage": "Ningún artículo seleccionado",
        "endsWith": "Termine con",
        "equals": "Igual a",
        "fileSizeTypes": [
          "B",
          "KB",
          "MB",
          "GB",
          "TB",
          "PB",
          "EB",
          "ZB",
          "YB"
        ],
        "filter": "Filtrar",
        "firstDayOfWeek": 1,
        "gt": "Mayor que",
        "gte": "Mayor o igual a",
        "lt": "Menor que",
        "lte": "Menor o igual a",
        "matchAll": "Cumplir con ambas reglas",
        "matchAny": "Cumplir con cualquiera",
        "medium": "Medio",
        "monthNames": [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre"
        ],
        "monthNamesShort": [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic"
        ],
        "nextDecade": "Próxima década",
        "nextHour": "próxima hora",
        "nextMinute": "Siguiente minuto",
        "nextMonth": "Próximo mes",
        "nextSecond": "Siguiente segundo",
        "nextYear": "El próximo año",
        "noFilter": "Sin filtro",
        "notContains": "No contenga",
        "notEquals": "Diferente a",
        "now": "Ahora",
        "passwordPrompt": "Escriba una contraseña",
        "pending": "Pendiente",
        "pm": "PM",
        "prevDecade": "Década anterior",
        "prevHour": "Hora anterior",
        "prevMinute": "Minuto anterior",
        "prevMonth": "Mes anterior",
        "prevSecond": "Anterior Segundo",
        "prevYear": "Año anterior",
        "reject": "No",
        "removeRule": "Eliminar regla",
        "searchMessage": "{0} resultados están disponibles",
        "selectionMessage": "{0} elementos seleccionados",
        "showMonthAfterYear": false,
        "startsWith": "Comience con",
        "strong": "Fuerte",
        "today": "Hoy",
        "upload": "Subir",
        "weak": "Débil",
        "weekHeader": "Sem",
        "aria": {
          "cancelEdit": "Cancelar editado",
          "close": "Cerrar",
          "collapseLabel": "Colapsar",
          "collapseRow": "Reducir Fila",
          "editRow": "Editar fila",
          "expandLabel": "Expandir",
          "expandRow": "Expandir Fila",
          "falseLabel": "Falso",
          "filterConstraint": "Restricción de filtro",
          "filterOperator": "Operador de filtro",
          "firstPageLabel": "Primera Página",
          "gridView": "Vista de cuadrícula",
          "hideFilterMenu": "Ocultar menú del filtro",
          "jumpToPageDropdownLabel": "Ir al menú desplegable de página",
          "jumpToPageInputLabel": "Ir a la entrada de página",
          "lastPageLabel": "Última Página",
          "listView": "Vista de lista",
          "moveAllToSource": "Mover todo al origen",
          "moveAllToTarget": "Mover todo al objetivo",
          "moveBottom": "Desplazarse hacia abajo",
          "moveDown": "Bajar",
          "moveTop": "Mover arriba",
          "moveToSource": "Mover al origen",
          "moveToTarget": "Mover al objetivo",
          "moveUp": "Subir",
          "navigation": "Navegación",
          "next": "Siguiente",
          "nextPageLabel": "Siguiente Página",
          "nullLabel": "No seleccionado",
          "otpLabel": "Introduzca el carácter de contraseña de un solo uso {0}",
          "pageLabel": "Página {page}",
          "passwordHide": "Contraseña oculta",
          "passwordShow": "Mostrar contraseña",
          "previous": "Anterior",
          "previousPageLabel": "Página Anterior",
          "rotateLeft": "Girar a la izquierda",
          "rotateRight": "Girar a la derecha",
          "rowsPerPageLabel": "Filas por página",
          "saveEdit": "Guardar editado",
          "scrollTop": "Desplazarse hacia arriba",
          "selectAll": "Seleccionar todos",
          "selectLabel": "Seleccionar",
          "selectRow": "Seleccionar fila",
          "showFilterMenu": "Mostrar menú del filtro",
          "slide": "Deslizar",
          "slideNumber": "{slideNumber}",
          "star": "1 estrella",
          "stars": "{star} estrellas",
          "trueLabel": "Verdadero",
          "unselectAll": "Deseleccionar todos",
          "unselectLabel": "Deseleccionar",
          "unselectRow": "Desmarcar fila",
          "zoomImage": "Ampliar imagen",
          "zoomIn": "Ampliar",
          "zoomOut": "Reducir"
        }
    },
    theme: {
        preset: Blue,
        options: {
          darkModeSelector: '.my-app-dark',
      }
    }
});
app.use(createPinia())
app.use(router)
app.component('DataTable', DataTable);
app.component('DataView', DataView);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('Button', Button);
app.component('Tag', Tag);
app.component('Fieldset', Fieldset);
app.component('ButtonGroup', ButtonGroup);
app.component('InputText', InputText);
app.component('InputIcon', InputIcon);
app.component('InputNumber', InputNumber);
app.component('IconField', IconField);
app.component('DatePicker', DatePicker);
app.component('Checkbox', Checkbox);
app.component('MultiSelect', MultiSelect);
app.component('Dialog', Dialog);
app.component('Skeleton', Skeleton);
app.directive('tooltip', Tooltip);
app.mount('#app')
