<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input 
          placeholder="请输入内容" 
          v-model="queryInfo.query" 
          clearable
          @clear="getOrders">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrders"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderslist.goods" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          width="80px"
          label="订单价格"
          prop="order_price"
        ></el-table-column>
        <el-table-column width="80px" label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay == 0"
              >未付款</el-tag
            >
            <el-tag type="primary" v-else-if="scope.row.order_pay == 1"
              >支付宝</el-tag
            >
            <el-tag type="success" v-else-if="scope.row.order_pay == 2"
              >微 信</el-tag
            >
            <el-tag type="info" v-else>银行卡</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          width="80px"
          label="是否发货"
          prop="is_send"
        ></el-table-column>
        <el-table-column width="180px" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column width="130px" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showExpressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog 
    title="修改地址" 
    :visible.sync="editDialogVisible" 
    width="50%"
    @close="editDialogClosed">
      <el-form
        :model="addrForm"
        :rules="addrFormRules"
        ref="addrFormRef"
        label-width="90px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="cityValue"
            :options="cityData"
            :props="cityProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addrForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="物流信息"
      :visible.sync="expressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in expressInfo.defaultExpress"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/request/request";
import cityData from "@/assets/citydata.js";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      orderslist: {},
      total: 0,
      editDialogVisible: false,
      addrForm: {
        address1: "",
        address2: "",
      },
      addrFormRules: {
        address1: [
          { required: true, message: "请输入省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      cityValue: [],
      cityData: cityData,
      cityProps: {
        expandTrigger: "hover",
        value: "value",
        label: "label",
        children: "children",
      },
      expressDialogVisible: false,
      expressInfo: {
        defaultExpress: [
          {
            time: "2018-05-10 09:39:00",
            ftime: "2018-05-10 09:39:00",
            context: "已签收,感谢使用顺丰,期待再次为您服务",
            location: "",
          },
          {
            time: "2018-05-10 08:23:00",
            ftime: "2018-05-10 08:23:00",
            context:
              "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
            location: "",
          },
          {
            time: "2018-05-10 07:32:00",
            ftime: "2018-05-10 07:32:00",
            context: "快件到达 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-10 02:03:00",
            ftime: "2018-05-10 02:03:00",
            context:
              "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-09 23:05:00",
            ftime: "2018-05-09 23:05:00",
            context: "快件到达 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 21:21:00",
            ftime: "2018-05-09 21:21:00",
            context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 13:07:00",
            ftime: "2018-05-09 13:07:00",
            context: "顺丰速运 已收取快件",
            location: "",
          },
          {
            time: "2018-05-09 12:25:03",
            ftime: "2018-05-09 12:25:03",
            context: "卖家发货",
            location: "",
          },
          {
            time: "2018-05-09 12:22:24",
            ftime: "2018-05-09 12:22:24",
            context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
            location: "",
          },
          {
            time: "2018-05-08 21:36:04",
            ftime: "2018-05-08 21:36:04",
            context: "商品已经下单",
            location: "",
          },
        ],
        meta: { status: 200, message: "获取物流信息成功！" },
      },
    };
  },
  created() {
    this.getOrders();
    console.log(this.cityData);
  },
  methods: {
    async getOrders() {
      const { data: res } = await request.get("orders", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("请求订单数据失败！");
      }
      this.orderslist = res.data;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrders();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrders();
    },
    showEditDialog() {
      this.editDialogVisible = true;
    },
    editDialogClosed(){
      this.$refs.addrFormRef.resetFields()
      this.cityValue = []
    },
    handleChange() {
      console.log(this.cityValue);
    },
    async showExpressDialog() {
      this.expressDialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>