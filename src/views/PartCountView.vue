<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
  ArchiveOutline as ArchiveIcon,
  AddOutline as AddIcon,
  TrashOutline as TrashIcon,
} from '@vicons/ionicons5';
import { lyla, SOCKET_URL } from '@/request';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import {
  SHARD_SIZE,
  INFO_NO_FILE,
  PDF2IMG_MODE,
  WEBSOCKET_TYPE,
  CROP_BOX_STYLE,
} from '@/config/const.config';
import { onlyAllowNumber as num } from '@/utils';

const message = useMessage();
const upload = ref(null);
const ws = ref(null);

const fileList = ref([]);
const images = ref([]);
const current = ref(0);
const pageTable = ref('1');
const columnCount = ref('6');
const pairIndex = ref([
  {
    key: `${new Date().getTime()}`,
    index: '1',
    count: '3',
  },
]);
const cropend = ref('');
const rect = ref([]);
const response = ref({
  code: null,
  data: {
    error_pages: [[], []],
    mapping_results: [],
    note: '',
  },
  msg: '',
});

const loadingUpload = ref(false);
const loadingPartCount = ref(false);

const reset = () => {
  current.value = 0;
  images.value = [];
  cropend.value = '';
};

const openWebsocket = () => {
  loadingUpload.value = true;
  const websocket = new WebSocket(SOCKET_URL);

  websocket.onopen = (e) => {
    console.log('connected: ', e);
    reset();
    sendMessage();
  };
  websocket.onclose = (e) => {
    console.log('disconnected: ', e);
    loadingUpload.value = false;
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const { img_base64, total, current } = data;
    if (img_base64) {
      images.value.push({ src: img_base64, page: current });
      current == total && ws.value.close();
    }
  };
  websocket.onerror = (e) => {
    console.log('error: ', e);
  };

  ws.value = websocket;
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

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  const data = cropper.getData(true);
  rect.value = [data.x, data.y, data.width, data.height];
  cropend.value = base64;
};

const handleUpload = () => {
  if (!fileList.value.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  openWebsocket();
};

const handlePartCount = () => {
  let pageNumber = parseInt(pageTable.value);
  if (Number.isNaN(pageNumber)) {
    message.error('请正确填写明细表的页码数');
    return;
  }
  loadingPartCount.value = true;
  const file = fileList.value[0].file;
  const params = {
    filename: file.name,
    rect: rect.value,
    page_explore: images.value[current.value]?.page,
    page_table: pageTable.value,
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
              检查两份pdf中爆炸图与安装图不一致的部分
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
        <n-scrollbar class="n-scrollbar" x-scrollable>
          <div class="preview-box">
            <div class="preview-item" v-for="(img, i) in images" :key="i">
              <n-badge
                :value="i + 1"
                :color="current == i ? '#18a058' : 'gray'"
                :offset="[-10, 10]"
              >
                <n-image
                  :src="img.src"
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
            :boxStyle="CROP_BOX_STYLE"
            :img="images[current]?.src"
            :options="options"
          />
        </div>
        <n-space class="form-box" vertical>
          <n-input-group>
            <n-input-group-label>明细表在第</n-input-group-label>
            <n-input v-model:value="pageTable" :allow-input="num" type="text" />
            <n-input-group-label>页</n-input-group-label>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>共</n-input-group-label>
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
        </n-space>
        <n-button type="primary" ghost @click="handlePartCount">
          开始任务
        </n-button>
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
            v-for="(img, i) in response.data.error_pages?.[0]"
            :key="i"
          >
            <n-badge :value="response.data.error_pages?.[1][i]">
              <n-image :src="img" alt="image" height="200px" />
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
  width: 640px;
}
.form-box {
  width: 400px;
}
</style>