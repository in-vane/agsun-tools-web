<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { lyla, openWebsocket } from '@/request';
import {
  SHARD_SIZE,
  INFO_NO_FILE,
  PDF2IMG_MODE,
  WEBSOCKET_TYPE,
} from '@/config/const.config';

const message = useMessage();

const ws = ref(null);
const loadingUpload = ref(false);
const fileList = ref([]);
const filePath = ref('');
const images = ref([]);
const progress = ref(0);
const current = ref(0);
const cameras = ref([]);

const MODE_CHAR = 0;
const MODE_ICON = 1;
const mode = ref(MODE_CHAR);
const options = [
  { label: '文字模式', value: MODE_CHAR },
  { label: '图标模式', value: MODE_ICON },
];

const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;
const videoRef = ref(null);
const canvasRef = ref(null);
const capturedImage = ref(null);
const loadingCapture = ref(false);

const mediaTrack = ref(null);
const response = ref({ error: true, result: [] });

// ==========
const reset = () => {
  current.value = 0;
  images.value = [];
  filePath.value = '';
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
  loadingUpload.value = true;
  reset();
  sendMessage();
};

const onmessage = (e) => {
  const data = JSON.parse(e.data);
  const { img_base64, total, current, file_path } = data;
  if (img_base64) {
    images.value.push(img_base64);
    progress.value = total; // 总数，用以显示进度
    current == total && ws.value.close();
  }
  filePath.value = file_path;
};

const handleUploadPDF = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  ws.value = openWebsocket(loadingUpload, onopen, onmessage);
};

const captureImage = () => {
  if (videoRef.value && canvasRef.value) {
    loadingCapture.value = true;
    const context = canvasRef.value.getContext('2d');

    // Set the canvas size to 4K resolution or the video’s actual resolution
    const width = videoRef.value.videoWidth;
    const height = videoRef.value.videoHeight;
    console.log(width, height);

    canvasRef.value.width = width;
    canvasRef.value.height = height;
    context.drawImage(videoRef.value, 0, 0, width, height);

    // Get the data URL of the captured image
    capturedImage.value = canvasRef.value.toDataURL('image/png');
    loadingCapture.value = false;
  }
};

const handleCompare = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  handleCrop();
  loadingUpload.value = true;
  const file = fileList.value[0].file;
  const url = mode.value == MODE_CHAR ? '/ocr_char' : '/ocr_icon';
  const params = {
    filename: file.name,
    mode: mode.value,
    page: current.value + 1,
    crop: capturedImage.value,
  };
  lyla
    .post(url, { json: params })
    .then((res) => {
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingUpload.value = false;
    });
};

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: VIDEO_WIDTH }, height: { ideal: VIDEO_HEIGHT } },
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (error) {
    console.error('Error accessing the camera: ', error);
  }
};

const handleSwitchCamera = (groupId) => {
  handleCloseCamera();
  navigator.mediaDevices
    .getUserMedia({
      video: { groupId, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
    })
    .then((stream) => {
      video.value.srcObject = stream;
      mediaTrack.value = stream;
      video.onloadedmetadata = (e) => {
        video.play();
      };
    })
    .catch((err) => {});
};

const handleCloseCamera = () => {
  videoRef.srcObject = null;
  if (mediaTrack.value) {
    mediaTrack.value.getVideoTracks().forEach((track) => {
      track.stop();
    });
  }
};

onBeforeUnmount(() => {
  handleCloseCamera();
});
</script>

<template>
  <div>
    <!-- upload -->
    <n-spin
      :show="loadingUpload"
      content-class="upload-spin-content"
      :description="`${images.length} / ${progress}`"
    >
      <n-h3 prefix="bar">1. 上传PDF</n-h3>
      <n-upload
        :max="1"
        :default-upload="false"
        v-model:file-list="fileList"
        @change="(data) => (fileList = data.fileList)"
      >
        <n-button>选择文件</n-button>
      </n-upload>
      <n-button
        type="primary"
        ghost
        class="upload-btn"
        @click="handleUploadPDF"
      >
        开始转换
      </n-button>
      <n-scrollbar x-scrollable>
        <div class="preview-box">
          <div class="preview-item" v-for="(img, i) in images" :key="i">
            <n-badge :value="i + 1" :color="current == i ? '#18a058' : 'gray'">
              <n-image
                :class="current == i ? 'current-img' : ''"
                :src="img"
                alt="image"
                height="200px"
                preview-disabled
                @click="() => (current = i)"
              />
            </n-badge>
          </div>
        </div>
      </n-scrollbar>
    </n-spin>
    <n-divider />
    <!-- 操作栏 -->
    <n-space vertical>
      <n-h3 prefix="bar">2. 拍摄对比</n-h3>
      <n-space>
        <n-button @click="startCamera"> 开启摄像头 </n-button>
        <n-popselect
          :options="cameras"
          :on-update:value="handleSwitchCamera"
          trigger="click"
        >
          <n-button :disabled="cameras.length == 0"> 切换摄像头 </n-button>
        </n-popselect>
        <n-select v-model:value="mode" :options="options" />
        <n-button type="primary" ghost @click="captureImage"> 截取 </n-button>
        <n-button type="primary" ghost @click="handleCompare">
          开始检测
        </n-button>
      </n-space>
      <!-- video区域 -->
      <n-spin :show="loadingCapture">
        <n-space size="small">
          <video ref="videoRef" autoplay></video>
          <n-image v-show="images.length" :src="images[current]" :width="160" />
          <n-image v-show="capturedImage" :src="capturedImage" :width="160" />
          <canvas ref="canvasRef"></canvas>
        </n-space>
      </n-spin>
      <!-- result -->
      <div v-show="response.error">
        <n-image-group>
          <n-space>
            <n-image
              v-for="(img, i) in response.result"
              :key="i"
              :src="img"
              alt="image"
              width="200px"
            />
          </n-space>
        </n-image-group>
      </div>
      <n-tag type="error" v-show="!response.error"> 该实物图无法检测 </n-tag>
    </n-space>
  </div>
</template>

<style scoped>
.upload-spin-content {
  position: relative;
}
.upload-btn {
  position: absolute;
  top: 49px;
  left: 91px;
}
.preview-box {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  min-height: 200px;
  border-radius: 3px;
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
}
video {
  border-radius: 3px;
  background: #000;
  width: 100%;
  max-width: 600px;
  height: auto;
}
canvas {
  display: none;
}
.n-image {
  border-radius: 3px;
  border: 1px solid rgb(224, 224, 230);
  cursor: pointer;
}
.current-img {
  border-color: #18a058;
}
.n-select {
  width: 160px;
}
</style>