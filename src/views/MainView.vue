<template>
  <div class="main-page">
    <div class="current-user" v-if="currentUser">
      <div class="avatar" @click="openMyself">
        <div class="avatar-inner">
          <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
          <div v-else class="initials">{{ initials(currentUser) }}</div>
        </div>
        <span class="avatar-tooltip">用户详情</span>
      </div>
      <div class="camera-icon" @click="createRoom">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M15 8v8H5V8h10m1-2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4V7a1 1 0 0 0-1-1z" />
        </svg>
        <span class="camera-tooltip">创建房间</span>
      </div>
    </div>
    
    <div class="notification-icon" @click.stop="toggleNotifications">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <div v-if="hasNewRequests" class="notification-dot"></div>
    </div>
    
    <div v-if="showNotifications" class="notification-modal" @click.stop>
      <div class="notification-header">
        <h3>好友申请</h3>
      </div>
      <div v-if="notificationLoading" class="notification-loading">加载中...</div>
      <div v-if="notificationError" class="notification-error">{{ notificationError }}</div>
      <div v-if="!notificationLoading && friendRequests.length" class="notification-results">
        <div class="notification-item" v-for="user in friendRequests" :key="user.id">
          <div class="notification-avatar">
            <div class="avatar-inner">
              <img v-if="requestAvatarUrls[user.id]" :src="requestAvatarUrls[user.id]" alt="avatar" />
              <div v-else class="initials">{{ initials(user) }}</div>
            </div>
            <span class="status" :class="user.status === 1 ? 'online' : (user.status === 2 ? 'incall' : 'offline')" :title="user.status === 1 ? '在线' : (user.status === 2 ? '通话中' : '离线')"></span>
          </div>
          <div class="notification-info">
            <div class="notification-name">{{ user.nickName || user.userName }}</div>
          </div>
          <div class="notification-actions">
            <button class="accept-btn" @click.stop="acceptRequest(user)">接受</button>
            <button class="reject-btn" @click.stop="rejectRequest(user)">拒绝</button>
          </div>
        </div>
      </div>
      <div v-if="!notificationLoading && !friendRequests.length" class="notification-empty">暂无好友申请</div>
      <div v-if="!notificationLoading && notificationTotalPages > 1" class="notification-pagination">
        <button @click="changeNotificationPage(notificationCurrentPage - 1)" :disabled="notificationCurrentPage === 1">上一页</button>
        <span>{{ notificationCurrentPage }} / {{ notificationTotalPages }}</span>
        <button @click="changeNotificationPage(notificationCurrentPage + 1)" :disabled="notificationCurrentPage === notificationTotalPages">下一页</button>
      </div>
    </div>
    
    <div v-if="showSearch" class="search-modal" @click.stop>
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="用户id、用户名、昵称" 
          @keyup.enter="handleSearch"
          ref="searchInput"
        />
      </div>
      <div v-if="searchLoading" class="search-loading">搜索中...</div>
      <div v-if="searchError" class="search-error">{{ searchError }}</div>
      <div v-if="!searchLoading && searchResults.length" class="search-results">
        <div class="search-result-item" v-for="user in searchResults" :key="user.id" @click="openUser(user.id)">
          <div class="result-avatar">
            <div class="avatar-inner">
              <img v-if="searchAvatarUrls[user.id]" :src="searchAvatarUrls[user.id]" alt="avatar" />
              <div v-else class="initials">{{ initials(user) }}</div>
            </div>
            <span class="status" :class="user.status === 1 ? 'online' : (user.status === 2 ? 'incall' : 'offline')" :title="user.status === 1 ? '在线' : (user.status === 2 ? '通话中' : '离线')"></span>
          </div>
          <div class="result-info">
            <div class="result-name">{{ user.nickName || user.userName }}</div>
            <div class="result-sub">{{ user.email || user.phone || '' }}</div>
          </div>
          <div class="result-actions">
            <div class="add-friend-icon" @click.stop="applyFriend(user)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span class="add-friend-tooltip">加好友</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!searchLoading && !searchResults.length && hasSearched" class="search-empty">未找到用户</div>
      <div v-if="!searchLoading && searchTotalPages > 1" class="search-pagination">
        <button @click="changeSearchPage(searchCurrentPage - 1)" :disabled="searchCurrentPage === 1">上一页</button>
        <span>{{ searchCurrentPage }} / {{ searchTotalPages }}</span>
        <button @click="changeSearchPage(searchCurrentPage + 1)" :disabled="searchCurrentPage === searchTotalPages">下一页</button>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="header-section">
        <h2>好友列表</h2>
        <div class="add-icon" @click.stop="toggleSearch">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span class="add-tooltip">添加好友</span>
        </div>
      </div>
      <div v-if="error" class="error">{{ error }}</div>

      <div class="friends">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <template v-if="!loading && friends.length">
          <div class="friend" v-for="f in friends" :key="f.id">
            <div class="avatar" @click="openUser(f.id)">
              <div class="avatar-inner">
                <img v-if="friendAvatarUrls[f.id]" :src="friendAvatarUrls[f.id]" alt="avatar" />
                <div v-else class="initials">{{ initials(f) }}</div>
              </div>
              <span class="status" :class="f.status === 1 ? 'online' : (f.status === 2 ? 'incall' : 'offline')" :title="f.status === 1 ? '在线' : (f.status === 2 ? '通话中' : '离线')"></span>
            </div>
            <div class="meta">
              <div class="name">{{ f.nickName || f.userName }}</div>
              <div class="sub">{{ f.email || f.phone || '' }}</div>
            </div>
            <div class="actions">
              <button class="connect" @click.prevent="connectToFriend(f)" :disabled="f.status !== 1" :title="f.status === 1 ? '点击连线' : (f.status === 2 ? '通话中，不可点击' : '离线，不可点击')">{{ f.status === 1 ? '连线' : (f.status === 2 ? '通话中' : '离线') }}</button>
            </div>
          </div>
        </template>
        <div v-if="!loading && !friends.length" class="empty">暂无好友</div>
      </div>
      <div v-if="totalPages > 1" class="pagination">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1 || loading">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages || loading">下一页</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const demoResponse = {
  code: 200,
  message: '获取好友列表成功',
  data: {
    list: [
      { id: 7, userName: '哈机密', nickName: null, email: null, phone: null, avatar: null, status: 0 },
      { id: 5, userName: 'nuliyang222', nickName: '哈机密', email: 'new@example.com', phone: '13800138000', avatar: 'https://example.com/avatar.png', status: 0 },
      { id: 6, userName: 'user01', nickName: null, email: null, phone: null, avatar: null, status: 2 },
      { id: 8, userName: 'user03', nickName: null, email: null, phone: null, avatar: null, status: 0 },
      { id: 9, userName: 'user04', nickName: null, email: null, phone: null, avatar: null, status: 0 }
    ],
    total: 5,
    pages: 1
  }
}

