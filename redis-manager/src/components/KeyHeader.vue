<template>
<div>
  <el-form :inline="true">
    <el-form-item>
      <el-input placeholder="key">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          title='click or enter to rename this key'
          @click="alert(111)">
        </i>
          <template slot="prepend">String</template>
        </el-input>
    </el-form-item>

    <el-form-item>
      <el-input placeholder="86400">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          title='click or enter to modify ttl'
          @click="alert(111)">
        </i>
          <template slot="prepend">TTL</template>
        </el-input>
    </el-form-item>

<!--     <el-form-item>
      <el-button type="primary">Save</el-button>
    </el-form-item> -->

    <el-form-item>
      <el-button type="danger" icon="el-icon-delete" circle></el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="info" icon="el-icon-refresh" circle></el-button>
    </el-form-item>

  </el-form>

</div>
</template>

<script>
  export default {
    data() {
      return {

      };
    }
  }
</script>
