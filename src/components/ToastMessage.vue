<template>
  <transition name="toast">
    <div v-if="visible" class="toast-container">
      <div class="toast-message">{{ message }}</div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ToastMessage',
  data () {
    return {
      visible: false,
      message: '',
      timer: null
    }
  },
  methods: {
    show (msg) {
      this.message = msg
      this.visible = true
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.visible = false
      }, 2500)
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
}

.toast-message {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.5s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
