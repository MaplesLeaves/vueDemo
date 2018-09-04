<template>
  <div class="app-container calendar-list-container houseDistributionDiv">
    <div class="filter-container">
      <el-input style="width: 200px;" class="filter-item" placeholder="房屋名称" v-model="listQuery.name">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="search">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="distribution" type="primary"
                 icon="el-icon-edit">分配人员
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="exportTemp" type="primary"
                 icon="el-icon-edit">模板下载
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="importHouse" type="primary"
                 icon="el-icon-edit">房屋导入
      </el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="加载中" border fit
              highlight-current-row
              style="width: 100%" @selection-change="selectHouse">
      <el-table-column type="selection" width="55" class="selection" prop='id'></el-table-column>
      <el-table-column align="center" label="房屋名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="房屋地址">
        <template slot-scope="scope">
          <span>{{scope.row.address}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备code">
        <template slot-scope="scope">
          <span>{{scope.row.dev_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否分配">
        <template slot-scope="scope">
          <span v-if="scope.row.shareId">
             已分配
          </span>
          <span v-else>
            未分配
          </span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="操作" width="230" class-name="small-padding fixed-width">-->
      <!--<template slot-scope="scope">-->
      <!--<el-button type="primary" @click="distributionOne(scope.row.id)">分配人员</el-button>-->
      <!--</template>-->
      <!--</el-table-column>-->
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.currPage" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="导入房屋" :visible.sync="uploadVisible" class="importDialog">
      <div class="mainDiv">
        <el-upload
          class="upload-demo"
          name="upFile"
          :headers="uploadHeader"
          drag
          :action="uploadUrl"
          on-success="uploadSuccess"
          multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">请上传模板文件</div>
        </el-upload>
      </div>
    </el-dialog>

    <el-dialog title="分配人员" :visible.sync="dialogFormVisible" class="houseDistributionDialog">
      <div class="mainDiv">
        <el-tree class="myTree" ref="myTree" :data="orgData" :props="defaultProps" :highlight-current="true"
                 @node-click="handleNodeClick"
                 node-key="id"
                 :expand-on-click-node="false"
                 :default-expand-all="true">
        </el-tree>
        <Kanban :key="1" class="kanban todo" :list="noSelectList" :options="options"
                header-text="可选择人员(选择人员拖动到右边)"/>
        <Kanban :key="2" class="kanban done" :list="selectList" :options="options" header-text="已选择人员"/>
      </div>

      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="saveData" v-loading="loading" :disabled="loading">提交</el-button>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getHousesByCurrentUser,
    distributeHouse,
    getToUserInfo,
    findUserHaveOrgByHouseId
  } from '@/api/houseDistribution'
  import waves from '@/directive/waves' // 水波纹指令
  import { findOneOrgTree } from '@/api/department'
  import Kanban from '@/components/Kanban'
  import { getToken } from '@/utils/auth'

  export default {
    name: 'notice',
    directives: {
      waves
    },
    components: {
      Kanban
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        loading: false,
        dialogFormVisible: false,
        uploadVisible: false,
        listQuery: {
          name: '',
          currPage: 1,
          pageSize: 20
        },
        postForm: {
          selectHouse: []
        },
        orgData: [],
        defaultProps: {
          children: 'childrenOrg',
          label: 'name'
        },
        options: {
          group: 'mission'
        },
        noSelectList: [],
        selectList: [],
        uploadUrl: process.env.BASE_API + '/rest/houseBasicInfo/excelHousesLead',
        uploadHeader: {
          'x-auth-token': getToken()
        }
      }
    },
    created() {
      this.getList()
      this.getOrg()
    },
    methods: {
      distribution() {
        if (this.postForm.selectHouse.length === 0) {
          this.$message({
            message: '请选择房屋',
            type: 'error'
          })
          return false
        } else if (this.postForm.selectHouse.length === 1) {
          this.getToUserInfo(this.postForm.selectHouse[0])
        } else if (this.postForm.selectHouse.length > 1) {
          for (var h of this.postForm.selectHouseObj) {
            if (h.shareId) {
              this.$message({
                message: '不能选择多个已分配房屋',
                type: 'error'
              })
              return false
            }
          }
        }
        this.dialogFormVisible = true
        if (this.orgData.length > 0 && this.orgData[0].childrenOrg && this.orgData[0].childrenOrg.length > 0) {
          if (this.postForm.selectHouse.length > 1) {
            this.findUser(this.orgData[0].childrenOrg[0].id, '')
          } else {
            this.findUser(this.orgData[0].childrenOrg[0].id, this.postForm.selectHouse[0])
          }
          setTimeout(() => {
            this.$refs.myTree.setCurrentKey(this.orgData[0].childrenOrg[0].id)
          }, 500)
        }
      },
      uploadSuccess(response, file, fileList) {
        if (response.success) {
          this.$message({
            message: '上传成功',
            type: 'success'
          })
          this.uploadVisible = false
          this.getList()
        }
      },
      handleNodeClick(data) {
        if (this.postForm.selectHouse.length > 1) {
          this.findUser(data.id)
        } else {
          this.findUser(data.id, this.postForm.selectHouse[0])
        }
      },
      distributionOne(id) {

      },
      uploadError(err, file, fileList) {
        console.info(err)
        this.$message({
          message: '上传失败',
          type: 'error'
        })
      },
      exportTemp() {
        location.href = 'http://doc.tdenergys.com/doc/wKgBalsLYJSAFjEJAABMAMs7N_w9494973.xls'
      },
      importHouse() {
        this.uploadVisible = true
      },
      getOrg() {
        findOneOrgTree({}).then(response => {
          if (response.success) {
            this.orgData = [response.result]
          }
        })
      },
      search() {
        this.getList()
      },
      getList() {
        this.listLoading = true
        getHousesByCurrentUser(this.listQuery).then(response => {
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
      saveData() {
        if (this.selectList.length === 0) {
          this.$message({
            message: '请选择分配人员',
            type: 'error'
          })
          return false
        }
        var temp = []
        for (var item of this.selectList) {
          temp.push(item.userId)
        }
        distributeHouse({ toUsers: temp, houses: this.postForm.selectHouse }).then(response => {
          if (response.success) {
            this.selectList = []
            this.noSelectList = []
            this.$message({
              message: '分配成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getList()
          } else {
            this.$message({
              message: response.message,
              type: 'error'
            })
          }
        })
      },
      findUser(orgId, houseId) {
        findUserHaveOrgByHouseId({ orgId: orgId, houseId: houseId }).then(response => {
          this.noSelectList = []
          for (var item of response.result.list) {
            if (item.uName) {
              this.noSelectList.push({ name: item.uName + ' ' + item.mobile, userId: item.id })
            } else {
              this.noSelectList.push({ name: item.nickName + ' ' + item.mobile, userId: item.id })
            }
          }
        })
      },
      getToUserInfo(houseId) {
        getToUserInfo({ houseId: houseId }).then(response => {
          this.selectList = []
          for (var item of response.result) {
            this.selectList.push({ name: item.nickName + ' ' + item.mobile, userId: item.id })
          }
        })
      },
      selectHouse(val) {
        if (!val || val.length === 0) {
          this.postForm.selectHouse = []
        } else {
          var temp = []
          for (var item of val) {
            temp.push(item.id)
          }
          this.postForm.selectHouseObj = val
          this.postForm.selectHouse = temp
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @media (max-width: 1500px) {
    .el-dialog {
      width: 70%!important;
    }
  }
  .houseDistributionDialog {
    .mainDiv {
      display: flex;
      margin-bottom: 10px;
      .kanban {
        width: 250px;
        margin-left: 50px;
        .board-column-content {
          .board-item {
            height: 44px;
            padding: 5px 10px;
            line-height: 34px;
          }
        }
        &.todo {
          .board-column-header {
            background: #4A9FF9;
          }
        }
        &.done {
          .board-column-header {
            background: #2ac06d;
          }
        }
      }
    }
  }

</style>
