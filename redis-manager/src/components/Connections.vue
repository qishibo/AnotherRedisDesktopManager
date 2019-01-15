<template>
  <div>
    <el-collapse>
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
    </el-collapse>
  </div>

</template>

<script>
  export default {
    name: "Connections",

    data: function () {
      return {
        connections: [
          {connection: "connection1", id: "connection1", keys: ['key1', 'key2']},
          {connection: "connection2", id: "connection2", keys: ['key1', 'key2']},
          {connection: "connection3", id: "connection3", keys: ['key1', 'key2']}
        ]
      };
    }
  }
</script>
