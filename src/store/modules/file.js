import { defineStore } from 'pinia';
import { store } from '@/store';
import { storage } from '@/utils/storage';
import { lyla } from '@/request';

export const useFileStore = defineStore({
  id: 'app-file',
  state: () => ({
    files: {},
  }),
  getters: {
    getFiles() {
      return this.files;
    },
  },
  actions: {
    updateFiles(md5, file) {
      this.files[md5] = file;
    },
    clearFiles() {
      this.files = {};
    },
  },
});

// Need to be used outside the setup
export function useFile() {
  return useFileStore(store);
}
