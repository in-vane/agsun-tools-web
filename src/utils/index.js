import { h } from 'vue';
import { NIcon } from 'naive-ui';
import SparkMD5 from 'spark-md5';
import { lyla } from '@/request';
import {
  PDF2IMG_MODE,
  SHARD_SIZE,
  WEBSOCKET_TYPE,
} from '@/config/const.config';

/**
 * input只允许数字
 * @param {*} value
 * @returns
 */
export const onlyAllowNumber = (value) => !value || /^\d+$/.test(value);

/**
 * 渲染icon
 * @param {*} icon
 * @returns
 */
export function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * 下载文件
 * @param {*} filename
 * @param {*} url
 */
export const download = (filename, url) => {
  let a = document.createElement('a');
  a.style = 'display: none'; // 创建一个隐藏的a标签
  a.download = filename;
  a.href = url;
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};

/**
 * 检查数组是否全true
 * @param {*} arr
 * @returns {Boolean}
 */
export const checkAllTrue = (arr) => arr.every((element) => element === true);

/**
 * 生成文件的md5
 * @param {*} file
 * @returns
 */
export const getMD5 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = reader.result;
      const md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer);
      resolve(md5);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });

/**
 * 检查文件是否已上传
 * @param {*} file
 * @returns {Boolean}
 */
export const checkFileUploaded = async (file) => {
  const md5 = await getMD5(file);
  const response = await lyla.post('/isFileUploaded', { json: { md5 } });
  let record = response.json.data?.result;

  return record;
};

/**
 * 分片上传文件
 * @param {*} ws websocket实例
 * @param {*} file 要上传的文件
 */
export const uploadFile = (ws, file) => {
  const size = file.size;
  const total = Math.ceil(size / SHARD_SIZE);
  const params = {
    type: WEBSOCKET_TYPE.UPLOAD,
    fileName: file.name,
    total,
  };
  for (let i = 0; i < total; i++) {
    const start = i * SHARD_SIZE;
    const end = Math.min(size, start + SHARD_SIZE);
    const fileClip = file.slice(start, end);
    const reader = new FileReader();
    reader.onload = (e) => {
      Object.assign(params, {
        current: i + 1,
        file: reader.result,
      });
      ws.send(JSON.stringify(params));
    };
    reader.readAsDataURL(fileClip);
  }
};

export const getImages = (ws, filePath, options = {}) => {
  const params = {
    type: WEBSOCKET_TYPE.PDF2IMG,
    filePath,
    options,
  };
  ws.send(JSON.stringify(params));
};
