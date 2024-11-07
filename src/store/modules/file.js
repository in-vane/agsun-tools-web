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
      const infoList = [];
      for (let item of fileList) {
        const file = item.file;
        const md5 = await getMD5(file);
        item.md5 = md5;
        // 前台文件查重
        const isCurHas = this.currentFiles.some((_) => {
          const isSame = item.md5 == _.md5;
          if (isSame) {
            infoList[0] = item.name;
            infoList[1] = _.name;
          }
          return isSame;
        });
        // 历史文件查重
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
        console.log(this.historyFiles);
      }
      if (infoList.length) {
        const $notification = window['$notification'];
        $notification.info({
          title: '前台文件相同',
          content: `文件列表中存在相同文件，它们的文件名可能不同，请检查。`,
        });
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
