<script setup>
import { h, ref, watchEffect } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  HomeOutline as IHome,
  LogoTableau as ITable,
  SparklesOutline as ISpark,
  DocumentOutline as IDoc,
  CropOutline as ICrop,
  BookOutline as IBook,
  BuildOutline as IBuild,
  LanguageOutline as ILang,
  CogOutline as ICog,
  CameraOutline as ICamera,
  LogOutOutline as ILogout,
  PencilOutline as ILine,
  AlbumsOutline as IAlbums,
} from '@vicons/ionicons5';
import { renderIcon } from '@/utils';
import { useUserStore } from '@/store/modules/user';

import Doc from '@/views/HomeView.vue';
import agsun from '@/assets/agsun.jpeg';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo || {};

const renderLabel = (path, label) => () =>
  h(RouterLink, { to: { path } }, { default: () => label });

const menuOptions = [
  // { label: renderLabel('/home', '首页'), key: 'home', icon: renderIcon(IHome) },
  {
    label: renderLabel('/area', '区域对比'),
    key: 'area',
    icon: renderIcon(ISpark),
  },
  {
    label: renderLabel('/fullPage', '整页对比'),
    key: 'fullPage',
    icon: renderIcon(IDoc),
  },
  {
    label: renderLabel('/count', '零件计数'),
    key: 'count',
    icon: renderIcon(ICog),
  },
  {
    label: renderLabel('/pageNo', '页码检查'),
    key: 'pageNo',
    icon: renderIcon(IBook),
  },
  {
    label: renderLabel('/screw', '螺丝包'),
    key: 'screw',
    icon: renderIcon(IBuild),
  },
  {
    label: renderLabel('/ce', 'CE表对比'),
    key: 'ce',
    icon: renderIcon(ITable),
  },
  {
    label: renderLabel('/size', 'CE贴纸尺寸'),
    key: 'size',
    icon: renderIcon(ICrop),
  },
  {
    label: renderLabel('/lang', '语言顺序'),
    key: 'lang',
    icon: renderIcon(ILang),
  },
  {
    label: renderLabel('/ocr', '实物检测'),
    key: 'ocr',
    icon: renderIcon(ICamera),
  },
  {
    label: renderLabel('/line', '线段检测'),
    key: 'line',
    icon: renderIcon(ILine),
  },
  {
    label: renderLabel('/history', '历史检索'),
    key: 'history',
    icon: renderIcon(IAlbums),
  },
];

const routeName = ref('');
const route = useRoute();

const show = ref(false);

watchEffect(() => {
  routeName.value = route.name;
});

const logoutHanlder = async () => {
  await userStore.logout();
  location.href = '/login';
};
</script>

<template>
  <n-layout
    :content-style="{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <n-layout-header bordered>
      <n-flex justify="space-between" align="center">
        <n-image :src="agsun" />
        <n-flex :size="24" align="center">
          <n-text>欢迎, {{ userInfo.name || 'admin' }}</n-text>
          <n-button @click="show = true"> 使用文档 </n-button>
          <n-button @click="logoutHanlder"> 登出 </n-button>
        </n-flex>
      </n-flex>
    </n-layout-header>
    <n-layout has-sider>
      <n-layout-sider
        bordered
        :default-collapsed="false"
        collapse-mode="width"
        :collapsed-width="64"
        :width="200"
        show-trigger="arrow-circle"
        :native-scrollbar="false"
      >
        <n-menu
          :options="menuOptions"
          :value="routeName"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :default-expanded-keys="['functions']"
        />
      </n-layout-sider>
      <n-layout-content
        content-style="padding: 24px;"
        :native-scrollbar="false"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
    <n-drawer v-model:show="show" :width="800">
      <n-drawer-content title="使用文档">
        <Doc />
      </n-drawer-content>
    </n-drawer>
  </n-layout>
</template>

<style scoped>
.n-layout-header {
  padding: 0 24px;
}
.n-layout-footer {
  padding: 8px;
  color: rgb(118, 124, 130);
  background: none;
  text-align: center;
}
</style>