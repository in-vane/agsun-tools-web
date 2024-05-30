<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla, openWebsocket } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';
import { onlyAllowNumber, checkFileUploaded, uploadFile } from '@/utils';

const upload = ref(null);
const message = useMessage();

const MODE_RECT = 0;
const MODE_CIR = 1;
const OPTIONS = [
  { label: '矩形模式', value: MODE_RECT },
  { label: '圆形模式', value: MODE_CIR },
];

const ws = ref(null);
const fileList = ref([]);
const filePath = ref('');
const loadingUpload = ref(false);

const mode = ref(MODE_RECT);
const active = ref(false);
const size = ref({ width: '', height: '', radius: '' });
const loading = ref(false);
const response = ref({
  code: null,
  data: {
    error: false,
    img_base64: '',
  },
  msg: '',
});

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

const onopen = () => {
  uploadFile(ws.value, fileList.value[0].file);
};

const handleUpload = async () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  const record = await checkFileUploaded(fileList.value[0].file);
  if (record) {
    filePath.value = record.file_path;
    message.success('已上传');
  } else {
    ws.value = openWebsocket(loadingUpload, onopen, onmessage);
  }
};

const checkSize = () => {
  loading.value = true;
  const params = {
    mode: mode.value,
    active: active.value ? 1 : 0,
    width: size.value.width || -1,
    height: size.value.height || -1,
    radius: size.value.radius || -1,
  };
  lyla
    .post('/size', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => (loading.value = false));
};
</script>

<template>
  <n-space vertical>
    <div>
      <n-h3 prefix="bar">1. 选择要检查尺寸的CE文件</n-h3>
      <n-spin :show="loading">
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
              检查贴纸上标注尺寸是否与实际尺寸相符
            </n-p>
          </n-upload-dragger>
        </n-upload>
        <n-space align="center">
          <n-select v-model:value="mode" :options="OPTIONS" />
          <n-switch v-model:value="active" size="large">
            <template #checked> 指定 </template>
            <template #unchecked> 指定 </template>
          </n-switch>
          <n-input-group>
            <n-input-group-label>手动输入</n-input-group-label>
            <n-input
              v-if="mode == MODE_RECT"
              autosize
              placeholder="宽"
              v-model:value="size.width"
              :disabled="!active"
              :allow-input="onlyAllowNumber"
            />
            <n-input
              v-if="mode == MODE_RECT"
              autosize
              placeholder="高"
              v-model:value="size.height"
              :disabled="!active"
              :allow-input="onlyAllowNumber"
            />
            <n-input
              v-if="mode == MODE_CIR"
              autosize
              placeholder="半径"
              v-model:value="size.radius"
              :disabled="!active"
              :allow-input="onlyAllowNumber"
            />
          </n-input-group>
          <n-button type="primary" ghost @click="handleUpload">
            上传文件
          </n-button>
          <n-button type="primary" ghost @click="checkSize">
            开始检查
          </n-button>
        </n-space>
      </n-spin>
    </div>
    <div v-show="response.data?.img_base64">
      <n-h3
        prefix="bar"
        :class="`n-h3-${response.data?.error ? 'error' : 'success'}`"
        :type="response.data?.error ? 'error' : 'success'"
      >
        2. 检测结果: {{ response.data?.message }}
      </n-h3>
      <n-image :src="response.data?.img_base64" alt="image" height="400px" />
    </div>
  </n-space>
</template>

<style scoped>
.n-input {
  min-width: 80px;
}
.n-image {
  border: 1px solid rgb(224, 224, 230);
  border-radius: 3px;
}
.n-h3 {
  margin-bottom: 8px;
}
.n-h3-success::after,
.n-h3-error::after {
  content: ' ';
  width: calc(100% - 8px);
  height: 100%;
  position: absolute;
  left: 8px;
  border-radius: 3px;
}
.n-h3-success::after {
  background: rgba(24, 160, 88, 0.2);
}
.n-h3-error::after {
  background: rgba(208, 48, 80, 0.2);
}
.n-select {
  width: 160px;
}
</style>