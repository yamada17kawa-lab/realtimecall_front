<template>
  <div class="friend-page">
    <div class="content-wrapper">
      <div class="close-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && userInfo" class="profile-card">
        <div class="delete-friend-btn" @click="showDeleteConfirm = true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span class="delete-text">删除好友</span>
        </div>
        <div class="avatar-section">
          <div class="avatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
            <div v-else class="initials">{{ initials(userInfo) }}</div>
          </div>
          <p class="username">{{ userInfo.nickName || userInfo.userName }}</p>
        </div>

        <div class="info-section">
          <div class="info-item">
            <label>用户名</label>
            <span>{{ userInfo.userName }}</span>
          </div>
          <div class="info-item">
            <label>昵称</label>
            <span>{{ userInfo.nickName || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>邮箱</label>
            <span>{{ userInfo.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>电话号码</label>
            <span>{{ userInfo.phone || '未设置' }}</span>
          </div>
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
          <h3>确认删除</h3>
          <p class="confirm-text">确定要删除好友吗？</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showDeleteConfirm = false">取消</button>
            <button class="btn-danger" @click="confirmDeleteFriend">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'FriendView',
  data () {
    return {
      userInfo: null,
      loading: false,
      error: '',
      avatarUrl: null,
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
    async fetchUserInfo () {
      this.loading = true
      this.error = ''
      try {
        const userId = this.$route.params.id
        const res = await axios.get(`/user/getUserById/${userId}`)
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
        const userId = this.$route.params.id
        const res = await axios.get(`/files/getAvatarByUserId/${userId}`)
        const body = res.data || {}
        if (body.code === 200) {
          return body.message
        }
      } catch (e) {
        console.warn('get avatar failed', e)
      }
      return null
    },
    async confirmDeleteFriend () {
      this.showDeleteConfirm = false
      try {
        const userId = this.$route.params.id
        const res = await axios.post(`/user/friend/delete/${userId}`)
        const body = res.data || {}
        if (body.code === 200) {
          this.$router.push({ name: 'main' })
        }
      } catch (e) {
        console.error('删除好友失败', e)
      }
    }
  }
}
</script>

<style scoped>
.friend-page { position: relative; width: 100vw; height: 100vh; background: url('@/assets/friend.jpg') no-repeat center center; background-size: cover; overflow: hidden; display: flex; align-items: center; justify-content: center }
.content-wrapper { width: 100%; max-width: 500px; position: relative }
.close-btn { position: absolute; top: 0; right: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; transition: color 0.2s; z-index: 10 }
.close-btn:hover { color: #2c3e50 }
.loading { text-align: center; padding: 40px 0; color: #666 }
.error { text-align: center; padding: 40px 0; color: #b00020 }
.profile-card { background: transparent; border-radius: 16px; padding: 32px 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); position: relative }
.delete-friend-btn { position: absolute; top: 0; left: 0; display: flex; align-items: center; gap: 8px; cursor: pointer; color: #dc3545; transition: all 0.2s }
.delete-friend-btn .delete-text { opacity: 0; white-space: nowrap; font-size: 14px; font-weight: 500; transition: opacity 0.2s }
.delete-friend-btn:hover .delete-text { opacity: 1 }
.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px }
.avatar { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0 }
.avatar img { width: 100%; height: 100%; object-fit: cover }
.avatar .initials { font-size: 48px; font-weight: 700; color: #2c3e50 }
.username { font-size: 24px; font-weight: 600; color: #2c3e50; margin: 12px 0 0 0 }
.info-section { display: flex; flex-direction: column; gap: 16px }
.info-item { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0 }
.info-item:last-child { border-bottom: none }
.info-item label { font-weight: 500; color: #666; margin-bottom: 8px }
.info-item span { font-weight: 600; color: #2c3e50 }

@media (max-width: 600px) {
  .profile-card { padding: 24px 20px }
  .avatar { width: 100px; height: 100px }
  .avatar .initials { font-size: 40px }
  .username { font-size: 20px }
}
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000 }
.modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); position: relative }
.modal-close { position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; transition: color 0.2s }
.modal-close:hover { color: #2c3e50 }
.modal h3 { margin: 0 0 20px; text-align: center; font-size: 20px }
.confirm-text { text-align: center; color: #666; margin-bottom: 20px }
.modal-actions { display: flex; gap: 12px; margin-top: 24px }
.modal-actions button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600 }
.btn-danger { background: #dc3545; color: white }
.btn-secondary { background: #6c757d; color: white }
</style>
