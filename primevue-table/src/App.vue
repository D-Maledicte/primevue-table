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
::-webkit-scrollbar {
  width: 6px !important;
}

::-webkit-scrollbar-track {
  background: #f1f1f1 !important;
}

::-webkit-scrollbar-thumb {
  background: #888 !important;
  border-radius: 10px !important;
}
</style>
