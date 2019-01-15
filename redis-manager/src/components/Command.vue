<template>
  <div>
    <div class="commands-container" style="height: 100px; color: grey;">
      <p v-for="item of commands">
        {{item.time}} {{item.command}} {{item.result}}
      </p>
    </div>
  </div>
</template>

<script>
  export default{
    data() {
      return {
        commands: [
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
          {'time': new Date().toGMTString(), 'command': 'keys * 1 100', 'result': 'success'},
        ]
      };
    }
  }
</script>

<style>
.commands-container p {
  margin: 0;
  font-size: 60%;
}
</style>
