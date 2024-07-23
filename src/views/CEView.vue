<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { lyla, openWebsocket } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';
import { onlyAllowNumber, checkFileUploaded, uploadFile } from '@/utils';
import { useFileStore } from '@/store/modules/file';

const fileStore = useFileStore();

const message = useMessage();

const ws = ref([null, null]);
const loadingUpload = ref(false);
const filePath = ref(['', '']);

const mode = ref(0);
const sheet = ref('1');
const options = [
  { label: '常规模式', value: 0 },
  { label: '丹麦模式', value: 1, disabled: true },
];

const loading = ref(false);
const response = ref({
  code: null,
  data: {
    excel_image_base64: '',
    pdf_image_base64: '',
  },
  msg: '',
});

const onmessage = (e, i) => {
  const data = JSON.parse(e.data);
  const { file_path } = data;
  if (file_path) {
    filePath.value[i] = file_path;
    message.info(`文件${i + 1}已上传`);
    ws.value[i].close();
  }
};

const onopen = (i) => {
  uploadFile(ws.value[i], fileStore.currentFiles[i].file);
};

const handleUpload = async () => {
  if (!fileStore.currentFiles.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  let record = null;
  for (let i = 0; i < 2; i++) {
    record = await checkFileUploaded(fileStore.currentFiles[i].file);
    if (record) {
      filePath.value[i] = record.file_path;
      message.info(`文件${i + 1}已上传`);
    } else {
      ws.value[i] = openWebsocket(
        loadingUpload,
        () => onopen(i),
        (e) => onmessage(e, i)
      );
    }
  }
};

const compare = () => {
  loading.value = true;
  const params = {
    mode: mode.value,
    sheet: sheet.value,
    filePath: filePath.value,
  };
  lyla
    .post('/ce', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => (loading.value = false));
};
</script>

<template>
  <div>
    <n-spin :show="loading">
      <n-space>
        <n-select v-model:value="mode" :options="options" />
        <n-input-group>
          <n-input-group-label>第</n-input-group-label>
          <n-input
            type="text"
            placeholder="1"
            v-model:value="sheet"
            :allow-input="onlyAllowNumber"
            autosize
          />
          <n-input-group-label>张Sheet表</n-input-group-label>
        </n-input-group>
        <n-button type="primary" ghost @click="handleUpload"> 上传 </n-button>
        <n-button type="primary" ghost @click="compare"> 开始对比 </n-button>
      </n-space>
    </n-spin>
    <n-divider />
    <n-h3 prefix="bar">2. 检测结果</n-h3>
    <div class="result-box">
      <div v-show="response.data?.excel_image_base64">
        <n-badge value="Excel" color="#18a058" :offset="[-28, 13]">
          <n-image :src="response.data?.excel_image_base64" width="100%" />
        </n-badge>
      </div>
      <div v-show="response.data?.pdf_image_base64">
        <n-badge value="PDF" color="#18a058" :offset="[-24, 13]">
          <n-image :src="response.data?.pdf_image_base64" width="100%" />
        </n-badge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.n-select {
  width: 200px;
}
.n-input {
  min-width: 56px;
}
.result-box {
  display: flex;
  gap: 0 16px;
}
.n-image {
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
}
</style>