import { createLyla } from '@lylajs/web';

const HOST = '10.22.148.91'
// const HOST = 'localhost'
const PORT = 8888;
const SOCKET_URL = `ws://${HOST}:${PORT}/websocket`;

const { lyla } = createLyla({
  baseUrl: `http://${HOST}:${PORT}/api`,
});

export { lyla, PORT, SOCKET_URL };
