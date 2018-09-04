<template>
  <div class="app-container calendar-list-container departmentDiv">
    <el-row>
      <el-col :span="6">
        <div class="filter-container" style="margin-bottom: 20px" >
          <label>组织树</label>
        </div>
        <el-tree class="myTree" ref="myTree" :data="data"  :props="defaultProps"
                 node-key="id" :highlight-current="true" @node-click="handleNodeClick" :expand-on-click-node="false"
                 :default-expand-all="true">
          <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button type="text" size="mini" @click="() => append(node, data)">
              添加
            </el-button>
             <el-button type="text" size="mini" @click="() => update(node, data)">
              修改
            </el-button>
            <el-button type="text" size="mini" @click="() => remove(node, data)">
              删除
            </el-button>
          </span>
          </span>
        </el-tree>
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="departmentFormVisible">
          <el-form :rules="rules" ref="departmentForm" :model="departmentForm" label-position="left" label-width="120px"
                   style='margin-left:40px;'>
            <el-form-item label="父组织名称">
              <el-input type="text" :disabled="true" style="width: 400px;"  class="filter-item" v-model="departmentForm.parentName">
              </el-input>
            </el-form-item>
            <el-form-item label="子组织名称" prop="name">
              <el-input type="text" style="width: 400px;"  class="filter-item" v-model="departmentForm.name">
              </el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancel(departmentForm)">取消</el-button>
            <el-button type="primary" @click="saveData(departmentForm)" v-loading="loading" :disabled="loading">提交</el-button>
          </div>
        </el-dialog>
      </el-col>
      <el-col :span="16" style="margin-left: 5%;">
        <div class="filter-container">
          <el-input style="width: 200px;" class="filter-item" placeholder="请输入姓名"
                    v-model="listQuery.name">
          </el-input>
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search"
                     @click="search">查询</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="addPerson" type="primary"
                     icon="el-icon-edit">添加
          </el-button>
        </div>
        <el-table  :data="list" v-loading="listLoading" element-loading-text="加载中" border fit
                   highlight-current-row
                   style="width: 100%">
          <el-table-column align="center" label="人员列表">
            <el-table-column align="center" label="姓名">
              <template slot-scope="scope">
                <span v-if="scope.row.uName">{{ scope.row.uName }}</span>
                <span v-else>{{ scope.row.nickName }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="联系方式">
              <template slot-scope="scope">
                <span>{{scope.row.mobile}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="权限">
              <template slot-scope="scope">
                <div v-for="item in scope.row.propertys" >
                  <span>{{item.name}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <el-button @click="editPersonRolesClick(scope.$index,scope.row)" type="text" size="small">编辑</el-button>
                <el-button @click="deletePersonRolesClick(scope.$index,scope.row)" type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                         :current-page="listQuery.currPage" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize"
                         layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="编辑权限" :visible.sync="haveOrgEditRoleFormVisible">
      <el-form label-position="left" label-width="70px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="haveOrgCheckedRoles">
            <el-checkbox v-for="role in roleList" :label="role.name" :key="role.id">{{role.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRole()">取 消</el-button>
        <el-button type="primary" @click="saveRole()" v-loading="haveOrgEditRoleLoading" :disabled="haveOrgEditRoleLoading">提 交</el-button>
      </div>
    </el-dialog>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="personFormVisible">
      <el-form :rules="rules" ref="personNoOrgForm" :model="personNoOrgForm" label-position="left" label-width="120px"
               style='margin-left:20px;'>
        <el-form-item label="选择角色">
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="checkedRoles" @change="handleCheckedRolesChange">
            <el-checkbox v-for="role in roleList" :label="role.name" :key="role.id">{{role.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="人员筛选">
          <el-input type="text" style="width: 200px;"  class="filter-item" placeholder="请输入姓名" v-model="personNoOrgForm.name">
          </el-input>
          <el-input type="text" style="width: 200px;"  class="filter-item" placeholder="请输入联系方式" v-model="personNoOrgForm.mobile">
          </el-input>
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search"
                     @click="searchPersonNoOrgButton()">查询</el-button>
        </el-form-item>
        <el-table ref="multipleTable" :data="tableData3"
          border fit highlight-current-row tooltip-effect="dark" style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column align="center" label="人员列表">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="姓名">
            <template slot-scope="scope">
              <span v-if="scope.row.uName">{{ scope.row.uName }}</span>
              <span v-else>{{ scope.row.nickName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="联系方式">
            <template slot-scope="scope">{{ scope.row.mobile }}</template>
          </el-table-column>
          </el-table-column>
        </el-table>
      </el-form>
      <div class="pagination-container">
        <el-pagination background @size-change="handleSizeChangeNoOrg" @current-change="handleCurrentChangeNoOrg"
                       :current-page="personNoOrgForm.currPage" :page-sizes="[10,20,30,40]" :page-size="personNoOrgForm.pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="totalList">
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSendPersonNoOrg()">取消</el-button>
        <el-button type="primary" @click="sendPersonNoOrgForm(personNoOrgListQuery)" v-loading="loading" :disabled="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import waves from '@/directive/waves' // 水波纹指令
  import { validateRequire } from '@/utils/validate'
  import { saveRole, deletePersonHaveOrgForm, sendPersonNoOrgForm, fetchRoleList, findOrg, saveOne, deleteOne, personHaveOrgList, searchPersonNoOrg } from '@/api/department'

  export default {
    name: 'department',
    directives: {
      waves
    },
    data() {
      return {
        fileList: [],
        list: [],
        total: null,
        totalList: null,
        departmentFormVisible: false,
        personFormVisible: false,
        haveOrgEditRoleFormVisible: false,
        loading: false,
        listLoading: false,
        haveOrgEditRoleLoading: false,
        options: [],
        value: '',
        tree: {
          name: ''
        },
        data: [],
        defaultProps: {
          children: 'childrenOrg',
          label: 'name'
        },
        listQuery: {
          currPage: 1,
          pageSize: 10,
          name: '',
          mobile: '',
          propertys: [],
          orgId: ''
        },
        dialogStatus: 'create',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        departmentForm: {
          id: '',
          name: '',
          parentName: '',
          parentId: ''
        },
        postForm: {
          id: '',
          name: '',
          pid: ''
        },
        rules: {
          name: [{ validator: validateRequire, required: true, message: '名称不能为空' }],
          parentName: [{ validator: validateRequire, required: true, message: '编码不能为空' }],
          label: [{ validator: validateRequire, required: true, message: '编码不能为空' }]
        },
        personNoOrgForm: {
          currPage: 1,
          pageSize: 10,
          name: '',
          mobile: '',
          address: ''
        },
        tableData3: [],
        multipleSelection: [],
        checkAll: false,
        roleList: [],
        checkedRoles: [],
        haveOrgCheckedRoles: [],
        userId: '',
        orgId: '',
        searchPersonListLoading: false,
        personNoOrgListQuery: {
          userIds: [],
          propertyIds: [],
          orgId: ''
        }
      }
    },
    created() {
      this.getTree()
    },
    mounted() {
      this.$refs.myTree.setCurrentKey(0)
    },
    methods: {
      getPersonHaveOrgList(obj = {}) {
        this.listLoading = false
        personHaveOrgList(obj).then(response => {
          this.list = response.result.list
          this.total = response.result.total
          this.listLoading = false
        })
      },
      getTree() {
        findOrg({}).then(response => {
          this.data = [response.result]
          this.orgId = response.result.id
          this.getPersonHaveOrgList({ currPage: 1,
            pageSize: 10,
            orgId: this.orgId
          })
        })
      },
      append(node, data) {
        this.departmentForm.parentId = data.id
        this.departmentForm.parentName = data.name
        this.dialogStatus = 'create'
        this.departmentFormVisible = true
      },
      update(node, data) {
        if (node.parent.id) {
          const parent = node.parent
          console.log(parent.id + '' + parent.name)
          this.departmentForm.parentId = parent.data.id
          this.departmentForm.parentName = parent.data.name
        }
        this.departmentForm.id = data.id
        this.departmentForm.name = data.name
        this.dialogStatus = 'update'
        this.departmentFormVisible = true
      },
      remove(node, data) {
        const parent = node.parent
        this.departmentForm.parentId = parent.data.id
        this.departmentForm.parentName = parent.data.name
        this.departmentForm.id = data.id
        this.departmentForm.name = data.name
        this.$confirm('此操作将删除该组织, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteOne(this.departmentForm).then(response => {
            if (response.success) {
              this.$message({
                message: response.message,
                type: 'success'
              })
              const parent = node.parent
              const children = parent.data.childrenOrg || parent.data
              const index = children.findIndex(d => d.id === data.id)
              children.splice(index, 1)
              this.resetForm()
            } else {
              this.$message({
                message: response.message,
                type: 'error'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      addPerson() {
        if (this.personNoOrgListQuery.orgId === '') {
          this.$message({
            message: '请先选择添加人员的组织',
            type: 'error'
          })
          return false
        }
        this.getRolesList()
        this.searchPersonNoOrg()
        this.personFormVisible = true
      },
      getRolesList() {
        fetchRoleList({
          currPage: 1,
          pageSize: 10 }).then(response => {
          this.roleList = response.result.list
          for (let i = 0; i < this.roleList.length; i++) {
            this.$set(this.checkedRoles, i, this.roleList[i].name)
          }
        })
      },
      search() {
        this.listQuery.currPage = 1
        this.listQuery.pageSize = 10
        this.getPersonHaveOrgList(this.listQuery)
      },
      editPersonRolesClick(index, obj) {
        if (this.listQuery.orgId === '') {
          this.$message({
            message: '请先选择要编辑人员的组织',
            type: 'error'
          })
          return false
        }
        this.getRolesList()
        if (obj.propertys && obj.propertys.length > 0) {
          for (let i = 0; i < obj.propertys.length; i++) {
            this.$set(this.haveOrgCheckedRoles, i, obj.propertys[i].name)
          }
        }
        this.userId = obj.id
        this.haveOrgEditRoleFormVisible = true
      },
      deletePersonRolesClick(index, obj) {
        if (this.listQuery.orgId === '') {
          this.$message({
            message: '请先选择要删除人员的组织',
            type: 'error'
          })
          return false
        }
        const val = {
          orgId: this.listQuery.orgId,
          userId: obj.id
        }
        deletePersonHaveOrgForm(val).then(response => {
          if (response.success) {
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.getPersonHaveOrgList({
              currPage: 1,
              pageSize: 10,
              orgId: this.personNoOrgListQuery.orgId
            })
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
          }
        })
      },
      handleSizeChange(val) {
        this.listQuery.pageSize = val
        this.getPersonHaveOrgList(this.listQuery)
      },
      handleCurrentChange(val) {
        this.listQuery.currPage = val
        this.getPersonHaveOrgList(this.listQuery)
      },
      handleNodeClick(data) {
        this.personNoOrgListQuery.orgId = data.id
        this.listQuery.orgId = data.id
        console.log('选中的组织：' + data.id + data.name)
        this.getPersonHaveOrgList(this.listQuery)
      },
      addNode(obj) {
        const parentNode = this.$refs.myTree.getNode(obj.parentId)
        const newChild = { id: obj.id, name: obj.name, children: [] }
        if (!obj.children) {
          this.$set(obj, 'children', [])
        }
        this.$refs.myTree.append(newChild, parentNode)
      },
      updateNode(obj) {
        const node = this.$refs.myTree.getNode(obj.id)
        node.data.name = obj.name
      },
      resetForm() {
        this.departmentForm = {
          id: '',
          name: '',
          parentName: '',
          parentId: ''
        }
        this.postForm = {
          id: '',
          name: '',
          pid: ''
        }
        this.dialogStatus = ''
        this.departmentFormVisible = false
      },
      saveData(obj) {
        console.log(obj.parentId + obj.parentName)
        if (obj.name === '') {
          this.$message({
            message: '输入框为必填项',
            type: 'error'
          })
          return false
        }
        if (!obj.id || obj.id === '') {
          this.postForm = {
            name: obj.name,
            pid: obj.parentId
          }
        } else {
          this.postForm = {
            name: obj.name,
            id: obj.id,
            pid: obj.parentId
          }
        }

        this.loading = true
        saveOne(this.postForm).then(response => {
          if (response.success) {
            if (this.dialogStatus === 'update') {
              this.updateNode(obj)
            } else {
              obj.id = response.result.id
              this.addNode(obj)
            }
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.resetForm()
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
            this.resetForm()
          }
          this.loading = false
        })
      },
      cancel(obj) {
        this.departmentFormVisible = false
        this.resetForm()
      },
      handleCheckedRolesChange(value) {
        console.log('角色选中: ' + value)
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        for (let i = 0; i < this.multipleSelection.length; i++) {
          this.$set(this.personNoOrgListQuery.userIds, i, this.multipleSelection[i].id)
          console.log('人员选中id: ' + this.multipleSelection[0].id)
        }
      },
      searchPersonNoOrgButton() {
        this.personNoOrgForm.currPage = 1
        this.personNoOrgForm.pageSize = 10
        this.searchPersonNoOrg()
      },
      searchPersonNoOrg() {
        this.searchPersonListLoading = true
        searchPersonNoOrg(this.personNoOrgForm).then(response => {
          this.tableData3 = response.result.list
          this.totalList = response.result.total
          this.searchPersonListLoading = false
        })
      },
      handleSizeChangeNoOrg(val) {
        this.personNoOrgForm.pageSize = val
        this.searchPersonNoOrg()
      },
      handleCurrentChangeNoOrg(val) {
        this.personNoOrgForm.currPage = val
        this.searchPersonNoOrg()
      },
      resetPersonNoOrgForm() {
        this.personNoOrgForm = {
          currPage: 1,
          pageSize: 10,
          name: '',
          mobile: '',
          address: ''
        }
        this.personFormVisible = false
        this.personNoOrgListQuery.propertyIds = []
        this.personNoOrgListQuery.userIds = []
      },
      sendPersonNoOrgForm() {
        this.personNoOrgListQuery.propertyIds = []
        for (let i = 0; i < this.roleList.length; i++) {
          const index = this.checkedRoles.findIndex(d => d === this.roleList[i].name)
          if (index >= 0) {
            this.personNoOrgListQuery.propertyIds.push(this.roleList[i].id)
          }
        }
        sendPersonNoOrgForm(this.personNoOrgListQuery).then(response => {
          if (response.success) {
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.getPersonHaveOrgList(this.listQuery)
            this.resetPersonNoOrgForm()
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
          }
        })
      },
      cancelSendPersonNoOrg() {
        this.personFormVisible = false
        this.resetPersonNoOrgForm()
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePreview(file) {
        console.log(file)
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件`)
      },
      cancelRole() {
        this.haveOrgCheckedRoles = []
        this.haveOrgEditRoleFormVisible = false
      },
      saveRole(data) {
        const obj = {
          orgId: this.listQuery.orgId,
          userId: this.userId,
          propertyIds: []
        }
        for (let i = 0; i < this.roleList.length; i++) {
          const index = this.haveOrgCheckedRoles.findIndex(d => d === this.roleList[i].name)
          if (index >= 0) {
            obj.propertyIds.push(this.roleList[i].id)
          }
        }
        saveRole(obj).then(response => {
          if (response.success) {
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.getPersonHaveOrgList(this.listQuery)
            this.haveOrgCheckedRoles = []
            this.haveOrgEditRoleFormVisible = false
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
          }
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  .departmentDiv{
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }
  }

</style>
