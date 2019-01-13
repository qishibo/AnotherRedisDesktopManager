<template>
  <div>
    <div>
    	<h2>Aside</h2>
      <i class="el-icon-circle-plus-outline"></i><a href="###">New Connection</a>
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
  components: {Connections}
}
</script>