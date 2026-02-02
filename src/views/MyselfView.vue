<template>
  <div class="myself-page">
    <div class="content-wrapper">
      <div class="delete-btn" @click="logout">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        <span class="delete-text">注销账号</span>
      </div>
      <div class="close-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && userInfo" class="profile-card">
        <div class="avatar-section">
          <div class="avatar" @click="editAvatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
            <div v-else class="initials">{{ initials(userInfo) }}</div>
          </div>
          <p class="username">{{ userInfo.nickName || userInfo.userName }}</p>
        </div>
        <input type="file" ref="avatarInput" @change="handleAvatarChange" accept="image/*" style="display: none" />

        <div class="info-section">
          <div class="info-item">
            <label>用户名</label>
            <span>{{ userInfo.userName }}</span>
          </div>
          <div class="info-item">
            <label>昵称</label>
            <div class="info-value">
              <span v-if="!editingField.nickName" @click="startEdit('nickName')">
                {{ userInfo.nickName || '未设置' }}
              </span>
              <input v-else
                v-model="editForm.nickName"
                @blur="saveEdit('nickName')"
                @keyup.enter="saveEdit('nickName')"
                ref="nickNameInput"
                class="edit-input"
              />
              <svg class="edit-icon" @click="startEdit('nickName')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4" />
              </svg>
            </div>
            <p v-if="fieldErrors.nickName" class="field-error">{{ fieldErrors.nickName }}</p>
          </div>
          <div class="info-item">
            <label>邮箱</label>
            <div class="info-value">
              <span v-if="!editingField.email" @click="startEdit('email')">
                {{ userInfo.email || '未设置' }}
              </span>
              <input v-else
                v-model="editForm.email"
                @blur="saveEdit('email')"
                @keyup.enter="saveEdit('email')"
                ref="emailInput"
                class="edit-input"
              />
              <svg class="edit-icon" @click="startEdit('email')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4" />
              </svg>
            </div>
            <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
          </div>
          <div class="info-item">
            <label>手机号</label>
            <div class="info-value">
              <span v-if="!editingField.phone" @click="startEdit('phone')">
                {{ userInfo.phone || '未设置' }}
              </span>
              <input v-else
                v-model="editForm.phone"
                @blur="saveEdit('phone')"
                @keyup.enter="saveEdit('phone')"
                ref="phoneInput"
                class="edit-input"
              />
              <svg class="edit-icon" @click="startEdit('phone')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4" />
              </svg>
            </div>
            <p v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</p>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="showChangePassword = true">修改密码</button>
        </div>
        <div class="logout-text" @click="handleLogout">退出登录</div>
      </div>

      <div v-if="showChangePassword" class="modal-overlay" @click.self="showChangePassword = false">
        <div class="modal">
          <div class="modal-close" @click="showChangePassword = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h3>修改密码</h3>
          <div class="form-field">
            <label>原密码</label>
            <input v-model="passwordForm.oldPassword" type="password" />
          </div>
          <div class="form-field">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" />
          </div>
          <div class="form-field">
            <label>确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showChangePassword = false">取消</button>
            <button class="btn-primary" @click="changePassword">确认修改</button>
          </div>
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="success">{{ passwordSuccess }}</p>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal">
          <div class="modal-close" @click="showDeleteConfirm = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h3>确认注销</h3>
          <p class="confirm-text">确定要注销账号吗？注销后数据将无法恢复。</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showDeleteConfirm = false">取消</button>
            <button class="btn-danger" @click="confirmDelete">确认注销</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MyselfView',
  inject: ['toast'],
  data () {
    return {
      userInfo: null,
      avatarUrl: null,
      loading: false,
      error: '',
      showChangePassword: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordSuccess: '',
      editingField: {
        nickName: false,
        email: false,
        phone: false
      },
      editForm: {
        nickName: '',
        email: '',
        phone: ''
      },
      fieldErrors: {
        nickName: '',
        email: '',
        phone: ''
      },
      showDeleteConfirm: false
    }
  },
  created () {
    this.fetchUserInfo()
  },
  methods: {
    goBack () {
      this.$router.push({ name: 'main' })
    },
    handleLogout () {
      this.$store.dispatch('logout')
      this.$router.push({ name: 'home' })
    },
    async fetchUserInfo () {
      this.loading = true
      this.error = ''
      try {
        const res = await axios.get('/user/myself')
        const body = res.data || {}
        if (body.code === 200 && body.data) {
          this.userInfo = body.data
          this.avatarUrl = await this.getAvatarUrl()
        } else {
          this.error = body.message || '获取用户信息失败'
        }
      } catch (e) {
        this.error = '获取用户信息失败'
      } finally {
        this.loading = false
      }
    },
    initials (user) {
      const name = user.nickName || user.userName || ''
      return name.slice(0, 1).toUpperCase()
    },
    async getAvatarUrl () {
      try {
        const res = await axios.get('/files/getAvatar')
        const body = res.data || {}
        if (body.code === 200) {
          return body.message
        }
      } catch (e) {
        console.warn('get avatar failed', e)
      }
      return null
    },
    editAvatar () {
      this.$refs.avatarInput.click()
    },
    async handleAvatarChange (event) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('files', file)

      try {
        const res = await axios.post('files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        const body = res.data || {}
        if (body.code === 200 && body.data && body.data.length > 0) {
          const avatarUrl = body.data[0].accessUrl
          this.avatarUrl = avatarUrl
        } else {
          this.toast().show('上传失败')
        }
      } catch (e) {
        this.toast().show('上传失败')
      } finally {
        event.target.value = ''
      }
    },
    async updateAvatar (avatarUrl) {
      const payload = {
        userName: this.userInfo.userName,
        nickName: this.userInfo.nickName,
        email: this.userInfo.email,
        phone: this.userInfo.phone,
        avatar: avatarUrl,
        isUpdatePassword: 0
      }

      try {
        const res = await axios.post('/user/updateUser', payload)
        const body = res.data || {}
        if (body.code === 200 && body.data) {
          this.userInfo = body.data
        } else {
          this.toast().show('更新头像失败')
        }
      } catch (e) {
        this.toast().show('更新头像失败')
      }
    },
    startEdit (field) {
      this.editingField[field] = true
      this.editForm[field] = this.userInfo[field]
      this.fieldErrors[field] = ''
      this.$nextTick(() => {
        const refName = field + 'Input'
        if (this.$refs[refName]) {
          this.$refs[refName].focus()
        }
      })
    },
    async saveEdit (field) {
      const value = this.editForm[field].trim()
      if (!value) {
        this.editingField[field] = false
        return
      }

      this.fieldErrors[field] = ''

      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          this.fieldErrors[field] = '请输入正确的邮箱格式'
          return
        }
      }

      const payload = {
        userName: this.userInfo.userName,
        nickName: this.userInfo.nickName,
        email: this.userInfo.email,
        phone: this.userInfo.phone,
        avatar: this.userInfo.avatar,
        isUpdatePassword: 0
      }

      if (field === 'nickName') {
        payload.nickName = value
      } else if (field === 'email') {
        payload.email = value
      } else if (field === 'phone') {
        payload.phone = value
      }

      try {
        const res = await axios.post('/user/updateUser', payload)
        const body = res.data || {}
        if (body.code === 200 && body.data) {
          this.userInfo = body.data
          this.editingField[field] = false
          this.editForm[field] = ''
        } else {
          this.fieldErrors[field] = body.message || '更新失败'
        }
      } catch (e) {
        this.fieldErrors[field] = e.response?.data?.message || '更新失败'
      }
    },
    async changePassword () {
      this.passwordError = ''
      this.passwordSuccess = ''

      if (!this.passwordForm.oldPassword) {
        this.passwordError = '请输入原密码'
        return
      }
      if (!this.passwordForm.newPassword) {
        this.passwordError = '请输入新密码'
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = '两次输入的密码不一致'
        return
      }

      try {
        const res = await axios.post('/user/updateUser', {
          userName: this.userInfo.userName,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
          isUpdatePassword: 1
        })
        const body = res.data || {}
        if (body.code === 200) {
          this.passwordSuccess = '修改密码成功'
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
          setTimeout(() => {
            this.$store.dispatch('logout')
            this.$router.push({ name: 'login' })
          }, 1000)
        } else {
          this.passwordError = body.message || '修改密码失败'
        }
      } catch (e) {
        this.passwordError = e.response?.data?.message || '修改密码失败'
      }
    },
    logout () {
      this.showDeleteConfirm = true
    },
    async confirmDelete () {
      try {
        const res = await axios.get('/user/delete')
        const body = res.data || {}
        if (body.code === 200) {
          this.showDeleteConfirm = false
          this.$store.dispatch('logout')
          this.$router.push({ name: 'home' })
        } else {
          this.toast().show(body.message || '注销失败')
        }
      } catch (e) {
        this.toast().show(e.response?.data?.message || '注销失败')
      }
    }
  }
}
</script>

