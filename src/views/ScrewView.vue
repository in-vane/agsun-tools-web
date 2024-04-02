<script setup>
import { ref } from 'vue';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';

const upload = ref(null);
const fileList = ref([]);
const response = ref({
  error: false,
  result: [],
});
const loading = ref(false);

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  loading.value = true;
  const formData = new FormData();
  formData.append('file', fileList.value[0].file);
  lyla
    .post('/screw', { body: formData })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loading.value = false;
    });
};

const columns = [
  { title: '螺丝型号', key: 'type' },
  { title: '螺丝包总计数', key: 'total' },
  { title: '步骤图总计数', key: 'step_total' },
  {
    title: '步骤图螺丝计数',
    key: 'step_count',
    render: (_) => _.step_count.join(' / '),
  },
  {
    title: '步骤图所在页数',
    key: 'step_page_no',
    render: (_) => _.step_page_no.join(' / '),
  },
];
const renderRowClass = (rowData) =>
  rowData.total == rowData.step_total ? '' : 'row-error';
</script>

<template>
  <n-space vertical>
    <n-spin :show="loading">
      <n-h3 prefix="bar">1. 上传PDF</n-h3>
      <n-upload
        ref="upload"
        :max="1"
        :default-upload="false"
        v-model:file-list="fileList"
        @change="(data) => (fileList = data.fileList)"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <archive-icon />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或者拖动文件到该区域来上传
          </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            检查螺丝包中数量的正误
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-button type="primary" ghost @click="handleUpload">
        开始检查
      </n-button>
    </n-spin>
    <div>
      <n-h3 prefix="bar">2. 零件计数检测结果</n-h3>
      <n-data-table
        size="small"
        :columns="columns"
        :data="response.result"
        :bordered="false"
        :row-class-name="renderRowClass"
      />
    </div>
  </n-space>
</template>

<style scoped>
.n-space {
  gap: 24px 12px !important;
}
.n-h3 {
  margin-bottom: 8px;
}
:deep(.row-error td) {
  color: rgb(208, 48, 80);
  background: rgba(208, 48, 80, 0.2);
}
</style>