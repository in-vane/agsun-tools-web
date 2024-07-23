<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { lyla, openWebsocket } from '@/request';
import { INFO_NO_FILE } from '@/config/const.config';
import { onlyAllowNumber, checkFileUploaded, uploadFile } from '@/utils';
import { useFileStore } from '@/store/modules/file';

const fileStore = useFileStore();

const message = useMessage();

const ws = ref([null, null]);
const loadingUpload = ref(false);

const mode = ref(1);
const options = [
  { label: '精细模式', value: 0 },
  { label: '默认模式', value: 1 },
];

const filePath = ref(['', '']);
const active = ref(false);
const start = ref(['', '']);
const end = ref(['', '']);
const loadingCompare = ref(false);
const response = ref({
  code: 0,
  msg: '',
  data: {
    pages: [],
    imgs_base64: [],
    error_msg: '',
  },
});

const onmessage = (e, i) => {
  const data = JSON.parse(e.data);
  const { file_path } = data;
  if (file_path) {
    filePath.value[i] = file_path;
    message.info(`文件${i + 1}已上传`);
    ws.value[i].close();
  }
};

const onopen = (i) => {
  uploadFile(ws.value[i], fileStore.currentFiles[i].file);
};

const handleUpload = async () => {
  if (fileStore.currentFiles.length != 2) {
    message.info(INFO_NO_FILE);
    return;
  }
  let record = null;
  for (let i = 0; i < 2; i++) {
    record = await checkFileUploaded(fileStore.currentFiles[i].file);
    if (record) {
      filePath.value[i] = record.file_path;
      message.info(`文件${i + 1}已上传`);
    } else {
      ws.value[i] = openWebsocket(
        loadingUpload,
        () => onopen(i),
        (e) => onmessage(e, i)
      );
    }
  }
};

const handleCompare = () => {
  loadingCompare.value = true;
  const params = {
    mode: mode.value,
    file_path_1: filePath.value[0],
    file_path_2: filePath.value[1],
    start_1: start.value[0] || -1,
    start_2: start.value[1] || -1,
    end_1: end.value[0] || -1,
    end_2: end.value[1] || -1,
  };
  if (!active.value) {
    params.start_1 = -1;
    params.start_2 = -1;
    params.end_1 = -1;
    params.end_2 = -1;
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
    <n-button type="primary" ghost @click="handleUpload"> 上传文件 </n-button>
    <!-- result -->
    <div>
      <n-spin :show="loadingCompare">
        <n-h3 prefix="bar">2. 对比检测</n-h3>
        <n-space align="center">
          <n-select v-model:value="mode" :options="options" />
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
              placeholder="从"
            />
            <n-input
              :disabled="!active"
              v-model:value="end[0]"
              :allow-input="onlyAllowNumber"
              autosize
              placeholder="到"
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
              placeholder="从"
            />
            <n-input
              :disabled="!active"
              v-model:value="end[1]"
              :allow-input="onlyAllowNumber"
              autosize
              placeholder="到"
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
.n-select {
  width: 140px;
}
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