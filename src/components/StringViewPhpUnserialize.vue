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
import unserialize from 'locutus/php/var/unserialize';

  export default{
    data() {
      return {
        //
      };
    },
    components: {VueJsonPretty},
    props: ['content'],
    computed: {
      newContent() {
        try {
          return unserialize(this.content.content);
        }
        catch (e) {
          return 'PHP Unserialize Failed, Please Check Data Format!';
        }
      }
    }
  }
</script>
