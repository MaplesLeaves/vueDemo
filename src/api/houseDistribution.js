import request from '@/utils/request'

export function getHousesByCurrentUser(query) {
  return request({
    url: '/rest/houseBasicInfo/getHousesByCurrentUser',
    method: 'post',
    data: query
  })
}

export function distributeHouse(query) {
  return request({
    url: '/rest/houseBasicInfo/distributeHouse',
    method: 'post',
    data: query
  })
}

export function getToUserInfo(query) {
  return request({
    url: '/rest/houseBasicInfo/getToUserInfo',
    method: 'post',
    data: query
  })
}

export function findUserHaveOrgByHouseId(query) {
  return request({
    url: '/rest/userInfo/findUserHaveOrgByHouseId',
    method: 'post',
    data: query
  })
}
