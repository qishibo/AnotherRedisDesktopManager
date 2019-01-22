<template>
<div>
  <el-form :inline="true">
    <el-form-item>
      <el-input placeholder="key" v-model="key" @keyup.enter.native="renameKey($event.target.value)">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          title='click or enter to rename this key'
          @click="renameKey"
          >
        </i>
          <template slot="prepend">String</template>
        </el-input>
    </el-form-item>

    <el-form-item>
      <el-input placeholder="86400" @keyup.enter.native="ttlKey($event.target.value)">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          title='click or enter to modify ttl'
          @click="ttlKey"
          >
        </i>
          <template slot="prepend">TTL</template>
        </el-input>
    </el-form-item>

<!--     <el-form-item>
      <el-button type="primary">Save</el-button>
    </el-form-item> -->

    <el-form-item>
      <el-button type="danger" @click="deleteKey" icon="el-icon-delete" circle></el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="success" @click="refreshKey" icon="el-icon-refresh" circle></el-button>
    </el-form-item>

  </el-form>

</div>
</template>

<script>
  export default {
    data() {
      return {
        key: 'keyyyyyy',
      };
    },
    methods: {
      deleteKey: function () {
        this.$confirm('确认删除' + this.key + '？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: this.key + '删除成功!',
            duration: 1000,
          });
        }).catch(() => {
        });
      },
      refreshKey: function () {
        console.log('refreshing ' + this.key)
      },
      renameKey: function (key) {
        console.log('remane key ' + this.key + 'new key is ' + key)
      },
      ttlKey: function (ttl) {
        console.log('ttl key ' + this.key + ' ttl is ' + ttl)
      }
    }
  }
</script>