export default {
  name: 'MainView',
  inject: ['toast'],
  data () {
    return {
      friends: [],
      loading: false,
      error: '',
      currentUser: null,
      avatarUrl: null,
      currentPage: 1,
      pageSize: 9,
      totalPages: 1,
      total: 0,
      friendAvatarUrls: {},
      showSearch: false,
      searchKeyword: '',
      searchResults: [],
      searchLoading: false,
      searchError: '',
      searchCurrentPage: 1,
      searchPageSize: 9,
      searchTotalPages: 1,
      searchTotal: 0,
      hasSearched: false,
      searchAvatarUrls: {},
      showNotifications: false,
      friendRequests: [],
      notificationLoading: false,
      notificationError: '',
      notificationCurrentPage: 1,
      notificationPageSize: 9,
      notificationTotalPages: 1,
      notificationTotal: 0,
      requestAvatarUrls: {},
      hasNewRequests: false
    }
  },
  created () {
    this.fetchCurrentUser()
    this.fetchFriends()
    this.fetchFriendRequests()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async fetchCurrentUser () {
      try {
        const res = await axios.get('/user/myself')
        const body = res.data || {}
        if (body.code === 200 && body.data) {
          this.currentUser = body.data
          this.avatarUrl = await this.getAvatarUrl()
        }
      } catch (e) {
        console.warn('fetch current user failed', e)
      }
    },
    async fetchFriends () {
      this.loading = true
      this.error = ''
      try {
        const res = await axios.get('/user/friend/list', {
          params: {
            current: this.currentPage,
            size: this.pageSize
          }
        })
        const body = res.data || {}
        if (body.code !== undefined && body.code !== 200) {
          this.error = body.message || '获取好友失败'
          this.friends = []
        } else {
          this.friends = (body.data && body.data.list) || []
          this.totalPages = (body.data && body.data.pages) || 1
          this.total = (body.data && body.data.total) || 0
          await this.fetchFriendAvatars()
        }
      } catch (e) {
        // fallback to demo data on failure
        console.warn('fetch friends failed, using demo', e)
        this.friends = (demoResponse.data && demoResponse.data.list) || []
        this.totalPages = (demoResponse.data && demoResponse.data.pages) || 1
        this.total = (demoResponse.data && demoResponse.data.total) || 0
        this.error = ''
      } finally {
        this.loading = false
      }
    },
    changePage (page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchFriends()
    },
    initials (f) {
      const name = f.nickName || f.userName || ''
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
    async getFriendAvatarUrl (userId) {
      try {
        const res = await axios.get(`/files/getAvatarByUserId/${userId}`)
        const body = res.data || {}
        if (body.code === 200) {
          return body.message
        }
      } catch (e) {
        console.warn('get friend avatar failed', e)
      }
      return null
    },
    async fetchFriendAvatars () {
      const promises = this.friends.map(async (friend) => {
        const avatarUrl = await this.getFriendAvatarUrl(friend.id)
        this.$set(this.friendAvatarUrls, friend.id, avatarUrl)
      })
      await Promise.all(promises)
    },
    openUser (id) {
      this.$router.push({ name: 'friend', params: { id } })
    },
    openMyself () {
      this.$router.push({ name: 'myself' })
    },
    toggleSearch () {
      this.showSearch = !this.showSearch
      if (this.showSearch) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus()
        })
      }
    },
    handleClickOutside (event) {
      if (this.showSearch && !event.target.closest('.search-modal') && !event.target.closest('.add-icon')) {
        this.showSearch = false
      }
      if (this.showNotifications && !event.target.closest('.notification-modal') && !event.target.closest('.notification-icon')) {
        this.showNotifications = false
      }
    },
    async handleSearch () {
      if (!this.searchKeyword.trim()) {
        return
      }
      this.searchLoading = true
      this.searchError = ''
      this.searchCurrentPage = 1
      await this.performSearch()
    },
    async performSearch () {
      this.searchLoading = true
      this.searchError = ''
      try {
        const encodedParam = encodeURIComponent(this.searchKeyword)
        const res = await axios.get(`/user/search/${encodedParam}`, {
          params: {
            current: this.searchCurrentPage,
            size: this.searchPageSize
          }
        })
        const body = res.data || {}
        console.log('搜索响应数据:', body)
        if (body.code === 200 && body.data) {
          this.searchResults = body.data.list || []
          this.searchTotalPages = body.data.pages || 1
          this.searchTotal = body.data.total || 0
          this.hasSearched = true
          await this.fetchSearchAvatars()
        } else {
          this.searchError = body.message || '搜索失败'
          this.searchResults = []
        }
      } catch (e) {
        this.searchError = '搜索失败'
        this.searchResults = []
      } finally {
        this.searchLoading = false
      }
    },
    async fetchSearchAvatars () {
      const promises = this.searchResults.map(async (user) => {
        const avatarUrl = await this.getFriendAvatarUrl(user.id)
        this.$set(this.searchAvatarUrls, user.id, avatarUrl)
      })
      await Promise.all(promises)
    },
    changeSearchPage (page) {
      if (page < 1 || page > this.searchTotalPages) return
      this.searchCurrentPage = page
      this.performSearch()
    },
    async applyFriend (user) {
      try {
        const res = await axios.get(`/user/friend/apply/${user.id}`)
        const body = res.data || {}
        if (body.code === 200) {
          this.toast().show(body.message || '好友申请成功')
          await this.handleSearch()
        } else {
          this.toast().show(body.message || '好友申请失败')
        }
      } catch (e) {
        this.toast().show('好友申请失败')
      }
    },
    async fetchFriendRequests () {
      this.notificationLoading = true
      this.notificationError = ''
      try {
        const res = await axios.get('/user/getApply', {
          params: {
            current: this.notificationCurrentPage,
            size: this.notificationPageSize
          }
        })
        const body = res.data || {}
        if (body.code === 200 && body.data) {
          this.friendRequests = body.data.list || []
          this.notificationTotalPages = body.data.pages || 1
          this.notificationTotal = body.data.total || 0
          this.hasNewRequests = this.friendRequests.length > 0
          await this.fetchRequestAvatars()
        } else {
          this.notificationError = body.message || '获取好友申请失败'
          this.friendRequests = []
          this.hasNewRequests = false
        }
      } catch (e) {
        this.notificationError = '获取好友申请失败'
        this.friendRequests = []
        this.hasNewRequests = false
      } finally {
        this.notificationLoading = false
      }
    },
    async fetchRequestAvatars () {
      const promises = this.friendRequests.map(async (user) => {
        const avatarUrl = await this.getFriendAvatarUrl(user.id)
        this.$set(this.requestAvatarUrls, user.id, avatarUrl)
      })
      await Promise.all(promises)
    },
    toggleNotifications () {
      this.showNotifications = !this.showNotifications
    },
    async acceptRequest (user) {
      try {
        const res = await axios.post(`/user/friend/add/${user.id}`)
        const body = res.data || {}
        if (body.code === 200) {
          this.toast().show(body.message || '好友添加成功')
          await this.fetchFriendRequests()
          await this.fetchFriends()
        } else {
          this.toast().show(body.message || '好友添加失败')
        }
      } catch (e) {
        this.toast().show('好友添加失败')
      }
    },
    async rejectRequest (user) {
      try {
        const res = await axios.get(`/user/apply/delete/${user.id}`)
        const body = res.data || {}
        if (body.code === 200) {
          this.toast().show(body.message || '删除好友申请成功')
          await this.fetchFriendRequests()
        } else {
          this.toast().show(body.message || '删除好友申请失败')
        }
      } catch (e) {
        this.toast().show('删除好友申请失败')
      }
    },
    changeNotificationPage (page) {
      if (page < 1 || page > this.notificationTotalPages) return
      this.notificationCurrentPage = page
      this.fetchFriendRequests()
    },
    createRoom () {
      console.log('createRoom被调用')
      const roomId = this.generateRoomId()
      console.log('生成的roomId:', roomId)
      this.$router.push({ name: 'videoCall', params: { roomId } })
    },
    connectToFriend (friend) {
      console.log('connectToFriend被调用', friend)
      const roomId = friend.roomId || this.generateRoomId()
      const userId2 = friend.id
      console.log('roomId:', roomId, 'userId2:', userId2)
      this.$router.push({ name: 'videoCall', params: { roomId, userId: userId2 } })
    },
    generateRoomId () {
      const roomId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
      console.log('generateRoomId生成:', roomId)
      return roomId
    }
  }
}
</script>

