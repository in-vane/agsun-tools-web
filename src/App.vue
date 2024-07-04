<script setup>
import { RouterView } from 'vue-router';

const themeOverrides = {
  common: {
    // primaryColor: '#6B0104',
  },
};
</script>

<template>
  <div class="content">
    <n-message-provider :max="1">
      <n-config-provider :theme-overrides="themeOverrides">
        <router-view />
      </n-config-provider>
    </n-message-provider>
  </div>
</template>

<style scoped>
.content {
  min-height: 100vh;
}
</style>