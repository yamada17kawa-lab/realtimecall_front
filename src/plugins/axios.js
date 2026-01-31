import axios from 'axios'
import store from '@/store'
import router from '@/router'

function safePushHome () {
  try {
    const current = router && router.currentRoute && router.currentRoute.name
    if (current === 'home' || current === '/') return
    // push and ignore redundant navigation errors
    router.push({ name: 'home' }).catch(err => {
      // Vue Router throws NavigationDuplicated for same-route pushes — ignore it
      if (err && err.name !== 'NavigationDuplicated') console.error(err)
    })
  } catch (e) {
    if (typeof window !== 'undefined') window.location.href = '/'
  }
}

// Logging switch (default: off). Use `setAxiosLog(true)` to enable.
export let AXIOS_LOG_ENABLED = true
export function setAxiosLog (enabled) {
  AXIOS_LOG_ENABLED = !!enabled
}
export function getAxiosLog () {
  return AXIOS_LOG_ENABLED
}

// expose quick toggles on window for runtime use in dev console
if (typeof window !== 'undefined') {
  window.__setAxiosLog = setAxiosLog
  window.__getAxiosLog = getAxiosLog
}

// List of paths that should NOT include Authorization header
const excludedPaths = [
  '/auth/register',
  '/auth/login',
  '/login'
]

function isExcluded (url) {
  try {
    const u = new URL(url, window.location.origin)
    return excludedPaths.some(p => u.pathname.startsWith(p))
  } catch (e) {
    return excludedPaths.some(p => url.indexOf(p) !== -1)
  }
}

function maskHeaders (headers) {
  if (!headers) return headers
  const h = Object.assign({}, headers)
  if (h.Authorization) h.Authorization = '***REDACTED***'
  if (h.authorization) h.authorization = '***REDACTED***'
  return h
}

// Request interceptor: add Authorization header except for excluded paths
axios.interceptors.request.use(config => {
  const token = store.getters.token || localStorage.getItem('token')
  if (token && !isExcluded(config.url)) {
    config.headers = config.headers || {}
    // Send back the token exactly as stored (backend may include Bearer prefix)
    config.headers.Authorization = token
  }

  // record start time for duration logging
  try {
    config.__axiosStartTime = Date.now()
    if (AXIOS_LOG_ENABLED) {
      const info = {
        method: (config.method || 'get').toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
        headers: maskHeaders(config.headers)
      }
      console.log('[API][Request]', info)
    }
  } catch (e) {
    // ignore logging errors
  }

  return config
}, err => {
  if (AXIOS_LOG_ENABLED) console.error('[API][Request][Error]', err)
  return Promise.reject(err)
})

// Response interceptor: log responses and handle auth errors
axios.interceptors.response.use(res => {
  try {
    if (AXIOS_LOG_ENABLED) {
      const duration = res.config && res.config.__axiosStartTime ? Date.now() - res.config.__axiosStartTime : null
      const info = {
        url: res.config && res.config.url,
        status: res.status,
        data: res.data,
        headers: maskHeaders(res.headers),
        duration
      }
      console.log('[API][Response]', info)
    }
  } catch (e) {
    // ignore
  }
  // If backend uses a { code: 401 } body to indicate unauthorized, handle it here
  try {
    if (res && res.data && res.data.code === 401) {
      store.dispatch('logout')
      safePushHome()
      return Promise.reject(new Error('Unauthorized (code 401)'))
    }
  } catch (e) {
    // ignore
  }
  return res
}, err => {
  try {
    if (AXIOS_LOG_ENABLED) {
      const cfg = err.config || {}
      console.error('[API][Response][Error]', {
        url: cfg.url,
        message: err.message,
        status: err.response && err.response.status,
        data: err.response && err.response.data
      })
    }
  } catch (e) {
    // ignore
  }

  // Handle HTTP-level 401
  if (err.response && err.response.status === 401) {
    store.dispatch('logout')
    safePushHome()
  }
  // Also handle body-level { code: 401 }
  try {
    if (err.response && err.response.data && err.response.data.code === 401) {
      store.dispatch('logout')
      safePushHome()
    }
  } catch (e) {
    // ignore
  }
  return Promise.reject(err)
})

export default axios
