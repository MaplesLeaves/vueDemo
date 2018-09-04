import request from '@/utils/request'

export function findOrg(query) {
  return request({
    url: '/rest/FPMUserPower/findOneOrgTree',
    method: 'post',
    data: query
  })
}
export function findParent(query) {
  return request({
    url: '/rest/FPMUserPower/findParent',
    method: 'post',
    data: query
  })
}

export function saveOne(query) {
  return request({
    url: '/rest/FPMUserPower/saveOrg',
    method: 'post',
    data: query
  })
}

export function findOneOrgTree(query) {
  return request({
    url: '/rest/FPMUserPower/findOneOrgTree',
    method: 'post',
    data: query
  })
}

export function deleteOne(query) {
  return request({
    url: '/rest/FPMUserPower/deleteOrg',
    method: 'post',
    data: query
  })
}

export function personHaveOrgList(query) {
  return request({
    url: '/rest/userInfo/findUserHaveOrg',
    method: 'post',
    data: query
  })
}
export function searchPerson(query) {
  return request({
    url: '',
    method: 'post',
    data: query
  })
}

export function searchPersonNoOrg(query) {
  return request({
    url: '/rest/userInfo/findUserHaveNoOrg',
    method: 'post',
    data: query
  })
}

export function fetchRoleList(query) {
  return request({
    url: '/rest/FPMUserPower/getPropertyLists',
    method: 'post',
    data: query
  })
}

export function sendPersonNoOrgForm(query) {
  return request({
    url: '/rest/userInfo/saveUserOrgPropertyRelation',
    method: 'post',
    data: query
  })
}

export function deletePersonHaveOrgForm(query) {
  return request({
    url: '/rest/userInfo/deleteOrgUserRelation',
    method: 'post',
    data: query
  })
}

export function saveRole(query) {
  return request({
    url: '/rest/userInfo/saveUserProperty',
    method: 'post',
    data: query
  })
}
