import { defineStore } from 'pinia';
import { store } from '@/store';
import { getMD5 } from '@/utils';

export const useFileStore = defineStore({
  id: 'app-file',
  state: () => ({
    currentFiles: [],
    historyFiles: [],
  }),
  getters: {
    getCurrentFiles() {
      return this.currentFiles;
    },
    getHistoryFiles() {
      return this.historyFiles;
    },
  },
  actions: {
    async updateFiles(fileList) {
      this.currentFiles = [];
      for (let item of fileList) {
        const file = item.file;
        const md5 = await getMD5(file);
        item.md5 = md5;
        const isCurHas = this.currentFiles.some((_) => item.md5 == _.md5);
        const isHisHas = this.historyFiles.some((_) => item.md5 == _.md5);

        if (!isCurHas) {
          this.currentFiles.push(item);
        }
        if (!isHisHas) {
          this.historyFiles.push(item);
        }
        if (this.historyFiles.length > 5) {
          this.historyFiles.shift();
        }
        console.log(this.historyFiles)
      }
    },
    clearCurrentFiles() {
      this.currentFiles = [];
    },
  },
});

// Need to be used outside the setup
export function useFile() {
  return useFileStore(store);
}
