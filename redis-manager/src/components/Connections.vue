<template>
  <div>
<!--     <el-collapse>
      <el-collapse-item v-for="item of connections" :key="item.connection">
        <template slot="title">
          <span>{{item.connection}}</span>&nbsp;
          <span :style="{float: 'right'}">
            <i class="el-icon-search"></i>
            <i class="el-icon-edit-outline"></i>
            <i class="el-icon-delete"></i>
          </span>
        </template>
        <div>
          <ul>
            <li v-for="key of item.keys">{{key}}</li>
          </ul>
        </div>
      </el-collapse-item>
    </el-collapse> -->

    <el-menu class="connection-menu" active-text-color="#ffd04b" :default-active="activeIndex">
      <el-submenu v-for="(item, index) of connections" :key="item.connection" :index="''+index">

        <template slot="title">
          <span slot="title" :title="item.connection" class="connection-name">{{item.connection}}</span>
<!--           <el-tooltip slot="title" effect="dark" content="Bottom Center 提示文字" placement="right" :enterable="false" :open-delay="500">
            <span class="connection-name">{{item.connection}}</span>
          </el-tooltip> -->

<!--           <el-popover
            placement="top"
            width="160"
            v-model="filterShow"
            :key='Math.random()'>
            <p>这是一段内容这是一段内容确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-input></el-input>
              <el-button size="mini" type="text" @click="filterShow = false">取消</el-button>
              <el-button type="primary" size="mini" @click="filterShow = false">确定</el-button>
            </div>
            <el-button slot="reference" @click.stop.prevent="aaa"><i class="el-icon-search"></i></el-button>
            <i slot="reference" @click.stop.prevent="aaa" class="el-icon-search"></i>
          </el-popover> -->

          <i class="el-icon-search" @click.stop.prevent="aaa"></i>
          <i class="el-icon-edit-outline"></i>
          <i class="el-icon-delete"></i>
        </template>

        <el-collapse>
          <el-collapse-item v-for="dbIndex of dbs" :key="'db_'+dbIndex">
            <template slot="title">
              <span class="connection-db">db{{dbIndex}}</span>
              <i class="el-icon-search" @click="aaa"></i>
              <i class="el-icon-edit-outline"></i>
              <i class="el-icon-delete"></i>
            </template>
            <div>
              <ul class="key-list">
                <li class="key-item" v-for="key of item.keys"><i class="fa fa-fighter-jet"></i> {{key}}</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>

      </el-submenu>
    </el-menu>

  </div>

</template>

<script>
  export default {
    name: "Connections",

    data: function () {
      return {
        activeIndex: '1',
        dbs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        connections: [
          {connection: "127.0.0.1@6379", id: "connection1", keys: ['key1', 'key2', 'key1', 'key2', 'key1', 'key2', 'key1', 'key2', 'key1', 'key2', ]},
          {connection: "11.22.33.44@6379", id: "connection2", keys: ['key1', 'key2']},
          {connection: "192.168.111.1000000000000000@63799", id: "connection3", keys: ['key1', 'key2']}
        ],
        filterShow: false,
      };
    },
    methods: {
      aaa() {
        alert(333)
      }
    }
  }
</script>

<style type="text/css">
  body {
    /*margin-left: 0;*/
  }
  .connection-menu {
    margin-top: 10px;
  }
  .connection-menu .connection-name {
    display: inline-block;
    width: 115px;
    word-break:keep-all;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .connection-menu .connection-db {
    display: inline-block;
    margin-left: 20px;
    width: 80px;
    color: grey;
  }
  .connection-menu .el-submenu__title {
    padding-left: 0px !important;
    padding-right: 0px;
    font-size: 13px !important;
  }
  .connection-menu .el-submenu__title .el-submenu__icon-arrow {
    right: 7px;
    top: 54%;
  }
  .connection-menu .el-submenu [class^=el-icon-] {
    font-size: 13px;
    margin: 0px;
    width: auto;
    color: grey;
  }

  .connection-menu .el-submenu.is-opened {
    /*background: #ECF5FF;*/
  }

  .key-list {

  }
</style>
