import request from '@/utils/request'

export function loginByUsername(mobile, password) {
  const data = {
    username: mobile,
    password,
    orgId: '160'
  }
  return request({
    url: 'userLogin',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: 'manage/rest/auth/logout',
    method: 'post'
  })
}

export function getUserInfo() {
  return request({
    url: 'manage/rest/auth/getUserInfo',
    method: 'post'
  })
}

