<template>
  <!-- 注册页面的整体盒子 -->
  <div class="reg-container">
    <!-- 注册的盒子 -->
    <div class="reg-box">
      <!-- 标题的盒子 -->
      <div class="title-box"></div>
      <!-- 注册的表单区域 -->
      <el-form ref="regRef" :model="regForm" :rules="regRules">
        <el-form-item prop="username">
          <el-input
            v-model="regForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="regForm.password"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item  prop="repassword">
          <el-input
            v-model="regForm.repassword"
            placeholder="请再次输入密码"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click.stop="registerFn" class="btn-reg">注册</el-button>
          <el-link type="info" @click.stop="$router.push('/login')">去登录</el-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
// 经验：
// 前端绑定数据对象'属性名'，可以直接给要调用的功能接口的参数名一致
// 好处：我可以直接把前端对象（带着同名的属性和前端的值发给后台）
import { registerAPI } from '@/api'
export default {
  name: 'my-register',
  data () {
    // 注意：必须在data函数里定义此箭头函数，才能确保this.regForm的使用
    const samePwdFn = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.regForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      regForm: {
        // 表单数据对象
        username: '',
        password: '',
        repassword: ''
      },
      regRules: {
        // 表单规则校验对象
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9]{1,10}$/,
            message: '用户名必须是1-10位的大小写字母数字',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^\S{6,15}$/,
            message: '密码必须是6-15的非空字符',
            trigger: 'blur'
          }
        ],
        repassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            pattern: /^\S{6,15}$/,
            message: '密码必须是6-15的非空字符',
            trigger: 'blur'
          },
          { validator: samePwdFn, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 注册->点击事件
    registerFn   () {
      // js兜底校验
      this.$refs.regRef.validate(async (valid) => {
        if (valid) {
          // 通过校验,拿到绑定的数据
          console.log(this.regForm)
          // 1、调用注册接口
          const { data: res } = await registerAPI(this.regForm)
          // 2、注册失败，提示用户
          // elementUI还在Vue的原型链上添加了弹窗提示,$message
          // return必须写：阻止代码往下执行
          if (res.code !== 0) return this.$message.error(res.message)
          // 3、注册成功，提示用户
          this.$message.success(res.message)
          // 跳转登录页面
          this.$router.push('/login')
        } else {
          return false // 阻止表单默认行为(表单下面红色提示会自动出现)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.reg-container {
  background: url("../../assets/images/login_bg.jpg") center;
  background-size: cover;
  height: 100%;

  .reg-box {
    width: 400px;
    height: 335px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0 30px;
    box-sizing: border-box;

    .title-box {
      height: 60px;
      background: url("../../assets/images/login_title.png") center no-repeat;
    }

    .btn-reg {
      width: 100%;
    }
  }
}
</style>
