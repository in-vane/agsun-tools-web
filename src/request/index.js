import { createLyla } from '@lylajs/web';
import { storage } from '@/utils/storage';
import { useUser } from '@/store/modules/user';

// 服务器调试
// const HOST = '10.22.148.91';
// const PORT = 8889;
// 本地调试
const HOST = 'localhost';
const PORT = 8888;
// 局域网内调试
// const HOST = '192.168.0.108'
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
        const $message = window['$notification'];
        const userStore = useUser();
        const { response } = error;
        if (!response) {
          $message.error({
            title: '任务失败',
            content: '网络或服务故障',
          });
          reject(statusText);
        }
        const { status, statusText } = response;
        console.log({ status, statusText });
        switch (status) {
          case 401:
            userStore.logout();
            location.href = '/login';
            break;
          case 403:
            $message.error({
              title: '任务失败',
              content: `没有权限, ${statusText}`,
            });
            break;

          default:
            $message.error({
              title: '任务失败',
              content: statusText,
            });
            break;
        }

        reject(statusText);
      },
    ],
  },
});

const openWebsocket = (loading, onopen, onmessage) => {
  try {
    loading.value = true;
    const token = storage.get('ACCESS-TOKEN', '');
    const websocket = new WebSocket(`${SOCKET_URL}?token=${token}`);

    websocket.onopen = (e) => {
      console.log('connected: ', e);
      onopen();
    };

    websocket.onclose = (e) => {
      console.log('disconnected: ', e);
      loading.value = false;
    };

    websocket.onmessage = onmessage;

    websocket.onerror = (e) => {
      console.log('error: ', e);
    };

    return websocket;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { lyla, PORT, SOCKET_URL, openWebsocket };
