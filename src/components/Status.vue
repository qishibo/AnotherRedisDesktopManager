<template>
  <div>
      <el-row>
        <el-col>
          <div style="float: right;">
            <el-tag type="info">
              <i class="el-icon-refresh"></i>
              {{ $t('message.auto_refresh') }}
            </el-tag>
            <el-tooltip class="item" effect="dark" :content="$t('message.auto_refresh_tip', {interval: refreshInterval / 1000})" placement="bottom">
              <el-switch v-model="autoRefresh" @change="refreshInit">
              </el-switch>
            </el-tooltip>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="status-container status-card">
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <i class="fa fa-server"></i>
              <span>{{ $t('message.server') }}</span>
            </div>
            <p><el-tag type="info" size="big">{{ $t('message.redis_version') }}: <el-tag type="success">{{this.connectionStatus.redis_version}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">OS: <el-tag :title="connectionStatus.os" type="success">{{this.connectionStatus.os}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.process_id') }}: <el-tag type="success">{{this.connectionStatus.process_id}}</el-tag></el-tag></p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <i class="fa fa-microchip"></i>
              <span>{{ $t('message.memory') }}</span>
            </div>
            <p><el-tag type="info" size="big">{{ $t('message.used_memory') }}: <el-tag type="success">{{this.connectionStatus.used_memory_human}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.used_memory_peak') }}: <el-tag type="success"> {{this.connectionStatus.used_memory_peak_human}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.used_memory_lua') }}: <el-tag type="success">{{Math.round(this.connectionStatus.used_memory_lua / 1024)}}K</el-tag></el-tag></p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <i class="fa fa-thermometer-three-quarters"></i>
              <span>{{ $t('message.stats') }}</span>
            </div>
            <p><el-tag type="info" size="big">{{ $t('message.connected_clients') }}: <el-tag type="success">{{this.connectionStatus.connected_clients}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.total_connections_received') }}: <el-tag type="success">{{this.connectionStatus.total_connections_received}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.total_commands_processed') }}: <el-tag type="success">{{this.connectionStatus.total_commands_processed}}</el-tag></el-tag></p>
          </el-card>
        </el-col>
      </el-row>

      <el-row class="status-card">
        <el-col>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <i class="fa fa-bar-chart"></i>
              <span>{{ $t('message.key_statistics') }}</span>
            </div>

            <el-table
              :data="DBKeys"
              stripe
              >
              <el-table-column
                fixed
                prop="db"
                label="DB"
                >
              </el-table-column>
              <el-table-column
                sortable
                prop="keys"
                label="Keys"
                :sort-method="sortByKeys"
                >
              </el-table-column>
              <el-table-column
                sortable
                prop="expires"
                label="Expires"
                :sort-method="sortByExpires"
                >
              </el-table-column>
              <el-table-column
                sortable
                prop="avg_ttl"
                label="Avg TTL"
                :sort-method="sortByTTL"
                >
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-row class="status-card">
        <el-col>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <i class="fa fa-info-circle"></i>
              <span>{{ $t('message.all_redis_info') }}</span>
            </div>

            <el-table
              :data="AllRedisInfo"
              stripe
              >
              <el-table-column
                fixed
                prop="key"
                label="Key"
                >
              </el-table-column>
              <el-table-column
                prop="value"
                label="Value"
                >
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

  </div>
</template>

<script>
export default {
  data() {
    return {
      autoRefresh: false,
      refreshTimer: null,
      refreshInterval: 2000,
      connectionStatus: {},
      statusConnection: null,
    };
  },
  computed: {
    DBKeys() {
      const dbs = [];

      for (const i in this.connectionStatus) {
        if (i.startsWith('db')) {
          const item = this.connectionStatus[i];
          const array = item.split(',');

          dbs.push({
            db: i,
            keys: array[0].split('=')[1],
            expires: array[1].split('=')[1],
            avg_ttl: array[2].split('=')[1],
          });
        }
      }

      return dbs;
    },
    AllRedisInfo() {
      const infos = [];

      for (const i in this.connectionStatus) {
        infos.push({ key: i, value: this.connectionStatus[i] });
      }

      return infos;
    },
  },
  methods: {
    initConnection() {
      this.statusConnection = this.$util.get('client');
    },
    initShow() {
      const client = this.statusConnection;

      client.infoAsync().then((reply) => {
        const status = this.initStatus(reply);
        this.connectionStatus = status;
      });
    },
    refreshInit() {
      console.log('auto refresh ', this.autoRefresh);

      this.refreshTimer && clearInterval(this.refreshTimer);

      if (this.autoRefresh) {
        this.initShow();

        this.refreshTimer = setInterval(() => {
          console.log('refreshing...');
          this.initShow();
        }, this.refreshInterval);
      }
    },
    sortByKeys(a, b) {
      return a.keys - b.keys;
    },
    sortByExpires(a, b) {
      return a.expires - b.expires;
    },
    sortByTTL(a, b) {
      return a.avg_ttl - b.avg_ttl;
    },
    initStatus(content) {
      if (!content) {
        return {};
      }

      content = content.split('\n');
      const lines = {};

      for (let i of content) {
        i = i.replace(/\s/ig, '');
        if (i.startsWith('#') || !i) continue;

        const kv = i.split(':');

        lines[kv[0]] = kv[1];
      }

      return lines;
    },
  },
  mounted() {
    this.initConnection();
    this.initShow();
    this.refreshInit();
  },
};
</script>

<style type="text/css">
  .el-row.status-card {
    margin-top: 20px;
  }
</style>
