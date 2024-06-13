<script setup>
import { onMounted, onUnmounted, ref, h } from 'vue';
import { useMessage, NInput } from 'naive-ui';
import {
  ArchiveOutline as ArchiveIcon,
  AddOutline as AddIcon,
  TrashOutline as TrashIcon,
} from '@vicons/ionicons5';
import { lyla, openWebsocket } from '@/request';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import {
  INFO_NO_FILE,
  WEBSOCKET_TYPE,
  CROP_BOX_STYLE,
} from '@/config/const.config';
import {
  onlyAllowNumber as num,
  checkFileUploaded,
  getImages,
  uploadFile,
} from '@/utils';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const filePath = ref('');
const loadingUpload = ref(false);

const images = ref([]);
const current = ref(0);
const cropend = ref('');
const rect = ref([]);

const MODE_NORMAL = 0;
const MODE_OCR = 1;
const sltoptions = [
  { label: '常规模式', value: MODE_NORMAL },
  { label: 'OCR模式', value: MODE_OCR },
];
const mode = ref(MODE_NORMAL);

const explorePage = ref(0);
const tablePage = ref('1');
const tablePages = ref([]);
const columnCount = ref('6');
const pairIndex = ref([
  { key: `${new Date().getTime()}`, index: '1', count: '3' },
]);

const tableLength = ref('0');
const tableData = ref([]);
const OCRColumns = [
  {
    title: '序号',
    key: 'key',
  },
  {
    title: '数量',
    key: 'count',
    render(row, index) {
      return h(NInput, {
        value: row.count,
        allowInput: num,
        onUpdateValue(v) {
          tableData.value[index].count = v;
        },
      });
    },
  },
];

const loadingPartCount = ref(false);
const response = ref({
  code: null,
  data: {
    error_pages: [[], []],
    mapping_results: [],
    note: '',
  },
  msg: '',
});

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
  current.value = 0;
  images.value = [];
  cropend.value = '';
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
  const record = await checkFileUploaded(fileList.value[0].file);
  if (record) {
    filePath.value = record.file_path;
    message.success('已上传');
    type = WEBSOCKET_TYPE.PDF2IMG;
  }
  ws.value = openWebsocket(loadingUpload, () => onopen(type), onmessage);
};

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  const data = cropper.getData(true);
  rect.value = [data.x, data.y, data.width, data.height];
  cropend.value = base64;
  explorePage.value = current.value;
};

const handlePartCount = () => {
  if (!tablePage.value) {
    message.error('请正确填写明细表所在的页码数');
    return;
  }
  loadingPartCount.value = true;
  const file = fileList.value[0].file;
  const params = {
    filename: file.name,
    filePath: filePath.value,
    rect: rect.value,
    page_explore: explorePage.value,
    page_table: tablePage.value,
    pair_index: pairIndex.value,
    columnCount: columnCount.value,
  };
  lyla
    .post('/partCount', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingPartCount.value = false;
    });
};

