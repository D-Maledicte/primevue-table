import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Button from "primevue/button";
import 'primeicons/primeicons.css';
const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
      }
    }
});
app.component('Button', Button);
app.mount('#app')