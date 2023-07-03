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
                <el-button class="btn-add" size="mini" @click="add">添 加</el-button>
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
            <el-table-column label="手机号码" prop="phone" width="100px"/>
            <el-table-column label="提货点名称" prop="takeName"/>
            <el-table-column label="省" prop="param.provinceName" width="70px"/>
            <el-table-column label="城市" prop="param.cityName" width="70px"/>
            <el-table-column label="区/县" prop="param.districtName" width="70px"/>
            <el-table-column label="申请时间" prop="createTime" width="155px"/>

            <el-table-column align="center" label="操作" width="150">
                <template slot-scope="scope">
                    <el-button :disabled="$hasBP('btn.all')  === false" size="mini" type="text"
                               @click="check(scope.row.id, 1)">审核通过
                    </el-button>
                    <el-button :disabled="$hasBP('btn.all')  === false" size="mini" type="text"
                               @click="check(scope.row.id, 0)">审核不通过
                    </el-button>
                    <el-button size="mini" type="text" @click="edit(scope.row.id)">修改</el-button>
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

        <el-dialog :visible.sync="dialogVisible" title="添加/修改" width="60%">
            <el-form ref="flashPromotionForm" label-width="150px" size="small" style="padding-right: 40px;">
                <el-form-item label="团长名称">
                    <el-input v-model="leader.name"/>
                </el-form-item>
                <el-form-item label="手机号码">
                    <el-input v-model="leader.phone"/>
                </el-form-item>
                <el-form-item label="身份证">
                    <el-input v-model="leader.idNo"/>
                </el-form-item>
                <el-form-item label="提货点名称">
                    <el-input v-model="leader.takeName"/>
                </el-form-item>
                <el-form-item label="选择地址">
                    <el-select
                        v-model="leader.province"
                        placeholder="请选择省"
                        @change="provinceChanged">
                        <el-option
                            v-for="item in provinceList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"/>
                    </el-select>
                    <el-select
                        v-model="leader.city"
                        placeholder="请选择市"
                        style="margin-left: 10px;" @change="cityChanged">
                        <el-option
                            v-for="item in cityList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"/>
                    </el-select>
                    <el-select
                        v-model="leader.district"
                        placeholder="请选择区" style="margin-left: 10px;">
                        <el-option
                            v-for="item in districtList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="详细地址">
                    <el-input v-model="leader.detailAddress"/>
                </el-form-item>
                <el-form-item label="经度">
                    <el-input v-model="leader.longitude"/>
                </el-form-item>
                <el-form-item label="纬度">
                    <el-input v-model="leader.latitude"/>
                </el-form-item>
                <el-form-item label="门店照片">
                    <el-upload
                        :action="BASE_API+'/admin/sys/file/fileUpload'"
                        :before-upload="beforeUpload"
                        :on-success="handleSuccess"
                        :show-file-list="false"
                        class="avatar-uploader">
                        <img :src="leader.storePath" width="150px">
                    </el-upload>
                </el-form-item>
                <el-form-item label="营业时间">
                    <el-input v-model="leader.workTime"/>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveOrUpdate()">确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/api/user/leader'
import regionApi from '@/api/sys/region'

const defaultForm = {
    id: '',
    userId: '1',
    regionId: '',
    name: '',
    phone: '',
    idNo: '',
    idNoUrl1: '',
    idNoUrl2: '',
    takeName: '',
    takeType: '1',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    longitude: '',
    latitude: '',
    haveStore: '1',
    storePath: 'https://guli-file-190513.oss-cn-beijing.aliyuncs.com/cover/default.gif',
    workTime: '',
    workStatus: '1',
    checkStatus: '0'
}

export default {
    data() {
        return {
            BASE_API: '/dev-api',

            listLoading: true, // 数据是否正在加载
            list: null, // banner列表
            total: 0, // 数据库中的总记录数
            page: 1, // 默认页码
            limit: 10, // 每页记录数
            searchObj: {}, // 查询表单对象

            provinceList: [],
            cityList: [],
            districtList: [],

            dialogVisible: false,
            leader: defaultForm,
            saveBtnDisabled: false
        }
    },

    // 生命周期函数：内存准备完毕，页面尚未渲染
    created() {
        console.log('list created......')
        this.fetchData()
        this.initProvince()
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
            api.getPageCheckList(this.page, this.limit, this.searchObj).then(
                response => {
                    debugger
                    this.list = response.data.records
                    this.total = response.data.total

                    // 数据加载并绑定成功
                    this.listLoading = false
                }
            )
        },

        check(id, status) {
            api.check(id, status).then(response => {
                this.$message({
                    type: 'success',
                    message: '操作成功!'
                })
                this.fetchData()
            });
        },

        // 重置查询表单
        resetData() {
            console.log('重置查询表单')
            this.searchObj = {}
            this.fetchData()
        },

        // -------------
        add() {
            this.dialogVisible = true
            this.leader = Object.assign({}, defaultForm)
        },

        edit(id) {
            this.dialogVisible = true
            this.fetchDataById(id)
        },

        fetchDataById(id) {
            api.getById(id).then(response => {
                this.leader = response.data
            })
        },

        saveOrUpdate() {
            this.saveBtnDisabled = true // 防止表单重复提交
            if (!this.leader.id) {
                this.saveData()
            } else {
                this.updateData()
            }
        },

        // 新增
        saveData() {
            api.save(this.leader).then(response => {
                if (response.code) {
                    this.$message({
                        type: 'success',
                        message: response.message
                    })
                    this.dialogVisible = false
                    this.fetchData(this.page)
                }
            })
        },

        // 根据id更新记录
        updateData() {
            api.updateById(this.leader).then(response => {
                if (response.code) {
                    this.$message({
                        type: 'success',
                        message: response.message
                    })
                    this.dialogVisible = false
                    this.fetchData(this.page)
                }
            })
        },

        // 根据id查询记录
        fetchDataById(id) {
            api.getById(id).then(response => {
                this.leader = response.data
            })
        },

        initProvince() {
            regionApi.findByParentId(86).then(response => {
                this.provinceList = response.data
            })
        },

        provinceChanged(id) {
            regionApi.findByParentId(id).then(response => {
                this.cityList = response.data
            })
        },

        cityChanged(id) {
            regionApi.findByParentId(id).then(response => {
                this.districtList = response.data
            })
        },

        handleSuccess(response) {
            this.leader.storePath = response.data
        },

        // 上传之前的回调
        beforeUpload(file) {
            const isJPG = file.type === 'image/jpeg'
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isJPG) {
                this.$message.error('上传封面图片只能是 JPG 格式!')
            }
            if (!isLt2M) {
                this.$message.error('上传封面图片大小不能超过 2MB!')
            }
            return isJPG && isLt2M
        }
    }
}
</script>

