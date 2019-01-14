<template>
  <div>
    this is status;
    <input :value="from">
    <p>{{msg}}{{from}}</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        msg:'from '
      };
    },
    props: ['from'],
    methods: {
    }
  }
</script>
