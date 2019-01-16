<template>
  <div>
    <div>
      <el-button type="info" @click="dialogFormVisible = true" icon="el-icon-plus">{{$t('message.new_connection')}}</el-button>

      <el-dialog title="Add New Connection" :visible.sync="dialogFormVisible">
        <el-form :label-position="labelPosition" label-width="80px">
          <el-form-item label="Host">
            <el-input autocomplete="off" placeholder="127.0.0.1"></el-input>
          </el-form-item>

          <el-form-item label="Port">
            <el-input autocomplete="off" placeholder="6379"></el-input>
          </el-form-item>

          <el-form-item label="Auth">
            <el-input autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="Alias Name">
            <el-input autocomplete="off"></el-input>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog>

    </div>
    <div>
      <Connections></Connections>
    </div>
  </div>
</template>


<script>
import Connections from '@/components/Connections';

export default {
  name: 'Aside',
  data() {
    return {
      dialogFormVisible: false,
      labelPosition: 'top',
    }
  },
  components: {Connections}
}
</script>
