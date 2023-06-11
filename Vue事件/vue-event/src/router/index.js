import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', // 网页打开第一次默认路由路径就是'/'
    component: () => import('@/views/layout'), // 默认打开，直接看到布局页面
    redirect: '/home', // 会导致路由规则数组再次匹配
    children: [
      // 侧边栏导航，点击会切换路由地址，路由地址靠数据请求回来铺设上去
      // 所以你的路由规则要配合它保持一致
      {
        path: 'home',
        component: () => import('@/views/home')
      },
      {
        path: 'user-info',
        component: () => import('@/views/user/userInfo.vue')
      },
      {
        path: 'user-avatar',
        component: () => import('@/views/user/userAvatar.vue')
      },
      {
        path: 'user-pwd',
        component: () => import('@/views/user/userPwd.vue')
      },
      {
        path: 'art-cate',
        component: () => import('@/views/article/artCate.vue')
      },
      {
        path: 'art-list',
        component: () => import('@/views/article/artList.vue')
      }
    ]
  },
  {
    path: '/reg',
    // webpack提供import函数来路由懒加载导入组件
    // 路由懒加载：就是页面路由路径切换到/reg，才去加载对应组件代码
    // 好处：让首页加载文件体积更小，打开更快
    component: () => import('@/views/register')
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue')
  }]

const router = new VueRouter({
  routes
})

const whiteList = ['/login', '/reg'] // 白名单(无需登录，即可访问的路由地址)

// 全局前置路由守卫
// 知识点1：浏览器第一次打开项目页面，会触发一次全局前置路由守卫
// 知识点2：判断登录与否：有token就证明登录了，无token未登录
// 知识点3：next()如果强制切换路由地址，会再次走路由守卫再次去匹配路由表
router.beforeEach((to, from, next) => {
  const token = store.state.token
  if (!token) {
    if (whiteList.includes(to.path)) {
      // 未登录，可以访问的路由地址，则放行（全局前置路由守卫不会再次触发了，而是匹配路由表，让组件挂载）
      next()
    } else {
      next('/login')
    }
  } else {
    store.dispatch('getUserInfoActions')
    next()
  }
})

export default router
// 退出登录，重新登录，只走相关组件代码（异步dom切换，不会导致所有代码重新执行）
// 解决：
// 1、可以在登录页面，登录成功后，再发请求去拿到用户信息
// 2、可以在全局前置路由守卫中，写（路由跳转的时候，判断+获取）
