import request from '@/utils/request'

export function fetchRoleList(query) {
  return request({
    url: '/rest/FPMUserPower/getPropertyLists',
    method: 'post',
    data: query
  })
}

export function saveOne(query) {
  return request({
    url: '/rest/FPMUserPower/saveProperty',
    method: 'post',
    data: query
  })
}

export function deleteOne(query) {
  return request({
    url: '/rest/FPMUserPower/deletePropertyById',
    method: 'post',
    data: query
  })
}
