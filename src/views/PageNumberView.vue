<script setup>
import { ref } from 'vue';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import { lyla, openWebsocket } from '@/request';
import {
  SHARD_SIZE,
  INFO_NO_FILE,
  PDF2IMG_MODE,
  WEBSOCKET_TYPE,
  CROP_BOX_STYLE,
} from '@/config/const.config';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const filePath = ref('');
const images = ref([]);
const current = ref(0);
const cropend = ref('');
const rect = ref([]);
const response = ref({
  code: null,
  data: {
    error: false,
    error_page: [],
    note: '',
    result: [],
  },
  msg: '',
});

const MODE_NORMAL = 0;
const MODE_RECT = 1;
const sltoptions = [
  { label: '默认模式', value: MODE_NORMAL },
  { label: '区域模式', value: MODE_RECT },
];
const mode = ref(MODE_NORMAL);

const loadingUpload = ref(false);
const loadingResult = ref(false);

const reset = () => {
  images.value = [];
  rect.value = [];
};

const sendMessage = () => {
  const file = fileList.value[0].file;
  const size = file.size;
  const total = Math.ceil(size / SHARD_SIZE);
  const params = {
    type: WEBSOCKET_TYPE.PDF2IMG,
    fileName: file.name,
    total,
    options: { mode: PDF2IMG_MODE.NORMAL },
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

const onopen = (e) => {
  console.log('connected: ', e);
  reset();
  sendMessage();
};

const onmessage = (e) => {
  const data = JSON.parse(e.data);
  const { img_base64, total, current, file_path } = data;
  if (img_base64) {
    images.value.push({ src: img_base64, page: current });
    current == total && ws.value.close();
  }
  filePath.value = file_path;
};

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  ws.value = openWebsocket(loadingUpload, onopen, onmessage);
};

const sendRect = () => {
  if (mode.value == MODE_RECT && !cropend.value) {
    message.error('请拉取页码范围高度');
    return;
  }
  if (mode.value == MODE_NORMAL) {
    rect.value = [0, 0, 0, 0];
  }
  loadingResult.value = true;
  const params = {
    rect: rect.value,
    file_path: filePath.value,
  };
  lyla
    .post('/pageNumber', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingResult.value = false;
    });
};

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  const data = cropper.getData(true);
  rect.value = [data.x, data.y, data.width, data.height];
  cropend.value = base64;
};

const options = {
  viewMode: 1,
  dragMode: 'move',
  autoCrop: true,
  cropend: handleGetCrop,
};
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <n-spin :show="loadingUpload">
      <n-h3 prefix="bar">1. 选择要检查的PDF文件</n-h3>
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
            检查页码的缺失、错误等问题
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-button type="primary" ghost @click="handleUpload"> 上传文件 </n-button>
    </n-spin>
    <!-- crop -->
    <n-spin :show="loadingResult">
      <n-h3 prefix="bar">2. 请拉取页码范围高度</n-h3>
      <n-space align="center">
        <n-select v-model:value="mode" :options="sltoptions" />
        <n-button type="primary" ghost @click="sendRect"> 开始任务 </n-button>
      </n-space>
      <div class="scroll-box">
        <n-scrollbar class="n-scrollbar" x-scrollable>
          <div class="preview-box">
            <div class="preview-item" v-for="(img, i) in images" :key="i">
              <n-badge
                :value="i + 1"
                :color="current == i ? '#18a058' : 'gray'"
                :offset="[-10, 10]"
              >
                <n-image
                  :src="img.src"
                  alt="image"
                  height="200px"
                  preview-disabled
                  @click="() => (current = i)"
                />
              </n-badge>
            </div>
          </div>
        </n-scrollbar>
        <div class="preview-crop" v-if="mode == MODE_RECT">
          <n-image
            v-show="cropend"
            :src="cropend"
            height="120px"
            width="100%"
            alt="image"
          />
        </div>
      </div>
      <div class="crop-box" v-if="mode == MODE_RECT">
        <vue-picture-cropper
          :boxStyle="CROP_BOX_STYLE"
          :img="images[current]?.src"
          :options="options"
        />
      </div>
    </n-spin>
    <!-- result -->
    <div v-show="response.code != null">
      <n-h3
        prefix="bar"
        :class="`n-h3-${response.data?.error ? 'error' : 'success'}`"
        :type="response.data?.error ? 'error' : 'success'"
      >
        3. 检测结果: {{ response.data?.note }}
      </n-h3>
      <n-image-group>
        <n-space>
          <div v-for="(img, i) in response.data?.result" :key="i">
            <n-badge :value="response.data?.error_page[i]">
              <n-image :src="img" alt="image" height="200px" />
            </n-badge>
          </div>
        </n-space>
      </n-image-group>
    </div>
  </n-space>
</template>

<style scoped>
.n-space {
  gap: 24px 12px !important;
}
.n-image {
  border-radius: 3px;
  border: solid 1px rgb(224, 224, 230);
}
.scroll-box {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.n-scrollbar {
  flex: 1;
}
.preview-box {
  display: flex;
  gap: 12px;
  min-height: 200px;
  border-radius: 3px;
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
}
.preview-crop {
  border: 1px dashed #18a058;
  border-radius: 3px;
  min-width: 150px;
  min-height: 200px;
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
.crop-box {
  margin-top: 8px;
}
.n-select {
  width: 160px;
}
</style>