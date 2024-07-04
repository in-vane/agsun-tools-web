<script setup>
import { ref, defineProps, toRefs, watch, onMounted } from 'vue';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';

import { useFileStore } from '@/store/modules/file';

const props = defineProps({
  fileList: Array,
  loading: Boolean,
});

const { fileList, loading } = toRefs(props);
const localFileList = ref([...fileList.value]);

const fileStore = useFileStore();
const history = ref([]);

const columns = [
  { title: '序号', key: 'index', width: 80 },
  { title: '文件名', key: 'name' },
];

const rowProps = (row) => ({
  style: 'cursor: pointer;',
  onClick: () => {
    localFileList.value = [...localFileList.value, row.file];
  },
});

const handleChange = (data) => {
  localFileList.value = data.fileList;
};

watch(localFileList, (newVal) => {
  fileList.value.splice(0, fileList.value.length, ...newVal);
});

watch(localFileList.value, (newVal) => {
  fileList.value.splice(0, fileList.value.length, ...newVal);
});

const renderHistory = () => {
  const files = fileStore.getFiles || {};
  const kv = Object.entries(files);
  history.value = kv.map(([key, value], i) => ({
    index: i,
    name: value.name,
    file: value,
  }));
};

onMounted(() => {
  renderHistory();
});
</script>

<template>
  <n-flex>
    <n-upload
      multiple
      ref="upload"
      accept=".pdf"
      :default-upload="false"
      v-model:file-list="localFileList"
      :disabled="loading"
      @change="handleChange"
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
      </n-upload-dragger>
    </n-upload>
    <n-data-table
      :columns="columns"
      :data="history"
      :row-props="rowProps"
      :max-height="320"
    />
  </n-flex>
</template>

<style scoped>
.n-upload {
  width: 50%;
}
.n-data-table {
  flex: 1;
}
</style>