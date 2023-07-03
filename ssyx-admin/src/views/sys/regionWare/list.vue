<template>
    <div class="app-container">

        <el-card class="operate-container" shadow="never">
            <el-form :inline="true">
                <el-form-item label="输入搜索：">
                    <el-input v-model="searchObj.keyword" placeholder="关键字" style="width: 203px"></el-input>
                </el-form-item>

                <el-button icon="el-icon-search" type="primary" @click="fetchData()">查询</el-button>
                <el-button type="default" @click="resetData()">清空</el-button>
            </el-form>
        </el-card>

        <!-- 工具条 -->
        <el-card class="operate-container" shadow="never">
            <i class="el-icon-tickets" style="margin-top: 5px"></i>
            <span style="margin-top: 5px">数据列表</span>
            <el-button class="btn-add" size="mini" @click="openShow()">开通区域</el-button>
        </el-card>

        <!-- banner列表 -->
        <el-table
            v-loading="listLoading"
            :data="list"
            border
            stripe
            style="width: 100%;margin-top: 10px;">

            <el-table-column
                align="center"
                label="序号"
                width="70">
                <template slot-scope="scope">
                    {{ (page - 1) * limit + scope.$index + 1 }}
                </template>
            </el-table-column>

            <el-table-column label="区域名称" prop="regionName"/>
            <el-table-column label="仓库名称" prop="wareName"/>
            <el-table-column label="创建时间" prop="createTime"/>
            <el-table-column label="状态" width="120px">
                <template slot-scope="scope">
                    <p>{{ scope.row.status == 0 ? '未开通' : '已开通' }}</p>
                </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="200">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" @click="removeDataById(scope.row.id)">删除</el-button>
                    <el-button v-if="scope.row.status === 0" size="mini" type="text"
                               @click="updateStatus(scope.row.id, 1)">开通
                    </el-button>
                    <el-button v-if="scope.row.status === 1" size="mini" type="text"
                               @click="updateStatus(scope.row.id, 0)">取消开通
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
            :current-page="page"
            :page-size="limit"
            :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
            :total="total"
            layout="sizes, prev, pager, next, jumper, ->, total, slot"
            style="padding: 30px 0; text-align: center;"
            @current-change="fetchData"
            @size-change="changeSize"
        />

        <el-dialog :visible.sync="openDialogVisible" title="开通区域" width="40%">
            <el-form ref="flashPromotionForm" label-width="150px" size="small">
                <el-form-item label="区域">
                    <el-autocomplete
                        v-model="keyword"
                        :fetch-suggestions="querySearch"
                        :trigger-on-focus="false"
                        class="inline-input"
                        placeholder="请输入区域关键字"
                        style="width: 200px;"
                        value-key="name"
                        @select="selectData"
                    />
                </el-form-item>
                <el-form-item label="仓库">
                    <el-select v-model="regionWare.wareId" placeholder="请选择">
                        <el-option
                            v-for="ware in wareList"
                            :key="ware.id"
                            :label="ware.name"
                            :value="ware.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button size="small" @click="openDialogVisible = false">取 消</el-button>
                    <el-button size="small" type="primary" @click="openSave()">确 定</el-button>

                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/api/sys/regionWare'
import wareApi from '@/api/sys/ware'
import regionApi from '@/api/sys/region'

const defaultForm = {
    regionId: '',
    regionName: '',
    wareId: '',
    wareName: ''
}
export default {
    data() {
        return {
            listLoading: true, // 数据是否正在加载
            list: null, // banner列表
            total: 0, // 数据库中的总记录数
            page: 1, // 默认页码
            limit: 10, // 每页记录数
            searchObj: {}, // 查询表单对象

            openDialogVisible: false,
            wareList: [],
            regionList: [],
            keyword: '',
            regionWare: defaultForm
        }
    },

    // 生命周期函数：内存准备完毕，页面尚未渲染
    created() {
        console.log('list created......')
        this.fetchData()
        this.fetchWareList()
    },

    // 生命周期函数：内存准备完毕，页面渲染成功
    mounted() {
        console.log('list mounted......')
    },

    methods: {

        // 当页码发生改变的时候
        changeSize(size) {
            console.log(size)
            this.limit = size
            this.fetchData(1)
        },

        // 加载banner列表数据
        fetchData(page = 1) {
            console.log('翻页。。。' + page)
            // 异步获取远程数据（ajax）
            this.page = page

            api.getPageList(this.page, this.limit, this.searchObj).then(
                response => {
                    this.list = response.data.records
                    this.total = response.data.total

                    // 数据加载并绑定成功
                    this.listLoading = false
                }
            )
        },

        fetchWareList() {
            wareApi.findAllList().then(response => {
                this.wareList = response.data
            })
        },

        openShow() {
            this.openDialogVisible = true
            this.regionWare = {}
            this.keyword = ''
        },

        openSave() {
            this.wareList.forEach(item => {
                if (item.id == this.regionWare.wareId) {
                    this.regionWare.wareName = item.name
                }
            })
            api.save(this.regionWare).then(response => {
                this.openDialogVisible = false
                if (response.code) {
                    this.$message({
                        type: 'success',
                        message: response.message
                    })
                    this.fetchData()
                }
            })
        },

        updateStatus(id, status) {
            api.updateStatus(id, status).then(response => {
                this.$message({
                    type: 'success',
                    message: '操作成功!'
                })
                this.fetchData()
            });
        },

        querySearch(queryString, cb) {
            console.log(queryString)
            console.log(cb)

            regionApi.findRegionByKeyword(queryString).then(response => {
                // 调用 callback 返回建议列表的数据
                cb(response.data)
            })
        },

        selectData(item) {
            this.regionWare.regionId = item.id
            this.regionWare.regionName = item.name
        },

        // 重置查询表单
        resetData() {
            console.log('重置查询表单')
            this.searchObj = {}
            this.fetchData()
        },

        // 根据id删除数据
        removeDataById(id) {
            // debugger
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => { // promise
                // 点击确定，远程调用ajax
                return api.removeById(id)
            }).then((response) => {
                this.fetchData(this.page)
                if (response.code) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        }
    }
}
</script>
