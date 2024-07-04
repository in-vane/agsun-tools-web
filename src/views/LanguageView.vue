<script setup>
import { ref, h } from 'vue';
import { useMessage, NButton, NInput, NIcon } from 'naive-ui';
import {
  ArchiveOutline as ArchiveIcon,
  AddOutline as AddIcon,
  TrashOutline as TrashIcon,
} from '@vicons/ionicons5';
import { lyla, openWebsocket } from '@/request';
import { INFO_NO_FILE, WEBSOCKET_TYPE } from '@/config/const.config.js';
import {
  onlyAllowNumber as num,
  checkFileUploaded,
  uploadFile,
  getImages,
} from '@/utils';
import CUploadFile from '@/components/uploadFile.vue';

const message = useMessage(); 
const ws = ref(null);

const loadingUpload = ref(false);
const fileList = ref([]);
const filePath = ref('');
const images = ref([]);
const current = ref('0');

const loadingOCR = ref(false);
const overview = ref([]);
const textStart = ref('');

const loadingRes = ref(false);
const response = ref({ code: -1, data: {}, msg: '' });

const onmessage = (e) => {
  const data = JSON.parse(e.data);
  const { file_path, img_base64, complete } = data;
  if (file_path) {
    filePath.value = file_path;
    getImages(ws.value, file_path);
  }
  if (img_base64) {
    images.value.push(img_base64);
  }
  if (complete) {
    ws.value.close();
  }
};

const onopen = (type) => {
  current.value = '1';
  images.value = [];
  if (type == WEBSOCKET_TYPE.UPLOAD) {
    uploadFile(ws.value, fileList.value[0].file);
  }
  if (type == WEBSOCKET_TYPE.PDF2IMG) {
    getImages(ws.value, filePath.value);
  }
};

const handleUpload = async () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  let type = WEBSOCKET_TYPE.UPLOAD;
  const record = await checkFileUploaded(fileList.value[0]);
  if (record) {
    filePath.value = record.file_path;
    type = WEBSOCKET_TYPE.PDF2IMG;
  }
  ws.value = openWebsocket(loadingUpload, () => onopen(type), onmessage);
};

const handleOCR = () => {
  loadingOCR.value = true;
  const params = {
    file_path: filePath.value,
    page: current.value,
  };
  lyla
    .post('/language/context', { json: params })
    .then((res) => {
      console.log(res);
      overview.value = res.json.data.result;
      textStart.value = res.json.data.start;
    })
    .catch((err) => {})
    .finally(() => {
      loadingOCR.value = false;
    });
};

const handleCompare = () => {
  loadingOCR.value = true;
  const params = {
    file_path: filePath.value,
    table: overview.value,
    start: textStart.value,
  };
  lyla
    .post('/language/compare', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingOCR.value = false;
    });
};

const addItem = () => {
  overview.value.push({
    key: `${new Date().getTime()}`,
    language: 'new language',
    start: '0',
  });
};

const removeItem = (row) => {
  const i = overview.value.findIndex((item) => item.key === row.key);
  if (i !== -1) {
    overview.value.splice(i, 1);
  }
};

const renderRowClass = (rowData) => (rowData.error ? 'row-error' : '');

const columns = [
  { title: '目录语言', key: 'language' },
  { title: '页码范围', render: (_) => _.page_number.join(' ~ ') },
  { title: '顺序正误', render: (_) => (_.error ? '错误' : '正确') },
  { title: '正文语言', render: (_) => (_.error ? _.actual_language : '-') },
];

const OCRColumns = [
  {
    title: '语言',
    key: 'language',
    render(row, index) {
      return h(NInput, {
        value: row.language,
        onUpdateValue(v) {
          overview.value[index].language = v;
        },
      });
    },
  },
  {
    title: '起始页',
    key: 'start',
    render(row, index) {
      return h(NInput, {
        value: row.start,
        onUpdateValue(v) {
          overview.value[index].start = v;
        },
      });
    },
  },
  {
    key: 'reduce',
    render(row, index) {
      return h(
        NButton,
        { onClick: () => removeItem(row) },
        { icon: () => h(NIcon, null, { default: () => h(TrashIcon) }) }
      );
    },
  },
];
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <n-spin :show="loadingUpload">
      <n-h3 prefix="bar">1. 上传PDF</n-h3>
      <c-upload-file :fileList="fileList" :loading="loadingUpload" />
      <n-button type="primary" ghost @click="handleUpload"> 上传文件 </n-button>
    </n-spin>
    <!-- ocr page -->
    <n-spin :show="loadingOCR">
      <n-h3 prefix="bar">2. 选择目录页</n-h3>
      <n-space vertical>
        <div class="scroll-box">
          <n-scrollbar class="n-scrollbar" x-scrollable trigger="none">
            <div class="preview-box">
              <div class="preview-item" v-for="(img, i) in images" :key="i">
                <n-badge
                  :value="i + 1"
                  :color="current == i + 1 ? '#18a058' : 'gray'"
                  :offset="[-10, 10]"
                >
                  <n-image
                    :src="img"
                    alt="image"
                    height="200px"
                    preview-disabled
                    @click="() => (current = i + 1)"
                  />
                </n-badge>
              </div>
            </div>
          </n-scrollbar>
        </div>
        <n-input-group>
          <n-input-group-label>目录页在第</n-input-group-label>
          <n-input
            v-model:value="current"
            :allow-input="num"
            autosize
            placeholder="请输入"
          />
          <n-input-group-label>页</n-input-group-label>
        </n-input-group>
        <n-button type="primary" ghost @click="handleOCR"> 识别目录 </n-button>
      </n-space>
    </n-spin>
    <!-- fix dict -->
    <n-spin :show="loadingRes">
      <n-h3 prefix="bar">3. 检查目录</n-h3>
      <n-space>
        <n-space vertical>
          <n-data-table :columns="OCRColumns" :data="overview" />
          <n-button block @click="addItem">
            <template #icon>
              <n-icon>
                <add-icon />
              </n-icon>
            </template>
          </n-button>
        </n-space>
        <n-space vertical>
          <n-input-group>
            <n-input-group-label>正文从第</n-input-group-label>
            <n-input
              v-model:value="textStart"
              :allow-input="num"
              autosize
              placeholder="请输入"
            />
            <n-input-group-label>页开始</n-input-group-label>
          </n-input-group>
          <n-button type="primary" ghost @click="handleCompare">
            开始检测
          </n-button>
        </n-space>
      </n-space>
    </n-spin>
    <!-- result -->
    <div>
      <n-h3
        prefix="bar"
        :class="`${response.code == 1 && 'n-h3-error'}`"
        :type="response.code == 1 ? 'error' : 'success'"
      >
        4. 语言顺序检测结果 {{ response.code == 1 ? ': 未检测到目录' : '' }}
      </n-h3>
      <n-data-table
        size="small"
        :columns="columns"
        :data="response.data.language"
        :bordered="false"
        :row-class-name="renderRowClass"
      />
    </div>
  </n-space>
</template>

<style scoped>
.n-h3 {
  margin-bottom: 8px;
}
.n-input {
  min-width: 80px;
}
:deep(.row-error td) {
  color: rgb(208, 48, 80);
  background: rgba(208, 48, 80, 0.2);
}
.n-h3-error::after {
  content: ' ';
  width: calc(100% - 8px);
  height: 100%;
  position: absolute;
  left: 8px;
  border-radius: 3px;
  background: rgba(208, 48, 80, 0.2);
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
}
.n-data-table {
  min-width: 400px;
}
</style>