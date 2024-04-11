<script setup>
import { ref } from 'vue';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { lyla } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';

const message = useMessage();
const upload = ref(null);

const fileList = ref([]);
const response = ref({
  code: null,
  data: {
    error: false,
    error_page: [],
    result: [],
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
  lyla
    .post('/pageNumber', { body: formData })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <n-space vertical>
    <n-spin :show="loading">
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
      <n-button type="primary" ghost @click="handleUpload"> 开始检查 </n-button>
    </n-spin>
    <div v-show="response.code != null">
      <n-h3
        prefix="bar"
        :class="`n-h3-${response.data?.error ? 'error' : 'success'}`"
        :type="response.data?.error ? 'error' : 'success'"
      >
        2. 检测结果: {{ response.data?.error ? '页码有误' : '页码无误' }}
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
  border: solid 1px rgb(224, 224, 230);
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