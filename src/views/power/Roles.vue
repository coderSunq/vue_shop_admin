<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleslist" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              class="vcenter"
            >
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="i2 === 0 ? '' : 'bdtop'"
                  class="vcenter"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="showRemoveTagDialogById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button 
            size="mini" 
            type="primary" 
            icon="el-icon-edit"
            >编辑</el-button>
            <el-button 
            size="mini" 
            type="danger" 
            icon="el-icon-delete"
            >删除</el-button>
            <el-button 
            size="mini" 
            type="warning" 
            icon="el-icon-setting"
            @click="setRights(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="resetDefKeys"
    >
      <el-tree 
      :data="rightslist" 
      :props="treeProps"
      node-key="id"
      default-expand-all
      show-checkbox
      :default-checked-keys="defKeys"
      ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button 
        @click="setRightsDialogVisible = false"
        >取 消</el-button>
        <el-button 
        type="primary" 
        @click="allotRights"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/request/request.js";
export default {
  data() {
    return {
      roleslist: [],
      setRightsDialogVisible:false,
      rightslist:[],
      treeProps:{
        label:"authName",
        children:"children"
      },
      defKeys:[],
      currentRole:{}
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await request.get("roles");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("请求角色列表失败");
      }
      this.$message.success("请求角色列表成功");
      this.roleslist = res.data;
    },
    async showRemoveTagDialogById(role, rightid) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await request.delete(
        `roles/${role.id}/rights/${rightid}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      role.children = res.data;
    },
    async setRights(role){
      this.currentRole = role
      const {data:res} = await request.get('rights/tree')
      if(res.meta.status !== 200){
        return this.$message.error('获取权限列表失败')
      }
      this.$message.success('获取权限列表成功')
      this.rightslist = res.data
      this.getLeafKeys(role,this.defKeys)
      this.setRightsDialogVisible = true
    },
    // 通过递归的方式获取所有角色下第三级权限的id
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item,arr))
    },
    resetDefKeys(){
      this.defKeys = []
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const keysStr = keys.join(',')
      const {data:res} = await request.post(`roles/${this.currentRole.id}/rights`,{rids:keysStr})
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.setRightsDialogVisible = false
      this.getRolesList()
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>