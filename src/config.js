const baseUrl = 'http://192.168.1.5:80'

module.exports = {
  baseUrl,
  wsUrl: baseUrl.replace('http', 'ws')
}
