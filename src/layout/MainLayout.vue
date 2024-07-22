<script setup>
import { h, onMounted, ref, watchEffect } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
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

import CArea from '@/views/AreaView.vue';
import CFull from '@/views/FullPageView.vue';
import CCount from '@/views/PartCountView.vue';
import CPageNo from '@/views/PageNumberView.vue';
import CScrew from '@/views/ScrewView.vue';
import CCe from '@/views/CEView.vue';
import CSize from '@/views/SizeView.vue';
import CLang from '@/views/LanguageView.vue';
import COcr from '@/views/OCRView.vue';
import CLine from '@/views/LineView.vue';
import CHis from '@/views/History/HistoryView.vue';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo || {};

const renderLabel = (path, label) => () =>
  h(RouterLink, { to: { path } }, { default: () => label });

const menuOptions = [
  {
    label: renderLabel('/area', '区域对比'),
    key: 'area',
    name: '区域对比',
    icon: renderIcon(ISpark),
  },
  {
    label: renderLabel('/fullPage', '整页对比'),
    key: 'fullPage',
    name: '整页对比',
    icon: renderIcon(IDoc),
  },
  {
    label: renderLabel('/count', '零件计数'),
    key: 'count',
    name: '零件计数',
    icon: renderIcon(ICog),
  },
  {
    label: renderLabel('/pageNo', '页码检查'),
    key: 'pageNo',
    name: '页码检查',
    icon: renderIcon(IBook),
  },
  {
    label: renderLabel('/screw', '螺丝包'),
    key: 'screw',
    name: '螺丝包',
    icon: renderIcon(IBuild),
  },
  {
    label: renderLabel('/ce', 'CE表对比'),
    key: 'ce',
    name: 'CE表对比',
    icon: renderIcon(ITable),
  },
  {
    label: renderLabel('/size', 'CE贴纸尺寸'),
    key: 'size',
    name: 'CE贴纸尺寸',
    icon: renderIcon(ICrop),
  },
  {
    label: renderLabel('/lang', '语言顺序'),
    key: 'lang',
    name: '语言顺序',
    icon: renderIcon(ILang),
  },
  {
    label: renderLabel('/ocr', '实物检测'),
    key: 'ocr',
    name: '实物检测',
    icon: renderIcon(ICamera),
  },
  {
    label: renderLabel('/line', '线段检测'),
    key: 'line',
    name: '线段检测',
    icon: renderIcon(ILine),
  },
  {
    label: renderLabel('/history', '历史检索'),
    key: 'history',
    name: '历史检索',
    icon: renderIcon(IAlbums),
  },
];

const routeName = ref('');
const route = useRoute();
const router = useRouter();

const show = ref(false);

const currentTab = ref('');
const panels = ref([]);

const LAYOUT_STYLE = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const handleClose = (key) => {
  const p = panels.value;
  const index = p.findIndex((_) => _.key == key);
  p.splice(index, 1);
  if (p.length > 0) {
    if (index == 0) {
      currentTab.value = p[0].key;
      router.push(p[0].key);
    }
    if (currentTab.value === key) {
      currentTab.value = p[index - 1].key;
      router.push(p[index - 1].key);
    }
  }
};

const onUpdateTab = (key) => {
  router.push(key);
};

const onUpdateMenu = (key, item) => {
  const p = panels.value;
  const i = p.findIndex((_) => _.key == key);
  if (i == -1) {
    p.push({ key: key, name: item.name });
    currentTab.value = key;
  }
};

const getComponent = (key) => {
  switch (key) {
    case 'area':
      return CArea;
    case 'fullPage':
      return CFull;
    case 'count':
      return CCount;
    case 'pageNo':
      return CPageNo;
    case 'screw':
      return CScrew;
    case 'ce':
      return CCe;
    case 'size':
      return CSize;
    case 'lang':
      return CLang;
    case 'ocr':
      return COcr;
    case 'line':
      return CLine;
    case 'history':
      return CHis;

    default:
      break;
  }
};

watchEffect(() => {
  routeName.value = route.name;
  currentTab.value = route.name;
});

const logoutHanlder = async () => {
  await userStore.logout();
  location.href = '/login';
};

onMounted(() => {
  const key = route.name;
  const name = menuOptions.find((item) => item.key == key)?.name;
  panels.value.push({ key, name });
});
</script>

<template>
  <n-layout :content-style="LAYOUT_STYLE">
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
          :on-update:value="onUpdateMenu"
        />
      </n-layout-sider>
      <n-layout-content
        content-style="padding: 24px;"
        :native-scrollbar="false"
      >
        <n-tabs
          v-model:value="currentTab"
          type="card"
          :closable="panels.length > 1"
          tab-style="min-width: 80px;"
          @close="handleClose"
          @update:value="onUpdateTab"
        >
          <n-tab-pane
            display-directive="show"
            v-for="panel in panels"
            :key="panel.key"
            :tab="panel.name"
            :name="panel.key"
          >
            <component :is="getComponent(panel.key)" :key="panel.key" />
          </n-tab-pane>
        </n-tabs>
        <!-- <router-view /> -->
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