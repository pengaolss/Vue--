<template>
  <div>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文章列表</span>
      </div>
      <!-- 搜索区域 -->
      <div class="search-box">
        <el-form :inline="true" :model="q">
          <el-form-item label="文章分类">
            <el-select
              v-model="q.cate_id"
              placeholder="请选择分类"
              size="small"
            >
              <el-option
                v-for="item in cateList"
                :key="item.id"
                :value="item.id"
                :label="item.cate_name"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态" style="margin-left: 15px">
            <el-select v-model="q.state" placeholder="请选择状态" size="small">
              <el-option label="已发布" value="已发布"></el-option>
              <el-option label="草稿" value="草稿"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="choseFn"
              >筛选</el-button
            >
            <el-button type="info" size="small" @click="resetFn"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
        <!-- 发表文章的按钮 -->
        <el-button
          type="primary"
          size="small"
          class="btn-pub"
          @click="showPubDialogFn"
          >发表文章</el-button
        >
      </div>

      <!-- 文章表格区域 -->
      <el-table :data="artList" style="width: 100%" border stripe>
        <el-table-column label="文章标题" prop="title">
          <template v-slot="scope">
            <el-link type="primary" @click="showDetailFn(scope.row.id)">{{
              scope.row.title
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="cate_name"></el-table-column>
        <el-table-column label="发表时间" prop="pub_date">
          <template v-slot="scope">
            <span>{{ $formatDate(scope.row.pub_date) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="state"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button type="danger" size="mini" @click="removeFn(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChangeFn"
        @current-change="handleCurrentChangeFn"
        :current-page.sync="q.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size.sync="q.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 发表文章的 Dialog 对话框 -->
    <el-dialog
      title="发表文章"
      :visible.sync="pubDialogVisible"
      fullscreen
      :before-close="handleClose"
      @close="dialogCloseFn"
    >
      <!-- 发布文章的对话框 -->
      <el-form
        :model="pubForm"
        :rules="pubFormRules"
        ref="pubFormRef"
        label-width="100px"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="pubForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="cate_id">
          <el-select
            v-model="pubForm.cate_id"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <!-- 因为整个表单要发给后台，去提前看眼vue代码里绑定的值需要什么，发现接口文档里要的是分类id -->
            <el-option
              v-for="item in cateList"
              :key="item.id"
              :value="item.id"
              :label="item.cate_name"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <quill-editor
            v-model="pubForm.content"
            @blur="contentChangeFn"
          ></quill-editor>
        </el-form-item>
        <el-form-item label="文章封面" prop="cover_img">
          <!-- 用来显示封面的图片 -->
          <img
            src="../../assets/images/cover.jpg"
            alt=""
            class="cover-img"
            ref="imgRef"
          />
          <br />
          <!-- 文件选择框，默认被隐藏 -->
          <input
            type="file"
            style="display: none"
            accept="image/*"
            ref="iptFileRef"
            @change="changeCoverFn"
          />
          <!-- 选择封面的按钮 -->
          <el-button type="text" @click="selCoverFn">+ 选择封面</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="pubArticleFn('已发布')"
            >发布</el-button
          >
          <el-button type="info" @click="pubArticleFn('草稿')"
            >存为草稿</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 查看文章详情的对话框 -->
    <el-dialog title="文章预览" :visible.sync="detailVisible" width="80%">
      <h1 class="title">{{ artDetail.title }}</h1>

      <div class="info">
        <span>作者：{{ artDetail.nickname || artDetail.username }}</span>
        <span>发布时间：{{ $formatDate(artDetail.pub_date) }}</span>
        <span>所属分类：{{ artDetail.cate_name }}</span>
        <span>状态：{{ artDetail.state }}</span>
      </div>

      <!-- 分割线 -->
      <el-divider></el-divider>

      <!-- 文章的封面 -->
      <img v-if="artDetail.cover_img" :src="baseURL + artDetail.cover_img" />

      <!-- 文章的详情 -->
      <div v-html="artDetail.content" class="detail-box"></div>
    </el-dialog>
  </div>
</template>

<script>
import { baseURL } from '@/utils/request'
import {
  getArtCateListAPI,
  uploadArticleAPI,
  getArtListAPI,
  getArtDetailAPI,
  delArticleAPI
} from '@/api'
// 标签和样式中，引入图片文件可以写路径，在js里引入图片要用import引入
// webpack会把图片变成一个base64字符串/在打包后的图片临时地址
import imgObj from '../../assets/images/cover.jpg'
// 标签和样式中，引入图片文件直接写'静态路径'(把路径放在js的vue变量里再赋予是不行的)
// 原因：webpack分析标签的时候，如果src的值是一个相对路径，它会去帮我们找到那个路径的文件并一起打包
// 打包的时候，会分析文件的大小，小图转成base64字符串再赋予src，如果是大图拷贝图片换个路径给img的src显示（运行时）

// Vue变量中路径，赋予给标签，都会当做普通的字符串使用
// 以前：我们写的路径是在vscode看着文件夹写的（以前好使的原因：你用live Server/磁盘双击打开，它都能通过你的相对路径，在
// 指定路径文件夹下，找到图片文件真身）
// 现在：写的模板代码，是要被webpack翻译处理转换的，你vscode里的代码，转换后打包到内存中/dist下，相对路径就会变化，
// 运行时，你写的固定路径字符串就找不到那个文件真身了
// 解决："js里引入图片，就用import引入"，让webpack把它当做模块数据，是转换成打包后的图片路径还是base64字符串

// 注意：只有相对路径本地图片需要注意，如果你是一个http://外链的图片地址，就可以直接随便用
// 直接标签里写也行，或者在js用变量保存后赋予给标签，都ok，因为运行时，浏览器发现src地址是外链就不找相对路径文件夹了
export default {
  name: 'ArtList',
  data () {
    return {
      baseURL: baseURL,
      // 查询参数对象
      q: {
        pagenum: 1, // 默认拿第一页的数据
        pagesize: 2, // 默认当前页需要几条数据（传递给后台，后台就返回几个数据）
        cate_id: '',
        state: ''
      },
      pubDialogVisible: false, // 控制发布文章对话框的出现或隐藏(true/false)
      pubForm: {
        // 发布文章-表单的数据对象
        title: '', // 文章标题
        cate_id: '', // 文章分类id
        content: '', // 文章内容
        cover_img: null, // 封面图片（文件）
        state: '' // 发布状态（值：'已发布'，'草稿'）
      },
      cateList: [], // 保存文章分类列表
      pubFormRules: {
        // 发布文章-表单的验证规则对象
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          {
            min: 1,
            max: 30,
            message: '文章标题的长度为1-30个字符',
            trigger: 'blur'
          }
        ],
        // 下拉菜单是没有失焦的，所以检验时机得用change
        cate_id: [
          { required: true, message: '请选择文章分类', trigger: 'change' }
        ],
        content: [
          // 为何富文本编辑框输入内容了，校验还不自己去掉
          // 原因：
          // content对应quill-editor富文本编辑器，它不是el提供的表单标签
          // el-input等输入框的在blur事件时进行校验
          // 下拉菜单，单选框，复选框，是在change事件时进行校验
          // quill-editor两个事件都没有，所以那你输入内容也不会自动走校验
          // 解决：
          // 自己来给quill-editor绑定change事件（在文档里查到的，它支持change事件-内容改变事件）
          // 在事件处理函数中用el-form组件对象内，调用某个校验规则再重新执行
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ],
        cover_img: [
          { required: true, message: '请选择封面图片', trigger: 'blur' }
        ]
      },
      artList: [], // 保存文章列表
      total: 0, // 保存现有文章的总数
      detailVisible: false, // 用于查看文章详情的对话框显示或隐藏(true/false)
      artDetail: {} // 文章详情
    }
  },
  methods: {
    // 获取-所有文章列表
    async getArtCateListFn () {
      const { data: res } = await getArtListAPI(this.q)
      this.artList = res.data // 保存当前获取的文章列表（注意：有分页不是所有数据）
      this.total = res.total // 保存总数
    },
    // 发表文章按钮->点击事件->让添加文章对话框出现
    showPubDialogFn () {
      this.pubDialogVisible = true
    },
    // 发布文章-对话框-关闭前的回调
    // 注意：自带的三种关闭方式：带点右上角的x，和按下esc按键，和点击半透明蒙层关闭，以及你自己
    // 点击设置pubDialogVisible对应变量为false，都会导致关闭前回调触发
    async handleClose (done) {
      // done的作用：调用就会关闭对话框
      // 询问用户是否确认关闭对话框
      const confirmResult = await this.$confirm(
        '此操作将导致文章信息丢失, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err) // 捕获确认框Promise对象里选择取消时，拒绝状态结果'cancel'字符串
      // $confirm内部虽然是一个确认提示框，但是它借用了Promise语法来管理，点击确定它的状态为兑现
      // 成功状态返回'confirm',如果用户点击了取消按钮，此Promise对象状态为拒绝状态，返回'cancel'字符串

      // 知识点回顾：
      // 1、await只能用在被async修饰的函数内
      // async修饰：就是在当前函数名左边加async关键字，如果没有函数名，在形参的左边加async
      // 原因：async修饰的函数就是异步函数，如果此函数被调用，总是返回一个全新Promise对象
      // 而且本次函数调用的是异步函数，所以外面的同步代码继续执行，而await暂停代码只能暂停
      // async函数内的，等待await后面异步结果
      // 2、await只能拿到成功的结果并放行往下走，如果失败内部会向浏览器控制台抛出错误并不会让
      // await往下走代码
      // 3、await后面的Promise的对象的拒绝状态（错误）如何捕获呢？
      // 方法一：try() catch(err) {}
      // 方法二：用Promise的链式调用，而且在catch里return的非Promise拒绝状态的对象值，都会当做
      // 成功的结果返回给原地新的Promise对象结果

      // 取消了关闭-阻止住, 什么都不干,对话框不能关闭，提前return不让下面的done执行
      if (confirmResult === 'cancel') return
      // 确认关闭
      done()
    },
    // 初始化文章分类的列表数据
    async initCateList () {
      const { data: res } = await getArtCateListAPI()
      if (res.code === 0) {
        this.cateList = res.data
      }
    },
    // 选择封面点击事件 ->让文件选择窗口出现
    selCoverFn () {
      this.$refs.iptFileRef.click() // 用js来模拟一次点击事件动作
    },
    // 用户选择了封面文件
    changeCoverFn (e) {
      // e.target 拿到触发事件的那个标签（input标签对象本身）
      // e.target.files 拿到选择的文件数组
      const files = e.target.files
      if (files.length === 0) {
        // 用户没有选择图片,那得把cover_img置空
        this.pubForm.cover_img = null
        // img要显示回默认cover.png
        this.$refs.imgRef.setAttribute('src', imgObj)
      } else {
        // 用户选择了文件，把文件直接保存到表单对象的属性里
        this.pubForm.cover_img = files[0]
        // 把图片文件，要显示到img标签里
        const url = URL.createObjectURL(files[0])
        this.$refs.imgRef.setAttribute('src', url)
      }
      // 让表单单独校验封面的规则
      this.$refs.pubFormRef.validateField('cover_img')
    },
    // 表单里（点击发布/存为草稿）按钮点击事件->准备调用后端接口
    pubArticleFn (str) {
      // str的值"已发布"，或者"草稿"（后端要求的参数值）
      this.pubForm.state = str // 保存到统一表单对象上

      // 兜底校验
      this.$refs.pubFormRef.validate(async (valid) => {
        if (valid) {
          // 都通过
          const fd = new FormData() // 准备一个表单数据对象的容器 FormData类是HTML5新出的专门为了装文件内容和其他
          // 参数的一个容器
          // fd.append('参数名',值)
          fd.append('title', this.pubForm.title)
          fd.append('cate_id', this.pubForm.cate_id)
          fd.append('content', this.pubForm.content)
          fd.append('cover_img', this.pubForm.cover_img)
          fd.append('state', this.pubForm.state)
          const { data: res } = await uploadArticleAPI(fd)
          if (res.code !== 0) return this.$message.error('发布文章失败！')
          this.$message.success('发布文章成功!')

          // 关闭对话框
          this.pubDialogVisible = false
          // 刷新文章列表 -> 再次请求文章列表数据h
          this.getArtCateListFn()
        } else {
          return false // 阻止默认行为(因为按钮有默认提交行为)
        }
      })
    },
    // 富文本编辑器内容改变触发此事件方法
    contentChangeFn () {
      // 目标：如何让el-form校验，只校验content这个规则
      this.$refs.pubFormRef.validateField('content')
    },
    // 新增文章->对话框关闭时->清空表单
    dialogCloseFn () {
      this.$refs.pubFormRef.resetFields()
      // 我们需要手动给封面标签img重新设置一个值，因为它没有收到v-model影响
      this.$refs.imgRef.setAttribute('src', imgObj)
    },
    // 分页->每页条数改变触发
    // 核心思想：根据选择的页码/条数，影响q对象对应属性的值，再重新发一次请求让后台重新返回数据
    handleSizeChangeFn (sizes) {
      // sizes：当前需要每页显示的条数
      // 因为Pagination的标签上已经加了.sync，子组件内会双向绑定到右侧vue变量上（q对象里pagesize已经改变了）
      // 如果你不放心，可以再写一遍
      this.q.pagesize = sizes
      // 问题：先点击最后一个页码，切换每页显示条数2->3，总数不够，分页只能分到2
      // 每页条数改变了，页码从3到2页改变了，2个事件都会触发
      // 偶发性的bug：有的时候自动回到第二页有数据有的时候没有
      // 知识点：两个网络请求一起发，谁先回来不一定
      // 原因：所以可能第二页三条数据回来有值铺设，紧接着第三页的三条数据回来了，空数组所以页面就是空的
      // 解决：当切换每页显示的条数，我们就把当前页码设置为1，而且标签里要设置
      this.q.pagenum = 1
      this.getArtCateListFn()
    },
    // 当前页码改变时触发
    handleCurrentChangeFn (nowPage) {
      // nowPage：当前要看的第几页，页数
      this.q.pagenum = nowPage
      this.getArtCateListFn()
    },
    // 筛选按钮->点击事件
    choseFn () {
      // 目的：当有了筛选条件，我想让页码回归1，每页的条数回归2
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.getArtCateListFn()
    },
    // 重置按钮->点击事件
    resetFn () {
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.q.cate_id = ''
      this.q.state = '' // 对象改变，v-model关联的表单标签也会变为空
      this.getArtCateListFn()
    },
    // 文章标题点击事件->为了查看详情
    async showDetailFn (artId) {
      this.detailVisible = true // 让详情的对话框出现
      // artId:文章id值
      const { data: res } = await getArtDetailAPI(artId)
      this.artDetail = res.data
    },
    // 删除文章按钮点击事件
    async removeFn (artId) {
      const { data: res } = await delArticleAPI(artId)
      if (res.code !== 0) return this.$message.error(res.message)
      this.$message.success(res.message)

      // 数组里只能保存当前页的数据，别的页面需要传参q给后台获取覆盖
      // 1的原因：虽然你调用删除接口但是那是后端删除，前端数组里你没有代码去修改它
      if (this.artList.length === 1) {
        if (this.q.pagenum > 1) { // 保证pagenum最小值为1
          this.q.pagenum--
        }
      }
      // 直接携带当前q里有的参数，重新去后台获取一次最新的数据列表
      this.getArtCateListFn()
      // 问题：在最后一页，删除最后一条时，虽然页码能回到上一页，但是数据没有出现
      // 原因：在network里参数q.pagenum的值不会自己回到上一页，因为你的代码里没有修改过这个q.pagenum的值，
      // 用getArticleFn方法，带着之前的参数请求去了所以没有数据
      // 解决：在调用接口以后，刷新数组列表之前，对页码进行一下处理
    }
  },
  created () {
    // 请求分类数据
    this.initCateList()
    // 请求文章列表
    this.getArtCateListFn()
  }
}
</script>

<style lang="less" scoped>
// scoped属性作用：让style里的选择器，只能选中当前组件的标签（为了保证样式的独立性，不影响别的组件）
// scoped原理：(多加了一个data-v的属性选择器)
// webpack打包的时候，会给组件标签上添加相同的data-v-hash值，然后也会给所有选择器后面
// 加上一个[data-v-hash]值的属性选择器
// <标签 data-v-hash值 class="my-a"><标签>
// 选择器会变成.my-a[data-v-hash值]
// 重要注意事项：scoped只会给当前组件所有原生标签添加data-v-hash值属性，还会给组件标签内根标签添加data-v-hash值属性
// 组件内的标签不会添加
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .btn-pub {
    margin-top: 5px;
  }
}
.el-pagination {
  margin-top: 15px;
}
// 设置图片封面的宽高
.cover-img {
  width: 400px;
  height: 280px;
  object-fit: cover;
}
// 设置富文本编辑器的默认最小高度
// ::v-deep作用: 穿透选择, 正常style上加了scope的话, 会给.ql-editor[data-v-hash]属性, 只能选择当前页面标签或者组件的根标签
// 如果想要选择组件内的标签(那些标签没有data-v-hash值)所以正常选择选不中, 加了::v-deep空格前置的话, 选择器就会变成如下形式
// [data-v-hash] .ql-editor 这样就能选中组件内的标签的class类名了
::v-deep .ql-editor {
  // 最小高度：标签本身的高度靠内容撑开，但是无内容或者没有300px的高度，标签会设置其高度为300px
  // 如果内容大于300px，标签高度也会随着撑开（比300px大）

  // 直接给height：那么无论容器内的内容有多少，标签高度也还是300px，超出300px的内容会溢出到外面而不是撑开此容器
  min-height: 300px;
}

// 总结：scoped不会给组件内的标签添加data-v属性，所以你要用 ::v-deep 穿透选择组件内的标签设置样式
</style>
