<template>
  <div>

      <el-row :gutter="10" class="status-container">
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ $t('message.server') }}</span>
            </div>
            <p><el-tag type="info" size="big">{{ $t('message.redis_version') }}: <el-tag type="success">{{this.connectionStatus.redis_version}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">OS: <el-tag type="success">{{this.connectionStatus.os}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.process_id') }}: <el-tag type="success">{{this.connectionStatus.process_id}}</el-tag></el-tag></p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
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
              <span>{{ $t('message.stats') }}</span>
            </div>
            <p><el-tag type="info" size="big">{{ $t('message.connected_clients') }}: <el-tag type="success">{{this.connectionStatus.connected_clients}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.total_connections_received') }}: <el-tag type="success">{{this.connectionStatus.total_connections_received}}</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">{{ $t('message.total_commands_processed') }}: <el-tag type="success">{{this.connectionStatus.total_commands_processed}}</el-tag></el-tag></p>
          </el-card>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ $t('message.key_statistics') }}</span>
            </div>

            <el-table
                :data="DBKeys"
                height="200"
                stripe
                >
                <el-table-column
                  fixed
                  sortable
                  prop="db"
                  label="DB"
                  >
                </el-table-column>
                <el-table-column
                  sortable
                  prop="keys"
                  label="Keys"
                  >
                </el-table-column>
                <el-table-column
                  sortable
                  prop="expires"
                  label="Expires"
                  >
                </el-table-column>
                <el-table-column
                  sortable
                  prop="avg_ttl"
                  label="Avg TTL"
                  >
                </el-table-column>
              </el-table>
          </el-card>
        </el-col>
      </el-row>


      <el-row>
        <el-col>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ $t('message.all_redis_info') }}</span>
            </div>

            <el-table
                :data="AllRedisInfo"
                stripe
                height="300"
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
        //
      };
    },
    props: ['connectionStatus'],
    computed: {
      DBKeys() {
        let dbs = [];

        for (var i in this.connectionStatus) {
          if (i.startsWith('db')) {
            let item = this.connectionStatus[i];
            let array = item.split(',');

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
        let infos = [];

        for (var i in this.connectionStatus) {
          infos.push({key: i, value: this.connectionStatus[i]});
        }

        return infos;
      },
    },
    methods: {
    },
    filters: {
      // round(num) {
      //   return Math.round(num * 100) / 100;
      // },
    },
  }
</script>

<style type="text/css">
  .status-container {
    width: 100%;
  }
  .status-container .el-tag {
    /*display: inline-block;*/
    max-width: 100%;
    /*text-overflow: ellipsis;*/
    /*overflow: hidden;*/
    /*vertical-align: center;*/
  }
</style>
