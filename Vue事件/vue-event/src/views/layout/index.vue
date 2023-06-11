<template>
  <el-container class="main-container">
    <!-- 头部区域 -->
    <el-header>
      <!-- 左侧的 logo -->
      <img src="../../assets/images/logo.png" alt="" />
      <!-- 右侧的菜单 -->
      <el-menu
        class="el-menu-top"
        mode="horizontal"
        background-color="#23262E"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-submenu index="1">
          <template slot="title">
            <!-- 头像 -->
            <img src="../../assets/images/head.png" alt="" class="avatar" />
            <span>个人中心</span>
          </template>
          <el-menu-item index="1-1"
            ><i class="el-icon-s-operation"></i>基本资料</el-menu-item
          >
          <el-menu-item index="1-2"
            ><i class="el-icon-camera"></i>更换头像</el-menu-item
          >
          <el-menu-item index="1-3"
            ><i class="el-icon-key"></i>重置密码</el-menu-item
          >
        </el-submenu>
        <el-menu-item index="2" @click="quitFn"
          ><i class="el-icon-switch-button"></i>退出</el-menu-item
        >
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <!-- 侧边栏-用户信息区域 -->
        <div class="user-box">
          <img :src="user_pic" alt="" v-if="user_pic" />
          <img src="../../assets/images/head.png" alt="" v-else />
          <span>欢迎 {{ nickname || username }}</span>
        </div>
        <!-- 侧边栏-菜单 -->
        <!--
          el-menu：导航菜单
           default-active: 当前激活菜单的index值（el-submenu/el-menu-item的index值） 对应的菜单就有激活样式
           @open: sub-menu 展开的回调
           @close: sub-menu 关闭的回调
           active-text-color: 激活时的文字颜色，哪项index的值和default-active一致，就会被动态设置文字颜色
           子标签：
           如果有嵌套，先写el-submenu（里面嵌套template#title的设置当前展示内容，子用el-menu-item）
           如果没有嵌套，直接写el-menu-item
           router: 设置上（默认值为true），就会当你点击某行菜单时，以index值作为路由的切换

           属性没有显示传值的，默认值为true
         -->
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#23262E"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          router
        >
          <template v-for="item in menus">
            <!-- 包含子菜单的“一级菜单” -->
            <el-menu-item
              v-if="!item.children"
              :index="item.indexPath"
              :key="item.indexPath"
            >
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </el-menu-item>
            <!-- 不包含子菜单的“一级菜单” -->
            <el-submenu v-else :index="item.indexPath" :key="item.indexPath">
              <template slot="title">
                <i :class="item.icon"></i>
                <span>{{ item.title }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                v-for="childrenitem in item.children"
                :index="childrenitem.indexPath"
                :key="childrenitem.indexPath"
              >
                <i :class="childrenitem.icon"></i>
                <span slot="title">{{ childrenitem.title }}</span>
              </el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <!-- 页面主体区域 -->
        <el-main>
          <!-- 二级路由挂载点 -->
          <router-view></router-view>
        </el-main>
        <!-- 底部 footer 区域 -->
        <el-footer>© www.itheima.com - 黑马程序员</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
// 经验：在组件标签上绑定的所有事件（包括原生事件的名字click，input等等）
// 都是自定义事件，都需要组件内$emit来触发才行
// 万一组件内不支持这个原生事件名字
// 解决：@事件名.native = "methods里方法名"
// .native给组件内根标签，绑定这个原生的事件
import { mapGetters } from 'vuex'
import { getMenusAPI } from '@/api'
export default {
  name: 'my-layout',
  data () {
    return {
      menus: [] // 侧边栏数据
    }
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'user_pic'])
  },
  methods: {
    // 退出登录 -> 点击事件
    quitFn () {
      // 为了让用户的体验更好，来个确认提示框
      this.$confirm('这就走了？不爱我了吗？', '提示', {
        confirmButtonText: '走了走了',
        cancelButtonText: '再待一会',
        type: 'warning'
      })
        .then(() => {
          // 他选择了确定（走了走了）
          // 清除vuex
          this.$store.commit('updateToken', '')
          this.$store.commit('updateUserInfo', {})
          // 强制跳转页面
          this.$router.push('/login')
          this.$message({
            type: 'success',
            message: '你个渣男!!!'
          })
        })
        .catch(() => {
          // 他选择了取消（再待一会）
        })
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    // 请求-侧边栏数据
    async getMenusFn () {
      const { data: res } = await getMenusAPI()
      this.menus = res.data
    }
  },
  // 请求-侧边栏数据
  created () {
    this.getMenusFn()
  }
}
</script>

<style lang="less" scoped>
.main-container {
  height: 100%;
  .el-header,
  .el-aside {
    background-color: #23262e;
  }
  .el-header {
    padding: 0;
    display: flex;
    justify-content: space-between;
  }
  .el-main {
    overflow-y: scroll;
    height: 0;
    background-color: #f2f2f2;
  }
  .el-footer {
    background-color: #eee;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.avatar {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  background-color: #fff;
  margin-right: 10px;
  object-fit: cover;
}

// 左侧边栏用户信息区域
.user-box {
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  user-select: none;
  img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 15px;
    object-fit: cover;
  }
  span {
    color: white;
    font-size: 12px;
  }
}
</style>
