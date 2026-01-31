<template>
  <div class="user-detail">
    <h2>用户详情</h2>
    <p>用户 ID: {{ id }}</p>
    <p>（详情页尚未实现）</p>
  </div>
</template>

<script>
export default {
  name: 'UserDetail',
  computed: {
    id () { return this.$route.params.id }
  }
}
</script>

<style scoped>
.user-detail { padding: 24px; text-align: center }
@media (max-width: 600px) {
  .user-detail { padding: 16px }
  h2 { font-size: 20px }
}
</style>
