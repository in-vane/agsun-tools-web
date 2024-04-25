<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla, SOCKET_URL } from '@/request';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import {
  SHARD_SIZE,
  PDF2IMG_MODE,
  WEBSOCKET_TYPE,
  CROP_BOX_STYLE,
} from '@/config/const.config';
import { onlyAllowNumber } from '@/utils';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);
const completed = ref([false, false]);

const fileList = ref([]);
const active = ref(false);
const limit = ref([
  { start: '', end: '' },
  { start: '', end: '' },
]);
const progress = ref(['', '']);
const current = ref([0, 0]);
const images = ref([[], []]);
const cropend = ref([]);
const response = ref({ result: '' });

const loadingUpload = ref(false);
const loadingCompare = ref(false);

/**
 * @param {number} i 第i个文件的limit参数
 */
const isLimitError = (i) => {
  const params = limit.value[i];
  let start = parseInt(params.start);
  let end = parseInt(params.end);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    message.error('请正确填写起止页');
    return true;
  }
  if (end < start) {
    message.error('起始页不能大于结束页');
    return true;
  }

  return false;
};

const reset = () => {
  completed.value = [false, false];
  progress.value = ['', ''];
  current.value = [0, 0];
  images.value = [[], []];
};

const openWebsocket = () => {
  const websocket = new WebSocket(SOCKET_URL);

  websocket.onopen = (e) => {
    console.log('connected: ', e);
    if (active.value) {
      const isError1 = isLimitError(0);
      const isError2 = isLimitError(1);
      if (isError1 || isError2) {
        return;
      }
    }
    loadingUpload.value = true;
    reset();
    sendMessage(0);
    sendMessage(1);
  };
  websocket.onclose = (e) => {
    console.log('disconnected: ', e);
    loadingUpload.value = false;
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const { total, current, img_base64, options } = data;
    if (img_base64) {
      images.value[options.index].push(img_base64);
      progress.value[options.index] = `${current} / ${total}`;
      completed.value[options.index] = current == total;
      completed.value.every((_) => _) && ws.value.close();
    }
  };
  websocket.onerror = (e) => {
    console.log('error: ', e);
    ws.value.close();
  };

  ws.value = websocket;
};

/**
 * @param {number} index 第i个文件
 */
const sendMessage = (index) => {
  const file = fileList.value[index].file;
  const size = file.size;
  const total = Math.ceil(size / SHARD_SIZE);
  const params = {
    type: WEBSOCKET_TYPE.PDF2IMG,
    fileName: file.name,
    total,
    options: {
      mode: PDF2IMG_MODE.NORMAL,
      index,
    },
  };
  if (active.value) {
    const { start, end } = limit.value[index];
    Object.assign(params.options, { start, end });
  }

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

const handlePreviewClick = (selectedPDF, selectedImg) => {
  current.value[0] = selectedPDF;
  current.value[1] = selectedImg;
};

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  cropend.value[current.value[0]] = base64;
};

const handleUpload = () => {
  if (fileList.value.length != 2) {
    message.info('请选择2份文件');
    return;
  }
  openWebsocket();
};

const handleCompare = () => {
  if (cropend.value.length != 2) {
    message.info('两张图都需要选择区域，点击缩略图切换！');
    return;
  }
  loadingCompare.value = true;
  const formData = new FormData();
  formData.append('img_1', cropend.value[0].split(',')[1]);
  formData.append('img_2', cropend.value[1].split(',')[1]);
  lyla
    .post('/explore', { body: formData })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingCompare.value = false;
    });
};

const handleSaveResult = () => {
  // const data = response.value.split(',')[1];
  // handleDownload(data, 'img');
};

const handleKeyDownEsc = (e) => {
  if (e.keyCode == 27) {
    cropper.clear();
  }
};

