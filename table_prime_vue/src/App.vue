<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'

const toggleColorScheme = () => {
    document.body.classList.toggle("my-app-dark");
}

</script>

<template>
  <header>
      <HelloWorld msg="You did it!" />
      <Button label="Check" icon="pi pi-check" @click="toggleColorScheme()"></Button>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
