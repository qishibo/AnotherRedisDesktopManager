<template>
  <div>
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
    <div>
      <component :is="selectedView" :content="$data"></component>
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
        content: 'a:3:{s:4:"name";s:6:"qii404";s:3:"age";i:233;s:2:"ll";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}'
        // content: '{"name": "qii404", "sss": [1,2,3,4]}'
      };
    },
    props: ['redisKey'],
    components: {StringViewText, StringViewJson, StringViewPhpUnserialize},
    mounted() {
      let key = this.redisKey;
      let client = this.util.get('client');

      client.getAsync(key).then(reply => {
        this.content = reply;
      })
    }
  }
</script>
