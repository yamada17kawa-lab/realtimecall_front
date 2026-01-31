<template>
  <div class="login-page" :style="bgStyle">
    <h1>登录</h1>
    <form @submit.prevent="onSubmit" class="form">
      <div class="field">
        <label>用户名</label>
        <input v-model="form.userName" required />
      </div>
      <div class="field">
        <label>密码</label>
        <div class="password-wrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" required />
          <button type="button" class="toggle" @click="showPassword = !showPassword" :aria-pressed="showPassword" :aria-label="showPassword ? '隐藏密码' : '显示密码'">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.67 21.67 0 0 1 5.06-6.06" />
              <path d="M1 1l22 22" />
              <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
            </svg>
          </button>
        </div>
      </div>

      <div class="actions">
        <button type="submit">登录</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import loginBg from '@/assets/login.jpg'

export default {
  name: 'LoginView',
  data () {
    return {
      form: {
        userName: '',
        password: ''
      },
      showPassword: false,
      error: '',
      success: ''
    }
  },
  created () {
    const token = localStorage.getItem('token') || this.$store.getters.token
    if (token) {
      this.$router.push({ name: 'main' })
    }
  },
  computed: {
    bgStyle () {
      return {
        backgroundImage: `url(${loginBg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
      }
    }
  },
  methods: {
    async onSubmit () {
      this.error = ''
      this.success = ''
      try {
        const res = await axios.post('/auth/login', {
          userName: this.form.userName,
          password: this.form.password
        })
        const body = res.data || {}
        if (body.code !== undefined && body.code !== 200) {
          this.error = body.message || '登录失败'
          return
        }
        const headerToken = res.headers && (res.headers.authorization || res.headers.Authorization)
        if (headerToken) {
          // 存储 token 原样返回（不要去掉 Bearer 或其他前缀）
          const token = headerToken
          localStorage.setItem('token', token)
          this.$store.dispatch('saveToken', token)
        }
        this.success = body.message || '登录成功'
        // 成功后跳转到主页面
        setTimeout(() => { this.$router.push({ name: 'main' }) }, 700)
      } catch (e) {
        if (e.response && e.response.data && e.response.data.message) this.error = e.response.data.message
        else this.error = e.message || '请求失败'
      }
    }
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box }
.login-page h1 { margin: 0 0 18px; text-align: center; font-size: 28px }
.form { max-width: 420px; width: 100% }
.field { margin-bottom: 12px; }
label { display:block; margin-bottom:6px }
input { width:100%; padding:8px; box-sizing:border-box }
.actions { margin-top: 16px }
.error { color: #b00020; margin-top: 12px }
.success { color: #007700; margin-top: 12px }
.password-wrapper { position: relative }
.password-wrapper input { padding-right: 44px }
.toggle { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 4px; font-size: 16px }
.toggle:focus { outline: none }
@media (max-width: 600px) {
  .login-page h1 { font-size: 24px }
  .form { padding: 0 16px }
  input { font-size: 16px }
}
</style>
