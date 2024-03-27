import { createLyla } from '@lylajs/web';

const PORT = 8888;
const SOCKET_URL = `ws://localhost:${PORT}/api`;

const { lyla } = createLyla({
  baseUrl: `http://127.0.0.1:${PORT}`,
});

export { lyla, PORT, SOCKET_URL };
