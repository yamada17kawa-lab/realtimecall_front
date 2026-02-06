<template>
  <div class="register-page" :style="bgStyle">
    <div class="back-btn" @click="goHome">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </div>
    <h1>注册</h1>
    <form @submit.prevent="onSubmit" class="form">
      <div class="field">
        <label>用户名</label>
        <input v-model="form.userName" required />
      </div>
      <div class="field">
        <label>邮箱 (可选)</label>
        <input v-model="form.email" type="email" />
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
      <div class="field">
        <label>确认密码</label>
        <div class="password-wrapper">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="form.confirmPassword" required />
          <button type="button" class="toggle" @click="showConfirmPassword = !showConfirmPassword" :aria-pressed="showConfirmPassword" :aria-label="showConfirmPassword ? '隐藏确认密码' : '显示确认密码'">
            <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
        <button type="submit">注册</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import registerBg from '@/assets/register.jpg'

export default {
  name: 'RegisterView',
  data () {
    return {
      form: {
        userName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false,
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
        backgroundImage: `url(${registerBg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
      }
    }
  },
  methods: {
    goHome () {
      this.$router.push({ name: 'home' })
    },
    async onSubmit () {
      this.error = ''
      this.success = ''

      if (this.form.password !== this.form.confirmPassword) {
        this.error = '两次输入的密码不一致'
        return
      }

      const payload = {
        userName: this.form.userName,
        password: this.form.password
      }
      if (this.form.email) payload.email = this.form.email

      try {
        const res = await axios.post('/auth/register', payload)
        const body = res.data || {}
        // 如果响应体里有 code 字段且不等于 200，则显示 message 并不跳转
        if (body.code !== undefined && body.code !== 200) {
          this.error = body.message || '注册失败'
          return
        }
        // token may be set in response header "Authorization"
        const headerToken = res.headers && (res.headers.authorization || res.headers.Authorization)
        if (headerToken) {
          const token = headerToken
          localStorage.setItem('token', token)
          this.$store.dispatch('saveToken', token)
        }
        if (body.data && body.data.id) {
          localStorage.setItem('userId', body.data.id)
        }
        this.success = body.message || '注册成功'
        // 成功后跳转到主页面
        setTimeout(() => { this.$router.push({ name: 'main' }) }, 1000)
      } catch (e) {
        if (e.response && e.response.data && e.response.data.message) {
          this.error = e.response.data.message
        } else {
          this.error = e.message || '请求失败'
        }
      }
    }
  }
}
</script>

<style scoped>
.register-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; position: relative }
.back-btn { position: absolute; top: 24px; left: 24px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: opacity 0.2s }
.back-btn:hover { opacity: 0.8 }
.register-page h1 { margin: 0 0 18px; text-align: center; font-size: 28px; font-weight: 900; color: white }
.form { max-width: 420px; width: 100% }
.field { margin-bottom: 12px; }
label { display:block; margin-bottom:6px; color: white }
input { width:100%; padding:8px; box-sizing:border-box; color: #333 }
.actions { margin-top: 16px }
.actions button { width: 100%; padding: 12px; background: rgba(255,255,255,0.6); color: #0077be; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s }
.actions button:hover { opacity: 0.9 }
.error { color: #ffcccc; margin-top: 12px }
.success { color: #ccffcc; margin-top: 12px }
.password-wrapper { position: relative }
.password-wrapper input { padding-right: 44px }
.toggle { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 4px; font-size: 16px }
.toggle:focus { outline: none }
@media (max-width: 600px) {
  .register-page h1 { font-size: 24px }
  .form { padding: 0 16px }
  input { font-size: 16px }
}
</style>
