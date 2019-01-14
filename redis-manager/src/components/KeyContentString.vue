<template>
  <div>
    <el-form>
      <el-form-item>
         <el-input type="textarea" :autosize="{ minRows: 4}" v-model="JSON.stringify(value)"></el-input>
       </el-form-item>
       <el-form-item>
         <el-button type="primary">Save</el-button>
         <!-- <el-button>Cancel</el-button> -->
       </el-form-item>
    </el-form>
  </div>
</template>

<script>
import unserialize from 'locutus/php/var/unserialize';

  export default {
    data() {
      return {
        value: unserialize('a:3:{s:4:"name";s:6:"qii404";s:3:"age";i:233;s:2:"ll";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}')
      };
    }
  }
</script>
