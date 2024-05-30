<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';
import { onlyAllowNumber } from '@/utils';

const message = useMessage();
const upload = ref(null);

const fileList = ref([]);

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

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  loading.value = true;
  const formData = new FormData();
  for (const item of fileList.value) {
    formData.append(item.file.name, item.file);
  }
  formData.append('mode', mode.value);
  formData.append('sheet', n);
  lyla
    .post('/ce', { body: formData })
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
    <n-h3 prefix="bar">1. 上传PDF</n-h3>
    <n-spin :show="loading">
      <n-upload
        multiple
        ref="upload"
        :max="2"
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
            检查CE表中对应位置的错误项
          </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-space vertical>
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
          <n-button type="primary" ghost @click="handleUpload">
            开始对比
          </n-button>
        </n-space>
      </n-space>
    </n-spin>
    <n-divider />
    <n-h3 prefix="bar">2. 检测结果</n-h3>
    <div class="result-box">
      <n-image
        v-show="response.data?.excel_image_base64"
        :src="response.data?.excel_image_base64"
        width="100%"
      />
      <n-image
        v-show="response.data?.pdf_image_base64"
        :src="response.data?.pdf_image_base64"
        width="100%"
      />
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