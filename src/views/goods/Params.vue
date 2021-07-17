<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <el-row>
        <el-col>
          <p>
            选择商品分类：
            <el-cascader
              v-model="cateSelectedKeys"
              :options="catelist"
              :props="cateProps"
              @change="handleChange"
            ></el-cascader>
          </p>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="btnDisabled"
            size="mini"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <el-table :data="manyTableDate" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="attrClosed(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" width="50px"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAttrById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="btnDisabled"
            size="mini"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <el-table :data="onlyTableDate" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="attrClosed(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" width="50px"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAttrById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <el-dialog
        :title="'添加' + addDialogTitleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <el-form-item :label="addDialogTitleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        :title="'修改' + addDialogTitleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item :label="addDialogTitleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialog">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from "@/request/request";
export default {
  data() {
    return {
      catelist: [],
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      cateSelectedKeys: [],
      activeName: "many",
      manyTableDate: [],
      onlyTableDate: [],
      addDialogVisible: false,
      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 清空表单数据函数
    clearFormDate() {
      this.$refs.addFormRef.resetFields();
    },
    handleChange() {
      this.getTableDate();
    },
    async getCateList() {
      const { data: res } = await request.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("请求分类列表数据失败！");
      }
      console.log(res.data);
      this.catelist = res.data;
    },
    handleClick() {
      if (this.manyTableDate === [] || this.onlyTableDate === []) {
        console.log(123);
        return;
      }
      this.getTableDate();
    },
    async getTableDate() {
      if (this.cateSelectedKeys.length !== 3) {
        this.cateSelectedKeys = [];
        this.manyTableDate = [];
        this.onlyTableDate = [];
        return;
      }
      const { data: res } = await request.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      console.log(res);
      if (this.activeName === "many") {
        this.manyTableDate = res.data;
      } else {
        this.onlyTableDate = res.data;
      }
    },
    showAddDialog() {
      this.addDialogVisible = true;
    },
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await request.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败！");
        }
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.clearFormDate();
        this.getTableDate();
      });
    },
    addDialogClosed() {
      this.clearFormDate();
    },
    editDialogClosed() {
      return this.$message.info("取消了操作！");
    },
    showEditDialog(row) {
      this.editDialogVisible = true;
      console.log(row);
      this.getEditDialogAttrById(row);
    },
    async getEditDialogAttrById(row) {
      const { data: res } = await request.get(
        `categories/${row.cat_id}/attributes/${row.attr_id}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败！");
      }
      this.$message.success("获取参数成功！");
      this.editForm = res.data;
    },
    editDialog() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await request.put(
          `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改失败！");
        }
        this.$message.success("修改成功！");
        this.editDialogVisible = false;
        this.getTableDate();
      });
    },
    async removeAttrById(row) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该属性, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult === "confirm") {
        const { data: res } = await request.delete(
          `categories/${row.cat_id}/attributes/${row.attr_id}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("删除失败！");
        }
        this.$message.success("删除成功！");
        this.getTableDate();
      } else {
        this.$message.info("取消了删除");
      }
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    //网络请求函数，将vals保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await request.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(","),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数失败！");
      }
      this.$message.success("修改参数成功！");
    },
    showInput(row) {
      row.inputVisible = true;
      // $nextTick当页面上元素被重新渲染之后会执行回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async attrClosed(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
  },
  computed: {
    cateId() {
      if (this.cateSelectedKeys.length === 3) {
        return this.cateSelectedKeys[this.cateSelectedKeys.length - 1];
      }
      return null;
    },
    btnDisabled() {
      if (this.cateSelectedKeys.length === 3) {
        return false;
      }
      return true;
    },
    addDialogTitleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin-right: 16px;
}
.input-new-tag {
  width: 120px;
}
</style>