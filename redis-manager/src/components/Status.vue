<template>
  <div>

      <el-row :gutter="80" class="status-container">
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>Server</span>
            </div>
            <p><el-tag type="info" size="big">Redis版本: <el-tag type="success">2.8.4</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">OS: <el-tag type="success">Linux 3.13.0-125-generic x86_64</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">进程ID: <el-tag type="success">25272</el-tag></el-tag></p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>Memory</span>
            </div>
            <p><el-tag type="info" size="big">已用内存: <el-tag type="success">2.07G</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">内存占用峰值: <el-tag type="success"> 2.79G</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">Lua占用内存: <el-tag type="success">233M</el-tag></el-tag></p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>Stats</span>
            </div>
            <p><el-tag type="info" size="big">客户端连接数: <el-tag type="success">2509</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">历史连接数: <el-tag type="success">4375526</el-tag></el-tag></p>
            <p><el-tag type="info" size="big">历史命令数: <el-tag type="success">28922668</el-tag></el-tag></p>
          </el-card>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <el-card class="box-card" style="width: 860px;">
            <div slot="header" class="clearfix">
              <span>数据库键值情况</span>
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
          <el-card class="box-card" style="width: 860px;">
            <div slot="header" class="clearfix">
              <span>All Redis Info</span>
            </div>

            <el-table
                :data="AllRedisInfo"
                stripe
                height="300"
                style="width: 100%;"
                >
                <el-table-column
                  fixed
                  prop="key"
                  label="Key"
                  width="150">
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
        DBKeys: [
          {db: "db0", keys: 2345, expires: 233, avg_ttl: 5449392},
          {db: "db1", keys: 1345, expires: 8754, avg_ttl: 6754},
          {db: "db2", keys: 2545, expires: 54, avg_ttl: 323232},
          {db: "db3", keys: 99345, expires: 11, avg_ttl: 54354},
          {db: "db3", keys: 99345, expires: 11, avg_ttl: 54354},
          {db: "db3", keys: 99345, expires: 11, avg_ttl: 54354},
          {db: "db3", keys: 99345, expires: 11, avg_ttl: 54354},
          {db: "db3", keys: 99345, expires: 11, avg_ttl: 54354},
        ],
        AllRedisInfo: [
          {key: "redis_version", value: "2.8.4"},
          {key: "redis_git_sha1", value: "00000000"},
          {key: "redis_git_dirty", value: "0"},
          {key: "redis_build_id", value: "a44a05d76f06a5d9"},
          {key: "redis_mode", value: "standalone"},
          {key: "os", value: "Linux 3.13.0-125-generic x86_64"},
          {key: "arch_bits", value: "64"},
          {key: "multiplexing_api", value: "epoll"},
          {key: "gcc_version", value: "4.8.2"},
          {key: "process_id", value: "25272"},
          {key: "run_id", value: "39be646fd514f3dfde1789d18a814bb77a4ee27b"},
          {key: "tcp_port", value: "6379"},
          {key: "uptime_in_seconds", value: "2836636"},
          {key: "uptime_in_days", value: "32"},
          {key: "hz", value: "10"},
          {key: "lru_clock", value: "1670143"},
          {key: "config_file", value: "/etc/redis/redis.conf"},
          {key: "connected_clients", value: "2509"},
          {key: "client_longest_output_list", value: "0"},
          {key: "client_biggest_input_buf", value: "0"},
          {key: "blocked_clients", value: "0"},
          {key: "used_memory", value: "2222078536"},
          {key: "used_memory_human", value: "2.07G"},
          {key: "used_memory_rss", value: "2318909440"},
          {key: "used_memory_peak", value: "2996731840"},
          {key: "used_memory_peak_human", value: "2.79G"},
          {key: "used_memory_lua", value: "33792"},
          {key: "mem_fragmentation_ratio", value: "1.04"},
          {key: "mem_allocator", value: "jemalloc-3.4.1"},
          {key: "loading", value: "0"},
          {key: "rdb_changes_since_last_save", value: "1022"},
          {key: "rdb_bgsave_in_progress", value: "0"},
          {key: "rdb_last_save_time", value: "1547622140"},
          {key: "rdb_last_bgsave_status", value: "ok"},
          {key: "rdb_last_bgsave_time_sec", value: "21"},
          {key: "rdb_current_bgsave_time_sec", value: "-1"},
          {key: "aof_enabled", value: "0"},
          {key: "aof_rewrite_in_progress", value: "0"},
          {key: "aof_rewrite_scheduled", value: "0"},
          {key: "aof_last_rewrite_time_sec", value: "-1"},
          {key: "aof_current_rewrite_time_sec", value: "-1"},
          {key: "aof_last_bgrewrite_status", value: "ok"},
          {key: "total_connections_received", value: "4375526"},
          {key: "total_commands_processed", value: "28922668"},
          {key: "instantaneous_ops_per_sec", value: "33"},
          {key: "rejected_connections", value: "0"},
          {key: "sync_full", value: "0"},
          {key: "sync_partial_ok", value: "0"},
          {key: "sync_partial_err", value: "0"},
          {key: "expired_keys", value: "911020"},
          {key: "evicted_keys", value: "0"},
          {key: "keyspace_hits", value: "20237568"},
          {key: "keyspace_misses", value: "2254795"},
          {key: "pubsub_channels", value: "0"},
          {key: "pubsub_patterns", value: "0"},
          {key: "latest_fork_usec", value: "40841"},
          {key: "role", value: "master"},
          {key: "connected_slaves", value: "0"},
          {key: "master_repl_offset", value: "0"},
          {key: "repl_backlog_active", value: "0"},
          {key: "repl_backlog_size", value: "1048576"},
          {key: "repl_backlog_first_byte_offset", value: "0"},
          {key: "repl_backlog_histlen", value: "0"},
          {key: "used_cpu_sys", value: "1930.76"},
          {key: "used_cpu_user", value: "4516.76"},
          {key: "used_cpu_sys_children", value: "13367.95"},
          {key: "used_cpu_user_children", value: "132705.14"},
          {key: "db0", value: "keys=4833382,expires=5250,avg_ttl=368819625"},
          {key: "db2", value: "keys=7,expires=0,avg_ttl=0"},
          {key: "db3", value: "keys=4,expires=2,avg_ttl=326298609"},
          {key: "db4", value: "keys=40,expires=36,avg_ttl=142629111"},
        ]
      };
    },
    methods: {
    }
  }
</script>

<style type="text/css">
  .status-container {
    width: 100%;
  }
</style>
