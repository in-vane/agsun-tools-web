//普通路由 无需验证权限
export const constantRouter = [
  {
    path: '/',
    name: 'Root',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
];

// 需要验证权限
export const asyncRoutes = [
  {
    path: '/',
    name: 'MainLayout',
    redirect: '/home',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: '/ce',
        name: 'ce',
        component: () => import('@/views/CEView.vue'),
      },
      {
        path: '/area',
        name: 'area',
        component: () => import('@/views/AreaView.vue'),
      },
      {
        path: '/fullPage',
        name: 'fullPage',
        component: () => import('@/views/FullPageView.vue'),
      },
      {
        path: '/fullPageImage',
        name: 'fullPageImage',
        component: () => import('@/views/FullPageImageView.vue'),
      },
      {
        path: '/count',
        name: 'count',
        component: () => import('@/views/PartCountView.vue'),
      },
      {
        path: '/size',
        name: 'size',
        component: () => import('@/views/SizeView.vue'),
      },
      {
        path: '/pageNo',
        name: 'pageNo',
        component: () => import('@/views/PageNumberView.vue'),
      },
      // {
      //   path: '/table',
      //   name: 'table',
      //   component: () => import('@/views/TableView.vue'),
      // },
      {
        path: '/screw',
        name: 'screw',
        component: () => import('@/views/ScrewView.vue'),
      },
      {
        path: '/lang',
        name: 'lang',
        component: () => import('@/views/LanguageView.vue'),
      },
      {
        path: '/ocr',
        name: 'ocr',
        component: () => import('@/views/OCRView.vue'),
      },
    ],
  },
];
