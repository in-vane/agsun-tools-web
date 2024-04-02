<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { INFO_NO_FILE, MESSAGE_ERROR_PARAMS } from '@/config/const.config.js';

const upload = ref(null);
const message = useMessage();

const fileList = ref([]);
const limit = ref('');
const response = ref({ code: -1, data: {}, msg: '' });

const loading = ref(false);

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  let n = parseInt(limit.value);
  if (Number.isNaN(n)) {
    message.error(MESSAGE_ERROR_PARAMS);
    return;
  }
  if (n < 0) {
    message.error(MESSAGE_ERROR_PARAMS);
    return;
  }
  loading.value = true;
  const formData = new FormData();
  formData.append('file', fileList.value[0].file);
  formData.append('limit', n);

  lyla
    .post('/language', { body: formData })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loading.value = false;
    });
};
const renderRowClass = (rowData) => (rowData.error ? 'row-error' : '');
const columns = [
  { title: '目录语言', key: 'language' },
  { title: '页码范围', render: (_) => _.page_number.join(' ~ ') },
  { title: '顺序正误', render: (_) => (_.error ? '错误' : '正确') },
  { title: '正文语言', render: (_) => (_.error ? _.actual_language : '-') },
];
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <n-spin :show="loading">
      <n-h3 prefix="bar">1. 上传PDF</n-h3>
      <n-upload
        ref="upload"
        accept=".pdf"
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
            检查说明书中语言顺序是否正确
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-space>
        <n-input-group>
          <n-input-group-label>遍历</n-input-group-label>
          <n-input v-model:value="limit" autosize placeholder="所有" />
          <n-input-group-label>页以检索目录</n-input-group-label>
        </n-input-group>
        <n-button type="primary" ghost @click="handleUpload">
          开始检查
        </n-button>
      </n-space>
    </n-spin>
    <!-- result -->
    <div v-show="response.code != -1">
      <n-h3
        prefix="bar"
        :class="`${response.code == 1 && 'n-h3-error'}`"
        :type="response.code == 1 ? 'error' : 'success'"
      >
        2. 语言顺序检测结果 {{ response.code == 1 ? ': 未检测到目录' : '' }}
      </n-h3>
      <n-data-table
        size="small"
        :columns="columns"
        :data="response.data.language"
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
.n-input {
  min-width: 80px;
}
:deep(.row-error td) {
  color: rgb(208, 48, 80);
  background: rgba(208, 48, 80, 0.2);
}
.n-h3-error::after {
  content: ' ';
  width: calc(100% - 8px);
  height: 100%;
  position: absolute;
  left: 8px;
  border-radius: 3px;
  background: rgba(208, 48, 80, 0.2);
}
</style>