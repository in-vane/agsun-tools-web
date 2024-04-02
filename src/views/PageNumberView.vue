<script setup>
import { ref } from 'vue';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { lyla } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';

const upload = ref(null);

const fileList = ref([]);
const response = ref({
  code: 0,
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
      <n-h3 prefix="bar">选择要检查的PDF文件</n-h3>
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
    <div v-show="response.data?.error">
      <n-h3 prefix="bar">页码错误的页面</n-h3>
      <n-image-group>
        <n-space>
          <n-image
            v-for="(img, i) in response.data?.result"
            :key="i"
            :src="img"
            alt="image"
            height="200px"
          />
        </n-space>
      </n-image-group>
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
.n-image {
  border: solid 1px rgb(224, 224, 230);
  border-radius: 3px;
}
</style>