<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-form :rules="rules" :model="postForm" :inline="true" class="demo-form-inline">
        <el-form-item label="名称" prop="name">
          <el-input v-model="postForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="proCode">
          <el-input v-model="postForm.proCode" placeholder="请输入角色编码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="filter-item" icon="el-icon-edit" @click="saveRole(postForm)">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="加载中" border fit
              highlight-current-row
              style="width: 100%">
      <el-table-column
        type="index"
        width="30">
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="编码">
        <template slot-scope="scope">
          <span>{{scope.row.proCode}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="创建时间">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button @click="editClick(scope.row)" type="text" size="small">编辑</el-button>
          <el-button @click="deleteClick(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.currPage" :page-sizes="[10,20,30,40]" :page-size="listQuery.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="编辑角色" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :model="editForm" label-position="left" label-width="70px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="name">
          <el-input class="filter-item" v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="proCode">
          <el-input class="filter-item" v-model="editForm.proCode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole(editForm)" v-loading="loading" :disabled="loading">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchRoleList, saveOne, deleteOne } from '@/api/role'
  import waves from '@/directive/waves' // 水波纹指令
  import { validateRequire } from '@/utils/validate'

  export default {
    name: 'role',
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
        listQuery: {
          currPage: 1,
          pageSize: 10
        },
        rules: {
          name: [{ validator: validateRequire, required: true, message: '名称不能为空' }],
          proCode: [{ validator: validateRequire, required: true, message: '编码不能为空' }]
        },
        postForm: {
          name: '',
          proCode: ''
        },
        editForm: {
          name: '',
          proCode: '',
          id: ''
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      editClick(row) {
        console.log(row)
        this.editForm.name = row.name
        this.editForm.proCode = row.proCode
        this.editForm.id = row.id
        this.dialogFormVisible = true
      },
      deleteClick(row) {
        console.log(row)
        this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteOne(row).then(response => {
            if (response.success) {
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.resetForm()
              this.getList()
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
      getList() {
        this.listLoading = true
        fetchRoleList(this.listQuery).then(response => {
          this.list = response.result.list
          this.total = response.result.total
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.currPage = val
        this.getList()
      },
      resetForm() {
        this.postForm = {
          name: '',
          proCode: ''
        }
        this.editForm = {
          name: '',
          proCode: '',
          id: ''
        }
        this.dialogFormVisible = false
      },
      saveRole(data) {
        if (data.name === '' || data.proCode === '') {
          this.$message({
            message: '输入框为必填项',
            type: 'error'
          })
          return false
        }
        this.loading = true
        saveOne(data).then(response => {
          if (response.success) {
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.resetForm()
            this.getList()
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
          }
          this.loading = false
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">


</style>
