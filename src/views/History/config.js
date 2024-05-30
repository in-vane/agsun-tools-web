/**
 * 功能映射表
 */
export const taskOptions = [
  { label: '区域对比', value: '001' },
  { label: '整页对比', value: '002' },
  { label: '零件计数', value: '003' },
  { label: '页码检查', value: '004' },
  { label: '螺丝包', value: '005' },
  { label: 'CE表对比', value: '006' },
  { label: 'CE贴纸尺寸', value: '007' },
  { label: '语言顺序', value: '008' },
  { label: '实物检测', value: '009' },
  { label: '线段检测', value: '010' },
];

export const taskMap = {
  '001': '区域对比',
  '002': '整页对比',
  '003': '零件计数',
  '004': '页码检查',
  '005': '螺丝包',
  '006': 'CE表对比',
  '007': 'CE贴纸尺寸',
  '008': '语言顺序',
  '009': '实物检测',
  '010': '线段检测',
};

/**
 * 表单验证规则
 */
export const rules = {
  username: {
    required: true,
    message: '请输入姓名',
    trigger: 'blur',
  },
  datetime: {
    type: 'number',
    required: true,
    message: '请选择时间',
    trigger: ['blur', 'change'],
  },
  type_id: {
    required: true,
    message: '请选择功能',
    trigger: ['blur', 'change'],
  },
  file_path: {
    required: true,
    message: '请选择文件',
    trigger: ['blur', 'change'],
  },
};

/**
 * mock数据
 */
export const data = [
  {
    username: 'admin',
    datetime: '2007-06-30',
    type_id: '010',
    text: '',
    images: [],
    file: 'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/result/1.pdf',
  },
  {
    username: 'admin',
    datetime: '2007-06-30',
    type_id: '001',
    text: '检测结果有诸多问题',
    images: [
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/1.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/2.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/3.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/4.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/5.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/6.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/7.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/8.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/9.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/10.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/11.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/12.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/13.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/14.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/15.jpg',
      'http://10.22.78.13:8088/file/agsun-tools-server/db/011/2024/0521/21-31-01/admin/16.jpg',
    ],
    file: '',
  },
];
