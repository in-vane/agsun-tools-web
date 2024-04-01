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

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const images = ref([]);
const completed = ref([false, false]);
const response = ref({
  code: 0,
  msg: '',
  data: {
    pages: [],
    imgs_base64: [],
    error_msg: '',
  },
});

const loading = ref(false);

const openWebsocket = () => {
  loading.value = true;
  const websocket = new WebSocket(SOCKET_URL);

  websocket.onopen = (e) => {
    console.log('connected: ', e);
    sendMessage(0);
    sendMessage(1);
  };
  websocket.onclose = (e) => {
    console.log('disconnected: ', e);
    loading.value = false;
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const { total, current, img_base64 } = data;
    if (img_base64) {
      images.value.push(img_base64);
      completed.value[options.index] = current == total;
      completed.value.every((_) => _) && ws.value.close();
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
    type: WEBSOCKET_TYPE.PDF2IMG,
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
  // openWebsocket();
  loading.value = true;
  const formData = new FormData();
  for (const item of fileList.value) {
    formData.append(item.file.name, item.file);
  }
  lyla
    .post('/fullPage', { body: formData })
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
    <!-- upload -->
    <div>
      <n-h3 prefix="bar">1. 上传PDF</n-h3>
      <n-upload
        multiple
        ref="upload"
        accept=".pdf"
        :max="2"
        :default-upload="false"
        v-model:file-list="fileList"
        :disabled="loading"
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
      <n-button :disabled="loading" @click="handleUpload"> 开始检测 </n-button>
    </div>
    <!-- result -->
    <div>
      <n-spin :show="loading">
        <n-h3 prefix="bar">2. 检测结果</n-h3>
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
.preview-box {
  display: flex;
  gap: 12px;
  min-height: 200px;
  border-radius: 3px;
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
}
</style>