import { createLyla } from '@lylajs/web';

const PORT = 8888;
const SOCKET_URL = `ws://localhost:${PORT}/api/websocket`;

const { lyla } = createLyla({
  baseUrl: `http://localhost:${PORT}/api`,
});

export { lyla, PORT, SOCKET_URL };
