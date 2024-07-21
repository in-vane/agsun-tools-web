<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla, openWebsocket } from '@/request';
import {
  download,
  checkFileUploaded,
  uploadFile,
  onlyAllowNumber,
} from '@/utils';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const filePath = ref('');
const MODE_CHECK = 0;
const MODE_FIX = 1;
const OPTIONS = [
  { label: '仅检测', value: MODE_CHECK },
  { label: '检测并加粗', value: MODE_FIX },
];
const mode = ref(MODE_CHECK);
const active = ref(false);
const range = ref([null, null]);
const response = ref({
  code: 0,
  data: {},
  msg: '',
});

const loading = ref(false);

// ==================================================
const onmessage = (e) => {
  const data = JSON.parse(e.data);
  const { file_path } = data;
  if (file_path) {
    filePath.value = file_path;
    message.info('上传已完成');
    ws.value.close();
  }
};

const onopen = (e) => {
  uploadFile(ws.value, fileList.value[0].file);
};

const handleUpload = async () => {
  if (!fileList.value.length) {
    message.info('请选择文件');
    return;
  }
  const record = await checkFileUploaded(fileList.value[0].file);
  if (record) {
    filePath.value = record.file_path;
    message.success('已上传');
  } else {
    ws.value = openWebsocket(loading, onopen, onmessage);
  }
};

const handleCheck = () => {
  loading.value = true;
  const params = {
    file_path: filePath.value,
    mode: mode.value,
  };
  if (active.value) {
    Object.assign(params, {
      start: range.value[0] || -1,
      end: range.value[1] || -1,
    });
  }
  lyla
    .post('/line', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loading.value = false;
    });
};

const handleDownload = () => {
  const file = fileList.value[0].file;
  const filename = file.name;
  download(filename, response.value.data.path);
};
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
          <n-p depth="3" style="margin: 8px 0 0 0"> 检查文件中线的粗细 </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-button type="primary" ghost @click="handleUpload"> 上传文件 </n-button>
    </n-spin>
    <div>
      <n-h3 prefix="bar">2. 参数选择</n-h3>
      <n-space align="center">
        <n-select v-model:value="mode" :options="OPTIONS" />
        <n-switch v-model:value="active" size="large">
          <template #checked> 指定范围 </template>
          <template #unchecked> 指定范围 </template>
        </n-switch>
        <n-input-group>
          <n-input-group-label>从</n-input-group-label>
          <n-input
            autosize
            placeholder="开始"
            v-model:value="range[0]"
            :disabled="!active"
            :allow-input="onlyAllowNumber"
          />
          <n-input-group-label>页到</n-input-group-label>
          <n-input
            autosize
            placeholder="结束"
            v-model:value="range[1]"
            :disabled="!active"
            :allow-input="onlyAllowNumber"
          />
          <n-input-group-label>页</n-input-group-label>
        </n-input-group>
        <n-button type="primary" ghost @click="handleCheck">
          开始检测
        </n-button>
      </n-space>
    </div>
    <div>
      <n-h3 prefix="bar">3. 结果</n-h3>
      <n-button type="primary" ghost @click="handleDownload">
        下载文件
      </n-button>
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
.n-select {
  width: 160px;
}
</style>