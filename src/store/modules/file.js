import { defineStore } from "pinia";
import { store } from "@/store";
import { getMD5 } from "@/utils";

export const useFileStore = defineStore({
  id: "app-file",
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
    async updateFiles(file, action) {
      const currentFileMD5 = await getMD5(file.file);
      file.md5 = currentFileMD5;
      // 如果是删除文件，则直接从currentFiles中删除，不需要查重
      if (action === "remove") {
        const len = this.currentFiles.length;
        if (len === 2) {
          if (
            this.currentFiles[0].md5 === currentFileMD5 &&
            this.currentFiles[0].name === file.name
          ) {
            this.currentFiles.shift();
          }
          return;
        }
        this.currentFiles = this.currentFiles.filter(
          (item) => item.md5 !== currentFileMD5,
        );
        return;
      }
      // 如果是添加文件，则先进行查重，再添加到currentFiles和historyFiles中
      let sameFile = null;
      // 前台文件查重
      const isCurHas = this.currentFiles.some((item) => {
        const isSame = item.md5 == currentFileMD5;
        console.log(item.md5, currentFileMD5, isSame);
        if (isSame) {
          sameFile = item;
        }
        return isSame;
      });
      this.currentFiles.push(file);
      if (isCurHas) {
        const $notification = window["$notification"];
        $notification.info({
          title: "前台文件相同",
          content: `${file.name}与文件列表中已有文件${sameFile.name}相同，它们的文件名可能不同，请检查。`,
        });
      }
      // 历史文件查重
      const isHisHas = this.historyFiles.some(
        (item) => currentFileMD5 == item.md5,
      );
      if (!isHisHas) {
        this.historyFiles.push(file);
      }
      if (this.historyFiles.length > 5) {
        this.historyFiles.shift();
      }
      console.log(this.currentFiles);

      // this.currentFiles = [];
      // const infoList = [];
      // for (let item of fileList) {
      //   const file = item.file;
      //   const md5 = await getMD5(file);
      //   console.log(md5);
      //   item.md5 = md5;
      //   // 前台文件查重
      //   const isCurHas = this.currentFiles.some((_) => {
      //     const isSame = item.md5 == _.md5;
      //     if (isSame) {
      //       infoList[0] = item.name;
      //       infoList[1] = _.name;
      //     }
      //     return isSame;
      //   });
      //   // 历史文件查重
      //   const isHisHas = this.historyFiles.some((_) => item.md5 == _.md5);

      //   if (!isCurHas) {
      //     this.currentFiles.push(item);
      //   }
      //   if (!isHisHas) {
      //     this.historyFiles.push(item);
      //   }
      //   if (this.historyFiles.length > 5) {
      //     this.historyFiles.shift();
      //   }
      //   console.log(this.historyFiles);
      // }
      // if (infoList.length) {
      //   const $notification = window["$notification"];
      //   $notification.info({
      //     title: "前台文件相同",
      //     content: `文件列表中存在相同文件，它们的文件名可能不同，请检查。`,
      //   });
      // }
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
