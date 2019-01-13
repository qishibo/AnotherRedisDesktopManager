<template>
  <ul>
    <li v-for="item of connections">{{item.connection}} 
      <span>
        <a :href="'search/' + item.id"><i class="el-icon-search"></i></a>
        <a :href="'edit/' + item.id"><i class="el-icon-edit-outline"></i></a>
        <a :href="'delete/' + item.id"><i class="el-icon-delete"></i></a>
      </span>
      <div>
        <ul>
          <li v-for="key of item.keys">{{key}}</li>
        </ul>
      </div>
    </li>
  </ul>
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