<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../../assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          unique-opened
          :collapse = "isCollapse"
          :collapse-transition = "false"
          router
          :default-active = "activePath"
        >
          <el-submenu :index="String(item.id)" 
          v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item 
            :index="'/' + subItem.path" 
            v-for="subItem in item.children" :key="subItem.id" 
            @click="savNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {getMenus} from '@/request/home.js'
export default {
  data() {
    return {
      menulist:[],
      iconList:{
        '125':'el-icon-user-solid',
        '103':'el-icon-warning',
        '101':'el-icon-s-goods',
        '102':'el-icon-s-order',
        '145':'el-icon-s-platform',
      },
      isCollapse:false,
      activePath:''
    };
  },
  created(){
    console.log(getMenus().then())
    getMenus().then(res=>{
      if(res.data.meta.status !==200) return this.$message.error(res.data.meta.msg)
      this.menulist = res.data.data
    })
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    savNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    > span {
      margin-left: 5px;
    }
  }
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>