<style scoped>
.myself-page { position: relative; width: 100vw; height: 100vh; background: url('@/assets/myself.jpg') no-repeat center center; background-size: cover; overflow: hidden; display: flex; align-items: center; justify-content: center }
.content-wrapper { width: 100%; max-width: 500px; position: relative }
.delete-btn { position: absolute; top: 0; left: 0; display: flex; align-items: center; gap: 8px; cursor: pointer; color: #dc3545; transition: all 0.2s }
.delete-btn .delete-text { opacity: 0; white-space: nowrap; font-size: 14px; font-weight: 500; transition: opacity 0.2s }
.delete-btn:hover .delete-text { opacity: 1 }
.close-btn { position: absolute; top: 0; right: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; transition: color 0.2s }
.close-btn:hover { color: #2c3e50 }
.loading { text-align: center; color: #666 }
.error { color: #b00020; text-align: center; margin-bottom: 16px }
.profile-card { background: transparent; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1) }
.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px }
.avatar { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0; cursor: pointer; transition: transform 0.2s }
.avatar:hover { transform: scale(1.05) }
.avatar img { width: 100%; height: 100%; object-fit: cover }
.avatar .initials { font-size: 48px; font-weight: 700; color: #2c3e50 }
.username { font-size: 20px; font-weight: 600; color: #2c3e50; margin-top: 12px }
.info-section { margin-bottom: 24px }
.info-item { display: flex; flex-direction: column; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee }
.info-item:last-child { border-bottom: none }
.info-item label { font-weight: 500; color: #666; margin-bottom: 8px }
.info-value { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end }
.info-value span { font-weight: 600; color: #2c3e50; cursor: pointer; transition: color 0.2s }
.info-value span:hover { color: #0077be }
.info-value .edit-input { padding: 6px 10px; border: 1px solid #0077be; border-radius: 4px; font-size: 14px; font-weight: 600; width: 200px; text-align: right }
.info-value .edit-input:focus { outline: none }
.edit-icon { cursor: pointer; color: #666; transition: color 0.2s }
.edit-icon:hover { color: #0077be }
.field-error { color: #b00020; font-size: 12px; margin-top: 4px; padding-left: 0 }
.actions { display: flex; gap: 12px }
.actions button { flex: 1; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600; transition: opacity 0.2s }
.actions button:hover { opacity: 0.9 }
.btn-primary { background: #0077be; color: white }
.btn-danger { background: #dc3545; color: white }
.btn-secondary { background: #6c757d; color: white }
.logout-text { text-align: center; font-size: 14px; color: #666; cursor: pointer; margin-top: 12px; transition: all 0.2s }
.logout-text:hover { color: #0077be; text-decoration: underline }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000 }
.modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); position: relative }
.modal-close { position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; transition: color 0.2s }
.modal-close:hover { color: #2c3e50 }
.modal h3 { margin: 0 0 20px; text-align: center; font-size: 20px }
.confirm-text { text-align: center; color: #666; margin-bottom: 20px }
.form-field { margin-bottom: 16px }
.form-field label { display: block; margin-bottom: 6px; font-weight: 500; color: #666 }
.form-field input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box }
.form-field input:focus { outline: none; border-color: #0077be }
.modal-actions { display: flex; gap: 12px; margin-top: 24px }
.modal-actions button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600 }
.success { color: #007700; text-align: center; margin-top: 12px }
@media (max-width: 600px) {
  .profile-card { padding: 20px }
  .avatar { width: 100px; height: 100px }
  .avatar .initials { font-size: 40px }
  .username { font-size: 18px }
  .info-value .edit-input { width: 100%; font-size: 16px }
  .actions button { font-size: 14px; padding: 10px }
  .delete-btn .delete-text { font-size: 12px }
}
</style>
