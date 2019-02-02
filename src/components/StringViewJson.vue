<template>
  <div class="text-formated-container">
    <vue-json-pretty
        :path="'res'"
        :data="newContent"
        >
      </vue-json-pretty>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default{
  data() {
    return {};
  },
  components: {VueJsonPretty},
  props: ['content'],
  computed: {
    newContent() {
      try {
        return JSON.parse(this.content.content);
      }
      catch (e) {
        return 'Json Parse Failed, Please Check Data Format!';
      }
    }
  }
};
</script>
