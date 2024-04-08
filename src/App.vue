<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="content">
    <n-message-provider :max="1">
      <router-view />
    </n-message-provider>
  </div>
</template>

<style scoped>
.content {
  min-height: 100vh;
}
</style>