<style scoped>
.main-page { position: relative; width: 100vw; height: 100vh; background: url('@/assets/main.jpg') no-repeat center center; background-size: cover; overflow: hidden }
.current-user { position: absolute; top: 24px; right: 24px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 16px }
.current-user .avatar { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: transparent; cursor: pointer; overflow: visible; transition: transform 0.2s }
.current-user .avatar:hover { transform: scale(1.05) }
.current-user .avatar-inner { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0 }
.current-user .avatar-inner img { width: 100%; height: 100%; object-fit: cover }
.current-user .avatar-inner .initials { font-weight: 700; color: #2c3e50 }
.avatar-tooltip { position: absolute; right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px; opacity: 0; white-space: nowrap; font-size: 14px; color: #666; transition: opacity 0.2s; pointer-events: none }
.avatar:hover .avatar-tooltip { opacity: 1 }
.camera-tooltip { position: absolute; right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px; opacity: 0; white-space: nowrap; font-size: 14px; color: #666; transition: opacity 0.2s; pointer-events: none }
.camera-icon:hover .camera-tooltip { opacity: 1 }
.content-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 80px; height: calc(100vh - 48px); overflow: hidden }
.header-section { display: flex; align-items: center; gap: 8px; margin-bottom: 18px }
.content-wrapper h2 { margin-bottom: 0; font-size: 32px }
.add-icon { width: 32px; height: 32px; border-radius: 50%; background: #0077be; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s; position: relative }
.add-icon:hover { opacity: 0.8 }
.add-icon svg { color: white }
.add-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; opacity: 0; white-space: nowrap; font-size: 14px; color: #666; transition: opacity 0.2s; pointer-events: none }
.add-icon:hover .add-tooltip { opacity: 1 }
.search-modal { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); padding: 16px; min-width: 320px; z-index: 1000; box-sizing: border-box }
.search-input-wrapper { margin-bottom: 12px }
.search-input-wrapper input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box }
.search-input-wrapper input:focus { border-color: #0077be }
.search-loading { text-align: center; color: #666; font-size: 14px; padding: 8px 0 }
.search-error { text-align: center; color: #b00020; font-size: 14px; padding: 8px 0 }
.search-results { max-height: 300px; overflow-y: auto }
.search-result-item { display: flex; align-items: center; padding: 10px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s }
.search-result-item:hover { background-color: #f5f5f5 }
.result-avatar { margin-right: 12px; position: relative }
.result-avatar .avatar-inner { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0 }
.result-avatar .avatar-inner img { width: 100%; height: 100%; object-fit: cover }
.result-avatar .avatar-inner .initials { font-weight: 700; color: #2c3e50; font-size: 20px }
.result-avatar .status { position: absolute; right: -4px; bottom: -4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; z-index: 3 }
.result-avatar .status.online { background: #28c76f }
.result-avatar .status.offline { background: #d9d9d9 }
.result-avatar .status.incall { background: #ff9800 }
.result-info { flex: 1 }
.result-name { font-weight: 600; color: #2c3e50; font-size: 14px }
.result-sub { font-size: 12px; color: #666; margin-top: 2px }
.result-actions { display: flex; align-items: center }
.add-friend-icon { width: 28px; height: 28px; border-radius: 50%; background: #0077be; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s; position: relative }
.add-friend-icon:hover { opacity: 0.8 }
.add-friend-icon.disabled { background: #d9d9d9; cursor: not-allowed }
.add-friend-icon.disabled:hover { opacity: 1 }
.add-friend-icon svg { color: white }
.add-friend-icon.disabled svg { color: white }
.add-friend-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; opacity: 0; white-space: nowrap; font-size: 12px; color: #666; transition: opacity 0.2s; pointer-events: none }
.add-friend-icon:hover .add-friend-tooltip { opacity: 1 }
.search-empty { text-align: center; color: #666; font-size: 14px; padding: 16px 0 }
.search-pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0 }
.search-pagination button { padding: 4px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px }
.search-pagination button:disabled { opacity: 0.5; cursor: not-allowed }
.search-pagination span { color: #666; font-size: 12px }
.loading { text-align: center }
.loading-spinner { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: absolute; top: 0; left: 0; background: transparent; z-index: 10 }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0077be; border-radius: 50%; animation: spin 1s linear infinite }
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error { color: #b00020; text-align: center }
.friends { display: grid; grid-template-columns: repeat(3, 312.24px); grid-auto-rows: 88px; grid-auto-flow: row; gap: 16px; width: 968.72px; height: 296px; justify-content: center; align-items: start; overflow-y: auto; position: relative }
.friend { display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.9); border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06) }
.avatar { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: transparent; cursor: pointer; overflow: visible; transition: transform 0.2s }
.avatar:hover { transform: scale(1.05) }
.avatar-inner { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0 }
.avatar-inner img { width: 100%; height: 100%; object-fit: cover }
.avatar-inner .initials { font-weight: 700; color: #2c3e50 }
.status { position: absolute; right: -6px; bottom: -6px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; z-index: 3 }
.status.online { background: #28c76f }
.status.offline { background: #d9d9d9 }
.status.incall { background: #ff9800 }
.meta { flex: 1; padding: 0 12px }
.name { font-weight: 600; color: #2c3e50 }
.sub { font-size: 12px; color: #666 }
.actions { width: 88px; text-align: right }
.connect { padding: 6px 10px; border-radius: 4px; border: none; background: #0077be; color: white; cursor: pointer }
.connect:disabled { opacity: 0.5; cursor: not-allowed }
.empty { text-align: center; color: #666 }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 24px }
.pagination button { padding: 6px 16px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed }
.pagination button.active { background: #0077be; color: white; border-color: #0077be }
.pagination span { color: #666 }
.notification-icon { position: absolute; top: 24px; left: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); box-shadow: 0 1px 4px rgba(0,0,0,0.1); transition: opacity 0.2s }
.notification-icon:hover { opacity: 0.8 }
.notification-icon svg { color: #2c3e50 }
.camera-icon { position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(40,199,111,0.9); box-shadow: 0 1px 4px rgba(0,0,0,0.1); transition: opacity 0.2s }
.camera-icon:hover { opacity: 0.8 }
.camera-icon svg { color: white }
.notification-dot { position: absolute; top: 2px; right: 2px; width: 10px; height: 10px; background: #ff4d4f; border-radius: 50%; border: 2px solid white }
.notification-modal { position: fixed; top: 80px; left: 24px; background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); padding: 16px; min-width: 320px; max-width: 400px; z-index: 1000; box-sizing: border-box }
.notification-header { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0 }
.notification-header h3 { margin: 0; font-size: 18px; color: #2c3e50 }
.notification-loading { text-align: center; color: #666; font-size: 14px; padding: 8px 0 }
.notification-error { text-align: center; color: #b00020; font-size: 14px; padding: 8px 0 }
.notification-results { max-height: 300px; overflow-y: auto }
.notification-item { display: flex; align-items: center; padding: 10px; border-radius: 6px; transition: background-color 0.2s }
.notification-item:hover { background-color: #f5f5f5 }
.notification-avatar { margin-right: 12px; position: relative }
.notification-avatar .avatar-inner { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f0f0f0 }
.notification-avatar .avatar-inner img { width: 100%; height: 100%; object-fit: cover }
.notification-avatar .avatar-inner .initials { font-weight: 700; color: #2c3e50; font-size: 20px }
.notification-avatar .status { position: absolute; right: -4px; bottom: -4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; z-index: 3 }
.notification-avatar .status.online { background: #28c76f }
.notification-avatar .status.offline { background: #d9d9d9 }
.notification-avatar .status.incall { background: #ff9800 }
.notification-info { flex: 1 }
.notification-name { font-weight: 600; color: #2c3e50; font-size: 14px }
.notification-sub { font-size: 12px; color: #666; margin-top: 2px }
.notification-actions { display: flex; gap: 8px }
.accept-btn { padding: 4px 12px; border: none; background: #28c76f; color: white; cursor: pointer; border-radius: 4px; font-size: 12px }
.accept-btn:hover { background: #23a65d }
.reject-btn { padding: 4px 12px; border: none; background: #ff4d4f; color: white; cursor: pointer; border-radius: 4px; font-size: 12px }
.reject-btn:hover { background: #d9363e }
.notification-empty { text-align: center; color: #666; font-size: 14px; padding: 16px 0 }
.notification-pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0 }
.notification-pagination button { padding: 4px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px }
.notification-pagination button:disabled { opacity: 0.5; cursor: not-allowed }
.notification-pagination span { color: #666; font-size: 12px }

@media (max-width: 600px) {
  .friends { grid-template-columns: 1fr }
  .notification-modal { left: 50%; transform: translateX(-50%); min-width: 280px }
}
</style>
