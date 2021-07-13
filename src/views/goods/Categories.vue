<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategories"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <tree-table
        :data="cateList"
        :columns="columns"
        border
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        class="tree-table"
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cate_deleted"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0"
            >一级</el-tag
          >
          <el-tag
            size="mini"
            type="warning"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="danger" v-else>三级</el-tag>
        </template>
        <template slot="operate" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="cateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="cateForm"
        :rules="cateFormRules"
        ref="cateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentlist"
            :props="parentCateProps"
            @change="parentCateChange"
            clearable
            ref="casRef"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategories">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/request/request";
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          prop: "cate_level",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          // prop:"",
          type: "template",
          template: "operate",
        },
      ],
      cateDialogVisible: false,
      cateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      cateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      parentlist: [],
      parentCateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      selectedKeys: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await request.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("请求商品分类数据失败！");
      }
      this.$message.success("请求商品分类数据成功！");
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCategories() {
      this.getParentList();
      console.log(this.parentlist);
      this.cateDialogVisible = true;
    },
    async getParentList() {
      const { data: res } = await request.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！");
      }
      this.$message.success("获取父级分类成功！");
      this.parentlist = res.data;
      console.log(this.parentlist);
    },
    parentCateChange() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length !== 0) {
        this.$refs.casRef.dropDownVisible = false;
      }
      if (this.selectedKeys.length > 0) {
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.cateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.cateForm.cat_pid = 0;
        this.cateForm.cat_level = 0;
      }
    },
    addCategories() {
      this.$refs.cateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await request.post("categories", this.cateForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品分类失败！");
        }
        this.getCateList();
        this.cateDialogVisible = false;
      });
    },
    addCateDialogClosed() {
      this.$refs.cateFormRef.resetFields();
      this.selectedKeys = [];
      this.cateForm.cat_pid = 0;
      this.cateForm.cat_pid = 0;
    },
  },
};
</script>

<style lang="less" scoped>
.tree-table {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>