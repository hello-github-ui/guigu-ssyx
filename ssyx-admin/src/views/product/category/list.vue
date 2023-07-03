<template>
    <div class="app-container">

        <el-card class="operate-container" shadow="never">
            <el-form :inline="true">
                <el-form-item label="输入搜索：">
                    <el-input v-model="searchObj.name" placeholder="关键字" style="width: 203px"></el-input>
                </el-form-item>

                <el-button icon="el-icon-search" type="primary" @click="fetchData()">查询</el-button>
                <el-button type="default" @click="resetData()">清空</el-button>
            </el-form>
        </el-card>

        <!-- 工具条 -->
        <el-card class="operate-container" shadow="never">
            <i class="el-icon-tickets" style="margin-top: 5px"></i>
            <span style="margin-top: 5px">数据列表</span>
            <el-button class="btn-add" size="mini" @click="add()">添加</el-button>
            <el-button class="btn-add" size="mini" style="margin: 0 10px;" @click="removeRows()">批量删除</el-button>
        </el-card>

        <!-- banner列表 -->
        <el-table
            v-loading="listLoading"
            :data="list"
            border
            stripe
            style="width: 100%;margin-top: 10px;"
            @selection-change="handleSelectionChange">

            <el-table-column
                type="selection"
                width="55"/>

            <el-table-column
                align="center"
                label="序号"
                width="70">
                <template slot-scope="scope">
                    {{ (page - 1) * limit + scope.$index + 1 }}
                </template>
            </el-table-column>

            <el-table-column label="分类名称" prop="name"/>
            <el-table-column label="排序" prop="sort"/>
            <el-table-column label="创建时间" prop="createTime"/>
            <el-table-column label="更新时间" prop="updateTime"/>

            <el-table-column align="center" label="操作" width="200">
                <template slot-scope="scope">
                    <router-link :to="'/product/category/edit/'+scope.row.id">
                        <el-button size="mini" type="text">修改</el-button>
                    </router-link>
                    <el-button size="mini" type="text" @click="removeDataById(scope.row.id)">删除</el-button>
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
import api from '@/api/product/category'

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

        add() {
            this.$router.push({path: '/product/category/add'})
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
        },

        // 当表格复选框选项发生变化的时候触发
        handleSelectionChange(selection) {
            console.log('handleSelectionChange......')
            console.log(selection)
            this.multipleSelection = selection
        },

        // 批量删除
        removeRows() {
            console.log('removeRows......')

            if (this.multipleSelection.length === 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的记录!'
                })
                return
            }

            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => { // promise
                // 点击确定，远程调用ajax
                // 遍历selection，将id取出放入id列表
                var idList = []
                this.multipleSelection.forEach(item => {
                    idList.push(item.id)
                    // console.log(idList)
                })
                // 调用api
                return api.removeRows(idList)
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
<style lang="scss" rel="stylesheet/scss" scoped></style>
