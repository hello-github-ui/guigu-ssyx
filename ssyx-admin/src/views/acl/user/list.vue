<template>
    <div class="app-container">
        <el-card class="operate-container" shadow="never">
            <div style="margin-top: 15px">
                <el-form :inline="true" label-width="140px" size="small">
                    <el-form-item label="输入搜索：">
                        <el-input
                            v-model="tempSearchObj.username"
                            placeholder="用户名"
                            style="width: 203px"
                        ></el-input>
                    </el-form-item>

                    <el-button
                        icon="el-icon-search"
                        type="primary"
                        @click="getUsers()"
                        >查询</el-button
                    >
                    <el-button type="default" @click="resetSearch()"
                        >清空</el-button
                    >
                </el-form>
            </div>
        </el-card>

        <!-- 工具条 -->
        <el-card class="operate-container" shadow="never">
            <i class="el-icon-tickets" style="margin-top: 5px"></i>
            <span style="margin-top: 5px">数据列表</span>
            <el-button class="btn-add" size="mini" @click="showAddUser"
                >添 加</el-button
            >
            <el-button
                :disabled="selectedIds.length === 0"
                class="btn-add"
                size="mini"
                style="margin: 0 10px"
                @click="revomveUsers"
                >批量删除
            </el-button>
        </el-card>

        <!-- banner列表 -->
        <el-table
            v-loading="listLoading"
            :data="users"
            border
            stripe
            style="width: 100%; margin-top: 10px"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" />

            <el-table-column
                align="center"
                label="序号"
                type="index"
                width="80"
            />

            <el-table-column label="用户名" prop="username" width="120" />
            <el-table-column label="用户名称" prop="name" width="120" />
            <el-table-column label="创建时间" prop="createTime" width="180" />
            <el-table-column label="更新时间" prop="updateTime" width="180" />

            <el-table-column align="center" label="操作" width="220">
                <!--        <template slot-scope="{row}">-->
                <!--          <HintButton type="info" size="mini" icon="el-icon-user-solid" title="分配角色"-->
                <!--            @click="showAssignRole(row)" v-if="$hasBP('btn.User.assgin')" />-->
                <!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改用户"-->
                <!--            @click="showUpdateUser(row)" v-if="$hasBP('btn.User.update')"/>-->
                <!--          <el-popconfirm :title="`确定删除 ${row.username} 吗?`" @onConfirm="removeUser(row.id)">-->
                <!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
                <!--              title="删除用户" v-if="$hasBP('btn.User.remove')"/>-->
                <!--          </el-popconfirm>-->
                <!--        </template>-->
                <template slot-scope="scope">
                    <el-button
                        size="mini"
                        type="text"
                        @click="showAssignRole(scope.row)"
                        >分配角色</el-button
                    >
                    <el-button
                        size="mini"
                        type="text"
                        @click="showUpdateUser(scope.row)"
                        >修改</el-button
                    >
                    <el-button
                        size="mini"
                        type="text"
                        @click="removeUser(scope.row.id)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            :current-page="page"
            :page-size="limit"
            :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
            :total="total"
            layout="prev, pager, next, jumper, ->, sizes, total"
            style="padding: 20px 0"
            @current-change="getUsers"
            @size-change="handleSizeChange"
        />

        <el-dialog
            :title="user.id ? '修改用户' : '添加用户'"
            :visible.sync="dialogUserVisible"
        >
            <el-form
                ref="userForm"
                :model="user"
                :rules="userRules"
                label-width="120px"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="user.username" />
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="user.name" />
                </el-form-item>

                <el-form-item v-if="!user.id" label="用户密码" prop="password">
                    <el-input v-model="user.password" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button
                    :loading="loading"
                    type="primary"
                    @click="addOrUpdate"
                    >确 定</el-button
                >
            </div>
        </el-dialog>

        <el-dialog
            :before-close="resetRoleData"
            :visible.sync="dialogRoleVisible"
            title="设置角色"
        >
            <el-form label-width="80px">
                <el-form-item label="用户名">
                    <el-input :value="user.username" disabled></el-input>
                </el-form-item>

                <el-form-item label="角色列表">
                    <el-checkbox
                        v-model="checkAll"
                        :indeterminate="isIndeterminate"
                        @change="handleCheckAllChange"
                    >
                        全选
                    </el-checkbox>
                    <div style="margin: 15px 0"></div>
                    <el-checkbox-group
                        v-model="userRoleIds"
                        @change="handleCheckedChange"
                    >
                        <el-checkbox
                            v-for="role in allRoles"
                            :key="role.id"
                            :label="role.id"
                            >{{ role.roleName }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>

            <div slot="footer">
                <el-button :loading="loading" type="primary" @click="assignRole"
                    >保存</el-button
                >
                <el-button @click="resetRoleData">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";

export default {
    name: "AclUserList",

    data() {
        return {
            listLoading: false, // 是否显示列表加载的提示
            searchObj: {
                // 包含请求搜索条件数据的对象
                username: "",
            },
            tempSearchObj: {
                // 收集搜索条件输入的对象
                username: "",
            },
            selectedIds: [], // 所有选择的user的id的数组
            users: [], // 当前页的用户列表
            page: 1, // 当前页码
            limit: 5, // 每页数量
            total: 0, // 总数量
            user: {}, // 当前要操作的user
            dialogUserVisible: false, // 是否显示用户添加/修改的dialog
            userRules: {
                // 用户添加/修改表单的校验规则
                username: [
                    { required: true, message: "用户名必须输入" },
                    { min: 4, message: "用户名不能小于4位" },
                ],
                password: [
                    { required: true, validator: this.validatePassword },
                ],
            },
            loading: false, // 是否正在提交请求中
            dialogRoleVisible: false, // 是否显示角色Dialog
            allRoles: [], // 所有角色列表
            userRoleIds: [], // 用户的角色ID的列表
            isIndeterminate: false, // 是否是不确定的
            checkAll: false, // 是否全选
        };
    },

    created() {
        this.getUsers();
    },

    methods: {
        /*
        显示指定角色的界面
        */
        showAssignRole(user) {
            this.user = user;
            this.dialogRoleVisible = true;
            this.getRoles();
        },

        /*
        全选勾选状态发生改变的监听
        */
        handleCheckAllChange(value) {
            // value 当前勾选状态true/false
            // 如果当前全选, userRoleIds就是所有角色id的数组, 否则是空数组
            this.userRoleIds = value
                ? this.allRoles.map((item) => item.id)
                : [];
            // 如果当前不是全选也不全不选时, 指定为false
            this.isIndeterminate = false;
        },

        /*
        异步获取用户的角色列表
        */
        async getRoles() {
            const result = await this.$API.user.getRoles(this.user.id);
            // console.log("result: " + JSON.stringify(result));
            // const { allRolesList, assignRoles } = result.data; // 解构赋值方式会报undefined错
            const allRolesList = result.data.allRoleList;
            const assignRoles = result.data.assignRoles;
            // console.log(typeof allRolesList);
            // console.log(typeof assignRoles);
            this.allRoles = allRolesList;
            this.userRoleIds = assignRoles.map((item) => item.id);
            this.checkAll = allRolesList.length === assignRoles.length;
            this.isIndeterminate =
                assignRoles.length > 0 &&
                assignRoles.length < allRolesList.length;
        },

        /*
        角色列表选中项发生改变的监听
        */
        handleCheckedChange(value) {
            const { userRoleIds, allRoles } = this;
            this.checkAll =
                userRoleIds.length === allRoles.length && allRoles.length > 0;
            this.isIndeterminate =
                userRoleIds.length > 0 && userRoleIds.length < allRoles.length;
        },

        /*
        请求给用户进行角色授权
        */
        async assignRole() {
            const userId = this.user.id;
            const roleIds = this.userRoleIds.join(",");
            this.loading = true;
            const result = await this.$API.user.assignRoles(userId, roleIds);
            this.loading = false;
            this.$message.success(result.message || "分配角色成功");
            this.resetRoleData();

            // console.log(this.$store.getters.name, this.user)
            if (this.$store.getters.name === this.user.username) {
                window.location.reload();
            }
        },

        /*
        重置用户角色的数据
        */
        resetRoleData() {
            this.dialogRoleVisible = false;
            this.allRoles = [];
            this.userRoleIds = [];
            this.isIndeterminate = false;
            this.checkAll = false;
        },

        /*
        自定义密码校验
        */
        validatePassword(rule, value, callback) {
            if (!value) {
                callback("密码必须输入");
            } else if (!value || value.length < 6) {
                callback("密码不能小于6位");
            } else {
                callback();
            }
        },
        /*
        根据输入进行搜索
        */
        search() {
            this.searchObj = { ...this.tempSearchObj };
            this.getUsers();
        },

        /*
        重置输入后搜索
        */
        resetSearch() {
            this.searchObj = {
                username: "",
            };
            this.tempSearchObj = {
                username: "",
            };
            this.getUsers();
        },

        /*
        显示添加用户的界面
        */
        showAddUser() {
            this.user = {};
            this.dialogUserVisible = true;

            this.$nextTick(() => this.$refs.userForm.clearValidate());
        },

        /*
        删除所有选中的用户
        */
        revomveUsers() {
            this.$confirm("确定删除吗?")
                .then(async () => {
                    await this.$API.user.removeUsers(this.selectedIds);
                    this.$message.success("删除成功");
                    this.getUsers();
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },

        /*
        列表选中状态发生改变的监听回调
        */
        handleSelectionChange(selection) {
            this.selectedIds = selection.map((item) => item.id);
        },

        /*
        显示更新用户的界面
        */
        showUpdateUser(user) {
            this.user = cloneDeep(user);
            this.dialogUserVisible = true;
        },

        /*
        删除某个用户
        */
        async removeUser(id) {
            await this.$API.user.removeById(id);
            this.$message.success("删除成功");
            this.getUsers(this.users.length === 1 ? this.page - 1 : this.page);
        },

        /*
        获取分页列表
        */
        async getUsers(page = 1) {
            this.page = page;
            const { limit, tempSearchObj } = this;
            this.listLoading = true;
            const result = await this.$API.user.getPageList(
                page,
                limit,
                tempSearchObj
            );
            this.listLoading = false;
            const { records, total } = result.data;
            this.users = records;
            this.total = total - 1;
            this.selectedIds = [];
        },

        /*
        处理pageSize发生改变的监听回调
        */
        handleSizeChange(pageSize) {
            this.limit = pageSize;
            this.getUsers();
        },

        /*
        取消用户的保存或更新
        */
        cancel() {
            this.dialogUserVisible = false;
            this.user = {};
        },

        /*
        保存或者更新用户
        */
        addOrUpdate() {
            this.$refs.userForm.validate((valid) => {
                if (valid) {
                    const { user } = this;
                    this.loading = true;
                    this.$API.user[user.id ? "update" : "add"](user).then(
                        (result) => {
                            this.loading = false;
                            this.$message.success("保存成功!");
                            this.getUsers(user.id ? this.page : 1);
                            this.user = {};
                            this.dialogUserVisible = false;
                        }
                    );
                }
            });
        },
    },
};
</script>
