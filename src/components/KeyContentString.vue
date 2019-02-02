<template>
  <div>

    <!-- select view -->
    <div>
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-select v-model="selectedView" placeholder="View As">
            <el-option
              v-for="item in views"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- content show -->
    <div>
      <component :is="selectedView" :content="$data" :redisKey='redisKey'></component>
    </div>

  </div>
</template>

<script>
import unserialize from 'locutus/php/var/unserialize';
import StringViewText from '@/components/StringViewText';
import StringViewJson from '@/components/StringViewJson';
import StringViewPhpUnserialize from '@/components/StringViewPhpUnserialize';

export default {
  data() {
    return {
      selectedView: 'StringViewText',
      views: [
        {value: 'StringViewText', text: 'View As Text'},
        {value: 'StringViewJson', text: 'View As Json'},
        {value: 'StringViewPhpUnserialize', text: 'View As PHPUnserialize'},
      ],
      content: ''
    };
  },
  props: ['redisKey'],
  components: {StringViewText, StringViewJson, StringViewPhpUnserialize},
  mounted() {
    let key = this.redisKey;
    let client = this.$util.get('client');

    client.getAsync(key).then(reply => {
      this.content = reply;
    });
  }
};
</script>

<style type="text/css">
  .text-formated-container {
    border: 1px solid #dcdfe6;
    min-height: 88px;
    padding: 5px 15px;
    line-height: 1.5;
    border-radius: 5px;
  }

  .vjs__tree span {
    color: #616069;
  }
</style>
