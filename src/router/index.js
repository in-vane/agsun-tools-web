import { createRouter, createWebHistory } from 'vue-router';
import { createRouterGuards } from './guards';
import { constantRouter } from '@/config/router.config';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRouter,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0, behavior: 'smooth' }),
});

export function setupRouter(app) {
  app.use(router);
  // 创建路由守卫
  createRouterGuards(router);
}

export default router;
