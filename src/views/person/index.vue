<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-form :rules="rules" :model="postForm" :inline="true" class="demo-form-inline">
        <el-form-item label="姓名">
          <el-input v-model="postForm.nickName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="postForm.mobile" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="filter-item" icon="el-icon-edit" @click="findPerson()">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="filter-item" icon="el-icon-edit" @click="addPerson(postForm)">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="加载中" border fit
              highlight-current-row
              style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column align="center" label="姓名">
        <template slot-scope="scope">
          <span v-if="scope.row.name">{{ scope.row.name }}</span>
          <span v-else>{{ scope.row.nickName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="联系方式">
        <template slot-scope="scope">
          <span>{{scope.row.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button @click="editClick(scope.row)" type="text" size="small">编辑</el-button>
          <el-button @click="deleteClick(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="postForm.currPage" :page-sizes="[10,20,30,40]" :page-size="postForm.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title=textMap[dialogStatus] :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :model="editForm" label-position="left" label-width="150px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名(登录名)" prop="username">
          <el-input class="filter-item" v-model="editForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input class="filter-item" v-model="editForm.nickName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input class="filter-item" v-model="editForm.mobile" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="proCode">
          <el-input v-if="dialogStatus === 'update'" disabled="true" class="filter-item" v-model="editForm.password" auto-complete="off"></el-input>
          <el-input v-else class="filter-item" v-model="editForm.password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSave()">取 消</el-button>
        <el-button type="primary" @click="savePerson(editForm)" v-loading="loading" :disabled="loading">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { deleteOne, savePerson, findAllPerson } from '@/api/person'
  import waves from '@/directive/waves' // 水波纹指令
  import { validateRequire } from '@/utils/validate'
  export default {
    name: 'person',
    directives: {
      waves
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        loading: false,
        dialogFormVisible: false,
        rules: {
          username: [{ validator: validateRequire, required: true, message: '用户名不能为空' }],
          name: [{ validator: validateRequire, required: true, message: '名称不能为空' }],
          proCode: [{ validator: validateRequire, required: true, message: '编码不能为空' }],
          mobile: [{ validator: validateRequire, required: true, message: '联系方式不能为空' }]
        },
        dialogStatus: 'create',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        postForm: {
          currPage: 1,
          pageSize: 10,
          nickName: '',
          mobile: ''
        },
        editForm: {
          username: '',
          nickName: '',
          mobile: '',
          password: '',
          id: ''
        }
      }
    },
    created() {
      this.getPersonHaveOrgList({
        currPage: 1,
        pageSize: 10 })
    },
    methods: {
      editClick(row) {
        console.log(row)
        this.editForm.username = row.username
        this.editForm.nickName = row.nickName
        this.editForm.password = row.password
        this.editForm.mobile = row.mobile
        this.editForm.id = row.id
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      },
      deleteClick(row) {
        console.log(row)
        this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteOne({ userId: row.id }).then(response => {
            if (response.success) {
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.resetForm()
              this.getPersonHaveOrgList(this.postForm)
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
      getPersonHaveOrgList(obj = {}) {
        this.listLoading = false
        findAllPerson(obj).then(response => {
          this.list = response.result.list
          this.total = response.result.total
          this.listLoading = false
          this.loading = false
        })
      },
      handleSizeChange(val) {
        this.postForm.pageSize = val
        this.getPersonHaveOrgList({
          currPage: this.postForm.currPage,
          pageSize: this.postForm.pageSize
        })
      },
      handleCurrentChange(val) {
        this.postForm.currPage = val
        this.getPersonHaveOrgList({
          currPage: this.postForm.currPage,
          pageSize: this.postForm.pageSize
        })
      },
      resetForm() {
        this.postForm = {
          nickName: '',
          mobile: '',
          currPage: 1,
          pageSize: 10
        }
        this.editForm = {
          username: '',
          nickName: '',
          mobile: '',
          password: '',
          id: ''
        }
        this.dialogFormVisible = false
      },
      findPerson() {
        this.loading = true
        let obj = {}
        if (this.postForm.nickName === '' && this.postForm.mobile === '') {
          obj = {
            currPage: 1,
            pageSize: 10
          }
        } else if (this.postForm.nickName === '' && this.postForm.mobile !== '') {
          obj = {
            currPage: 1,
            pageSize: 10,
            mobile: this.postForm.mobile
          }
        } else if (this.postForm.nickName !== '' && this.postForm.mobile === '') {
          obj = {
            currPage: 1,
            pageSize: 10,
            nickName: this.postForm.nickName
          }
        } else {
          obj = {
            currPage: 1,
            pageSize: 10,
            nickName: this.postForm.nickName,
            mobile: this.postForm.mobile
          }
        }
        this.getPersonHaveOrgList(obj)
      },
      addPerson() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
      },
      cancelSave() {
        this.dialogFormVisible = false
        this.resetForm()
        this.getPersonHaveOrgList({
          currPage: 1,
          pageSize: 10 })
      },
      savePerson() {
        let obj = {}
        if (this.editForm.id === '') {
          obj = {
            nickName: this.editForm.nickName,
            username: this.editForm.username,
            mobile: this.editForm.mobile,
            password: this.editForm.password
          }
        } else {
          obj = {
            id: this.editForm.id,
            nickName: this.editForm.nickName,
            userName: this.editForm.username,
            mobile: this.editForm.mobile,
            password: this.editForm.password
          }
        }
        savePerson(obj).then(response => {
          if (response.success) {
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.resetForm()
            this.getPersonHaveOrgList(this.postForm)
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


</style>
