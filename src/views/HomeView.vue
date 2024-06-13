<script setup>
import IMG_21 from '@/assets/doc/2.1.png';
import IMG_221 from '@/assets/doc/2.2.1.png';
import IMG_222 from '@/assets/doc/2.2.2.png';
import IMG_231 from '@/assets/doc/2.3.1.png';
import IMG_232 from '@/assets/doc/2.3.2.png';
import IMG_233 from '@/assets/doc/2.3.3.png';
import IMG_241 from '@/assets/doc/2.4.1.png';
import IMG_242 from '@/assets/doc/2.4.2.png';
import IMG_243 from '@/assets/doc/2.4.3.png';
import IMG_244 from '@/assets/doc/2.4.4.png';
import IMG_251 from '@/assets/doc/2.5.1.png';
import IMG_252 from '@/assets/doc/2.5.2.png';
import IMG_261 from '@/assets/doc/2.6.1.png';
import IMG_262 from '@/assets/doc/2.6.2.png';
import IMG_27 from '@/assets/doc/2.7.png';
import IMG_281 from '@/assets/doc/2.8.1.png';
import IMG_282 from '@/assets/doc/2.8.2.png';
import IMG_291 from '@/assets/doc/2.9.1.png';
import IMG_292 from '@/assets/doc/2.9.2.png';
</script>

