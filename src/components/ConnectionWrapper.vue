<template>
<div>
  <OperateItem
    ref='operateItem'
    :client='client'>
  </OperateItem>

  <KeyList
    ref='keyList'
    :client='client'>
  </KeyList>
</div>
</template>

<script type="text/javascript">
import KeyList from '@/components/KeyList';
import OperateItem from '@/components/OperateItem';

export default {
  data() {
    return {};
  },
  props: ['config', 'client'],
  components: {OperateItem, KeyList},
  methods: {
    initShow() {
      this.$refs.operateItem.initShow();
      this.$refs.keyList.initShow();
    },
  },
}
</script>
