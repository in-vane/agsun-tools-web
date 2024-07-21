<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMessage, useNotification } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla, openWebsocket } from '@/request';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import { WEBSOCKET_TYPE, CROP_BOX_STYLE } from '@/config/const.config';
import {
  onlyAllowNumber,
  checkFileUploaded,
  uploadFile,
  getImages,
} from '@/utils';

const message = useMessage();
const notification = useNotification();
const upload = ref(null);
const ws = ref([null, null]);

const mode = ref(0);
const selectOptions = [
  { label: '精细模式', value: 0 },
  { label: '默认模式', value: 1 },
];

const fileList = ref([]);
const filePath = ref(['', '']);
const active = ref(false);
const limit = ref([
  { start: '', end: '' },
  { start: '', end: '' },
]);
const current = ref([0, 0]);
const images = ref([[], []]);
const cropend = ref([]);
const response = ref({ result: '' });

const loadingUpload = ref(false);
const loadingCompare = ref(false);

const genOptions = (i) => {
  const options = {};
  if (active.value) {
    const { start, end } = limit.value[i];
    Object.assign(options, { start, end });
  }
  return options;
};

const onmessage = (e, i) => {
  const data = JSON.parse(e.data);
  const { file_path, img_base64, complete } = data;
  if (file_path) {
    filePath.value[i] = file_path;
    const options = genOptions(i);
    getImages(ws.value[i], file_path, options);
  }
  if (img_base64) {
    images.value[i].push(img_base64);
  }
  if (complete) {
    ws.value[i].close();
  }
};

const onopen = (type, i) => {
  current.value[i] = 0;
  images.value[i] = [];
  if (type == WEBSOCKET_TYPE.UPLOAD) {
    uploadFile(ws.value[i], fileList.value[i].file);
  }
  if (type == WEBSOCKET_TYPE.PDF2IMG) {
    const options = genOptions(i);
    getImages(ws.value[i], filePath.value[i], options);
  }
};

const handleUpload = async () => {
  if (fileList.value.length != 2) {
    message.info('请选择2份文件');
    return;
  }
  let record = null;
  let type = WEBSOCKET_TYPE.UPLOAD;
  for (let i = 0; i < 2; i++) {
    record = await checkFileUploaded(fileList.value[i].file);
    if (record) {
      filePath.value[i] = record.file_path;
      type = WEBSOCKET_TYPE.PDF2IMG;
    }
    ws.value[i] = openWebsocket(
      loadingUpload,
      () => onopen(type, i),
      (e) => onmessage(e, i)
    );
  }
};

const handlePreviewClick = (selectedPDFIndex, selectedImgIndex) => {
  current.value[0] = selectedPDFIndex;
  current.value[1] = selectedImgIndex;
};

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  cropend.value[current.value[0]] = base64;
};

const handleCompare = () => {
  if (cropend.value.length != 2) {
    message.info('两张图都需要选择区域，点击缩略图切换选择区域。');
    return;
  }
  loadingCompare.value = true;
  const params = {
    mode: mode.value,
    file_path_1: filePath.value[0],
    file_path_2: filePath.value[1],
    img_1: cropend.value[0].split(',')[1],
    img_2: cropend.value[1].split(',')[1],
  };
  lyla
    .post('/area', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {
      const msg = typeof err == 'string' ? err : err.message;
      notification.error({
        title: '任务失败',
        content: msg,
      });
    })
    .finally(() => {
      loadingCompare.value = false;
    });
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
            检查两份pdf中爆炸图与安装图不一致的部分
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-space align="center">
        <n-select v-model:value="mode" :options="selectOptions" />
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
          <n-h3 prefix="bar"> 文件1中的图像预览 </n-h3>
          <div class="scroll-box">
            <n-scrollbar class="n-scrollbar" x-scrollable trigger="none">
              <div class="preview-box">
                <div v-for="(img, i) in images[0]" :key="i">
                  <n-badge
                    :value="i + 1"
                    :color="
                      current[0] == 0
                        ? current[1] == i
                          ? '#18a058'
                          : 'gray'
                        : 'gray'
                    "
                    :offset="[-10, 10]"
                  >
                    <n-image
                      :src="img"
                      alt="image"
                      height="200px"
                      preview-disabled
                      @click="(e) => handlePreviewClick(0, i)"
                    />
                  </n-badge>
                </div>
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
          <n-h3 prefix="bar">文件2中的图像预览 </n-h3>
          <div class="scroll-box">
            <n-scrollbar x-scrollable trigger="none">
              <div class="preview-box">
                <div v-for="(img, i) in images[1]" :key="i">
                  <n-badge
                    :value="i + 1"
                    :color="
                      current[0] == 1
                        ? current[1] == i
                          ? '#18a058'
                          : 'gray'
                        : 'gray'
                    "
                    :offset="[-10, 10]"
                  >
                    <n-image
                      :src="img"
                      alt="image"
                      height="200px"
                      preview-disabled
                      @click="(e) => handlePreviewClick(1, i)"
                    />
                  </n-badge>
                </div>
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
        <div class="crop-box">
          <vue-picture-cropper
            :boxStyle="CROP_BOX_STYLE"
            :img="images[current[0]][current[1]]"
            :options="options"
          />
        </div>
      </div>
      <div class="box-divider-item">
        <n-spin :show="loadingCompare">
          <n-space justify="space-between">
            <n-h3 prefix="bar">4. 对比结果(以文件1的区域为参照)</n-h3>
            <!-- <n-button type="primary" ghost @click="handleSaveResult">
              保存结果
            </n-button> -->
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
.n-select {
  width: 140px;
}
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
  border: 1px dashed #18a058;
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
.crop-box {
  margin-top: 8px;
}
</style>