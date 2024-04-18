<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config.js';
import { onlyAllowNumber } from '@/utils';

const upload = ref(null);
const message = useMessage();

const fileList = ref([]);
const active = ref(false);
const size = ref({ width: '', height: '' });
const response = ref({
  code: null,
  data: {
    error: false,
    img_base64: '',
  },
  msg: '',
});

const loading = ref(false);

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  loading.value = true;
  const formData = new FormData();
  formData.append('file', fileList.value[0].file);
  if (active.value) {
    formData.append('width', size.value.width || -1);
    formData.append('height', size.value.height || -1);
  }
  lyla
    .post('/size', { body: formData })
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
        <n-space>
          <n-switch v-model:value="active" size="large">
            <template #checked> 指定 </template>
            <template #unchecked> 指定 </template>
          </n-switch>
          <n-input-group>
            <n-input-group-label>手动输入</n-input-group-label>
            <n-input
              autosize
              placeholder="宽"
              v-model:value="size.width"
              :allow-input="onlyAllowNumber"
            />
            <n-input
              autosize
              placeholder="高"
              v-model:value="size.height"
              :allow-input="onlyAllowNumber"
            />
          </n-input-group>
          <n-button type="primary" ghost @click="handleUpload">
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
        2. 检测结果: {{ response.msg }}
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
</style>