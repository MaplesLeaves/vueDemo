import Vue from 'vue'
import Router from 'vue-router'

const _import = require('./_import_' + process.env.NODE_ENV)
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading

/* layout */
import Layout from '../views/layout/Layout'

Vue.use(Router)

/**
 * icon : the icon show in the sidebar
 * hidden : if `hidden:true` will not show in the sidebar
 * redirect : if `redirect:noredirect` will not redirct in the levelbar
 * noDropdown : if `noDropdown:true` will not has submenu in the sidebar
 * meta : `{ role: ['admin'] }`  will control the page role
 **/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/authredirect', component: _import('login/authredirect'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index'),
      name: 'dashboard',
      meta: { title: '主页', icon: 'icon-zhuye', noCache: true }
    }]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/notice',
    component: Layout,
    children: [{
      path: 'index',
      component: _import('notice/index'),
      name: 'notice',
      meta: { title: '通知管理', icon: 'icon-notice', noCache: true }
    }]
  },
  {
    path: '/department',
    component: Layout,
    children: [{
      path: 'index',
      component: _import('department/index'),
      name: 'department',
      meta: { title: '组织管理', icon: 'icon-zuzhi', noCache: true }
    }]
  },
  {
    path: '/role',
    component: Layout,
    meta: {
      roles: ['ROLE_admin'] // you can set roles in root nav
    },
    children: [{
      path: 'index',
      component: _import('role/index'),
      name: 'role',
      meta: { title: '角色管理', icon: 'icon-jiaoseguanli', noCache: true }
    }]
  },
  {
    path: '/house',
    component: Layout,
    redirect: 'noredirect',
    name: 'house',
    meta: { title: '房屋管理', icon: 'icon-fangwu' },
    children: [
      {
        path: 'houseDistribution',
        component: _import('houseManager/houseDistribution'),
        name: 'houseDistribution',
        meta: { title: '房屋分配', noCache: true, icon: 'icon-fenpei' }
      },
      {
        path: 'houseApproval',
        component: _import('houseManager/houseDistribution'),
        name: 'houseApproval',
        meta: { title: '房屋审批', noCache: true, roles: ['ROLE_admin'], icon: 'icon-shenpi' }
      }
    ]
  },
  {
    path: '/person',
    component: Layout,
    meta: {
      roles: ['ROLE_admin'] // you can set roles in root nav
    },
    children: [{
      path: 'index',
      component: _import('person/index'),
      name: 'person',
      meta: { title: '人员管理', icon: 'icon-renyuanguanli', noCache: true }
    }]
  },
  { path: '*', redirect: '/404', hidden: true }
]
