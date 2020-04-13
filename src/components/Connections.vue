<template>
  <div>
    <ConnectionWrapper
      v-for="(item, connectionName) of connections"
      :key="connectionName"
      :index="connectionName"
      :config='item'>
    </ConnectionWrapper>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import ConnectionWrapper from '@/components/ConnectionWrapper';

export default {
  data() {
    return {
      connections: [],
    };
  },
  components: {ConnectionWrapper},
  created() {
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
  },
  methods: {
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = {};

      for (const item of connections) {
        item.connectionName = this.initConnectionName(item);
        slovedConnections[item.connectionName] = item;
      }

      this.connections = slovedConnections;
    },
    initConnectionName(connection) {
      return connection.name || `${connection.host}@${connection.port}`;
    },
  },
  mounted() {
    this.initConnections();
  },
};
</script>
