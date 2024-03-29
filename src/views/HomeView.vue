<script setup>
</script>

<template>
  <n-result status="418" title="欢迎使用" description="请在左侧目录选择功能">
    <template #footer>
      <n-button>使用说明</n-button>
    </template>
  </n-result>
</template>

<style scoped>
.n-result {
  margin: 80px;
}
</style>