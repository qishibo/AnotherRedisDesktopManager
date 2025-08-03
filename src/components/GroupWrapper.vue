<template>
  <div class="group-list">
    <div class="group-item" v-for="(group, index) in groups" :key="index">
      <div class="group-header" @click="toggleGroup(index)">
        <i class="el-icon-arrow-right" :class="{'rotated': group.expanded}"></i>
        <span class="group-name">{{ group.name }}</span>
        <span class="connection-count">({{ group.connections.length }})</span>
        
        <div class="group-operations">
          <i class="el-icon-edit-outline" @click.stop="editGroup(group)"></i>
          <i class="el-icon-delete" @click.stop="deleteGroup(group)"></i>
        </div>
      </div>

      <div class="group-content" v-show="group.expanded">
        <slot :connections="group.connections"></slot>
      </div>
    </div>

    <!-- 添加分组按钮 -->
    <div class="add-group" @click="addNewGroup">
      <i class="el-icon-plus"></i>
      <span>新建分组</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupWrapper',
  
  data() {
    return {
      groups: []
    }
  },

  methods: {
    // 切换分组展开/收起状态
    toggleGroup(index) {
      this.$set(this.groups[index], 'expanded', !this.groups[index].expanded)
    },

    // 添加新分组
    addNewGroup() {
      this.$prompt('请输入分组名称', '新建分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        if (value) {
          this.groups.push({
            name: value,
            expanded: true,
            connections: []
          })
          this.$emit('group-added', value)
        }
      })
    },

    // 编辑分组
    editGroup(group) {
      this.$prompt('请输入新的分组名称', '编辑分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: group.name
      }).then(({ value }) => {
        if (value) {
          group.name = value
          this.$emit('group-updated', group)
        }
      })
    },

    // 删除分组
    deleteGroup(group) {
      this.$confirm('确认删除该分组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.groups.indexOf(group)
        this.groups.splice(index, 1)
        this.$emit('group-deleted', group)
      })
    },

    // 更新分组数据
    updateGroups(groups) {
      this.groups = groups
    }
  }
}
</script>

<style lang="scss" scoped>
.group-list {
  .group-item {
    margin-bottom: 10px;

    .group-header {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      background: #f5f7fa;
      border-radius: 4px;

      &:hover {
        background: #ebeef5;
        
        .group-operations {
          display: flex;
        }
      }

      i {
        margin-right: 5px;
        transition: transform 0.3s;

        &.rotated {
          transform: rotate(90deg);
        }
      }

      .group-name {
        flex: 1;
        font-size: 14px;
      }

      .connection-count {
        margin: 0 10px;
        color: #909399;
      }

      .group-operations {
        display: none;
        align-items: center;

        i {
          padding: 4px;
          margin-left: 5px;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .group-content {
      padding: 10px 0 0 25px;
    }
  }

  .add-group {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    color: #409EFF;
    
    &:hover {
      background: #f5f7fa;
    }

    i {
      margin-right: 5px;
    }
  }
}
</style>
