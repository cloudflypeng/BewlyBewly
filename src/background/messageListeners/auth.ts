// 由于 sendResponse 复杂, 所以使用自定义的函数
import type { APIMAP } from '../utils'
import { AHS } from '../utils'

const API_AUTH: APIMAP = {
  getAccessKey: (message, send, sendResponse) => {
    const url = message.confirmUri
    fetch(url)
      .then(response => sendResponse && sendResponse({ accessKey: `${response.url}`.match(/access_key=([0-9a-z]{32})/)![1] }))
      .catch(error => console.error(error))
    return true
  },
  // biliJct 似乎没有使用
  logout: (message, send, sendResponse) => {
    const url = `https://passport.bilibili.com/login/exit/v2?biliCSRF=${message.biliCSRF}`
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        biliCSRF: message.biliJct,
      }),
    })
      .then(response => response.json())
      .then(data => sendResponse && sendResponse(data))
      .catch(error => console.error(error))
  },
  getLoginQRCode: {
    url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
    _fetch: {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    },
    params: {
      appkey: '4409e2ce8ffd12b8',
      local_id: '0',
      ts: '0',
      sign: 'e134154ed6add881d28fbdf68653cd9c',
    },
    afterHandle: AHS.J_S,
  },
  qrCodeLogin: {
    url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
    _fetch: {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    },
    params: {
      appkey: '4409e2ce8ffd12b8',
      auth_code: '',
      local_id: '0',
      ts: '0',
      sign: 'e134154ed6add881d28fbdf68653cd9c',
    },
    afterHandle: AHS.J_S,
  },
}

export default API_AUTH
