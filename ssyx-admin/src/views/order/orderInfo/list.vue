<template>
    <div class="app-container">

        <el-card class="operate-container" shadow="never">
            <el-form inline>
                <el-form-item label="订单号">
                    <el-input v-model="searchObj.outTradeNo" clearable placeholder="订单号" type="text" width="100"/>
                </el-form-item>

                <el-form-item label="订单状态">
                    <el-select v-model="searchObj.orderStatus" clearable placeholder="订单状态">
                        <el-option label="未支付" value="UNPAID"/>
                        <el-option label="已支付，待发货" value="WAITING_DELEVER"/>
                        <el-option label="已发货" value="DELEVERED"/>
                        <el-option label="待签收" value="WAITING_SIGN"/>
                        <el-option label="已完结" value="FINISHED"/>
                        <el-option label="已取消" value="CANCEL"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="下单时间">
                    <el-date-picker
                        v-model="searchObj.times"
                        end-placeholder="结束时间"
                        range-separator="至"
                        start-placeholder="开始时间"
                        type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss"
                    />
                </el-form-item>

                <el-form-item label="仓库">
                    <el-select v-model="searchObj.wareId" placeholder="请选择" @change="fetchLeaderList">
                        <el-option
                            v-for="ware in wareList"
                            :key="ware.id"
                            :label="ware.name"
                            :value="ware.id"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="收货人">
                    <el-input v-model="searchObj.receiver" clearable placeholder="收货人姓名/手机" type="text"
                              width="100"/>
                </el-form-item>

                <el-button icon="el-icon-search" type="primary" @click="fetchData()">查询</el-button>
                <el-button type="default" @click="resetSearch">清空</el-button>
            </el-form>
        </el-card>

        <!-- 工具条 -->
        <!--    <el-card class="operate-container" shadow="never">-->
        <!--      <i class="el-icon-tickets" style="margin-top: 5px"></i>-->
        <!--      <span style="margin-top: 5px">数据列表</span>-->
        <!--      <el-button class="btn-add" size="mini" @click="add()">添加</el-button>-->
        <!--      <el-button class="btn-add" size="mini" @click="batchDeliver()" style="margin: 0 10px;">批量发货</el-button>-->
        <!--    </el-card>-->

        <el-table
            v-loading="listLoading"
            :data="list"
            border
            stripe
            style="width: 100%;margin-top: 10px;">

            <el-table-column
                align="center"
                label="序号"
                width="55">
                <template slot-scope="scope">
                    {{ (page - 1) * limit + scope.$index + 1 }}
                </template>
            </el-table-column>

            <el-table-column label="订单号" prop="orderNo" width="130"/>
            <el-table-column label="订单金额" width="140px">
                <template slot-scope="scope">
                    <p>总额：￥{{ scope.row.totalAmount }}</p>
                    <p>促销：{{ scope.row.activityAmount }}</p>
                    <p>优惠券：￥{{ scope.row.couponAmount }}</p>
                </template>
            </el-table-column>
            <el-table-column label="收货人" width="160px">
                <template slot-scope="scope">
                    <p>姓名：{{ scope.row.receiverName }}</p>
                    <p>电话：{{ scope.row.receiverPhone }}</p>
                </template>
            </el-table-column>
            <el-table-column label="团长信息">
                <template slot-scope="scope">
                    <p>姓名：{{ scope.row.leaderName }}</p>
                    <p>提货点：{{ scope.row.takeName }}</p>
                </template>
            </el-table-column>
            <el-table-column label="操作时间" width="200px">
                <template slot-scope="scope">
                    <p>创建：{{ scope.row.createTime }}</p>
                    <p>支付：{{ scope.row.paymentTime }}</p>
                </template>
            </el-table-column>
            <el-table-column label="订单状态" prop="param.orderStatusName" width="100"/>

            <el-table-column align="center" label="操作" width="130">
                <template slot-scope="scope">
                    <router-link :to="'/order/orderInfo/show/'+scope.row.id">
                        <el-button size="mini" type="primary">查看</el-button>
                    </router-link>
                </template>
            </el-table-column>
        </el-table>

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
import api from '@/api/order/orderInfo'
import wareApi from '@/api/sys/ware'

export default {
    data() {
        return {
            listLoading: true, // 数据是否正在加载
            list: null, // banner列表
            total: 0, // 数据库中的总记录数
            page: 1, // 默认页码
            limit: 10, // 每页记录数
            searchObj: {}, // 查询表单对象
            multipleSelection: [],// 批量选择中选择的记录列表

            wareList: [],
            leaderList: []
        }
    },

    // 生命周期函数：内存准备完毕，页面尚未渲染
    created() {
        console.log('list created......')
        this.fetchData()
        this.fetchWareList();
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

            // 时间搜索处理
            if (this.searchObj.times && this.searchObj.times.length == 2) {
                this.searchObj.createTimeBegin = this.searchObj.times[0]
                this.searchObj.createTimeEnd = this.searchObj.times[1]
                delete this.searchObj.times
            }
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

        // 重置查询表单
        resetData() {
            console.log('重置查询表单')
            this.searchObj = {}
            this.fetchData()
        }

        // 当表格复选框选项发生变化的时候触发
        // handleSelectionChange(selection) {
        //   console.log('handleSelectionChange......')
        //   console.log(selection)
        //   this.multipleSelection = selection
        // },

        // batchDeliver() {
        //   if (this.multipleSelection.length === 0) {
        //     this.$message({
        //       type: 'warning',
        //       message: '请选择要发货的记录!'
        //     })
        //     return
        //   }
        //
        //   this.multipleSelection.forEach(item => {
        //     if(item.orderStatus != 0) {
        //       this.$message({
        //         type: 'warning',
        //         message: '请选择未发货的记录，里面包含已发货记录!'
        //       })
        //       return
        //     }
        //   })
        //
        //   this.$confirm('确认该发货吗, 是否确认?', '提示', {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }).then(() => { // promise
        //     // 点击确定，远程调用ajax
        //     var idList = []
        //     this.multipleSelection.forEach(item => {
        //       idList.push(item.id)
        //     })
        //     return api.batchDeliver(idList)
        //   }).then((response) => {
        //     if (response.code) {
        //       this.$message({
        //         type: 'success',
        //         message: '发货成功!'
        //       })
        //     }
        //     this.fetchData(this.page)
        //   }).catch(() => {
        //     this.$message({
        //       type: 'info',
        //       message: '已取消发货'
        //     })
        //   })
        // }
    }
}
</script>
