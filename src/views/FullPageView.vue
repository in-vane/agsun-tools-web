<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla, SOCKET_URL } from '@/request';
import {
  SHARD_SIZE,
  PDF2IMG_MODE,
  INFO_NO_FILE,
  WEBSOCKET_TYPE,
} from '@/config/const.config';
import { onlyAllowNumber } from '@/utils';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const filePath = ref(['', '']);
const active = ref(false);
const start = ref(['', '']);
const response = ref({
  code: 0,
  msg: '',
  data: {
    pages: [],
    imgs_base64: [],
    error_msg: '',
  },
});

const loadingUpload = ref(false);
const loadingCompare = ref(false);

const isComplete = () => filePath.value.every((_) => _);

const openWebsocket = () => {
  loadingUpload.value = true;
  const websocket = new WebSocket(SOCKET_URL);

  websocket.onopen = (e) => {
    console.log('connected: ', e);
    sendMessage(0);
    sendMessage(1);
  };
  websocket.onclose = (e) => {
    console.log('disconnected: ', e);
    loadingUpload.value = false;
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const { file_path, options } = data;
    if (file_path) {
      filePath.value[options.index] = file_path;
      if (isComplete()) {
        message.info('上传已完成');
        ws.value.close();
      }
    }
  };
  websocket.onerror = (e) => {
    console.log('error: ', e);
  };

  ws.value = websocket;
};

const sendMessage = (index) => {
  const file = fileList.value[index].file;
  const size = file.size;
  const total = Math.ceil(size / SHARD_SIZE);
  const params = {
    type: WEBSOCKET_TYPE.COMPARE,
    fileName: file.name,
    total,
    options: {
      mode: PDF2IMG_MODE.VECTOR,
      index,
    },
  };

  for (let i = 0; i < total; i++) {
    const start = i * SHARD_SIZE;
    const end = Math.min(size, start + SHARD_SIZE);
    const fileClip = file.slice(start, end);
    const reader = new FileReader();
    reader.onload = (e) => {
      Object.assign(params, {
        file: reader.result,
        current: i + 1,
      });
      ws.value.send(JSON.stringify(params));
    };
    reader.readAsDataURL(fileClip);
  }
};

const handleUpload = () => {
  if (fileList.value.length != 2) {
    message.info(INFO_NO_FILE);
    return;
  }
  openWebsocket();
};

const handleCompare = () => {
  if (!isComplete()) {
    message.info('请先上传文件');
    return;
  }
  loadingCompare.value = true;
  const params = {
    file_path_1: filePath.value[0],
    file_path_2: filePath.value[1],
    start_1: start.value[0] || -1,
    start_2: start.value[1] || -1,
  };
  if (!active.value) {
    params.start_1 = -1;
    params.start_2 = -1;
  }
  lyla
    .post('/fullPage', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => (loadingCompare.value = false));
};
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <div>
      <n-spin :show="loadingUpload">
        <n-h3 prefix="bar">1. 上传PDF</n-h3>
        <n-upload
          multiple
          ref="upload"
          accept=".pdf"
          :max="2"
          :default-upload="false"
          v-model:file-list="fileList"
          :disabled="loadingUpload"
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
              按页检查两份pdf中不一致的部分
            </n-p>
          </n-upload-dragger>
        </n-upload>
        <n-button type="primary" ghost @click="handleUpload">
          上传文件
        </n-button>
      </n-spin>
    </div>
    <!-- result -->
    <div>
      <n-spin :show="loadingCompare">
        <n-h3 prefix="bar">2. 对比检测</n-h3>
        <n-space align="center">
          <n-switch v-model:value="active" size="large">
            <template #checked> 指定 </template>
            <template #unchecked> 指定 </template>
          </n-switch>
          <n-input-group>
            <n-input-group-label>文件一</n-input-group-label>
            <n-input
              :disabled="!active"
              v-model:value="start[0]"
              :allow-input="onlyAllowNumber"
              autosize
              placeholder="起始"
            />
            <n-input-group-label>页</n-input-group-label>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>文件二</n-input-group-label>
            <n-input
              :disabled="!active"
              v-model:value="start[1]"
              :allow-input="onlyAllowNumber"
              autosize
              placeholder="起始"
            />
            <n-input-group-label>页</n-input-group-label>
          </n-input-group>
          <n-button
            type="primary"
            ghost
            :disabled="loadingCompare"
            @click="handleCompare"
          >
            对比检测
          </n-button>
        </n-space>
        <n-p v-show="response.data?.error_msg">
          {{ response.data?.error_msg }}
        </n-p>
        <n-image-group>
          <n-space>
            <div
              class="preview-item"
              v-for="(page, i) in response.data.pages"
              :key="i"
            >
              <n-badge
                :value="page"
                :color="current == i ? '#18a058' : 'gray'"
                :offset="[-10, 10]"
              >
                <n-image
                  :src="response.data.imgs_base64[i]"
                  alt="image"
                  height="200px"
                  @click="() => (current = i)"
                />
              </n-badge>
            </div>
          </n-space>
        </n-image-group>
      </n-spin>
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
.preview-box {
  display: flex;
  gap: 12px;
  min-height: 200px;
  border-radius: 3px;
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
}
</style>