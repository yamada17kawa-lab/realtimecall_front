import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null
  },
  getters: {
    token: state => state.token,
    isAuthenticated: state => !!state.token
  },
  mutations: {
    setToken (state, token) {
      state.token = token
    },
    clearToken (state) {
      state.token = null
    }
  },
  actions: {
    initToken ({ commit }) {
      const t = localStorage.getItem('token')
      if (t) commit('setToken', t)
    },
    saveToken ({ commit }, token) {
      if (token) {
        localStorage.setItem('token', token)
        commit('setToken', token)
      }
    },
    logout ({ commit }) {
      localStorage.removeItem('token')
      commit('clearToken')
    }
  },
  modules: {
  }
})
