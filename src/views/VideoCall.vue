<template>
  <div class="video-call">
    <div class="video-container">
      <video ref="remoteVideo" autoplay playsinline class="remote-video"></video>
      <video ref="localVideo" autoplay playsinline muted class="local-video"></video>
    </div>
    <div class="controls">
      <button class="hangup" @click="hangup">挂断</button>
      <button class="vconsole-btn" @click="toggleVConsole">日志</button>
    </div>
  </div>
</template>

<script>
import config from '@/config'

export default {
  name: 'VideoCall',
  inject: ['toast'],
  data () {
    return {
      ws: null,
      roomId: null,
      userId: null,
      otherUserId: null,
      currentUserId: null,
      pc: null,
      localStream: null,
      isHangingUp: false,
      pingTimer: null,
      iceCandidates: [],
      remoteDescriptionSet: false
    }
  },
  mounted () {
    this.roomId = this.$route.params.roomId
    this.userId = this.$route.params.userId
    this.currentUserId = localStorage.getItem('userId')
    console.log('roomId:', this.roomId)
    console.log('userId:', this.userId)
    console.log('currentUserId:', this.currentUserId)
    
    console.log('浏览器环境检测:')
    console.log('- UserAgent:', navigator.userAgent)
    console.log('- HTTPS:', window.location.protocol === 'https:')
    console.log('- RTCPeerConnection:', typeof window.RTCPeerConnection !== 'undefined')
    console.log('- mediaDevices:', typeof navigator.mediaDevices !== 'undefined')
    console.log('- getUserMedia:', navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia !== 'undefined')
    
    this.connectWebSocket()
  },
  beforeDestroy () {
    this.cleanup()
  },
  methods: {
    connectWebSocket () {
      let token = localStorage.getItem('token') || this.$store.getters.token

      let wsUrl = `${config.wsUrl}/wsnuliyang?roomId=${encodeURIComponent(this.roomId)}&token=${encodeURIComponent(token)}`
      if (this.userId) {
        wsUrl += `&userId2=${encodeURIComponent(this.userId)}`
      }
      console.log('连接WebSocket:', wsUrl)
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket连接成功')
      }
      
      this.ws.onmessage = async (event) => {
        console.log('收到消息:', event.data)
        
        if (event.data === 'pong') {
          console.log('收到pong响应')
          return
        }
        
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'room') {
            this.otherUserId = message.data
            console.log('对方进入房间，userId:', this.otherUserId)
            this.startPing()
          } else if (message.type === 'offer') {
            console.log('收到offer指令，我是发起方')
            await this.initWebRTC()
            await this.createOffer()
          } else if (message.type === 'sdp') {
            console.log('收到SDP:', message)
            this.handleRemoteSdp(message.data)
          } else if (message.type === 'ice') {
            console.log('收到ICE:', message)
            this.handleIceCandidate(message.data)
          }
        } catch (e) {
          console.error('解析消息失败:', e)
        }
      }
      
      this.ws.onerror = (e) => {
        console.error('WebSocket错误:', e)
        console.error('WebSocket错误详情:', e.type, e.target)
      }
      
      this.ws.onclose = (e) => {
        console.log('WebSocket连接关闭')
        console.log('关闭原因:', e.code, e.reason, e.wasClean)
        if (!this.isHangingUp) {
          console.log('非主动挂断，自动返回main页面')
          this.$router.push({ name: 'main' })
        }
      }
    },
    hangup () {
      this.isHangingUp = true
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const message = this.otherUserId 
          ? { type: 'reject', to: this.otherUserId }
          : { type: 'reject' }
        this.ws.send(JSON.stringify(message))
      }
      this.cleanup()
      this.$router.push({ name: 'main' })
    },
    cleanup () {
      if (this.pingTimer) {
        clearInterval(this.pingTimer)
        this.pingTimer = null
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
      }
      if (this.pc) {
        this.pc.close()
        this.pc = null
      }
      if (this.ws) {
        this.ws.close()
      }
    },
    startPing () {
      if (this.pingTimer) {
        clearInterval(this.pingTimer)
      }
      this.pingTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send('ping')
          console.log('发送ping')
        }
      }, 30000)
    },
    async initWebRTC () {
      try {
        if (this.pc) {
          console.log('PeerConnection已存在，跳过初始化')
          return
        }
        
        if (!window.RTCPeerConnection) {
          throw new Error('浏览器不支持WebRTC，请使用Chrome、Firefox或Safari最新版本')
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('浏览器不支持媒体设备访问，请使用HTTPS环境或更换浏览器')
        }
        
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
        this.pc = new RTCPeerConnection(configuration)
        console.log('PeerConnection创建成功，ICE配置:', configuration)
        
        this.pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('收集到ICE候选者:', event.candidate)
            this.sendIceCandidate(event.candidate)
          } else {
            console.log('ICE候选者收集完成')
          }
        }
        
        this.pc.oniceconnectionstatechange = () => {
          const state = this.pc.iceConnectionState
          console.log('ICE连接状态变化:', state)
          if (state === 'connected' || state === 'completed') {
            console.log('✅ ICE连接成功！')
          } else if (state === 'failed') {
            console.error('❌ ICE连接失败！')
          } else if (state === 'disconnected') {
            console.warn('⚠️ ICE连接断开')
          }
        }
        
        this.pc.onconnectionstatechange = () => {
          const state = this.pc.connectionState
          console.log('PeerConnection状态变化:', state)
          if (state === 'connected') {
            console.log('✅ PeerConnection已连接！')
          } else if (state === 'failed') {
            console.error('❌ PeerConnection连接失败！')
          } else if (state === 'disconnected') {
            console.warn('⚠️ PeerConnection断开')
          }
        }
        
        this.pc.onicegatheringstatechange = () => {
          console.log('ICE收集状态变化:', this.pc.iceGatheringState)
        }
        
        this.pc.ontrack = (event) => {
          console.log('收到远程流', event.streams)
          const remoteVideo = this.$refs.remoteVideo
          console.log('remoteVideo元素:', remoteVideo)
          if (remoteVideo) {
            remoteVideo.srcObject = event.streams[0]
            console.log('设置远程视频流成功，srcObject:', remoteVideo.srcObject)
          } else {
            console.error('remoteVideo元素不存在')
          }
        }
        
        const constraints = {
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            facingMode: 'user'
          },
          audio: true
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('浏览器不支持媒体设备访问，请使用HTTPS或更换浏览器')
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('获取本地流成功', stream.getTracks())
        this.localStream = stream
        const localVideo = this.$refs.localVideo
        console.log('localVideo元素:', localVideo)
        if (localVideo) {
          localVideo.srcObject = stream
          console.log('设置本地视频流成功，srcObject:', localVideo.srcObject)
        } else {
          console.error('localVideo元素不存在')
        }
        
        stream.getTracks().forEach(track => {
          this.pc.addTrack(track, stream)
        })
        console.log('添加本地轨道到PeerConnection')
        
      } catch (error) {
        console.error('初始化WebRTC失败:', error)
        if (error.message && error.message.includes('浏览器不支持WebRTC')) {
          this.toast().show('浏览器不支持WebRTC，请使用Chrome、Firefox或Safari最新版本')
        } else if (error.message && error.message.includes('浏览器不支持媒体设备访问')) {
          this.toast().show('浏览器不支持媒体设备访问，请使用HTTPS环境或更换浏览器')
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.toast().show('请允许访问摄像头和麦克风')
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          this.toast().show('未找到摄像头或麦克风设备')
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          this.toast().show('摄像头或麦克风被占用，请关闭其他应用后重试')
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          this.toast().show('设备不支持请求的分辨率')
        } else if (error.name === 'TypeError') {
          this.toast().show('浏览器不支持媒体设备访问')
        } else {
          this.toast().show('无法访问媒体设备: ' + error.message)
        }
      }
    },
    
    async createOffer () {
      try {
        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)
        console.log('创建并设置本地offer成功', offer)
        this.sendSdp(offer)
      } catch (error) {
        console.error('创建Offer失败:', error)
      }
    },
    sendSdp (sdp) {
      console.log('准备发送SDP，currentUserId:', this.currentUserId, 'otherUserId:', this.otherUserId)
      const message = {
        type: 'sdp',
        from: this.currentUserId,
        to: this.otherUserId,
        data: sdp
      }
      const messageStr = JSON.stringify(message)
      console.log('发送SDP字符串:', messageStr)
      this.ws.send(messageStr)
      console.log('发送SDP对象:', message)
    },
    async handleRemoteSdp (sdp) {
      try {
        console.log('收到远程SDP，类型:', sdp.type)
        
        await this.initWebRTC()
        
        await this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
        this.remoteDescriptionSet = true
        console.log('设置远程SDP成功', sdp.type)
        
        if (sdp.type === 'offer') {
          console.log('收到offer，创建answer')
          const answer = await this.pc.createAnswer()
          await this.pc.setLocalDescription(answer)
          console.log('创建并设置本地answer成功')
          this.sendSdp(answer)
        } else {
          console.log('收到answer，不需要创建answer')
        }
        
        console.log('添加缓存的ICE候选者，数量:', this.iceCandidates.length)
        for (const candidate of this.iceCandidates) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
            console.log('添加缓存的ICE候选者成功')
          } catch (error) {
            console.error('添加缓存的ICE候选者失败:', error)
          }
        }
        this.iceCandidates = []
      } catch (error) {
        console.error('处理远程SDP失败:', error)
      }
    },
    sendIceCandidate (candidate) {
      const message = {
        type: 'ice',
        from: this.currentUserId,
        to: this.otherUserId,
        data: candidate
      }
      this.ws.send(JSON.stringify(message))
      console.log('发送ICE:', message)
    },
    async handleIceCandidate (candidate) {
      try {
        console.log('准备添加ICE候选者:', candidate, 'remoteDescriptionSet:', this.remoteDescriptionSet)
        
        if (!this.remoteDescriptionSet) {
          console.log('远程描述未设置，缓存ICE候选者')
          this.iceCandidates.push(candidate)
          return
        }
        
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('添加ICE候选者成功，当前ICE状态:', this.pc.iceConnectionState, 'PeerConnection状态:', this.pc.connectionState)
      } catch (error) {
        console.error('添加ICE候选者失败:', error)
      }
    },
    toggleVConsole () {
      if (window.vConsole) {
        window.vConsole.show()
      } else {
        console.log('VConsole 未加载')
      }
    }
  }
}
</script>

<style scoped>
.video-call {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000
}
.video-container {
  position: relative;
  width: 80%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background: #222;
  border-radius: 8px;
  overflow: hidden
}
.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover
}
.local-video {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  max-width: 30vw;
  max-height: 22.5vw;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3)
}
@media (max-width: 768px) {
  .video-container {
    width: 95%;
    border-radius: 4px
  }
  .local-video {
    width: 120px;
    height: 90px;
    bottom: 10px;
    right: 10px
  }
  .controls {
    margin-top: 20px
  }
  .hangup {
    padding: 12px 30px;
    font-size: 16px
  }
}
.controls {
  margin-top: 40px;
  display: flex;
  gap: 20px
}
.hangup {
  padding: 15px 40px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: #ff4d4f;
  color: white;
  cursor: pointer;
  transition: background 0.2s
}
.hangup:hover {
  background: #ff7875
}
.vconsole-btn {
  padding: 15px 40px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  transition: background 0.2s
}
.vconsole-btn:hover {
  background: #40a9ff
}
</style>
