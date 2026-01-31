<template>
  <div class="home">
    <video class="home-video" autoplay loop muted playsinline>
      <source :src="homeVideo" type="video/mp4" />
    </video>
    <nav class="home-nav">
      <router-link to="/register">注册</router-link>
      <router-link to="/login">登录</router-link>
    </nav>
    <div class="center-wrap">
      <HelloWorld msg="Welcome to Realtime Call !"/>
    </div>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import homeVideo from '@/assets/home.mp4'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  },
  data () {
    return {
      homeVideo
    }
  },
  created () {
    const token = localStorage.getItem('token') || this.$store.getters.token
    if (token) {
      this.$router.push({ name: 'main' })
    }
  }
}
</script>

<style scoped>
.home-nav { margin: 20px 0; }
.home-nav a {
  margin: 0 10px;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  /* gradient text matching welcome heading */
  background: linear-gradient(90deg, #0077be 0%, #00aaff 30%, #8a2be2 60%, #ff7eb6 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  animation: gradientShift 6s ease infinite;
  text-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
.home-nav a:hover { opacity: 0.95 }

.home { min-height: 100vh; display: flex; flex-direction: column; position: relative; width: 100%; overflow: hidden }
.home-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1 }
.center-wrap { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1 }

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
