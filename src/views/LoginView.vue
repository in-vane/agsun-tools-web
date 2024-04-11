<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { useMessage } from 'naive-ui';

import agsun from '@/assets/agsun.jpeg';

const rules = {
  username: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入用户名',
  },
  password: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入密码',
  },
};

const message = useMessage();
const loading = ref(false);
const model = ref({
  username: '',
  password: '',
});

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const formRef = ref(null);

const handleValidateButtonClick = (e) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const { username, password } = model.value;
      message.loading('登录中...');
      loading.value = true;

      const params = { username, password };
      try {
        const response = await userStore.login(params);
        message.destroyAll();
        if (response.code === 0) {
          const toPath = decodeURIComponent(route.query?.redirect || '/');
          message.success('登录成功，即将进入系统');
          router.replace(toPath);
        } else {
          message.info(response.message || '登录失败');
        }
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<template>
  <div class="layout">
    <div class="content">
      <n-image :src="agsun" alt="agsun-logo" />
      <n-p depth="3">AGSUN-Tools 文档对比工具</n-p>
      <n-form
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item path="username">
          <n-input v-model:value="model.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item path="password">
          <n-input
            v-model:value="model.password"
            type="password"
            placeholder="请输入用户名"
          />
        </n-form-item>
        <div style="display: flex; justify-content: flex-end">
          <n-button
            round
            type="primary"
            attr-type="submit"
            @click="handleValidateButtonClick"
          >
            验证
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url('@/assets/login.svg');
  background-size: 100% 100%;
}
.content {
  flex: 1;
  padding: 56px 12px;
  max-width: 384px;
  min-width: 320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
.n-image {
  margin: 0 auto;
}
.n-p {
  text-align: center;
}
</style>