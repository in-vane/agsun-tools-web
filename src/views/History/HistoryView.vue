<script setup>
import { ref, h } from 'vue';
import { useMessage, NButton, NIcon, NSpace, NA } from 'naive-ui';
import { DocumentOutline as IDoc } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { download } from '@/utils';
import { useUserStore } from '@/store/modules/user';
import { taskOptions, taskMap, rules, data } from './config';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo || {};

const message = useMessage();
const formRef = ref(null);
const formValue = ref({
  username: userInfo.name || 'admin',
  datetime: new Date().getTime(),
  type_id: '001',
  file_path: [],
});
const fileOptions = ref([]);
const loadingSelect = ref(false);

const loading = ref(false);
const page = ref(1);
const response = ref([]);

const showModal = ref(false);
const images = ref([]);

const searchHistory = (page) => {
  loading.value = true;
  lyla
    .post('/history/searchHistory', { json: formRef.value.model })
    .then((res) => {
      console.log(res);
      response.value = Array.isArray(res.json.data) ? res.json.data : [];
    })
    .catch((err) => {})
    .finally(() => (loading.value = false));
};

const handleValidateClick = (e) => {
  e && e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      searchHistory();
    } else {
      console.log(errors);
    }
  });
};

const searchFiles = () => {
  loadingSelect.value = true;
  const params = {
    username: formRef.value.model.username,
    datetime: formRef.value.model.datetime,
    type_id: formRef.value.model.type_id,
  };
  lyla
    .post('/history/files', { json: params })
    .then((res) => {
      const result = Array.isArray(res.json.data) ? res.json.data : [];
      const options = result.map((row) => ({
        label: row.file_name,
        value: row.file_path,
      }));
      fileOptions.value = options;
    })
    .catch((err) => {})
    .finally(() => {
      loadingSelect.value = false;
    });
};

const showImages = (row) => {
  images.value = row.images;
  showModal.value = true;
};

const onSelectShow = (show) => {
  show && searchFiles();
};

const columns = [
  {
    title: '用户',
    key: 'username',
    width: 80,
    ellipsis: { tooltip: true },
    fixed: 'left',
  },
  { title: '时间', key: 'datetime', width: 180 },
  {
    title: '功能',
    width: 100,
    render: (row) => taskMap[row.type_id],
  },
  {
    title: '对比文件',
    key: 'file_path',
    minWidth: 200,
    render: (row) => {
      return h(
        NSpace,
        null,
        row.related_files.map((file) =>
          h(NA, { href: file.file_path, target: '_blank' }, [file.file_name])
        )
      );
    },
  },
  {
    title: '结果信息',
    key: 'text',
    ellipsis: { tooltip: true },
    render: (row) => row.text || '-',
  },
  {
    title: '结果图片',
    key: 'images',
    width: 80,
    render: (row) => {
      return h(
        NButton,
        {
          size: 'small',
          text: true,
          type: 'primary',
          onClick: () => showImages(row),
        },
        { default: () => '查看' }
      );
    },
  },
  {
    title: '结果文件',
    width: 80,
    render: (row) => {
      return row.result_file
        ? h(
            NButton,
            {
              size: 'small',
              quaternary: true,
              type: 'primary',
              onClick: () => download('result.pdf', row.result_file),
            },
            { icon: () => h(NIcon, null, { default: () => h(IDoc) }) }
          )
        : '-';
    },
  },
];
</script>

<template>
  <n-space vertical>
    <n-form
      ref="formRef"
      inline
      :label-width="80"
      :model="formValue"
      :rules="rules"
      size="medium"
    >
      <n-form-item label="用户" path="username">
        <n-input v-model:value="formValue.username" placeholder="输入姓名" />
      </n-form-item>
      <n-form-item label="时间" path="datetime">
        <n-date-picker v-model:value="formValue.datetime" type="date" />
      </n-form-item>
      <n-form-item label="功能" path="type_id">
        <n-select
          v-model:value="formValue.type_id"
          placeholder="请选择功能"
          :options="taskOptions"
        />
      </n-form-item>
      <n-form-item label="文件" path="file_path">
        <n-select
          v-model:value="formValue.file_path"
          placeholder="请先选择前面的项"
          :options="fileOptions"
          :loading="loadingSelect"
          @update:show="onSelectShow"
          multiple
        />
      </n-form-item>
      <n-form-item>
        <n-button
          type="primary"
          attr-type="button"
          @click="handleValidateClick"
        >
          查询
        </n-button>
      </n-form-item>
    </n-form>
    <n-spin :show="loading">
      <n-data-table
        size="small"
        :columns="columns"
        :data="response"
        :single-line="false"
        scroll-x="100%"
      />
    </n-spin>
    <!-- <n-pagination v-model:page="page" :on-update:page="searchHistory" /> -->
  </n-space>
  <n-modal v-model:show="showModal">
    <n-card
      title="图片结果"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-image-group>
        <n-space>
          <n-image
            v-for="(image, i) in images"
            :key="i"
            :src="image"
            alt="image"
            width="200px"
          />
        </n-space>
      </n-image-group>
    </n-card>
  </n-modal>
</template>

<style scoped>
.n-select {
  min-width: 160px;
}
.n-card {
  width: 50%;
  min-width: 800px;
}
</style> 