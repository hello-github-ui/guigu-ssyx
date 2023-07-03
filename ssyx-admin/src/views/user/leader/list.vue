<template>
    <div class="app-container">

        <!-- 工具条 -->
        <el-card class="operate-container" shadow="never">
            <el-form :inline="true">
                <el-form-item label="输入搜索：">
                    <el-input v-model="searchObj.keyword" placeholder="关键字" style="width: 203px"></el-input>
                </el-form-item>

                <el-button icon="el-icon-search" type="primary" @click="fetchData()">查询</el-button>
                <el-button type="default" @click="resetData()">清空</el-button>
            </el-form>
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

            <el-table-column label="姓名" prop="name" width="100px"/>
            <el-table-column label="手机号码" prop="phone" width="120px"/>
            <el-table-column label="提货点名称" prop="takeName"/>
            <el-table-column label="所属区域" prop="param.regionName" width="80px"/>
            <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                    <p>
                        {{ scope.row.checkStatus === 0 ? '待审核' : scope.row.checkStatus === 1 ? '通过' : '未通过' }}</p>
                </template>
            </el-table-column>
            <el-table-column label="审核时间" prop="checkTime" width="150px"/>
            <el-table-column label="申请时间" prop="createTime" width="150px"/>

            <el-table-column align="center" label="操作" width="200">
                <template slot-scope="scope">
                    <el-button :disabled="$hasBP('btn.all')  === false" size="mini" type="text"
                               @click="check(scope.row.id, 0)">审核不通过
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
    </div>
</template>

<script>
import api from '@/api/user/leader'

export default {
    data() {
        return {
            listLoading: true, // 数据是否正在加载
            list: null, // banner列表
            total: 0, // 数据库中的总记录数
            page: 1, // 默认页码
            limit: 10, // 每页记录数
            searchObj: {}, // 查询表单对象
            multipleSelection: [] // 批量选择中选择的记录列表
        }
    },

    // 生命周期函数：内存准备完毕，页面尚未渲染
    created() {
        console.log('list created......')
        this.fetchData()
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
                    debugger
                    this.list = response.data.records
                    this.total = response.data.total

                    // 数据加载并绑定成功
                    this.listLoading = false
                }
            )
        },

        // 重置查询表单
        resetData() {
            console.log('重置查询表单')
            this.searchObj = {}
            this.fetchData()
        },

        check(id, status) {
            api.check(id, status).then(response => {
                this.$message({
                    type: 'success',
                    message: '操作成功!'
                })
                this.fetchData()
            });
        }
    }
}
</script>

