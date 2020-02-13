<template>
  <div>
    <!-- select view -->
    <el-form :inline="true" size="small">
      <el-form-item>
        <el-select v-model="selectedView" placeholder="View As">
          <el-option
            v-for="item in views"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
          <span slot="prefix" class="fa fa-sitemap"></span>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- content show -->
    <div>
      <component :is="selectedView" :redisKey="redisKey"></component>
    </div>
  </div>
</template>

<script>
import StringViewText from '@/components/StringViewText';
import StringViewJson from '@/components/StringViewJson';
import StringViewPhpUnserialize from '@/components/StringViewPhpUnserialize';

export default {
  data() {
    return {
      selectedView: 'StringViewText',
      views: [
        { value: 'StringViewText', text: 'View As Text' },
        { value: 'StringViewJson', text: 'View As Json' },
        { value: 'StringViewPhpUnserialize', text: 'View As PHPUnserialize' },
      ],
      content: '',
    };
  },
  props: ['client', 'redisKey', 'syncKeyParams'],
  components: { StringViewText, StringViewJson, StringViewPhpUnserialize },
  methods: {
    initShow() {
      const key = this.syncKeyParams.keyName;

      if (!key) {
        return;
      }

      this.client.getAsync(key).then((reply) => {
        // character not visible
        if (!this.$util.isVisible(reply)) {
          this.content = this.$util.toUTF8(reply);
        }

        else {
          this.content = reply;
        }
      });
    },
  },
  mounted() {
    this.initShow();
  },
};
</script>

<style type="text/css">
  .text-formated-container {
    border: 1px solid #dcdfe6;
    min-height: 100px;
    padding: 5px 15px;
    line-height: 1.5;
    border-radius: 5px;
  }

  .vjs__tree span {
    color: #616069;
  }

  .collapse-container {
    height: 27px;
  }

  .collapse-container .collapse-btn {
    float: right;
    padding: 9px 0;
  }
</style>
