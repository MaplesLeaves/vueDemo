import request from '@/utils/request'

export function deleteOne(query) {
  return request({
    url: '/rest/userInfo/deleteUser',
    method: 'post',
    data: query
  })
}

export function savePerson(query) {
  return request({
    url: '/rest/user/save2',
    method: 'post',
    data: query
  })
}

export function findAllPerson(query) {
  return request({
    url: '/rest/FPMUserPower/pageUser',
    method: 'post',
    data: query
  })
}