<template>
  <n-result status="418" title="AGSUN-Tools使用文档" description="">
    <template #default>
      <!-- <n-h1>AGSUN-Tools使用文档</n-h1> -->
      <n-h2>1. 访问</n-h2>
      <n-p>
        在浏览器中输入服务器ip即可访问。当前部署的服务器ip：192.168.0.54
      </n-p>

      <n-h2>2. 使用指南</n-h2>
      <n-h3>2.1 登录/登出</n-h3>
      <n-ol>
        <n-li>默认账户为：用户名 admin 密码 admin</n-li>
        <n-li>添加新用户请操作数据库。</n-li>
        <n-li>登录后点击右上角即可登出。</n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_21" />

      <n-h3>2.2 区域对比</n-h3>
      <n-p>
        该功能用以检测两份文档中指定区域的差异，若两份文档的排版基本一致，请选择整页对比以减少操作。
      </n-p>

      <n-ol>
        <n-li>选择2份PDF文档。</n-li>
        <n-li>
          【指定】开关可以限制两份文档的转换范围，以减少转换时间，填写数字即可，默认转换所有页。
        </n-li>
        <n-li>
          单击【开始转换】，转换结束后在左侧灰色虚线框内显示文档的缩略图，横向滚动。单击缩略图可以切换【选取对比区域】中的图源。右侧绿色虚线框内为截取的区域预览，单击可放大查看。
        </n-li>
        <n-li>
          在确保两份文档均选取区域后，单击【开始对比】，结果中染色部分即为差异。
        </n-li>
        <n-li>
          结果解读：结果由两张区域图片进行对齐后的叠加，第一张图片为本体，第二张图片为参照物，若出现染色，则两张图片一定存在差异，可能有以下原因：
          <n-ul>
            <n-li>染色区域不在另一张区域图中。</n-li>
            <n-li>染色区域发生了缩放、旋转等操作。</n-li>
          </n-ul>
        </n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_221" />
      <n-image height="240" alt="image" :src="IMG_222" />

      <n-h3>2.3 整页对比</n-h3>
      <n-p>
        该功能以【页】为单位对两份文档进行对比，若需要对部分区域内的内容进行对比，请使用区域对比功能。
      </n-p>

      <n-ol>
        <n-li> 选择2份要对比的PDF文档，单击【上传文件】。 </n-li>
        <n-li> 【指定】开关可以控制两份文档的起始页，填写数字即可。 </n-li>
        <n-li>
          单击【对比检测】，结果返回存在差异的页，染色部分即为差异。
          其差异部分会在上传的第一份文档显示，第二份文档就作为对照物
        </n-li>
        <n-li>
          结果解读参见区域对比，必要时可以对具体的页面使用区域对比功能。
        </n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_231" />
      <n-image height="240" alt="image" :src="IMG_232" />
      <n-p>
        如下图所示，结果可能显示“从第i页到第j页，两个文件格式变化巨大”。此时可以使用【指定】功能来跳过目标页，进行后续页面的对比。例如，文档A在第5页后插入了一页新的内容，此时应从文档A的第7页（跳过第6页）和文档B的第6页来对比。
      </n-p>
      <n-image height="240" alt="image" :src="IMG_233" />

      <n-h3>2.4 零件计数</n-h3>
      <n-p>
        该功能用以检测爆炸图中零件数与明细表中的数目是否一致，以及不同语言的明细表与第一张明细表是否一致。
      </n-p>
      <n-image height="240" alt="image" :src="IMG_241" />
      <n-p>
        由于文档中明细表可能由矢量绘制或为图片，格式没有统一规范，故提供两种模式并需要分别指定参数。
      </n-p>
      <n-ol>
        <n-li>
          常规模式：当明细表使用矢量绘制时使用该模式，需要指定参数：
          <n-ol>
            <n-li>第1张明细表所在的页码</n-li>
            <n-li>明细表的列数</n-li>
            <n-li>明细表中序号与数量的对应关系</n-li>
          </n-ol>
        </n-li>
        <n-li>
          OCR模式：当明细表使用图片绘制时使用该模式，需要指定的参数：
          <n-ol>
            <n-li>所有明细表所在的页码：单击【加号】增加并输入。 </n-li>
            <n-li>
              第1张明细表的零件数量值：输入零件数会自动生成序号表，填写每个零件的数量即可。
            </n-li>
          </n-ol>
        </n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_242" />
      <n-image height="240" alt="image" :src="IMG_243" />
      <n-p>
        检测结果提供文字描述、错误的明细表页以及爆炸图零件计数与明细表零件技术的正误。
      </n-p>
      <n-image height="240" alt="image" :src="IMG_244" />

      <n-h3>2.5 页码检查</n-h3>
      <n-p>
        该功能用以检查文档的页码是否有误。因页码所在的高度不同，故可选择两种模式。
      </n-p>
      <n-ol>
        <n-li> 默认模式：默认页码离页面底部的距离不超过65。 </n-li>
        <n-li>
          区域模式：通过框选页码所在区域的方式来提供页码所在的高度。
        </n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_251" />
      <n-image height="240" alt="image" :src="IMG_252" />

      <n-h3>2.6 螺丝包</n-h3>
      <n-p>
        该功能用以检测文档中螺丝包的螺丝数量和步骤图中螺丝总数是否一致。由于螺丝包表格可能由矢量绘制或为图片，格式没有统一规范，故为兼容需要选取区域识别。
      </n-p>
      <n-image height="240" alt="image" :src="IMG_261" />
      <n-image height="240" alt="image" :src="IMG_262" />

      <n-h3>2.7 CE表对比</n-h3>
      <n-p> 该功能用以对比两份文件中CE表内容的差异。 </n-p>
      <n-ol>
        <n-li> 选择原始CE表（Excel文件）和目标CE表（PDF文件）。 </n-li>
        <n-li>
          目前只有常规模式。因Excel文件可能存在多张Sheet表，故需要提供第二个参数，默认为1。
        </n-li>
        <n-li>
          单击【开始对比】，结果返回图片。图片中蓝色方框内的内容即为差异部分。第一张图片为excel图，第二张为pdf图
        </n-li>
      </n-ol>
      <n-image height="240" alt="image" :src="IMG_27" />

      <n-h3>2.8 CE贴纸尺寸</n-h3>
      <n-p>
        检测CE贴纸中标注尺寸与实际尺寸是否一致，提供矩形与圆形两种模式。因标注尺寸的格式不一致难以做兼容，故提供【指定】开关输入尺寸，填写数字即可。
      </n-p>
      <n-image height="240" alt="image" :src="IMG_281" />
      <n-image height="240" alt="image" :src="IMG_282" />

      <n-h3>2.9 语言顺序</n-h3>
      <n-p> 检查多语言文档中目录的语言顺序与正文中语言的顺序是否一致。 </n-p>
      <n-image height="240" alt="image" :src="IMG_291" />
      <n-p>文档没有目录时的场景。</n-p>
      <n-image height="240" alt="image" :src="IMG_292" />

      <n-h3>2.10 实物检测</n-h3>
      <n-p> // TODO </n-p>

      <n-h3>2.11 线段检测</n-h3>
      <n-p> 该功能用以检测PDF文档中过细的线。 使用方式如下： </n-p>

      <n-ol>
        <n-li> 拖动或单击选择要检测的1份PDF文档，单击【上传文件】 </n-li>
        <n-li> 完成后点击开始检测。 </n-li>
        <n-li> 完成后点击下载文件即可。 </n-li>
      </n-ol>
    </template>
    <template #footer> </template>
  </n-result>
</template>

<style scoped>
.n-result {
  margin: 80px;
}
</style>