const options = {
  viewMode: 1,
  dragMode: 'move',
  autoCrop: true,
  cropend: handleGetCrop,
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDownEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDownEsc);
});
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <div>
      <n-h3 prefix="bar">1. 文档对比(区域模式), 请选择文件上传</n-h3>
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
            检查两份pdf中爆炸图与安装图不一致的部分
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-space align="center">
        <n-switch v-model:value="active" size="large">
          <template #checked> 指定 </template>
          <template #unchecked> 指定 </template>
        </n-switch>
        <n-input-group>
          <n-input-group-label>文件一</n-input-group-label>
          <n-input
            :disabled="!active"
            v-model:value="limit[0].start"
            :allow-input="onlyAllowNumber"
            autosize
            placeholder="从"
          />
          <n-input
            :disabled="!active"
            v-model:value="limit[0].end"
            :allow-input="onlyAllowNumber"
            autosize
            placeholder="到"
          />
        </n-input-group>
        <n-input-group>
          <n-input-group-label>文件二</n-input-group-label>
          <n-input
            :disabled="!active"
            v-model:value="limit[1].start"
            :allow-input="onlyAllowNumber"
            autosize
            placeholder="从"
          />
          <n-input
            :disabled="!active"
            v-model:value="limit[1].end"
            :allow-input="onlyAllowNumber"
            autosize
            placeholder="到"
          />
        </n-input-group>
        <n-button
          type="primary"
          ghost
          :disabled="loadingUpload"
          @click="handleUpload"
        >
          开始转换
        </n-button>
      </n-space>
    </div>
    <!-- preview -->
    <n-spin :show="loadingUpload">
      <div class="box-divider">
        <div class="box-divider-item">
          <n-h3 prefix="bar"> 文件1中的图像预览 {{ progress[0] }} </n-h3>
          <div class="scroll-box">
            <n-scrollbar class="n-scrollbar" x-scrollable>
              <div class="preview-box">
                <n-image
                  v-for="(img, i) in images[0]"
                  :key="i"
                  :src="img"
                  alt="image"
                  height="200px"
                  preview-disabled
                  @click="(e) => handlePreviewClick(0, i)"
                />
              </div>
            </n-scrollbar>
            <div class="preview-crop">
              <n-image
                v-show="cropend[0]"
                :src="cropend[0]"
                height="120px"
                width="100%"
                alt="image"
              />
            </div>
          </div>
        </div>
        <div class="box-divider-item">
          <n-h3 prefix="bar">文件2中的图像预览 {{ progress[1] }}</n-h3>
          <div class="scroll-box">
            <n-scrollbar x-scrollable>
              <div class="preview-box">
                <n-image
                  v-for="(img, i) in images[1]"
                  :key="i"
                  :src="img"
                  alt="image"
                  height="200px"
                  preview-disabled
                  @click="(e) => handlePreviewClick(1, i)"
                />
              </div>
            </n-scrollbar>
            <div class="preview-crop">
              <n-image
                v-show="cropend[1]"
                :src="cropend[1]"
                height="120px"
                width="100%"
                alt="image"
              />
            </div>
          </div>
        </div>
      </div>
    </n-spin>
    <!-- result -->
    <div class="box-divider">
      <div class="box-divider-item">
        <n-space justify="space-between">
          <n-h3 prefix="bar">3. 选取对比区域</n-h3>
          <n-button type="primary" ghost @click="handleCompare">
            开始对比
          </n-button>
        </n-space>
        <vue-picture-cropper
          :boxStyle="CROP_BOX_STYLE"
          :img="images[current[0]][current[1]]"
          :options="options"
        />
      </div>
      <div class="box-divider-item">
        <n-spin :show="loadingCompare">
          <n-space justify="space-between">
            <n-h3 prefix="bar">5. 对比结果</n-h3>
            <n-button type="primary" ghost @click="handleSaveResult">
              保存结果
            </n-button>
          </n-space>
          <div class="preview-box preview-box-result">
            <n-image
              v-show="response.result"
              :src="response.result"
              alt="image"
              width="100%"
            />
          </div>
        </n-spin>
      </div>
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
.box-divider {
  display: flex;
  gap: 24px;
}
.box-divider-item {
  width: calc(50% - 12px);
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
  border: 1px dashed rgb(224, 224, 230);
  border-radius: 3px;
  min-width: 150px;
  min-height: 200px;
}
.preview-box-skeleton {
  background: rgb(250, 250, 252);
  border: 1px dashed rgb(224, 224, 230);
  min-height: 120px;
}
.scroll-box {
  display: flex;
  gap: 12px;
}
.preview-box-result {
  margin-top: 8px;
  min-height: 400px;
}
.n-input {
  min-width: 80px;
}
</style>