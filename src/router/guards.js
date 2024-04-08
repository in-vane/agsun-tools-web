import { storage } from '@/utils/storage';
import { asyncRoutes } from '@/config/router.config';
import { useUser, ACCESS_TOKEN } from '@/store/modules/user';

const LOGIN_PATH = '/login';
const whitePathList = ['/login'];

export function createRouterGuards(router) {
  const userStore = useUser();

  router.beforeEach(async (to, from, next) => {
    // Whitelist can be directly entered
    if (whitePathList.includes(to.path)) {
      next();
      return;
    }

    const token = storage.get(ACCESS_TOKEN);

    if (!token) {
      // redirect login page
      const redirectData = {
        path: LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    if (userStore.getIsDynamicRouteAdded) {
      next();
      return;
    }

    // 动态添加可访问路由表
    // const userInfo = await userStore.getInfo();
    // const routes = await asyncRouteStore.generateRoutes(userInfo);
    asyncRoutes.forEach((item) => {
      router.addRoute(item);
    });

    const redirectPath = from.query.redirect || to.path;
    const redirect = decodeURIComponent(redirectPath);
    const nextData =
      to.path === redirect ? { ...to, replace: true } : { path: redirect };
    userStore.setDynamicRouteAdded(true);
    next(nextData);
  });

  router.onError((error) => {
    console.log(error, '路由错误');
  });
}
