import { h } from 'vue';
import { NIcon, NTag } from 'naive-ui';
import SparkMD5 from 'spark-md5';
import { lyla, SOCKET_URL } from '@/request';
import { SHARD_SIZE, WEBSOCKET_TYPE } from '@/config/const.config';

export const onlyAllowNumber = (value) => !value || /^\d+$/.test(value);

export function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const newTagColors = { color: '#f90', textColor: '#fff', borderColor: '#f90' };
export function renderNew(
  type = 'warning',
  text = 'New',
  color = newTagColors
) {
  return () =>
    h(
      NTag,
      { type, round: true, size: 'small', color },
      { default: () => text }
    );
}

export const download = (filename, url) => {
  let a = document.createElement('a');
  a.style = 'display: none'; // 创建一个隐藏的a标签
  a.download = filename;
  a.href = url;
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};

export const isFileUploaded = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = reader.result;
      const md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer);
      const params = { md5 };
      lyla
        .post('/isFileUploaded', { json: params })
        .then((res) => {
          console.log(res);
          let result = res.json.data?.result;
          result = Array.isArray(result) ? result : [];
          resolve(result);
        })
        .catch((err) => reject(err));
    };
    reader.readAsArrayBuffer(file);
  });
