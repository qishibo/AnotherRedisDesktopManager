<template>
  <div>
    <ConnectionWrapper
      v-for="item of connections"
      :key="item.key ? item.key : item.connectionName"
      :index="item.connectionName"
      :globalSettings="globalSettings"
      :config='item'>
    </ConnectionWrapper>

    <ScrollToTop parentNum='1' :posRight='false'></ScrollToTop>
  </div>
</template>

<script type="text/javascript">
import storage from '@/storage.js';
import ConnectionWrapper from '@/components/ConnectionWrapper';
import ScrollToTop from '@/components/ScrollToTop';

export default {
  data() {
    return {
      connections: [],
      globalSettings: this.$storage.getSetting(),
    };
  },
  components: {ConnectionWrapper, ScrollToTop},
  created() {
    this.$bus.$on('refreshConnections', () => {
      this.initConnections();
    });
    this.$bus.$on('reloadSettings', settings => {
      this.globalSettings = settings;
    });
  },
  methods: {
    initConnections() {
      const connections = storage.getConnections(true);
      const slovedConnections = [];
      // this.connections = [];

      for (const item of connections) {
        item.connectionName = storage.getConnectionName(item);
        slovedConnections.push(item);
      }

      this.connections = slovedConnections;
    }
  },
  mounted() {
    this.initConnections();
  },
};
</script>
