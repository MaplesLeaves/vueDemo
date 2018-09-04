<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input style="width: 200px;" class="filter-item" placeholder="标题" v-model="listQuery.title">
      </el-input>
      <el-date-picker v-model="listQuery.beginDate" @change="beginTimeChange" class="filter-item" type="datetime"
                      placeholder="开始时间"
                      format="yyyy-MM-dd HH:mm:ss">
      </el-date-picker>
      <span class="filter-item">-</span>
      <el-date-picker v-model="listQuery.endDate" @change="endTimeChange" class="filter-item" type="datetime"
                      placeholder="结束时间"
                      format="yyyy-MM-dd HH:mm:ss">
      </el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="search">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary"
                 icon="el-icon-edit">添加
      </el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="加载中" border fit
              highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="内容">
        <template slot-scope="scope">
          <span>{{scope.row.memo}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="接受角色">
        <template slot-scope="scope">
          <span v-if="scope.row.isNoticeHirer === 1 && scope.row.isNoticeHouseOwner === 1">
            屋主 | 租户
          </span>
          <span v-else-if="scope.row.isNoticeHirer === 1">
            租户
          </span>
          <span v-else-if="scope.row.isNoticeHouseOwner === 1">
            屋主
          </span>
          <span v-else>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.currPage" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="postForm" :model="postForm" label-position="left" label-width="70px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="发送角色">
          <el-checkbox-group v-model="checkboxVal">
            <el-checkbox label="isZh">租户</el-checkbox>
            <el-checkbox label="isWz">屋主</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input type="text" class="filter-item" placeholder="请输入标题" v-model="postForm.title">
          </el-input>
        </el-form-item>
        <el-form-item label="内容" prop="memo">
          <el-input type="area" class="filter-item" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容"
                    v-model="postForm.memo">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData" v-loading="loading" :disabled="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchList, saveOne } from '@/api/notice'
  import waves from '@/directive/waves' // 水波纹指令
  import { validateRequire } from '@/utils/validate'
  import { isInArray } from '@/utils/index'
  import DateFns from 'date-fns'

  export default {
    name: 'notice',
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
        textName: '新增',
        listQuery: {
          currPage: 1,
          pageSize: 10,
          title: '',
          beginDate: '',
          endDate: ''
        },
        rules: {
          title: [{ validator: validateRequire, required: true }],
          memo: [{ validator: validateRequire, required: true }]
        },
        postForm: {
          memo: '',
          title: '',
          isNoticeHouseOwner: 1,
          isNoticeHirer: 1
        },
        checkboxVal: ['isZh', 'isWz'],
        dialogStatus: 'create',
        textMap: {
          update: '编辑',
          create: '创建'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      beginTimeChange(val) {
        this.listQuery.beginDate = DateFns.format(new Date(val), 'YYYY-MM-DD HH:mm:ss')
      },
      endTimeChange(val) {
        this.listQuery.endDate = DateFns.format(new Date(val), 'YYYY-MM-DD HH:mm:ss')
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
      },
      search() {
        this.getList()
      },
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
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
          memo: '',
          title: '',
          isNoticeHouseOwner: 1,
          isNoticeHirer: 1
        }
        this.checkboxVal = ['isZh', 'isWz']
        this.dialogFormVisible = false
      },
      saveData() {
        this.$refs.postForm.validate(valid => {
          if (valid) {
            if (isInArray(this.checkboxVal, 'isZh')) {
              this.postForm.isNoticeHirer = 1
            } else {
              this.postForm.isNoticeHirer = 0
            }
            if (isInArray(this.checkboxVal, 'isWz')) {
              this.postForm.isNoticeHouseOwner = 1
            } else {
              this.postForm.isNoticeHouseOwner = 0
            }
            if (this.postForm.isNoticeHouseOwner === 0 && this.postForm.isNoticeHirer === 0) {
              this.$message({
                message: '请选择发送角色',
                type: 'error'
              })
              return false
            }
            this.loading = true
            saveOne(this.postForm).then(response => {
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
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">


</style>
