<script setup>
import Panel from 'primevue/panel';
const toggleColorScheme = () => {
    document.body.classList.toggle("my-app-dark");
}

</script>

<template>
  <div class="about">
    <Panel header="Header" toggleable>
    <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    </Panel>
    <h1>This is an about page</h1>
    <Button label="Check" icon="pi pi-check" @click="toggleColorScheme()"></Button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
