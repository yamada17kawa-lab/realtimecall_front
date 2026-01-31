<template>
  <div id="app">
    <router-view/>
    <ToastMessage ref="toast"/>
  </div>
</template>

<script>
import ToastMessage from './components/ToastMessage.vue'

export default {
  name: 'App',
  components: {
    ToastMessage
  },
  data () {
    return {
      toast: null
    }
  },
  mounted () {
    this.toast = this.$refs.toast
  },
  provide () {
    return {
      toast: () => this.$refs.toast
    }
  }
}
</script>

<style lang="scss">
#root, html, body, #app { height: 100%; margin: 0; }
body { overflow-x: hidden; }
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* nav removed */
</style>
