<script setup>
import { onMounted, ref, h, watch } from 'vue';
import { useMessage, NButton } from 'naive-ui';
import { lyla } from '@/request';
import { taskOptions, taskMap, rules, data } from './config';

const message = useMessage();

const formRef = ref(null);
const formValue = ref({
  username: 'admin',
  datetime: 1183135260000,
  type_id: '001',
  file_path: [],
});
const fileOptions = ref([]);
const disabled = ref(true);

const loading = ref(false);
const page = ref(1);
const response = ref([]);

const showModal = ref(false);
const images = ref([]);

const search = (page) => {
  loading.value = true;
  lyla
    .post('/history/search', { json: formRef.value.model })
    .then((res) => {
      console.log(res);
      response.value = Array.isArray(res.json.data) ? res.json.data : [];
    })
    .catch((err) => {})
    .finally(() => (loading.value = false));
};

const handleValidateClick = (e) => {
  e && e.preventDefault();
  console.log(formRef.value.model);
  formRef.value?.validate((errors) => {
    if (!errors) {
      search();
    } else {
      console.log(errors);
    }
  });
};

const handleFiles = () => {
  console.log(formRef.value.model);
  formRef.value?.validate((errors) => {
    disabled.value = errors;
    if (!errors) {
      const params = {
        username: formRef.value.model.username,
        datetime: formRef.value.model.datetime,
        type_id: formRef.value.model.type_id,
      };
      lyla
        .post('/history/files', { json: params })
        .then((res) => {
          console.log(res);
          const result = Array.isArray(res.json.data) ? res.json.data : [];
          const options = result.map((row) => ({
            label: row.file_name,
            value: file_path,
          }));
          fileOptions.value = options;
        })
        .catch((err) => {});
    }
  });
};

const showImages = (row) => {
  images.value = row.images;
  showModal.value = true;
};

const columns = [
  { title: '用户', key: 'username', width: 100, resizable: true },
  { title: '时间', key: 'datetime', width: 120 },
  {
    title: '功能',
    key: 'type_id',
    width: 120,
    render: (row) => taskMap[row.type_id],
  },
  { title: '涉及文件', key: 'file_path', ellipsis: true, resizable: true },
  {
    title: '结果',
    key: 'result',
    children: [
      {
        title: '信息',
        key: 'text',
        ellipsis: true,
        resizable: true,
        render: (row) => row.text || '-',
      },
      {
        title: '图片',
        key: 'images',
        width: 100,
        render: (row) => {
          return h(
            NButton,
            {
              size: 'small',
              onClick: () => showImages(row),
            },
            { default: () => '查看图片' }
          );
        },
      },
      {
        title: '文件',
        key: 'file',
        ellipsis: true,
        render: (row) => row.file || '-',
      },
    ],
  },
];

watch(
  () => [
    formValue.value.username,
    formValue.value.datetime,
    formValue.value.type_id,
  ],
  (newValues, oldValues) => {
    handleFiles();
  },
  { deep: true }
);

onMounted(() => {
  handleFiles();
});
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
      <n-form-item label="文件" path="type_id">
        <n-select
          v-model:value="formValue.file_path"
          placeholder="请先选择前面的项"
          :options="fileOptions"
          :disabled="disabled"
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
      <n-data-table :columns="columns" :data="data" :single-line="false" />
    </n-spin>
    <!-- <n-pagination v-model:page="page" :on-update:page="search" /> -->
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