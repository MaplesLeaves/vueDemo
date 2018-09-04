import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'rest/sysnotice/getListWithPage',
    method: 'post',
    data: query
  })
}

export function saveOne(query) {
  return request({
    url: 'rest/sysnotice/saveOne',
    method: 'post',
    data: query
  })
}
