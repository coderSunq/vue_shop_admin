<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryinfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button 
            slot="append" 
            icon="el-icon-search"
            @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column width="110px" prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column width="80px" prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column width="160px" prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time|dateFormat}}
          </template>
        </el-table-column>
        <el-table-column width="120px" label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryinfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="10"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background>
    </el-pagination>
    </el-card>
  </div>
</template>

<script>
import request from '@/request/request'
export default {
  data(){
    return {
      queryinfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      goodslist:[],
      total:0
    }
  },
  created(){
    this.getGoodsList()
  },
  methods:{
    async getGoodsList(){
      const {data:res} = await request.get('goods',{
        params:this.queryinfo
      })
      if(res.meta.status !== 200){
        return this.$message.error('请求商品数据失败！')
      }
      this.$message.success('请求商品数据成功！')
      this.goodslist = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(newSize){
      this.queryinfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryinfo.pagenum = newPage
      this.getGoodsList()
    },
    toAddPage(){
      this.$router.push('goods/add')
    }
  }
};
</script>

<style>
</style>