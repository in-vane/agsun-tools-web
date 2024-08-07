<script setup>
import { ref, h } from 'vue';
import { useMessage, NButton, NInput, NIcon } from 'naive-ui';
import { lyla, openWebsocket } from '@/request';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import {
  AddOutline as AddIcon,
  TrashOutline as TrashIcon,
} from '@vicons/ionicons5';
import {
  INFO_NO_FILE,
  WEBSOCKET_TYPE,
  CROP_BOX_STYLE,
} from '@/config/const.config';
import {
  onlyAllowNumber as num,
  checkFileUploaded,
  uploadFile,
  getImages,
} from '@/utils';
import { useFileStore } from '@/store/modules/file';

const fileStore = useFileStore();

const message = useMessage();
const ws = ref(null);

const jump = ref(null);

const filePath = ref('');
const images = ref([]);
const current = ref(0);
const cropend = ref('');
const rect = ref([]);
const overview = ref([]);
const limit = ref({ start: '', end: '' });
const response = ref({
  code: null,
  data: {
    result: [],
    image_page: [],
  },
  msg: '',
});
const loadingUpload = ref(false);
const loadingOCR = ref(false);
const loadingRes = ref(false);

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
  rect.value = [];
  if (type == WEBSOCKET_TYPE.UPLOAD) {
    uploadFile(ws.value, fileStore.currentFiles[0].file);
  }
  if (type == WEBSOCKET_TYPE.PDF2IMG) {
    getImages(ws.value, filePath.value);
  }
};

const handleUpload = async () => {
  if (!fileStore.currentFiles.length) {
    message.info(INFO_NO_FILE);
    return;
  }
  let type = WEBSOCKET_TYPE.UPLOAD;
  const record = await checkFileUploaded(fileStore.currentFiles[0].file);
  if (record) {
    filePath.value = record.file_path;
    type = WEBSOCKET_TYPE.PDF2IMG;
  }
  ws.value = openWebsocket(loadingUpload, () => onopen(type), onmessage);
};

const handleOCR = () => {
  if (!rect.value.length) {
    message.error('请选择螺丝包区域');
    return;
  }
  loadingOCR.value = true;
  const params = {
    file_path: filePath.value,
    page: current.value,
    rect: rect.value,
  };
  lyla
    .post('/screw/bags', { json: params })
    .then((res) => {
      console.log(res);
      overview.value = res.json.data.result;
    })
    .catch((err) => {})
    .finally(() => {
      loadingOCR.value = false;
    });
};

const handleGetCrop = () => {
  const base64 = cropper.getDataURL();
  const data = cropper.getData(true);
  rect.value = [data.x, data.y, data.width, data.height];
  cropend.value = base64;
};

const isLimitError = () => {
  let start = parseInt(limit.value.start);
  let end = parseInt(limit.value.end);
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

const handleCheck = () => {
  const isError = isLimitError();
  if (isError) {
    return;
  }
  loadingRes.value = true;
  const params = {
    table: overview.value,
    start: limit.value.start,
    end: limit.value.end,
    file_path: filePath.value,
    page: current.value,
    rect: rect.value,
  };
  lyla
    .post('/screw/compare', { json: params })
    .then((res) => {
      console.log(res);
      response.value = res.json;
    })
    .catch((err) => {})
    .finally(() => {
      loadingRes.value = false;
    });
};

// table result
const columns = [
  { title: '螺丝型号', key: 'type' },
  { title: '螺丝包总计数', key: 'total' },
  { title: '步骤图总计数', key: 'step_total' },
  {
    title: '步骤图螺丝计数',
    key: 'step_count',
    render: (_) => _.step_count.join(' / '),
  },
  {
    title: '步骤图所在页数',
    key: 'step_page_no',
    render: (_) => _.step_page_no.join(' / '),
  },
];

const renderRowClass = (rowData) => {
  return rowData.total == rowData.step_total ? '' : 'row-error';
};

// table type
const addItem = () => {
  overview.value.push({
    key: `${new Date().getTime()}`,
    type: 'new type',
    count: '0',
  });
};

const removeItem = (row) => {
  const i = overview.value.findIndex((item) => item.key === row.key);
  if (i !== -1) {
    overview.value.splice(i, 1);
  }
};

const OCRColumns = [
  {
    title: '螺丝类别',
    key: 'type',
    sorter: 'default',
    render(row, index) {
      return h(NInput, {
        value: row.type,
        onUpdateValue(v) {
          overview.value[index].type = v;
        },
      });
    },
  },
  {
    title: '总数量',
    key: 'count',
    render(row, index) {
      return h(NInput, {
        value: row.count,
        onUpdateValue(v) {
          overview.value[index].count = v;
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

const options = {
  viewMode: 1,
  dragMode: 'move',
  autoCrop: true,
  cropend: handleGetCrop,
};
</script>

<template>
  <n-space vertical>
    <!-- upload -->
    <n-button type="primary" ghost @click="handleUpload"> 开始转换 </n-button>
    <!-- crop table -->
    <n-spin :show="loadingOCR">
      <n-flex align="center">
        <n-h3 prefix="bar">2. 选取螺丝表</n-h3>
        <n-input
          v-model:value="jump"
          :allow-input="num"
          autosize
          placeholder="页数"
        />
        <n-button type="primary" ghost @click="() => (current = jump - 1)">
          快速选择
        </n-button>
      </n-flex>
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
      </div>
      <div class="crop-box">
        <vue-picture-cropper
          :boxStyle="CROP_BOX_STYLE"
          :img="images[current]"
          :options="options"
        />
      </div>
      <n-button type="primary" ghost @click="handleOCR"> 识别螺丝包 </n-button>
    </n-spin>
    <n-spin :show="loadingRes">
      <n-h3 prefix="bar">3. 检查</n-h3>
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
        <div class="preview-crop">
          <n-image
            v-show="cropend"
            :src="cropend"
            height="120px"
            width="100%"
            alt="image"
          />
        </div>
        <n-input-group>
          <n-input-group-label>步骤图从</n-input-group-label>
          <n-input
            v-model:value="limit.start"
            :allow-input="num"
            autosize
            placeholder="起始"
          />
          <n-input-group-label>页到</n-input-group-label>
          <n-input
            v-model:value="limit.end"
            :allow-input="num"
            autosize
            placeholder="结束"
          />
          <n-input-group-label>页结束</n-input-group-label>
        </n-input-group>
        <n-button type="primary" ghost @click="handleCheck">
          开始检测
        </n-button>
      </n-space>
    </n-spin>
    <!-- result -->
    <div>
      <n-h3 prefix="bar">4. 检测结果</n-h3>
      <n-p class="n-p-errmsg" v-show="response.data?.image_page?.length">
        该文档的第{{
          response.data?.image_page
        }}页的步骤图中，螺丝图例为图片，结果可能有误，请仔细检查。
      </n-p>
      <n-data-table
        size="small"
        :columns="columns"
        :data="response.data?.result"
        :bordered="false"
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
:deep(.row-error td) {
  color: rgb(208, 48, 80);
  background: rgba(208, 48, 80, 0.2);
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
  /* background: rgb(250, 250, 252); */
  min-width: 150px;
  min-height: 200px;
}
.n-input {
  min-width: 80px;
}
.n-data-table {
  min-width: 400px;
}
.crop-box {
  margin: 8px 0;
}
.n-p-errmsg {
  padding: 8px;
  border-radius: 3px;
  background: rgba(208, 48, 80, 0.2);
}
</style>