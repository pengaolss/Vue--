import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { getUserInfoAPI } from '@/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用来存储登录成功之后，得到的token
    token: '', // 保存token字符串
    userInfo: {} // 保存用户信息（id，username，nickname，email，user_pic）
  },
  getters: {
    // 原始写法
    // username (state) {
    //   return state.userInfo.username
    // }
    // 简写
    nickname: state => state.userInfo.nickname, // 昵称
    username: state => state.userInfo.username, // 用户名
    user_pic: state => state.userInfo.user_pic // 用户头像
  },
  mutations: {
    // 更新 token 的 mutation 函数
    updateToken (state, newToken) {
      state.token = newToken
    },
    // 更新用户的信息
    updateUserInfo (state, info) {
      state.userInfo = info
    }
  },
  actions: {
    // 请求 -> 用户信息
    async getUserInfoActions (store) {
      const { data: res } = await getUserInfoAPI()
      console.log(res)
      if (res.code === 0) {
        // 你现在本地有token值，才去请求用户信息
        store.commit('updateUserInfo', res.data)
      }
    }
  },
  modules: {
  },
  // 配置为 vuex 的插件
  plugins: [createPersistedState()] // 注入持久化插件
})

// vuex默认保存在内存中，所以刷新所有的值会回归初始化（无法做到持久存储）
// 借助npm i vuex-persistedstate@3.2.1这个包可以让vuex做持久化存储
