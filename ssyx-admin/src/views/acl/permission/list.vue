<template>
    <div class="app-container">

        <!-- 工具条 -->
        <div class="tools-div">
            <el-button icon="el-icon-plus" size="mini" type="success" @click="add()">添 加</el-button>
        </div>
        <el-table
            :data="sysMenuList"
            :default-expand-all="false"
            :tree-props="{children: 'children'}"
            border
            row-key="id"
            style="width: 100%;margin-bottom: 20px;margin-top: 10px;">

            <el-table-column label="菜单名称" prop="name" width="200"/>

            <el-table-column label="权限标识" prop="code" width="180"/>

            <el-table-column label="创建时间" prop="createTime" width="200"/>

            <el-table-column label="修改时间" prop="updateTime" width="200"/>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.type !== 2" icon="el-icon-plus" size="mini" title="添加下级节点"
                               type="success" @click="add(scope.row)"/>
                    <el-button icon="el-icon-edit" size="mini" title="修改" type="primary" @click="edit(scope.row)"/>
                    <el-button :disabled="scope.row.children.length > 0" icon="el-icon-delete" size="mini" title="删除"
                               type="danger" @click="removeDataById(scope.row.id)"/>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="40%">
            <el-form ref="dataForm" :model="sysMenu" label-width="150px" size="small" style="padding-right: 40px;">
                <el-form-item v-if="sysMenu.id === ''" label="上级部门">
                    <el-input v-model="sysMenu.parentName" disabled="true"/>
                </el-form-item>
                <el-form-item label="菜单类型" prop="type">
                    <el-radio-group v-model="sysMenu.type" :disabled="typeDisabled">
                        <el-radio :disabled="type0Disabled" :label="0">目录</el-radio>
                        <el-radio :disabled="type1Disabled" :label="1">菜单</el-radio>
                        <el-radio :disabled="type2Disabled" :label="2">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="sysMenu.name"/>
                </el-form-item>

                <el-form-item v-if="sysMenu.type !== 0" prop="to_code">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
                    <el-input v-model="sysMenu.to_code" placeholder="请输入组件路径"/>
                </el-form-item>
                <el-form-item v-if="sysMenu.type === 2">
                    <el-input v-model="sysMenu.code" maxlength="100" placeholder="请输入权限标识"/>
                    <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(hasAuthority('bnt.sysRole.list'))"
                            placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-refresh-right" size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button icon="el-icon-check" size="small" type="primary" @click="saveOrUpdate()">确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/api/acl/permission'

const defaultForm = {
    id: '',
    parentId: '',
    name: '',
    type: 0,
    path: '',
    component: '',
    perms: '',
    icon: '',
    sortValue: 1,
    status: 1
}
export default {
    // 定义数据
    data() {
        return {
            sysMenuList: [],
            expandKeys: [], // 需要自动展开的项

            typeDisabled: false,
            type0Disabled: false,
            type1Disabled: false,
            type2Disabled: false,
            dialogTitle: '',

            dialogVisible: false,
            sysMenu: defaultForm,
            saveBtnDisabled: false,

            iconList: [
                {
                    class: "el-icon-s-tools",
                },
                {
                    class: "el-icon-s-custom",
                },
                {
                    class: "el-icon-setting",
                },
                {
                    class: "el-icon-user-solid",
                },
                {
                    class: "el-icon-s-help",
                },
                {
                    class: "el-icon-phone",
                },
                {
                    class: "el-icon-s-unfold",
                },
                {
                    class: "el-icon-s-operation",
                },
                {
                    class: "el-icon-more-outline",
                },
                {
                    class: "el-icon-s-check",
                },
                {
                    class: "el-icon-tickets",
                },
                {
                    class: "el-icon-s-goods",
                },
                {
                    class: "el-icon-document-remove",
                },
                {
                    class: "el-icon-warning",
                },
                {
                    class: "el-icon-warning-outline",
                },
                {
                    class: "el-icon-question",
                },
                {
                    class: "el-icon-info",
                }
            ]
        }
    },

    // 当页面加载时获取数据
    created() {
        this.fetchData()
    },

    methods: {
        // 调用api层获取数据库中的数据
        fetchData() {
            console.log('加载列表')
            api.getPermissionList().then(response => {
                this.sysMenuList = response.data
                console.log(this.sysMenuList)
            })
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
                return api.removePermission(id)
            }).then((response) => {
                this.fetchData()
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch(() => {
                this.$message.info('取消删除')
            })
        },

        // -------------
        add(row) {
            debugger
            this.typeDisabled = false
            this.dialogTitle = '添加下级节点'
            this.dialogVisible = true

            this.sysMenu = Object.assign({}, defaultForm)
            this.sysMenu.id = ''
            if (row) {
                this.sysMenu.parentId = row.id
                this.sysMenu.parentName = row.name
                //this.sysMenu.component = 'ParentView'
                if (row.type === 0) {
                    this.sysMenu.type = 1
                    this.typeDisabled = false
                    this.type0Disabled = false
                    this.type1Disabled = false
                    this.type2Disabled = true
                } else if (row.type === 1) {
                    this.sysMenu.type = 2
                    this.typeDisabled = true
                }
            } else {
                this.dialogTitle = '添加目录节点'
                this.sysMenu.type = 0
                this.sysMenu.component = 'Layout'
                this.sysMenu.parentId = 0
                this.typeDisabled = true
            }
        },

        edit(row) {
            debugger
            this.dialogTitle = '修改节点'
            this.dialogVisible = true

            this.sysMenu = Object.assign({}, row)
            this.typeDisabled = true
        },

        saveOrUpdate() {
            if (this.sysMenu.type === 0 && this.sysMenu.parentId !== 0) {
                this.sysMenu.component = 'ParentView'
            }
            this.$refs.dataForm.validate(valid => {
                if (valid) {
                    this.saveBtnDisabled = true // 防止表单重复提交
                    if (!this.sysMenu.id) {
                        this.saveData()
                    } else {
                        this.updateData()
                    }
                }
            })
        },

        // 新增
        saveData() {
            api.addPermission(this.sysMenu).then(response => {
                this.$message.success(response.message || '操作成功')
                this.dialogVisible = false
                this.fetchData(this.page)
            })
        },

        // 根据id更新记录
        updateData() {
            api.updatePermission(this.sysMenu).then(response => {
                this.$message.success(response.message || '操作成功')
                this.dialogVisible = false
                this.fetchData()
            })
        }
    }
}
</script>
