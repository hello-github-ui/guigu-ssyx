<template>
    <div>

        <el-card class="operate-container" shadow="never">
            <div style="margin-top: 15px">
                <el-form :inline="true" label-width="140px" size="small">
                    <el-form-item label="输入搜索：">
                        <el-input v-model="tempSearchObj.roleName" placeholder="角色名称"
                                  style="width: 203px"></el-input>
                    </el-form-item>

                    <el-button icon="el-icon-search" type="primary" @click="search()">查询</el-button>
                    <el-button type="default" @click="resetSearch()">清空</el-button>
                </el-form>
            </div>
        </el-card>

        <!-- 工具条 -->
        <el-card class="operate-container" shadow="never">
            <i class="el-icon-tickets" style="margin-top: 5px"></i>
            <span style="margin-top: 5px">数据列表</span>

            <el-button class="btn-add" size="mini" @click="addRole">添加</el-button>
            <el-button :disabled="selectedRoles.length === 0" class="btn-add" size="mini" style="margin: 0 10px;"
                       @click="removeRoles()">批量删除
            </el-button>
        </el-card>

        <el-table
            v-loading="listLoading"
            :data="roles"
            border
            stripe
            @selection-change="handleSelectionChange">

            <el-table-column
                type="selection"
                width="75"/>

            <el-table-column
                align="center"
                label="序号"
                type="index"
                width="100">
            </el-table-column>

            <el-table-column align="center" label="角色名称" width="500">
                <template slot-scope="{row}">
                    <template v-if="row.edit">
                        <el-input v-model="row.roleName" class="edit-input" size="small"/>
                        <el-button
                            class="cancel-btn"
                            icon="el-icon-refresh"
                            size="small"
                            type="warning"
                            @click="cancelEdit(row)"
                        >
                            取消
                        </el-button>
                    </template>
                    <span v-else>{{ row.roleName }}</span>
                </template>
            </el-table-column>

            <el-table-column align="center" label="操作">
                <template slot-scope="{row}">
                    <HintButton icon="el-icon-info" size="mini" title="分配权限" type="info"
                                @click="$router.push(`/acl/role/auth/${row.id}?roleName=${row.roleName}`)"/>

                    <HintButton v-if="row.edit" icon="el-icon-check" size="mini" title="确定"
                                type="primary" @click="updateRole(row)"/>
                    <HintButton v-if="!row.edit" icon="el-icon-edit" size="mini" title="修改角色"
                                type="primary" @click="row.edit= true"/>
                    <HintButton icon="el-icon-delete" size="mini" title="删除角色" type="danger"
                                @click="removeRole(row)"/>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
            :current-page="page"
            :page-size="limit"
            :page-sizes="[5, 10, 20]"
            :total="total"
            layout="prev, pager, next, jumper, ->, sizes, total"
            style="padding: 10px;"
            @current-change="getRoles"
            @size-change="handleSizeChange"
        />
    </div>
</template>

<script>

export default {

    name: 'RoleList',

    data() {
        return {
            listLoading: true, // 数据是否正在加载
            roles: [], // 角色列表
            total: 0, // 总记录数
            page: 1, // 当前页码
            limit: 5, // 每页记录数
            tempSearchObj: { // 收集搜索条件数据
                roleName: '',
            },
            searchObj: { // 发送请求的条件参数数据
                roleName: '',
            },
            selectedRoles: [] // 所有选中的角色列表
        }
    },

    mounted() {
        this.getRoles()
    },

    methods: {

        /*
        取消修改
        */
        cancelEdit(role) {
            role.roleName = role.originRoleName
            role.edit = false
            this.$message.warning('取消角色修改')
        },

        /*
        更新角色
        */
        updateRole(role) {
            this.$API.role.updateById({id: role.id, roleName: role.roleName})
                .then(result => {
                    this.$message.success(result.message || '更新角色成功!')
                    this.getRoles(this.page)
                })
        },

        /*
        每页数量发生改变的监听
        */
        handleSizeChange(pageSize) {
            this.limit = pageSize
            this.getRoles()
        },

        /*
        添加角色
        */
        addRole() {
            // 显示添加界面
            this.$prompt('请输入新名称', '添加角色', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({value}) => {
                this.$API.role.save({roleName: value}).then(result => {
                    this.$message.success(result.message || '添加角色成功')
                    this.getRoles()
                })
            }).catch(() => {
                this.$message.warning('取消添加')
            })
        },

        /*
        异步获取角色分页列表
        */
        getRoles(page = 1) {
            this.page = page
            this.listLoading = true
            const {limit, searchObj} = this
            this.$API.role.getPageList(page, limit, searchObj).then(
                result => {
                    const {records, total} = result.data
                    this.roles = records.map(item => {
                        item.edit = false // 用于标识是否显示编辑输入框的属性
                        item.originRoleName = item.roleName // 缓存角色名称, 用于取消
                        return item
                    })
                    this.total = total
                }
            ).finally(() => {
                this.listLoading = false
            })
        },

        /*
        根据搜索条件进行搜索
        */
        search() {
            this.searchObj = {...this.tempSearchObj}
            this.getRoles()
        },

        /*
        重置查询表单搜索列表
        */
        resetSearch() {
            this.tempSearchObj = {
                roleName: ''
            }
            this.searchObj = {
                roleName: ''
            }
            this.getRoles()
        },

        /*
        删除指定的角色
        */
        removeRole({id, roleName}) {
            this.$confirm(`确定删除 '${roleName}' 吗?`, '提示', {
                type: 'warning'
            }).then(async () => {
                const result = await this.$API.role.removeById(id)
                this.getRoles(this.roles.length === 1 ? this.page - 1 : this.page)
                this.$message.success(result.message || '删除成功!')
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },

        /*
        当表格复选框选项发生变化的时候触发
        */
        handleSelectionChange(selection) {
            this.selectedRoles = selection
        },

        /*
        批量删除
        */
        removeRoles() {
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                type: 'warning'
            }).then(async () => {
                const ids = this.selectedRoles.map(role => role.id)
                const result = await this.$API.role.removeRoles(ids)
                this.getRoles()
                this.$message({
                    type: 'success',
                    message: '批量删除成功!'
                })
            }).then((result) => {

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

<style scoped>
.edit-input {
    padding-right: 100px;
}

.cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
}
</style>
