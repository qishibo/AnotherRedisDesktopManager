<template>
  <div class="group-select-wrap">
    <el-select
      :value="value"
      clearable
      filterable
      class="group-select"
      :placeholder="$t('message.select_group')"
      @input="$emit('input', $event)"
      @visible-change="onSelectVisibleChange">
      <el-option
        v-for="group in groups"
        :key="group.id"
        :label="group.name"
        :value="group.id">
      </el-option>
    </el-select>
    <i
      class="el-icon-plus group-add-icon"
      :title="$t('message.new_group')"
      @click.stop="openNewGroupDialog">
    </i>

    <!-- new group dialog -->
    <el-dialog
      :title="$t('message.new_group')"
      :visible.sync="showGroupDialog"
      width="400px"
      append-to-body>
      <el-form @submit.native.prevent="handleNewGroup">
        <el-form-item :label="$t('message.group_name')">
          <el-input
            v-model="newGroupName"
            :placeholder="$t('message.group_name')">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showGroupDialog = false">{{ $t('message.close') }}</el-button>
        <el-button type="primary" @click="handleNewGroup">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage';

export default {
  props: {
    value: { default: null },
  },
  data() {
    return {
      groups: [],
      showGroupDialog: false,
      newGroupName: '',
    };
  },
  created() {
    this.loadGroups();
  },
  methods: {
    loadGroups() {
      this.groups = storage.getGroups();
    },
    onSelectVisibleChange(opened) {
      if (opened) {
        this.loadGroups();
      }
    },
    openNewGroupDialog() {
      this.newGroupName = '';
      this.showGroupDialog = true;
    },
    handleNewGroup() {
      const name = this.newGroupName.trim();

      if (!name) {
        return this.$message.error(this.$t('message.group_name_required'));
      }

      const group = storage.addGroup(name);

      if (!group) {
        return this.$message.error(this.$t('message.group_exists'));
      }

      this.loadGroups();
      this.$emit('input', group.id);

      this.showGroupDialog = false;
      this.$message.success(this.$t('message.add_success'));
      this.$bus.$emit('groups-updated');
    },
  },
};
</script>

<style scoped>
  .group-select-wrap {
    position: relative;
  }
  .group-select {
    width: 100%;
  }
  .group-select >>> .el-input__inner {
    padding-right: 50px;
  }
  .group-add-icon {
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    cursor: pointer;
  }
  .group-add-icon:hover {
    color: #409eff;
  }
</style>