const handlePartCountOCR = () => {
  if (!tablePages.value.length) {
    message.error('请正确填写明细表所在的页码数');
    return;
  }
  loadingPartCount.value = true;
  const file = fileList.value[0].file;
  const page_table = tablePages.value.slice().sort((a, b) => a - b);
  const params = {
    filename: file.name,
    filePath: filePath.value,
    rect: rect.value,
    page_explore: explorePage.value,
    page_table: page_table,
    table_dict: tableData.value,
  };
  lyla
    .post('/partCountOcr', { json: params })
    .then((res) => {
      console.log(res);
      response.value = {
        ...res.json,
        pages: res.json.data.error_pages[0],
        images: res.json.data.error_pages[1],
      };
    })
    .catch((err) => {})
    .finally(() => {
      loadingPartCount.value = false;
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

const columns = [
  {
    title: '零件序号',
    key: 'no',
    sorter: (a, b) => parseInt(a[0]) - parseInt(b[0]),
    render: (_) => parseInt(_[0]),
  },
  {
    title: '计数正误',
    key: 'state',
    render: (_) => (_[1] ? '正确' : '错误'),
  },
  {
    title: '检测计数',
    key: 'found',
    render: (_) => (_[2] == null ? '-' : _[2]),
  },
  {
    title: '表格计数',
    key: 'expected',
    render: (_) => (_[3] == null ? '-' : _[3]),
  },
];

const renderRowClass = (rowData) => (rowData[1] ? '' : 'row-error');

const addItem = () => {
  pairIndex.value.push({
    key: `${new Date().getTime()}`,
    index: '1',
    count: '3',
  });
};

const removeItem = (key) => {
  const i = pairIndex.value.findIndex((item) => item.key === key);
  if (i !== -1) {
    pairIndex.value.splice(i, 1);
  }
};

const resetTableLength = (v) => {
  let len = parseInt(v);
  if (Number.isNaN(len)) {
    len = 0;
    tableLength.value = `${len}`;
  }
  const d = [];
  for (let i = 0; i < len; i++) {
    d.push({ key: i + 1, count: '0' });
  }
  tableData.value = d;
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
      <n-spin :show="loadingUpload">
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
              检查爆炸图和明细表
            </n-p>
          </n-upload-dragger>
        </n-upload>
        <n-button type="primary" ghost @click="handleUpload">
          开始转换
        </n-button>
      </n-spin>
    </div>
    <!-- preview -->
    <n-spin :show="loadingPartCount">
      <n-h3 prefix="bar">2. 文件图像预览</n-h3>
      <div class="scroll-box">
        <n-scrollbar class="n-scrollbar" x-scrollable trigger="none">
          <div class="preview-box">
            <div class="preview-item" v-for="(img, i) in images" :key="i">
              <n-badge
                :value="i + 1"
                :color="current == i ? '#18a058' : 'gray'"
                :offset="[-10, 10]"
              >
                <n-image
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
        <div class="preview-crop">
          <n-image
            v-show="cropend"
            :src="cropend"
            height="120px"
            width="100%"
            alt="image"
          />
        </div>
      </div>
      <div class="scroll-box">
        <div class="crop-box">
          <vue-picture-cropper
            :boxStyle="{ ...CROP_BOX_STYLE, height: '600px' }"
            :img="images[current]"
            :options="options"
          />
        </div>
        <n-space class="form-box" vertical>
          <n-select v-model:value="mode" :options="sltoptions" />
          <template v-if="mode == MODE_NORMAL">
            <n-input-group>
              <n-input-group-label>明细表在第</n-input-group-label>
              <n-input
                v-model:value="tablePage"
                :allow-input="num"
                type="text"
              />
              <n-input-group-label>页</n-input-group-label>
            </n-input-group>
            <n-input-group>
              <n-input-group-label>明细表共</n-input-group-label>
              <n-input
                v-model:value="columnCount"
                :allow-input="num"
                type="text"
              />
              <n-input-group-label>列</n-input-group-label>
            </n-input-group>
            <div v-for="item in pairIndex" :key="item.key">
              <n-input-group>
                <n-input-group-label>第</n-input-group-label>
                <n-input
                  v-model:value="item.index"
                  :allow-input="num"
                  type="text"
                />
                <n-input-group-label>列的序号对应第</n-input-group-label>
                <n-input
                  v-model:value="item.count"
                  :allow-input="num"
                  type="text"
                />
                <n-input-group-label>列的数值</n-input-group-label>
                <n-button
                  v-if="pairIndex.length > 1"
                  quaternary
                  round
                  @click="() => removeItem(item.key)"
                >
                  <n-icon>
                    <trash-icon />
                  </n-icon>
                </n-button>
              </n-input-group>
            </div>
            <n-button block @click="addItem">
              <template #icon>
                <n-icon>
                  <add-icon />
                </n-icon>
              </template>
            </n-button>
            <n-button type="primary" ghost @click="handlePartCount">
              开始任务
            </n-button>
          </template>
          <template v-else>
            <n-space align="center">
              <n-input-group-label>明细表所在页码</n-input-group-label>
              <n-dynamic-tags
                :input-props="{ allowInput: num }"
                v-model:value="tablePages"
              />
            </n-space>
            <n-input-group>
              <n-input-group-label>明细表有</n-input-group-label>
              <n-input
                v-model:value="tableLength"
                :allow-input="num"
                @change="resetTableLength"
                autosize
                placeholder="请输入"
              />
              <n-input-group-label>种零件</n-input-group-label>
            </n-input-group>
            <n-data-table
              size="small"
              max-height="375px"
              :columns="OCRColumns"
              :data="tableData"
            />
            <n-button type="primary" ghost @click="handlePartCountOCR">
              开始任务
            </n-button>
          </template>
        </n-space>
      </div>
    </n-spin>
    <!-- result -->
    <div>
      <n-h3 prefix="bar">3. 零件计数检测结果</n-h3>
      <n-p>{{ response.data?.note }}</n-p>
      <n-image-group>
        <n-space>
          <div
            class="preview-item"
            v-for="(page, i) in response.pages"
            :key="i"
          >
            <n-badge :value="page">
              <n-image :src="response.images[i]" alt="image" height="200px" />
            </n-badge>
          </div>
        </n-space>
      </n-image-group>
      <n-data-table
        size="small"
        :bordered="false"
        :columns="columns"
        :data="response.data?.mapping_results"
        :row-class-name="renderRowClass"
      />
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
  border-radius: 3px;
  border: 1px dashed rgb(224, 224, 230);
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
:deep(.row-error td) {
  color: rgb(208, 48, 80);
  background: rgba(208, 48, 80, 0.2);
}
.crop-box {
  width: 50%;
}
.form-box {
  max-width: 50%;
  gap: 12px !important;
  flex: 1;
}
.n-select {
  width: 160px;
}
.n-input {
  min-width: 80px;
}
</style>