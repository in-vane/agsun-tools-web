<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="content">
    <n-notification-provider>
      <n-message-provider :max="2">
        <router-view />
      </n-message-provider>
    </n-notification-provider>
  </div>
</template>

<style scoped>
.content {
  min-height: 100vh;
}
</style>