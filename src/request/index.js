import { createLyla } from '@lylajs/web';
import { storage } from '@/utils/storage';
import { useUser } from '@/store/modules/user';



const HOST = '10.22.148.91';
const PORT = 8889;
// const HOST = '10.22.148.82'
// const PORT = 6108;
// const HOST = 'localhost'
// const PORT = 8888;
const SOCKET_URL = `ws://${HOST}:${PORT}/websocket`;

const { lyla } = createLyla({
  baseUrl: `http://${HOST}:${PORT}/api`,
  hooks: {
    onBeforeRequest: [
      (options) => {
        const { headers } = options;
        const token = storage.get('ACCESS-TOKEN', '');
        options.headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
        return options;
      },
    ],
    onResponseError: [
      (error, reject) => {
        const $message = window['$message'];
        const userStore = useUser();
        const { response } = error;
        const { status, statusText } = response;
        console.log({ status, statusText });
        switch (status) {
          case 401:
            userStore.logout();
            location.href = '/login';
            break;
          case 403:
            $message.error(`没有执行该任务的权限: ${statusText}`)
            break;

          default:
            $message.error(`任务失败: ${statusText}`)
            break;
        }

        reject(statusText);
      },
    ],
  },
});

export { lyla, PORT, SOCKET_URL };
