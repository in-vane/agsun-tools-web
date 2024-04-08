<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { NIcon, NMessageProvider } from 'naive-ui';
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