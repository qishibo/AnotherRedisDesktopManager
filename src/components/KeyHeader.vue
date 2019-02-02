<template>
<div>
  <el-form :inline="true">
    <el-form-item>
      <el-input placeholder="key" v-model="myRedisKey" @keyup.enter.native="renameKey">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          :title="$t('message.click_enter_to_rename')"
          @click="renameKey"
          >
        </i>
          <template slot="prepend"><span class="key-detail-type">{{ keyType }}</span></template>
        </el-input>
    </el-form-item>

    <el-form-item>
      <el-input placeholder="86400" v-model="keyTTL" @keyup.enter.native="ttlKey">
        <i
          class="el-icon-check el-input__icon"
          slot="suffix"
          :title="$t('message.click_enter_to_ttl')"
          @click="ttlKey"
          >
        </i>
          <template slot="prepend">TTL</template>
        </el-input>
    </el-form-item>

<!--     <el-form-item>
      <el-button type="primary">Save</el-button>
    </el-form-item> -->

    <el-form-item>
      <el-button type="danger" @click="deleteKey" icon="el-icon-delete" circle></el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="success" @click="refreshKey" icon="el-icon-refresh" circle></el-button>
    </el-form-item>

  </el-form>

</div>
</template>

<script>
  export default {
    data() {
      return {
        myRedisKey: this.redisKey,
        myRedisKeyLast: this.redisKey,
        keyTTL: -1,
      };
    },
    props: ['redisKey', 'keyType'],
    methods: {
      deleteKey: function () {
        this.$confirm(
          this.$t('message.confirm_to_delete_key', {key: this.myRedisKey}),
          {type: 'warning'}
        ).then(() => {

          let client = this.$util.get('client');
          client.delAsync(this.myRedisKey).then(reply => {
            console.log('delete ' + this.myRedisKey, reply);

            if (reply === 1) {
              this.$message.success({
                message: this.myRedisKey + this.$t('message.delete_success'),
                duration: 1000,
              });

              this.$bus.$emit('removePreTab');
            }

            else {
              this.$message.error({
                message: this.myRedisKey + this.$t('message.delete_failed'),
                duration: 1000,
              });
            }
          });
        }).catch(() => {});
      },
      refreshKey: function () {
        console.log('refreshing ' + this.key)
      },
      renameKey: function () {
        console.log('remane key ' + this.redisKey + ' new key is ' + this.myRedisKey);
        let client = this.$util.get('client');

        if (this.myRedisKeyLast === this.myRedisKey) {
          return;
        }

        client.renameAsync(this.myRedisKeyLast, this.myRedisKey).then(reply => {
          console.log('rename result ' + this.redisKey + ' ' + this.myRedisKey, reply);

          if (reply === 'OK') {
            this.$message.success({
              message: this.myRedisKeyLast + ' rename to ' + this.myRedisKey + ' ' + this.$t('message.modify_success'),
              duration: 1000,
            });

            this.myRedisKeyLast = this.myRedisKey;
          }
        });
      },
      ttlKey: function () {
        console.log('ttl key ' + this.myRedisKey + ' ttl is ' + this.keyTTL);
        let client = this.$util.get('client');

        client.expireAsync(this.myRedisKey, this.keyTTL).then(reply => {
          console.log('expire result ' + this.myRedisKey + ' ' + this.keyTTL);

          if (reply) {
            this.$message.success({
              message: this.myRedisKey + ' expire ' + this.keyTTL + ' ' + this.$t('message.modify_success'),
              duration: 1000,
            });
          }
        });
      }
    },
    mounted() {
      let redisKey = this.myRedisKey;
      let client = this.$util.get('client');

      if (!redisKey) {
        return;
      }

      client.ttlAsync(redisKey).then(reply => {
        console.log(redisKey, reply);
        this.keyTTL = reply;
      })
    },
  }
</script>

<style type="text/css">
  .key-detail-type {
    text-transform: capitalize;
    text-align: center;
    width: 28px;
    display: inline-block;
  }
</style>
