import { defineStore } from 'pinia';
import { store } from '@/store';
import { storage } from '@/utils/storage';

export const CURRENT_USER = 'CURRENT-USER';
export const ACCESS_TOKEN = 'ACCESS-TOKEN';

export const useUserStore = defineStore({
  id: 'app-user',
  state: () => ({
    info: storage.get(CURRENT_USER, {}),
    token: storage.get(ACCESS_TOKEN, ''),
    permissions: [],
    isDynamicRouteAdded: false,
  }),
  getters: {
    getUserInfo() {
      return this.info;
    },
    getToken() {
      return this.token;
    },
    getIsDynamicRouteAdded() {
      return this.isDynamicRouteAdded;
    },
  },
  actions: {
    setToken(token) {
      this.token = token;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info) {
      this.info = info;
    },
    setDynamicRouteAdded(added) {
      this.isDynamicRouteAdded = added;
    },
    // 登录
    async login(params) {
      // const response = await login(params);
      const response = {
        result: {
          token: 'HQWHXPBPLGYNRZLGYXEQYNCJBSXSHCIH',
        },
        code: 200,
      };
      const { result, code } = response;
      if (code === 200) {
        const ex = 7 * 24 * 60 * 60;
        storage.set(ACCESS_TOKEN, result.token, ex);
        storage.set(CURRENT_USER, result, ex);
        this.setToken(result.token);
        this.setUserInfo(result);
      }
      return response;
    },
    // 获取用户信息
    async getInfo() {
      // const result = await getUserInfo();
      const result = { permissions: [] };
      if (result.permissions && result.permissions.length) {
        const permissionsList = result.permissions;
        this.setPermissions(permissionsList);
        this.setUserInfo(result);
      } else {
        throw new Error('getInfo: permissionsList must be a non-null array !');
      }
      return result;
    },
    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo({ name: '' });
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
