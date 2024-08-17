<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView class="key"/>
</template>

<style>
@media (min-width: 1024px) {
  .key {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
