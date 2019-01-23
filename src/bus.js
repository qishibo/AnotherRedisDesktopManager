export default (Vue) => {
  const eventHub = new Vue()
  Vue.prototype.$bus = {
    $on (...event) {
      eventHub.$on(...event)
    },
    $off (...event) {
      eventHub.$off(...event)
    },
    $once (...event) {
      eventHub.$once(...event)
    },
    $emit (...event) {
      eventHub.$emit(...event)
    }
  }
}
